<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        try {
            $type = $request->query('type', 'store'); // Default to 'store' for backward compatibility
            $cacheKey = 'api_categories_' . $type;
            
            Cache::forget($cacheKey);
            $categories = Cache::remember($cacheKey, 600, function () use ($type) {
                $query = Category::withCount('products')
                    ->with('parent:id,name,slug')
                    ->where('is_active', true);

                if ($type === 'restaurant') {
                    $query->where('type', 'restaurant');
                } elseif ($type === 'all') {
                    // Return all types
                } else {
                    $query->where(function ($q) {
                        $q->where('type', 'store')->orWhereNull('type');
                    });
                }

                return $query->orderBy('sort_order', 'asc')
                    ->orderBy('name', 'asc')
                    ->get()
                    ->map(function ($category) {
                        return [
                            'id' => $category->id,
                            'name' => $category->name,
                            'type' => $category->type ?? 'store',
                            'slug' => $category->slug,
                            'description' => $category->description,
                            'image' => $category->image,
                            'image_url' => $category->image_url,
                            'parent_id' => $category->parent_id,
                            'parent' => $category->parent ? [
                                'id' => $category->parent->id,
                                'name' => $category->parent->name,
                                'slug' => $category->parent->slug,
                            ] : null,
                            'products_count' => $category->products_count,
                            'is_active' => $category->is_active,
                            'created_at' => $category->created_at,
                            'updated_at' => $category->updated_at,
                        ];
                    });
            });
            
            return response()->json($categories);
        } catch (\Exception $e) {
            \Log::error('Categories fetch error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch categories'], 500);
        }
    }

    public function getRestaurantCategories(\Illuminate\Http\Request $request)
    {
        try {
            $type = $request->query('type', 'restaurant');
            $categories = Category::where('type', $type)
                ->where('is_active', true)
                ->orderBy('sort_order', 'asc')
                ->get()
                ->map(function ($cat) {
                    return [
                        'id' => $cat->id,
                        'name' => $cat->name,
                        'type' => $cat->type,
                        'slug' => $cat->slug,
                        'description' => $cat->description,
                        'image' => $cat->image,
                        'image_url' => $cat->image_url,
                        'sort_order' => $cat->sort_order,
                        'is_active' => $cat->is_active,
                    ];
                });
            return response()->json($categories);
        } catch (\Exception $e) {
            \Log::error('Restaurant categories fetch error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch restaurant categories'], 500);
        }
    }

    public function getHomepageCategories()
    {
        try {
            $categories = Cache::remember('api_categories_homepage', 600, function () {
                return Category::where('show_on_homepage', true)
                    ->where('is_active', true)
                    ->orderBy('sort_order', 'asc')
                    ->with(['products' => function ($query) {
                        $query->where('is_active', true)
                              ->where('is_approved', true) // Only approved products on homepage
                              ->orderBy('created_at', 'desc')
                              ->take(10);
                    }])
                    ->get()
                    ->map(function ($category) {
                        return [
                            'id' => $category->id,
                            'name' => $category->name,
                            'slug' => $category->slug,
                            'description' => $category->description,
                            'image' => $category->image,
                            'image_url' => $category->image_url,
                            'sort_order' => $category->sort_order,
                            'show_on_homepage' => $category->show_on_homepage,
                            'products' => $category->products->map(function ($product) {
                                return [
                                    'id' => $product->id,
                                    'name' => $product->name,
                                    'slug' => $product->slug,
                                    'price' => $product->price,
                                    'currency' => $product->currency,
                                    'discount_price' => $product->discount_price,
                                    'sale_price' => $product->sale_price,
                                    'compare_price' => $product->compare_price,
                                    'is_featured' => $product->is_featured,
                                    'image_url' => $product->image_url,
                                    'stock' => $product->stock,
                                    'is_active' => $product->is_active,
                                ];
                            }),
                        ];
                    });
            });
            
            return response()->json([
                'data' => $categories,
                'count' => $categories->count()
            ]);
        } catch (\Exception $e) {
            \Log::error('Homepage categories fetch error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch homepage categories'], 500);
        }
    }
}
