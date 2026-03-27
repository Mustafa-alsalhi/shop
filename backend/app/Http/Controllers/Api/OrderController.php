<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        Log::info('=== ORDER CONTROLLER - Getting User Orders ===');
        
        $orders = Order::with(['items.product'])
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate(10);
            
        Log::info('Orders fetched:', ['count' => $orders->count()]);
        
        // Transform the data to ensure image URLs are properly formatted
        $orders->getCollection()->transform(function ($order) {
            $order->items->transform(function ($item) {
                // Ensure image_url is properly set
                if (!$item->image_url && $item->product) {
                    $item->image_url = $item->product->image_url;
                }
                
                // Convert relative URLs to absolute
                if ($item->image_url && str_starts_with($item->image_url, '/')) {
                    $item->image_url = url($item->image_url);
                }
                
                return $item;
            });
            return $order;
        });
            
        return response()->json($orders);
    }

    public function store(Request $request)
    {
        Log::info('=== ORDER CONTROLLER - Creating Order ===');
        Log::info('Request data:', $request->all());
        
        $request->validate([
            'shipping_address' => 'required|array',
            'billing_address' => 'nullable|array',
            'payment_method' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        $user = $request->user();
        Log::info('User ID:', ['user_id' => $user->id]);
        
        $cartItems = Cart::with('product')->where('user_id', $user->id)->get();
        Log::info('Cart items count:', ['count' => $cartItems->count()]);

        if ($cartItems->isEmpty()) {
            Log::warning('Cart is empty for user:', ['user_id' => $user->id]);
            return response()->json([
                'message' => 'Cart is empty'
            ], 400);
        }

        try {
            DB::beginTransaction();

            $subtotal = $cartItems->sum(function ($item) {
                return $item->product->price * $item->quantity;
            });

            $tax = $subtotal * 0.1; // 10% tax
            $shipping = $subtotal > 50 ? 0 : 10; // Free shipping over $50
            $total = $subtotal + $tax + $shipping;
            
            Log::info('Order totals:', [
                'subtotal' => $subtotal,
                'tax' => $tax,
                'shipping' => $shipping,
                'total' => $total
            ]);

            $order = Order::create([
                'user_id' => $user->id,
                'order_number' => 'ORD-' . strtoupper(uniqid()),
                'subtotal' => $subtotal,
                'tax' => $tax,
                'shipping' => $shipping,
                'total_amount' => $total,
                'status' => 'pending',
                'payment_status' => 'pending',
                'payment_method' => $request->payment_method,
                'shipping_address' => $request->shipping_address,
                'billing_address' => $request->billing_address ?? $request->shipping_address,
                'notes' => $request->notes,
            ]);

            Log::info('Order created:', ['order_id' => $order->id, 'order_number' => $order->order_number]);

            foreach ($cartItems as $cartItem) {
                $imageUrl = $cartItem->product->image_url ?? null;
                
                // Convert relative URL to absolute for storage
                if ($imageUrl && str_starts_with($imageUrl, '/')) {
                    $imageUrl = url($imageUrl);
                }
                
                Log::info('Processing order item:', [
                    'product_id' => $cartItem->product_id,
                    'product_name' => $cartItem->product->name,
                    'original_image_url' => $cartItem->product->image_url,
                    'final_image_url' => $imageUrl,
                    'cart_item_id' => $cartItem->id
                ]);
                
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $cartItem->product_id,
                    'product_variant_id' => $cartItem->product_variant_id,
                    'product_name' => $cartItem->product->name,
                    'product_sku' => $cartItem->product->sku,
                    'quantity' => $cartItem->quantity,
                    'price' => $cartItem->product->price,
                    'total' => $cartItem->product->price * $cartItem->quantity,
                    'image_url' => $imageUrl,
                ]);

                // Update product stock
                $cartItem->product->decrement('stock', $cartItem->quantity);
            }

            // Clear cart
            Cart::where('user_id', $user->id)->delete();
            Log::info('Cart cleared for user:', ['user_id' => $user->id]);

            DB::commit();
            Log::info('✅ Order created successfully:', ['order_id' => $order->id]);

            // Load the complete order with items for response
            $completeOrder = Order::with(['items.product'])->find($order->id);
            
            // Transform the order items to include proper image URLs
            $completeOrder->items->transform(function ($item) {
                if (!$item->image_url && $item->product) {
                    $item->image_url = $item->product->image_url;
                }
                
                if ($item->image_url && str_starts_with($item->image_url, '/')) {
                    $item->image_url = url($item->image_url);
                }
                
                Log::info('Final order item image:', [
                    'product_name' => $item->product_name,
                    'image_url' => $item->image_url
                ]);
                
                return $item;
            });

            return response()->json($completeOrder, 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('❌ Failed to create order:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Failed to create order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show(Request $request, $id)
    {
        $order = Order::with(['items.product', 'items.variant'])
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);
            
        return response()->json($order);
    }
}
