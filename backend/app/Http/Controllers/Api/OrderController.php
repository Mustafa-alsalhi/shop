<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Cart;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    public function calculateDelivery(Request $request)
    {
        $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        $user = $request->user();
        $cartItems = Cart::with(['product.seller'])->where('user_id', $user->id)->get();

        if ($cartItems->isEmpty()) {
            return response()->json([
                'fee' => 0,
                'distance_km' => 0,
                'message' => 'Cart is empty'
            ]);
        }

        $customerLat = $request->latitude;
        $customerLng = $request->longitude;

        $sellersGroup = [];
        foreach ($cartItems as $item) {
            $sellerId = $item->product->seller_id;
            if ($sellerId && $item->product->seller) {
                if (!isset($sellersGroup[$sellerId])) {
                    $sellersGroup[$sellerId] = [
                        'latitude' => $item->product->seller->latitude,
                        'longitude' => $item->product->seller->longitude,
                    ];
                }
            } else {
                $sellersGroup['admin'] = ['latitude' => null, 'longitude' => null];
            }
        }

        $totalFee = 0;
        $maxDistance = 0;

        foreach ($sellersGroup as $sellerId => $location) {
            if ($location['latitude'] && $location['longitude']) {
                $result = \App\Services\DeliveryService::calculateFee(
                    $customerLat, $customerLng,
                    $location['latitude'], $location['longitude']
                );
                $totalFee += $result['fee'];
                if ($result['distance_km'] > $maxDistance) {
                    $maxDistance = $result['distance_km'];
                }
            } else {
                $totalFee += env('BASE_DELIVERY_FEE', 15);
            }
        }

        return response()->json([
            'fee' => $totalFee,
            'distance_km' => $maxDistance,
            'message' => "Estimated delivery calculated successfully"
        ]);
    }
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
            'shipping_company' => 'nullable|string',
            'notes' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'formatted_address' => 'nullable|string',
            'building_details' => 'nullable|string',
        ]);

        $user = $request->user();
        Log::info('User ID:', ['user_id' => $user->id]);
        
        $cartItems = Cart::with(['product.seller', 'product.tax'])->where('user_id', $user->id)->get();
        Log::info('Cart items count:', ['count' => $cartItems->count()]);

        if ($cartItems->isEmpty()) {
            Log::warning('Cart is empty for user:', ['user_id' => $user->id]);
            return response()->json([
                'message' => 'Cart is empty'
            ], 400);
        }

        // التحقق من حالة المطعم قبل قبول الطلب
        foreach ($cartItems as $cItem) {
            if ($cItem->product && $cItem->product->seller && $cItem->product->seller->type === 'restaurant') {
                $rest = $cItem->product->seller;
                if (!$rest->is_open || !$rest->accepting_orders) {
                    return response()->json([
                        'message' => "عذراً، المطعم ({$rest->store_name}) مغلق حالياً أو متوقف مؤقتاً عن استقبال الطلبات."
                    ], 400);
                }
            }
        }

        try {
            DB::beginTransaction();

            $subtotal = 0;
            $tax = 0;

            foreach ($cartItems as $item) {
                // Ensure a unified price is used for both subtotal and actual OrderItem row.
                $itemPrice = $item->price > 0 ? $item->price : ($item->product->sale_price ?? $item->product->price);
                $itemSubtotal = $itemPrice * $item->quantity;
                $subtotal += $itemSubtotal;
                
                // Stash the calculated price for the OrderItem creation loop later
                $item->calculated_price = $itemPrice;

                // Calculate real tax if product has a valid and active tax
                if ($item->product && $item->product->tax_id && $item->product->tax && $item->product->tax->is_active) {
                    $taxModel = $item->product->tax;
                    if ($taxModel->type === 'percentage') {
                        $tax += ($itemSubtotal * $taxModel->rate) / 100;
                    } else {
                        $tax += $taxModel->rate * $item->quantity;
                    }
                }
            }

            // Calculate dynamic shipping based on user location and cart items' sellers
            $shipping = 0;
            if ($request->latitude && $request->longitude) {
                $customerLat = $request->latitude;
                $customerLng = $request->longitude;
                $sellersGroup = [];
                
                foreach ($cartItems as $item) {
                    $sellerId = $item->product->seller_id;
                    if ($sellerId && $item->product->seller) {
                        if (!isset($sellersGroup[$sellerId])) {
                            $sellersGroup[$sellerId] = [
                                'latitude' => $item->product->seller->latitude,
                                'longitude' => $item->product->seller->longitude,
                            ];
                        }
                    } else {
                        $sellersGroup['admin'] = ['latitude' => null, 'longitude' => null];
                    }
                }
                
                foreach ($sellersGroup as $sellerId => $location) {
                    if ($location['latitude'] && $location['longitude']) {
                        $result = \App\Services\DeliveryService::calculateFee(
                            $customerLat, $customerLng,
                            $location['latitude'], $location['longitude']
                        );
                        $shipping += $result['fee'];
                    } else {
                        $shipping += env('BASE_DELIVERY_FEE', 15);
                    }
                }
            } else {
                // Fallback standard flat rate if map location missing
                $shipping = 15;
            }

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
                'shipping_company' => $request->shipping_company,
                'shipping_address' => $request->shipping_address,
                'billing_address' => $request->billing_address ?? $request->shipping_address,
                'notes' => $request->notes,
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'formatted_address' => $request->formatted_address,
                'building_details' => $request->building_details,
            ]);

            Log::info('Order created:', ['order_id' => $order->id, 'order_number' => $order->order_number]);

            foreach ($cartItems as $cartItem) {
                // Use the selected image from cart item, fallback to product image
                $imageUrl = $cartItem->image_url ?? $cartItem->product->image_url ?? null;

                // Convert relative URL to absolute for storage
                if ($imageUrl && str_starts_with($imageUrl, '/')) {
                    $imageUrl = url($imageUrl);
                }
                
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $cartItem->product_id,
                    'product_variant_id' => $cartItem->product_variant_id,
                    'product_name' => $cartItem->product->name,
                    'product_sku' => $cartItem->product->sku,
                    'quantity' => $cartItem->quantity,
                    'price' => $cartItem->calculated_price,
                    'total' => $cartItem->calculated_price * $cartItem->quantity,
                    'image_url' => $imageUrl,
                    'color' => $cartItem->color ?? null,
                    'color_code' => $cartItem->color_code ?? null,
                    'size' => $cartItem->size ?? null,
                    'variant_name' => $cartItem->variant_name ?? null,
                    'variant_value' => $cartItem->variant_value ?? null,
                    'selected_image_index' => $cartItem->selected_image_index ?? null,
                    'selected_options' => $cartItem->selected_options ?? null,
                    'special_instructions' => $cartItem->special_instructions ?? null,
                ]);

                // Update product stock and sold count
                $cartItem->product->decrement('stock', $cartItem->quantity);
                $cartItem->product->increment('sold_count', $cartItem->quantity);
            }

            // Clear cart
            Cart::where('user_id', $user->id)->delete();
            Log::info('Cart cleared for user:', ['user_id' => $user->id]);

            DB::commit();
            Log::info('✅ Order created successfully:', ['order_id' => $order->id]);
            
            // إضافة إشعار للعميل بإنشاء الطلب بنجاح
            Notification::create([
                'user_id' => $user->id,
                'type' => 'success',
                'title' => 'تم إنشاء طلبك بنجاح',
                'message' => 'رقم الطلب الخاص بك هو ' . $order->order_number,
                'read' => false,
                'link' => '/orders/' . $order->id,
            ]);

            // Load the complete order with items for response
            $completeOrder = Order::with(['items.product'])->find($order->id);

            // --- Send Email Notifications to Sellers ---
            try {
                $itemsBySeller = [];
                foreach ($completeOrder->items as $item) {
                     if ($item->product && $item->product->seller) {
                         $sellerId = $item->product->seller->id;
                         if (!isset($itemsBySeller[$sellerId])) {
                             $itemsBySeller[$sellerId] = [
                                 'seller' => $item->product->seller,
                                 'items' => []
                             ];
                         }
                         $itemsBySeller[$sellerId]['items'][] = $item;
                     }
                }
                
                foreach ($itemsBySeller as $sellerData) {
                    $seller = $sellerData['seller'];
                    $sellerItems = $sellerData['items'];
                    $sellerUser = $seller->user;
                    
                    if ($sellerUser) {
                        // In-app notification for seller
                        \App\Models\Notification::create([
                            'user_id' => $sellerUser->id,
                            'type' => 'success',
                            'title' => 'طلب جديد!',
                            'message' => "لديك طلب جديد برقم {$completeOrder->order_number} يحتاج إلى مراجعتك.",
                            'link' => '/seller/orders',
                            'read' => false,
                        ]);

                        if ($sellerUser->email) {
                            \Illuminate\Support\Facades\Mail::to($sellerUser->email)
                                ->send(new \App\Mail\SellerOrderNotificationMail($completeOrder, $seller, $sellerItems));
                        }
                    }
                }
            } catch (\Exception $mailEx) {
                Log::error('Failed to send seller order notifications: ' . $mailEx->getMessage());
            }
            // -------------------------------------------
            
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
        $order = Order::with(['items.product', 'items.variant', 'driver'])
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);
            
        return response()->json($order);
    }
}
