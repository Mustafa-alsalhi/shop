<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SellerCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class SellerCategoryController extends Controller
{
    /**
     * عرض جميع فئات المتجر الخاصة بالبائع الحالي
     */
    public function index()
    {
        $seller = Auth::user()->seller;

        if (!$seller) {
            return response()->json(['message' => 'Seller profile not found'], 404);
        }

        $categories = SellerCategory::where('seller_id', $seller->id)
            ->orderBy('sort_order')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($categories);
    }

    /**
     * عرض فئة متجر محددة
     */
    public function show($id)
    {
        $seller = Auth::user()->seller;

        if (!$seller) {
            return response()->json(['message' => 'Seller profile not found'], 404);
        }

        $category = SellerCategory::where('id', $id)
            ->where('seller_id', $seller->id)
            ->first();

        if (!$category) {
            return response()->json(['message' => 'Category not found'], 404);
        }

        return response()->json($category);
    }

    /**
     * إنشاء فئة متجر جديدة
     */
    public function store(Request $request)
    {
        $seller = Auth::user()->seller;

        if (!$seller) {
            return response()->json(['message' => 'Seller profile not found'], 404);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        $slug = Str::slug($request->name);
        $originalSlug = $slug;
        $counter = 1;

        while (SellerCategory::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        $category = SellerCategory::create([
            'seller_id' => $seller->id,
            'name' => $request->name,
            'slug' => $slug,
            'description' => $request->description,
            'icon' => $request->icon,
            'sort_order' => $request->sort_order ?? 0,
            'is_active' => $request->is_active ?? true,
        ]);

        return response()->json($category, 201);
    }

    /**
     * تحديث فئة متجر موجودة
     */
    public function update(Request $request, $id)
    {
        $seller = Auth::user()->seller;

        if (!$seller) {
            return response()->json(['message' => 'Seller profile not found'], 404);
        }

        $category = SellerCategory::where('id', $id)
            ->where('seller_id', $seller->id)
            ->first();

        if (!$category) {
            return response()->json(['message' => 'Category not found'], 404);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        if ($request->name !== $category->name) {
            $slug = Str::slug($request->name);
            $originalSlug = $slug;
            $counter = 1;

            while (SellerCategory::where('slug', $slug)->where('id', '!=', $category->id)->exists()) {
                $slug = $originalSlug . '-' . $counter;
                $counter++;
            }

            $category->slug = $slug;
        }

        $category->name = $request->name;
        $category->description = $request->description;
        $category->icon = $request->icon;
        $category->sort_order = $request->sort_order ?? $category->sort_order;
        $category->is_active = $request->is_active ?? $category->is_active;
        $category->save();

        return response()->json($category);
    }

    /**
     * حذف فئة متجر
     */
    public function destroy($id)
    {
        $seller = Auth::user()->seller;

        if (!$seller) {
            return response()->json(['message' => 'Seller profile not found'], 404);
        }

        $category = SellerCategory::where('id', $id)
            ->where('seller_id', $seller->id)
            ->first();

        if (!$category) {
            return response()->json(['message' => 'Category not found'], 404);
        }

        // التحقق من عدم وجود منتجات مرتبطة
        if ($category->products()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete category with associated products',
                'products_count' => $category->products()->count()
            ], 400);
        }

        $category->delete();

        return response()->json(['message' => 'Category deleted successfully']);
    }

    /**
     * تحديث ترتيب الفئات
     */
    public function updateOrder(Request $request)
    {
        $seller = Auth::user()->seller;

        if (!$seller) {
            return response()->json(['message' => 'Seller profile not found'], 404);
        }

        $request->validate([
            'categories' => 'required|array',
            'categories.*.id' => 'required|integer',
            'categories.*.sort_order' => 'required|integer|min:0',
        ]);

        foreach ($request->categories as $categoryData) {
            $category = SellerCategory::where('id', $categoryData['id'])
                ->where('seller_id', $seller->id)
                ->first();

            if ($category) {
                $category->sort_order = $categoryData['sort_order'];
                $category->save();
            }
        }

        return response()->json(['message' => 'Categories order updated successfully']);
    }
}
