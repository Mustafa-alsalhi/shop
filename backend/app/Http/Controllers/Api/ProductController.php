<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function clothing(Request $request)
    {
        return $this->getCategoryProducts($request, 2);
    }

    public function sports(Request $request)
    {
        return $this->getCategoryProducts($request, 5);
    }

    public function electronics(Request $request)
    {
        return $this->getCategoryProducts($request, 1);
    }

    private function getCategoryProducts(Request $request, $categoryId)
    {
        try {
            $query = Product::with(['category', 'tax'])
                ->where('category_id', $categoryId)
                ->where('is_active', true);

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

            $sortBy = $request->get('sortBy', 'created_at');
            $sortOrder = $request->get('sortOrder', 'desc');

            switch ($sortBy) {
                case 'price':
                case 'name':
                case 'rating':
                    $query->orderBy($sortBy, $sortOrder);
                    break;
                default:
                    $query->orderBy('created_at', $sortOrder === 'desc' ? 'desc' : 'asc');
                    break;
            }

            return response()->json($query->paginate(12));
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch products'], 500);
        }
    }

    public function index(Request $request)
    {
        $query = Product::with(['category', 'seller']);

        if (!$request->has('seller_id')) {
            $query->where('is_approved', true);
        }

        if ($request->has('is_active') && $request->boolean('is_active')) {
            $query->where('is_active', true);
        }

        if ($request->has('category_id') || $request->has('category')) {
            $categoryIds = $request->input('category_id') ?? $request->input('category');
            if (is_string($categoryIds)) {
                // If the parameter is a single slug, try to resolve it to an ID first
                if (!is_numeric($categoryIds) && strpos($categoryIds, ',') === false) {
                    $cat = \App\Models\Category::where('slug', $categoryIds)->first();
                    if ($cat) {
                        $categoryIds = [$cat->id];
                    } else {
                        $categoryIds = explode(',', $categoryIds);
                    }
                } else {
                    $categoryIds = explode(',', $categoryIds);
                }
            } else if (!is_array($categoryIds)) {
                $categoryIds = [$categoryIds];
            }

            $categoryIds = array_filter($categoryIds, function ($id) {
                return !empty($id) && is_numeric($id); });
            $categoryIds = array_map('intval', $categoryIds);

            if (!empty($categoryIds)) {
                // Include products from sub-categories of the selected categories
                $subCategoryIds = \App\Models\Category::whereIn('parent_id', $categoryIds)->pluck('id')->toArray();
                $allCategoryIds = array_unique(array_merge($categoryIds, $subCategoryIds));

                $query->whereIn('category_id', $allCategoryIds);
            }
        }

        if ($request->has('status')) {
            $status = $request->input('status');
            if ($status === 'active')
                $query->where('is_active', true);
            else if ($status === 'inactive' || $status === 'draft')
                $query->where('is_active', false);
            else if ($status === 'featured')
                $query->where('is_featured', true);
        }

        if ($request->has('featured') && $request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                    ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->has('min_price'))
            $query->where('price', '>=', $request->min_price);
        if ($request->has('max_price'))
            $query->where('price', '<=', $request->max_price);
        if ($request->has('rating'))
            $query->where('rating', '>=', $request->rating);
        if ($request->has('in_stock') && $request->boolean('in_stock'))
            $query->where('stock', '>', 0);
        if ($request->has('seller_id'))
            $query->where('seller_id', $request->seller_id);

        $sortBy = $request->get('sortBy', 'created_at');
        $sortOrder = $request->get('sortOrder', 'desc');

        switch ($sortBy) {
            case 'name':
            case 'price':
            case 'rating':
            case 'sold_count':
                $query->orderBy($sortBy, $sortOrder);
                break;
            case 'sales':
                $query->orderBy('sold_count', $sortOrder);
                break;
            default:
                $query->orderBy('created_at', $sortOrder === 'asc' ? 'asc' : 'desc');
                break;
        }

        return response()->json($query->paginate(12));
    }

    public function bestSellers(Request $request)
    {
        try {
            $limit = $request->get('limit', 12);
            $bestsellers = Product::with(['category', 'tax'])
                ->where('is_active', true)
                ->orderBy('sold_count', 'desc')
                ->take($limit)
                ->get();
            return response()->json(['data' => $bestsellers]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch best sellers', 'message' => $e->getMessage()], 500);
        }
    }

    public function topSellers()
    {
        try {
            $sortedSellers = \Illuminate\Support\Facades\Cache::remember('api_top_sellers', 600, function () {
                $sellers = \App\Models\Seller::withCount('products')
                    ->withSum('products', 'sold_count')
                    ->where('status', 'active')
                    ->get();

                $sellerReviewsAgg = DB::table('reviews')
                    ->join('products', 'reviews.product_id', '=', 'products.id')
                    ->whereIn('products.seller_id', $sellers->pluck('id'))
                    ->whereNotNull('reviews.rating')
                    ->where('reviews.rating', '>', 0)
                    ->select('products.seller_id', DB::raw('AVG(reviews.rating) as avg_rating'), DB::raw('COUNT(reviews.id) as reviews_count'))
                    ->groupBy('products.seller_id')
                    ->get()
                    ->keyBy('seller_id');

                $processedSellers = $sellers->map(function ($seller) use ($sellerReviewsAgg) {
                    $totalSales = $seller->products_sum_sold_count ?? 0;
                    $reviewData = $sellerReviewsAgg->get($seller->id);
                    $avgRating = $reviewData ? round((float) $reviewData->avg_rating, 1) : 0;
                    $reviewsCount = $reviewData ? $reviewData->reviews_count : 0;

                    return [
                        'id' => $seller->id,
                        'store_name' => $seller->store_name,
                        'description' => $seller->description,
                        'avatar' => $seller->avatar,
                        'is_verified' => $seller->is_verified,
                        'status' => $seller->status,
                        'rating' => round($avgRating, 1),
                        'reviews_count' => $reviewsCount,
                        'total_products' => $seller->products_count,
                        'total_sales' => $totalSales,
                        'created_at' => $seller->created_at,
                        'updated_at' => $seller->updated_at,
                    ];
                });

                return $processedSellers->sortByDesc(function ($seller) {
                    return min($seller['total_sales'] / 10, 50) + ($seller['rating'] * 10);
                })->values()->take(12);
            });

            return response()->json([
                'data' => $sortedSellers,
                'message' => 'Top sellers fetched successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch top sellers', 'message' => $e->getMessage()], 500);
        }
    }

    public function featured(Request $request)
    {
        $page = $request->get('page', 1);
        $perPage = $request->get('per_page', 12);

        $products = \Illuminate\Support\Facades\Cache::remember("api_featured_products_page_{$page}_{$perPage}", 600, function () use ($request, $perPage) {
            $query = Product::with(['category', 'seller'])->where('is_featured', true);
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);
            return $query->paginate($perPage);
        });

        return response()->json($products);
    }

    public function show($id)
    {
        $product = Product::with(['category', 'tax', 'reviews.user', 'seller'])->findOrFail($id);
        if ($product->seller) {
            $product->seller_name = $product->seller->store_name;
            $product->seller_avatar = $product->seller->avatar;
            $product->seller_rating = $product->seller->rating;
            $product->seller_reviews_count = $product->seller->reviews_count;
            $product->seller_id = $product->seller->id;
            if ($product->seller->user_id)
                $product->seller_user_id = $product->seller->user_id;
        }
        return response()->json($product);
    }

    public function related($id)
    {
        $product = Product::findOrFail($id);
        $relatedProducts = Product::where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->where('is_active', true)
            ->inRandomOrder()->take(4)->get();
        return response()->json($relatedProducts);
    }

    public function getSeller($id)
    {
        try {
            $seller = \App\Models\Seller::find($id);
            if (!$seller)
                return response()->json(['success' => false, 'message' => 'Seller not found'], 404);

            $productCount = Product::where('seller_id', $seller->id)->count();
            $categories = \App\Models\Category::whereHas('products', function ($query) use ($seller) {
                $query->where('seller_id', $seller->id);
            })->withCount([
                        'products' => function ($query) use ($seller) {
                            $query->where('seller_id', $seller->id);
                        }
                    ])->get()->map(function ($category) {
                        return [
                            'id' => $category->id,
                            'name' => $category->name,
                            'slug' => $category->slug,
                            'image' => $category->image,
                            'products_count' => $category->products_count,
                        ];
                    });

            $reviews = DB::table('reviews')
                ->join('products', 'reviews.product_id', '=', 'products.id')
                ->where('products.seller_id', $seller->id)
                ->whereNotNull('reviews.rating')
                ->where('reviews.rating', '>', 0)
                ->select('reviews.rating', 'reviews.id')
                ->get();

            $avgRating = $reviews->count() > 0 ? round($reviews->avg('rating'), 1) : 0;

            $sellerData = [
                'id' => $seller->id,
                'user_id' => $seller->user_id,
                'store_name' => $seller->store_name,
                'description' => $seller->description,
                'avatar' => $seller->avatar,
                'is_verified' => $seller->is_verified,
                'status' => $seller->status,
                'rating' => $avgRating,
                'reviews_count' => $reviews->count(),
                'total_products' => $productCount,
                'categories' => $categories,
                'created_at' => $seller->created_at,
                'updated_at' => $seller->updated_at,
            ];
            return response()->json(['data' => $sellerData, 'message' => 'Seller fetched successfully']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    public function sellerProducts(Request $request)
    {
        try {
            $seller = auth()->user()->seller;
            if (!$seller)
                return response()->json(['error' => 'Seller profile not found'], 404);

            $query = Product::where('seller_id', $seller->id)->with(['category', 'tax']);
            if ($request->has('search')) {
                $search = $request->get('search');
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', '%' . $search . '%')
                        ->orWhere('description', 'like', '%' . $search . '%')
                        ->orWhere('sku', 'like', '%' . $search . '%');
                });
            }
            if ($request->has('status')) {
                $status = $request->get('status');
                if ($status === 'active')
                    $query->where('is_active', true);
                elseif ($status === 'inactive')
                    $query->where('is_active', false);
            }
            return response()->json($query->orderBy('created_at', 'desc')->paginate(20));
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to fetch products'], 500);
        }
    }

    public function sellerStoreProduct(Request $request)
    {
        try {
            $seller = auth()->user()->seller;
            if (!$seller)
                return response()->json(['error' => 'Seller profile not found'], 404);

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'required|string',
                'price' => 'required|numeric|min:0',
                'stock' => 'required|integer|min:0',
                'category_id' => 'required|exists:categories,id',
                'subcategory_id' => [
                    function ($attribute, $value, $fail) use ($request) {
                        if ($request->filled('category_id')) {
                            $hasChildren = \App\Models\Category::where('parent_id', $request->category_id)->exists();
                            if ($hasChildren && empty($value)) {
                                $fail('الفئة الفرعية مطلوبة لأن الفئة الرئيسية المختارة تحتوي على أقسام فرعية.');
                            }
                            if (!empty($value)) {
                                $validSub = \App\Models\Category::where('id', $value)->where('parent_id', $request->category_id)->exists();
                                if (!$validSub) {
                                    $fail('الفئة الفرعية المختارة غير صالحة أو لا تتبع الفئة الرئيسية.');
                                }
                            }
                        }
                    }
                ],
                'currency' => 'required|string|max:10',
                'condition' => 'required|in:new,used,refurbished',
                'detailed_description' => 'nullable|string',
                'sale_price' => 'nullable|numeric|min:0',
                'tax_id' => 'nullable|exists:taxes,id',
                'variants' => 'nullable|string',
                'food_options' => 'nullable',
                'preparation_time' => 'nullable|integer|min:1',
                'image_url' => 'nullable|file|image|mimes:jpeg,png,jpg,webp|max:2048',
                'gallery_images.*' => 'nullable|file|image|mimes:jpeg,png,jpg,webp|max:2048',
            ]);

            if ($request->filled('subcategory_id')) {
                $validated['category_id'] = $request->subcategory_id;
            }

            $product = new Product();
            $product->name = $validated['name'];
            $product->description = $validated['description'];
            $product->price = $validated['price'];
            $product->stock = $validated['stock'];
            $product->category_id = $validated['category_id'];
            $product->seller_id = $seller->id;
            $product->currency = $validated['currency'];
            $product->condition = $validated['condition'];
            $product->detailed_description = $validated['detailed_description'] ?? null;
            $product->sale_price = $validated['sale_price'] ?? null;
            if (isset($validated['tax_id'])) {
                $product->tax_id = $validated['tax_id'];
            }
            if (!empty($validated['variants'])) {
                $product->variants = json_decode($validated['variants'], true);
            }
            if ($request->has('food_options')) {
                $foodOpts = $request->food_options;
                $product->food_options = is_string($foodOpts) ? json_decode($foodOpts, true) : $foodOpts;
            }
            if ($request->has('preparation_time')) {
                $product->preparation_time = $request->preparation_time;
            }

            if ($request->hasFile('image_url')) {
                $image = $request->file('image_url');
                $imageName = time() . '.' . $image->getClientOriginalExtension();
                $image->move(public_path('images/products'), $imageName);
                $product->image_url = '/images/products/' . $imageName;
            } else {
                // Provide a default image if none is uploaded to avoid DB constraint errors
                $product->image_url = 'assets/images/default-product.png';
            }

            if ($request->hasFile('gallery_images')) {
                $galleryPaths = [];
                foreach ($request->file('gallery_images') as $file) {
                    $imageName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                    $file->move(public_path('images/products/gallery'), $imageName);
                    $galleryPaths[] = '/images/products/gallery/' . $imageName;
                }
                $product->gallery_images = $galleryPaths;
            }

            $product->is_approved = true;
            $product->is_active = true;
            $product->slug = Str::slug($validated['name']) . '-' . time();
            $product->sku = 'SKU-' . strtoupper(Str::random(8)) . '-' . time();
            $product->save();

            return response()->json(['message' => 'Product created successfully', 'product' => $product], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to create product: ' . $e->getMessage()], 500);
        }
    }

    public function sellerGetProduct($id)
    {
        try {
            $seller = auth()->user()->seller;
            if (!$seller)
                return response()->json(['error' => 'Seller profile not found'], 404);
            $product = Product::where('seller_id', $seller->id)->where('id', $id)->with(['category', 'tax'])->firstOrFail();
            return response()->json($product);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Product not found'], 404);
        }
    }

    public function sellerUpdateProduct(Request $request, $id)
    {
        try {
            $seller = auth()->user()->seller;
            if (!$seller)
                return response()->json(['error' => 'Seller profile not found'], 404);
            $product = Product::where('seller_id', $seller->id)->where('id', $id)->firstOrFail();
            $validated = $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'description' => 'sometimes|required|string',
                'price' => 'sometimes|required|numeric|min:0',
                'stock' => 'sometimes|required|integer|min:0',
                'category_id' => 'sometimes|required|exists:categories,id',
                'subcategory_id' => [
                    function ($attribute, $value, $fail) use ($request) {
                        if ($request->filled('category_id')) {
                            $hasChildren = \App\Models\Category::where('parent_id', $request->category_id)->exists();
                            if ($hasChildren && empty($value)) {
                                $fail('الفئة الفرعية مطلوبة لأن الفئة الرئيسية المختارة تحتوي على أقسام فرعية.');
                            }
                            if (!empty($value)) {
                                $validSub = \App\Models\Category::where('id', $value)->where('parent_id', $request->category_id)->exists();
                                if (!$validSub) {
                                    $fail('الفئة الفرعية المختارة غير صالحة أو لا تتبع الفئة الرئيسية.');
                                }
                            }
                        }
                    }
                ],
                'currency' => 'sometimes|required|string|max:10',
                'condition' => 'sometimes|required|in:new,used,refurbished',
                'detailed_description' => 'nullable|string',
                'sale_price' => 'nullable|numeric|min:0',
                'tax_id' => 'nullable|exists:taxes,id',
                'variants' => 'nullable|string',
                'food_options' => 'nullable',
                'preparation_time' => 'nullable|integer|min:1',
                'image_url' => 'nullable|file|image|mimes:jpeg,png,jpg,webp|max:2048',
                'gallery_images.*' => 'nullable|file|image|mimes:jpeg,png,jpg,webp|max:2048',
            ]);

            $updateData = $request->all();
            if ($request->filled('subcategory_id')) {
                $updateData['category_id'] = $request->subcategory_id;
            }
            if ($request->has('variants') && !empty($request->variants)) {
                $updateData['variants'] = is_string($request->variants) ? json_decode($request->variants, true) : $request->variants;
            }
            if ($request->has('food_options')) {
                $foodOpts = $request->food_options;
                $updateData['food_options'] = is_string($foodOpts) ? json_decode($foodOpts, true) : $foodOpts;
            }
            if ($request->has('preparation_time')) {
                $updateData['preparation_time'] = $request->preparation_time;
            }

            if ($request->hasFile('image_url')) {
                $image = $request->file('image_url');
                $imageName = time() . '.' . $image->getClientOriginalExtension();
                $image->move(public_path('images/products'), $imageName);
                $updateData['image_url'] = '/images/products/' . $imageName;
            }

            if ($request->hasFile('gallery_images')) {
                $galleryPaths = $product->gallery_images ?? [];
                foreach ($request->file('gallery_images') as $file) {
                    $imageName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                    $file->move(public_path('images/products/gallery'), $imageName);
                    $galleryPaths[] = '/images/products/gallery/' . $imageName;
                }
                $updateData['gallery_images'] = $galleryPaths;
            }

            $product->update($updateData);
            return response()->json(['message' => 'Product updated successfully', 'product' => $product]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to update product'], 500);
        }
    }

    public function sellerDeleteProduct($id)
    {
        try {
            $seller = auth()->user()->seller;
            if (!$seller)
                return response()->json(['error' => 'Seller profile not found'], 404);
            $product = Product::where('seller_id', $seller->id)->where('id', $id)->firstOrFail();
            $product->delete();
            return response()->json(['message' => 'Product deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to delete product'], 500);
        }
    }
}
