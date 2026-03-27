<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function clothing(Request $request)
    {
        try {
            // Get products specifically from clothing category
            $query = Product::with('category')
                ->whereHas('category', function ($query) {
                    $query->where('slug', 'clothing')
                        ->orWhere('name', 'LIKE', '%clothing%')
                        ->orWhere('name', 'LIKE', '%ملابس%');
                })
                ->where('is_active', true);
            
            // Apply other filters
            if ($request->has('search')) {
                $search = $request->get('search');
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'LIKE', "%{$search}%")
                      ->orWhere('description', 'LIKE', "%{$search}%");
                });
            }
            
            if ($request->has('min_price')) {
                $query->where('price', '>=', $request->get('min_price'));
            }
            
            if ($request->has('max_price')) {
                $query->where('price', '<=', $request->get('max_price'));
            }
            
            if ($request->has('rating')) {
                $query->where('rating', '>=', $request->get('rating'));
            }
            
            if ($request->has('in_stock')) {
                $query->where('stock', '>', 0);
            }
            
            // Apply sorting
            $sortBy = $request->get('sortBy', 'created_at');
            $sortOrder = $request->get('sortOrder', 'desc');
            
            switch ($sortBy) {
                case 'price':
                    $query->orderBy('price', $sortOrder);
                    break;
                case 'name':
                    $query->orderBy('name', $sortOrder);
                    break;
                case 'rating':
                    $query->orderBy('rating', $sortOrder);
                    break;
                case 'created_at':
                    if ($sortOrder === 'desc') {
                        $query->orderBy('created_at', 'desc');
                    } else {
                        $query->orderBy('created_at', 'asc');
                    }
                    break;
                default:
                    $query->orderBy('created_at', 'desc');
                    break;
            }
            
            $products = $query->paginate(12);
            
            \Log::info('Clothing products fetched', [
                'count' => $products->total(),
                'search' => $request->get('search'),
                'filters' => $request->all()
            ]);
            
            return response()->json([
                'data' => $products->items(),
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
                'from' => $products->firstItem(),
                'to' => $products->lastItem()
            ]);
        } catch (\Exception $e) {
            \Log::error('Clothing products fetch error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch clothing products'], 500);
        }
    }

    public function kids(Request $request)
    {
        try {
            // Get products specifically from kids category
            $query = Product::with('category')
                ->whereHas('category', function ($query) {
                    $query->where('slug', 'kids')
                        ->orWhere('name', 'LIKE', '%kids%')
                        ->orWhere('name', 'LIKE', '%أولاد%')
                        ->orWhere('name', 'LIKE', '%بنات%');
                })
                ->where('is_active', true);
            
            // Apply other filters
            if ($request->has('search')) {
                $search = $request->get('search');
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'LIKE', "%{$search}%")
                      ->orWhere('description', 'LIKE', "%{$search}%");
                });
            }
            
            if ($request->has('min_price')) {
                $query->where('price', '>=', $request->get('min_price'));
            }
            
            if ($request->has('max_price')) {
                $query->where('price', '<=', $request->get('max_price'));
            }
            
            if ($request->has('rating')) {
                $query->where('rating', '>=', $request->get('rating'));
            }
            
            if ($request->has('in_stock')) {
                $query->where('stock', '>', 0);
            }
            
            // Apply sorting
            $sortBy = $request->get('sortBy', 'created_at');
            $sortOrder = $request->get('sortOrder', 'desc');
            
            switch ($sortBy) {
                case 'price':
                    $query->orderBy('price', $sortOrder);
                    break;
                case 'name':
                    $query->orderBy('name', $sortOrder);
                    break;
                case 'rating':
                    $query->orderBy('rating', $sortOrder);
                    break;
                case 'created_at':
                    if ($sortOrder === 'desc') {
                        $query->orderBy('created_at', 'desc');
                    } else {
                        $query->orderBy('created_at', 'asc');
                    }
                    break;
                default:
                    $query->orderBy('created_at', 'desc');
                    break;
            }
            
            $products = $query->paginate(12);
            
            \Log::info('Kids products fetched', [
                'count' => $products->total(),
                'search' => $request->get('search'),
                'filters' => $request->all()
            ]);
            
            return response()->json([
                'data' => $products->items(),
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
                'from' => $products->firstItem(),
                'to' => $products->lastItem()
            ]);
        } catch (\Exception $e) {
            \Log::error('Kids products fetch error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch kids products'], 500);
        }
    }

    public function electronics(Request $request)
    {
        try {
            // Get products specifically from electronics category
            $query = Product::with('category')
                ->whereHas('category', function ($query) {
                    $query->where('slug', 'electronics')
                        ->orWhere('name', 'LIKE', '%electronics%')
                        ->orWhere('name', 'LIKE', '%إلكترونيات%');
                })
                ->where('is_active', true);
            
            // Apply other filters
            if ($request->has('search')) {
                $search = $request->get('search');
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'LIKE', "%{$search}%")
                      ->orWhere('description', 'LIKE', "%{$search}%");
                });
            }
            
            if ($request->has('min_price')) {
                $query->where('price', '>=', $request->get('min_price'));
            }
            
            if ($request->has('max_price')) {
                $query->where('price', '<=', $request->get('max_price'));
            }
            
            if ($request->has('rating')) {
                $query->where('rating', '>=', $request->get('rating'));
            }
            
            if ($request->has('in_stock')) {
                $query->where('stock', '>', 0);
            }
            
            // Apply sorting
            $sortBy = $request->get('sortBy', 'created_at');
            $sortOrder = $request->get('sortOrder', 'desc');
            
            switch ($sortBy) {
                case 'price':
                    $query->orderBy('price', $sortOrder);
                    break;
                case 'name':
                    $query->orderBy('name', $sortOrder);
                    break;
                case 'rating':
                    $query->orderBy('rating', $sortOrder);
                    break;
                case 'created_at':
                    if ($sortOrder === 'desc') {
                        $query->orderBy('created_at', 'desc');
                    } else {
                        $query->orderBy('created_at', 'asc');
                    }
                    break;
                default:
                    $query->orderBy('created_at', 'desc');
                    break;
            }
            
            $products = $query->paginate(12);
            
            \Log::info('Electronics products fetched', [
                'count' => $products->total(),
                'search' => $request->get('search'),
                'filters' => $request->all()
            ]);
            
            return response()->json([
                'data' => $products->items(),
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
                'from' => $products->firstItem(),
                'to' => $products->lastItem()
            ]);
        } catch (\Exception $e) {
            \Log::error('Electronics products fetch error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch electronics products'], 500);
        }
    }

    public function index(Request $request)
    {
        // Get all products by default (active and inactive)
        $query = Product::with('category');
        
        // Filter by active status (only if explicitly requested)
        if ($request->has('is_active') && $request->boolean('is_active')) {
            $query->where('is_active', true);
        }
        
        // Filter by category (support multiple categories)
        if ($request->has('category_id') || $request->has('category')) {
            $categoryIds = $request->input('category_id') ?? $request->input('category');
            
            // Handle both single category and multiple categories
            if (is_string($categoryIds)) {
                $categoryIds = explode(',', $categoryIds);
            }
            
            // Filter out empty values and convert to integers
            $categoryIds = array_filter($categoryIds, function($id) {
                return !empty($id) && is_numeric($id);
            });
            $categoryIds = array_map('intval', $categoryIds);
            
            if (!empty($categoryIds)) {
                \Log::info('Filtering by category IDs: ' . implode(', ', $categoryIds));
                $query->whereIn('category_id', $categoryIds);
            }
        }
        
        // Filter by status
        if ($request->has('status')) {
            $status = $request->input('status');
            switch ($status) {
                case 'active':
                    $query->where('is_active', true);
                    break;
                case 'inactive':
                    $query->where('is_active', false);
                    break;
                case 'draft':
                    $query->where('is_active', false);
                    break;
                case 'featured':
                    $query->where('is_featured', true);
                    break;
            }
        }
        
        // Filter by featured products
        if ($request->has('featured') && $request->boolean('featured')) {
            $query->where('is_featured', true);
        }
        
        // Search
        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }
        
        // Filter by price range
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        
        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }
        
        // Filter by rating
        if ($request->has('rating')) {
            $query->where('rating', '>=', $request->rating);
        }
        
        // Filter by stock status
        if ($request->has('in_stock') && $request->boolean('in_stock')) {
            $query->where('stock', '>', 0);
        }
        
        // Sort products
        $sortBy = $request->get('sortBy', 'created_at');
        $sortOrder = $request->get('sortOrder', 'desc');
        
        // Handle different sort options
        switch ($sortBy) {
            case 'created_at':
                if ($sortOrder === 'desc') {
                    // Sort by created_at ONLY - no featured prioritization for new products
                    $query->orderBy('created_at', 'desc');
                } else {
                    $query->orderBy('created_at', 'asc');
                }
                break;
            case 'name':
                $query->orderBy('name', $sortOrder);
                break;
            case 'price':
                $query->orderBy('price', $sortOrder);
                break;
            case 'rating':
                $query->orderBy('rating', $sortOrder);
                break;
            case 'sales':
                $query->orderBy('sales_count', $sortOrder);
                break;
            default:
                $query->orderBy('created_at', 'desc');
                break;
        }
        
        $products = $query->paginate(12);
        
        // Debug logging for all products
        \Log::info('All products query executed', [
            'category_id' => $request->has('category_id') ? $request->get('category_id') : 'none',
            'category_slug' => $request->has('category') ? $request->get('category') : 'none',
            'search' => $request->has('search') ? $request->get('search') : 'none',
            'min_price' => $request->has('min_price') ? $request->get('min_price') : 'none',
            'max_price' => $request->has('max_price') ? $request->get('max_price') : 'none',
            'rating' => $request->has('rating') ? $request->get('rating') : 'none',
            'in_stock' => $request->has('in_stock') ? $request->get('in_stock') : 'none',
            'featured' => $request->has('featured') ? $request->get('featured') : 'none',
            'sortBy' => $sortBy,
            'sortOrder' => $sortOrder,
            'total_count' => $query->count(),
            'returned_count' => $products->count(),
            'current_page' => $products->currentPage(),
            'last_page' => $products->lastPage()
        ]);
        
        return response()->json($products);
    }
    
    public function featured(Request $request)
    {
        $query = Product::with('category')
            ->where('is_featured', true);
        
        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);
        
        $products = $query->paginate($request->get('per_page', 12));
        
        return response()->json($products);
    }
    
    public function show($id)
    {
        $product = Product::with(['category', 'reviews.user'])->findOrFail($id);
        
        return response()->json($product);
    }
    
    public function related($id)
    {
        $product = Product::findOrFail($id);
        
        $relatedProducts = Product::where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->where('is_active', true)
            ->inRandomOrder()
            ->take(4)
            ->get();
            
        return response()->json($relatedProducts);
    }
}
