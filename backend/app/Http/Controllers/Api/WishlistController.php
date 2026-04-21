<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Wishlist;
use App\Models\Product;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function index(Request $request)
    {
        \Log::info('=== WISHLIST INDEX ===');
        \Log::info('User ID:', [$request->user()->id]);
        
        $wishlistItems = Wishlist::with('product')
            ->where('user_id', $request->user()->id)
            ->get();
            
        \Log::info('Wishlist Items Count:', [$wishlistItems->count()]);
        \Log::info('Wishlist Items:', $wishlistItems->toArray());
            
        return response()->json($wishlistItems);
    }

    public function store(Request $request)
    {
        \Log::info('=== WISHLIST STORE REQUEST ===');
        \Log::info('User ID:', [$request->user()->id]);
        \Log::info('Request Data:', $request->all());
        
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'product_name' => 'nullable|string',
            'price' => 'nullable|numeric',
            'image_url' => 'nullable|string',
            'currency' => 'nullable|string|max:3',
        ]);

        // Check if wishlist item exists
        $existingItem = Wishlist::where('user_id', $request->user()->id)
            ->where('product_id', $request->product_id)
            ->first();

        if ($existingItem) {
            // Update existing item
            $existingItem->product_name = $request->product_name;
            $existingItem->price = $request->price;
            $existingItem->image_url = $request->image_url;
            $existingItem->sku = $request->sku;
            $existingItem->weight = $request->weight;
            $existingItem->dimensions = $request->dimensions;
            $existingItem->category = $request->category;
            $existingItem->brand = $request->brand;
            $existingItem->description = $request->description;
            $existingItem->short_description = $request->short_description;
            $existingItem->status = $request->status;
            $existingItem->featured = $request->featured;
            $existingItem->variant_attributes = $request->variant_attributes;
            $existingItem->currency = $request->currency;
            $existingItem->save();
            $wishlistItem = $existingItem;
            \Log::info('Updated existing wishlist item');
        } else {
            // Create new wishlist item
            $wishlistItem = Wishlist::create([
                'user_id' => $request->user()->id,
                'product_id' => $request->product_id,
                'product_name' => $request->product_name,
                'price' => $request->price,
                'image_url' => $request->image_url,
                'sku' => $request->sku,
                'weight' => $request->weight,
                'dimensions' => $request->dimensions,
                'category' => $request->category,
                'brand' => $request->brand,
                'description' => $request->description,
                'short_description' => $request->short_description,
                'status' => $request->status,
                'featured' => $request->featured,
                'variant_attributes' => $request->variant_attributes,
                'currency' => $request->currency,
            ]);
            \Log::info('Created new wishlist item');
        }

        \Log::info('=== WISHLIST ITEM SAVED ===');
        \Log::info('Product Name:', [$wishlistItem->product_name]);
        \Log::info('Price:', [$wishlistItem->price]);
        \Log::info('Image URL:', [$wishlistItem->image_url]);
        \Log::info('Currency:', [$wishlistItem->currency]);
        \Log::info('Wishlist Item Full Data:', $wishlistItem->toArray());

        return response()->json($wishlistItem, 201);
    }

    public function destroy(Request $request, $id)
    {
        \Log::info('=== WISHLIST DESTROY ===');
        \Log::info('User ID:', [$request->user()->id]);
        \Log::info('Item ID:', [$id]);
        
        $wishlistItem = Wishlist::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $wishlistItem->delete();

        \Log::info('Wishlist item deleted successfully');

        return response()->json([
            'message' => 'Item removed from wishlist'
        ]);
    }

    public function clear(Request $request)
    {
        \Log::info('=== WISHLIST CLEAR ===');
        \Log::info('User ID:', [$request->user()->id]);
        
        Wishlist::where('user_id', $request->user()->id)
            ->delete();

        \Log::info('All wishlist items cleared successfully');

        return response()->json([
            'message' => 'Wishlist cleared successfully'
        ]);
    }
}
