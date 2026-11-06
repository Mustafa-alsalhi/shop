<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class BannerController extends Controller
{
    private static bool $columnChecked = false;

    /**
     * Ensure the 'type' column exists on the banners table
     */
    private function ensureTypeColumn(): void
    {
        if (self::$columnChecked) {
            return;
        }

        try {
            if (Schema::hasTable('banners') && !Schema::hasColumn('banners', 'type')) {
                Schema::table('banners', function (Blueprint $table) {
                    $table->string('type')->default('store')->after('position');
                    $table->index('type');
                });
            }
            self::$columnChecked = true;
        } catch (\Throwable $e) {
            // Ignore schema inspection errors if any
        }
    }

    /**
     * Clear cached banner entries
     */
    private function clearBannerCache(?string $type = null, ?string $position = null): void
    {
        try {
            Cache::forget('api_active_banners_home');
            Cache::forget('api_active_banners_category');
            Cache::forget('api_active_banners_product');
            if ($position) {
                Cache::forget("api_active_banners_{$position}");
            }
            if ($type) {
                Cache::forget("api_active_banners_home_{$type}");
                if ($position) {
                    Cache::forget("api_active_banners_{$position}_{$type}");
                }
            }
        } catch (\Throwable $e) {
            // Ignore cache errors
        }
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->ensureTypeColumn();

        $query = Banner::query();

        // Filter by position if provided
        if ($request->filled('position')) {
            $query->byPosition($request->position);
        }

        // Filter by activity type if provided
        if ($request->filled('type') && $request->type !== 'all') {
            if ($request->type === 'store' || $request->type === 'stores') {
                $query->where(function ($q) {
                    $q->whereIn('type', ['store', 'stores'])
                      ->orWhereNull('type')
                      ->orWhere('type', '');
                });
            } else {
                $query->where('type', $request->type);
            }
        }

        // Filter by active status if provided
        if ($request->has('active')) {
            $query->where('is_active', $request->boolean('active'));
        }

        $banners = $query->ordered()->get();

        return response()->json([
            'success' => true,
            'data' => $banners,
            'message' => 'Banners retrieved successfully'
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $this->ensureTypeColumn();

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'image_url' => 'required|string|max:500',
            'link_url' => 'nullable|string|max:500',
            'link_text' => 'nullable|string|max:255',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
            'position' => 'nullable|string|max:50',
            'type' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->all();
        $data['position'] = !empty($data['position']) ? $data['position'] : 'home';
        $data['type'] = !empty($data['type']) ? $data['type'] : 'store';

        $banner = Banner::create($data);

        $this->clearBannerCache($banner->type, $banner->position);

        return response()->json([
            'success' => true,
            'data' => $banner,
            'message' => 'Banner created successfully'
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $this->ensureTypeColumn();

        $banner = Banner::find($id);

        if (!$banner) {
            return response()->json([
                'success' => false,
                'message' => 'Banner not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $banner,
            'message' => 'Banner retrieved successfully'
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $this->ensureTypeColumn();

        $banner = Banner::find($id);

        if (!$banner) {
            return response()->json([
                'success' => false,
                'message' => 'Banner not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|nullable|string|max:1000',
            'image_url' => 'sometimes|required|string|max:500',
            'link_url' => 'sometimes|nullable|string|max:500',
            'link_text' => 'sometimes|nullable|string|max:255',
            'is_active' => 'sometimes|boolean',
            'sort_order' => 'sometimes|integer|min:0',
            'position' => 'sometimes|nullable|string|max:50',
            'type' => 'sometimes|nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $oldType = $banner->type;
        $oldPosition = $banner->position;

        $data = $request->all();
        if (array_key_exists('type', $data) && empty($data['type'])) {
            $data['type'] = 'store';
        }
        if (array_key_exists('position', $data) && empty($data['position'])) {
            $data['position'] = 'home';
        }

        $banner->update($data);

        $this->clearBannerCache($oldType, $oldPosition);
        $this->clearBannerCache($banner->type, $banner->position);

        return response()->json([
            'success' => true,
            'data' => $banner,
            'message' => 'Banner updated successfully'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $this->ensureTypeColumn();

        $banner = Banner::find($id);

        if (!$banner) {
            return response()->json([
                'success' => false,
                'message' => 'Banner not found'
            ], 404);
        }

        $oldType = $banner->type;
        $oldPosition = $banner->position;

        // Delete the image file if it exists
        if ($banner->image_url && !str_starts_with($banner->image_url, 'http')) {
            $imagePath = str_replace('/storage/', '', $banner->image_url);
            Storage::disk('public')->delete($imagePath);
        }

        $banner->delete();

        $this->clearBannerCache($oldType, $oldPosition);

        return response()->json([
            'success' => true,
            'message' => 'Banner deleted successfully'
        ]);
    }

    /**
     * Upload banner image
     */
    public function uploadImage(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $imageName = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
            $imagePath = $image->storeAs('banners', $imageName, 'public');

            $imageUrl = '/storage/' . $imagePath;

            return response()->json([
                'success' => true,
                'data' => [
                    'image_url' => $imageUrl,
                    'full_url' => url($imageUrl)
                ],
                'message' => 'Image uploaded successfully'
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'No image file provided'
        ], 422);
    }

    /**
     * Get active banners for public display
     */
    public function getActiveBanners(Request $request)
    {
        $this->ensureTypeColumn();

        $position = $request->get('position', 'home');
        $type = $request->get('type', 'store');

        $banners = Banner::active()
            ->byPosition($position)
            ->byType($type)
            ->ordered()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $banners,
            'message' => 'Active banners retrieved successfully'
        ]);
    }
}
