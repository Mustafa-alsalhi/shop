<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function index(Request $request)
    {
        \Log::info('=== CART INDEX REQUEST ===');
        \Log::info('User ID:', [$request->user()->id]);
        
        $cartItems = Cart::with(['product', 'variant'])
            ->where('user_id', $request->user()->id)
            ->get();
        
        // Add total to each cart item
        $cartItems->transform(function ($item) {
            $item->total = ($item->price ?? 0) * $item->quantity;
            return $item;
        });
        
        \Log::info('Cart Items Count:', [$cartItems->count()]);
        \Log::info('Cart Items:', $cartItems->toArray());
        
        // Calculate totals
        $subtotal = $cartItems->sum(function ($item) {
            return ($item->price ?? 0) * $item->quantity;
        });
        $tax = $subtotal * 0.1; // 10% tax
        $total = $subtotal + $tax;
        $totalItems = $cartItems->sum('quantity');
        
        \Log::info('Cart Totals:', ['subtotal' => $subtotal, 'tax' => $tax, 'total' => $total, 'total_items' => $totalItems]);
        
        return response()->json([
            'items' => $cartItems,
            'subtotal' => $subtotal,
            'tax' => $tax,
            'total' => $total,
            'total_items' => $totalItems,
        ]);
    }

    public function store(Request $request)
    {
        \Log::info('=== CART STORE REQUEST ===');
        \Log::info('User ID:', [$request->user()->id]);
        \Log::info('Request Data:', $request->all());
        
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'variant_id' => 'nullable|exists:product_variants,id',
            'product_name' => 'nullable|string',
            'price' => 'nullable|numeric',
            'image_url' => 'nullable|string',
            'currency' => 'nullable|string|max:3',
        ]);

        $product = Product::findOrFail($request->product_id);

        if ($product->stock < $request->quantity) {
            return response()->json([
                'message' => 'Insufficient stock'
            ], 400);
        }

        // Check if cart item exists
        $existingItem = Cart::where('user_id', $request->user()->id)
            ->where('product_id', $request->product_id)
            ->where('product_variant_id', $request->variant_id)
            ->first();

        if ($existingItem) {
            // Update existing item
            $existingItem->quantity = $request->quantity;
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
            $cartItem = $existingItem;
            \Log::info('Updated existing cart item');
        } else {
            // Create new cart item
            $cartItem = Cart::create([
                'user_id' => $request->user()->id,
                'product_id' => $request->product_id,
                'product_variant_id' => $request->variant_id,
                'quantity' => $request->quantity,
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
            \Log::info('Created new cart item');
        }

        \Log::info('=== CART ITEM SAVED ===');
        \Log::info('Product Name:', [$cartItem->product_name]);
        \Log::info('Price:', [$cartItem->price]);
        \Log::info('Image URL:', [$cartItem->image_url]);
        \Log::info('Currency:', [$cartItem->currency]);
        \Log::info('SKU:', [$cartItem->sku]);
        \Log::info('Cart Item Full Data:', $cartItem->toArray());
        
        // Return the full cart with totals after adding
        $cartItems = Cart::with(['product', 'variant'])
            ->where('user_id', $request->user()->id)
            ->get();
        
        // Add total to each cart item
        $cartItems->transform(function ($item) {
            $item->total = ($item->price ?? 0) * $item->quantity;
            return $item;
        });
        
        // Calculate totals
        $subtotal = $cartItems->sum(function ($item) {
            return ($item->price ?? 0) * $item->quantity;
        });
        $tax = $subtotal * 0.1; // 10% tax
        $total = $subtotal + $tax;
        $totalItems = $cartItems->sum('quantity');
        
        return response()->json([
            'items' => $cartItems,
            'subtotal' => $subtotal,
            'tax' => $tax,
            'total' => $total,
            'total_items' => $totalItems,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $cartItem = Cart::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $cartItem->update([
            'quantity' => $request->quantity,
        ]);

        return response()->json($cartItem);
    }

    public function destroy(Request $request, $id)
    {
        $cartItem = Cart::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $cartItem->delete();

        return response()->json([
            'message' => 'Item removed from cart'
        ]);
    }
}
