<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CategoryController extends Controller
{
    public function index()
    {
        try {
            $categories = \App\Models\Category::withCount('products')
                ->where('is_active', true)
                ->orderBy('name', 'asc')
                ->get()
                ->map(function ($category) {
                    return [
                        'id' => $category->id,
                        'name' => $category->name,
                        'slug' => $category->slug,
                        'description' => $category->description,
                        'image' => $category->image,
                        'image_url' => $category->image_url,
                        'products_count' => $category->products_count,
                        'is_active' => $category->is_active,
                        'created_at' => $category->created_at,
                        'updated_at' => $category->updated_at,
                    ];
                });
            
            return response()->json($categories);
        } catch (\Exception $e) {
            \Log::error('Categories fetch error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch categories'], 500);
        }
    }
}
