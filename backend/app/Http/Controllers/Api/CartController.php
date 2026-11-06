<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Product;
use App\Models\Notification;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function index(Request $request)
    {
        \Log::info('=== CART INDEX REQUEST ===');
        \Log::info('User ID:', [$request->user()->id]);

        $this->deduplicateUserCart($request->user()->id);

        $cartItems = Cart::with(['product.tax', 'variant'])
            ->where('user_id', $request->user()->id)
            ->get();

        // Add total and tax to each cart item
        $cartItems->transform(function ($item) {
            $item->total = ($item->price ?? 0) * $item->quantity;

            // Calculate tax for this item based on product's tax
            $itemTax = 0;
            
            // Debug logging
            \Log::info('Tax calculation for cart item:', [
                'cart_item_id' => $item->id,
                'product_id' => $item->product_id,
                'product_name' => $item->product_name,
                'price' => $item->price,
                'quantity' => $item->quantity,
                'total' => $item->total,
                'has_product' => !is_null($item->product),
                'tax_id' => $item->product ? $item->product->tax_id : 'no_product',
                'tax_id_value' => $item->product && $item->product->tax_id ? $item->product->tax_id : 'null',
                'has_tax_relation' => $item->product && !is_null($item->product->tax),
                'tax_data' => $item->product && $item->product->tax ? $item->product->tax->toArray() : 'no_tax'
            ]);
            
            // Only calculate tax if product has a valid tax_id and active tax
            if ($item->product && $item->product->tax_id && $item->product->tax && $item->product->tax->is_active) {
                if ($item->product->tax->type === 'percentage') {
                    $itemTax = ($item->total * $item->product->tax->rate) / 100;
                } else {
                    $itemTax = $item->product->tax->rate * $item->quantity;
                }
                \Log::info('Tax applied:', ['item_id' => $item->id, 'tax_amount' => $itemTax]);
            } else {
                \Log::info('No tax applied:', [
                    'item_id' => $item->id,
                    'reason' => !$item->product ? 'no_product' : (!$item->product->tax_id ? 'no_tax_id' : (!$item->product->tax ? 'no_tax_relation' : (!$item->product->tax->is_active ? 'tax_inactive' : 'unknown')))
                ]);
            }
            $item->tax = $itemTax;

            return $item;
        });

        \Log::info('Cart Items Count:', [$cartItems->count()]);
        \Log::info('Cart Items:', $cartItems->toArray());

        // Calculate totals
        $subtotal = $cartItems->sum(function ($item) {
            return ($item->price ?? 0) * $item->quantity;
        });
        $tax = $cartItems->sum(function ($item) {
            return $item->tax ?? 0;
        });
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
            'color' => 'nullable|string',
            'color_code' => 'nullable|string',
            'size' => 'nullable|string',
            'variant_name' => 'nullable|string',
            'variant_value' => 'nullable|string',
            'selected_image_index' => 'nullable|integer',
            'selected_options' => 'nullable|array',
            'special_instructions' => 'nullable|string',
            'force_clear' => 'nullable|boolean',
        ]);

        $product = Product::with('seller')->findOrFail($request->product_id);

        if ($product->stock < $request->quantity) {
            return response()->json([
                'message' => 'Insufficient stock'
            ], 400);
        }

        $seller = $product->seller;
        $isRestaurantItem = $seller && $seller->type === 'restaurant';
        $sellerType = $isRestaurantItem ? 'restaurant' : 'store';

        // تحقق من تعارض المطاعم في السلة
        $existingCartItems = Cart::with('product.seller')->where('user_id', $request->user()->id)->get();
        if ($existingCartItems->isNotEmpty()) {
            if ($request->boolean('force_clear')) {
                Cart::where('user_id', $request->user()->id)->delete();
            } else {
                // فحص إذا كان في السلة وجبات من مطعم آخر
                foreach ($existingCartItems as $cartItm) {
                    $itemSeller = $cartItm->product ? $cartItm->product->seller : null;
                    if ($itemSeller) {
                        if ($isRestaurantItem && $itemSeller->type === 'restaurant' && $itemSeller->id !== $seller->id) {
                            return response()->json([
                                'conflict' => true,
                                'conflict_type' => 'different_restaurant',
                                'message' => "لديك وجبات من مطعم ({$itemSeller->store_name}) في السلة. هل تريد إفراغ السلة وبدء طلب جديد من ({$seller->store_name})؟",
                                'current_restaurant' => $itemSeller->store_name,
                                'new_restaurant' => $seller->store_name
                            ], 409);
                        }
                    }
                }
            }
        }

        // احتساب سعر الوجبة متضمناً الإضافات المختارة
        $finalPrice = $request->price ?? ($product->sale_price ?: $product->price);
        if ($request->filled('selected_options') && is_array($request->selected_options)) {
            $optionsExtraCost = 0;
            // حساب تكلفة الإضافات المدفوعة
            if (isset($request->selected_options['extras']) && is_array($request->selected_options['extras'])) {
                foreach ($request->selected_options['extras'] as $extra) {
                    if (isset($extra['price']) && is_numeric($extra['price'])) {
                        $optionsExtraCost += (float)$extra['price'];
                    }
                }
            }
            // في حال وجود حجم مخصص بسعر محدد
            if (isset($request->selected_options['size']) && isset($request->selected_options['size']['price'])) {
                $finalPrice = (float)$request->selected_options['size']['price'];
            }
            $finalPrice += $optionsExtraCost;
        }

        $normalizedReqOptions = $this->normalizeOptions($request->selected_options);

        // Check if cart item exists (مطابقة المنتج والإضافات بدقة)
        $existingItems = Cart::where('user_id', $request->user()->id)
            ->where('product_id', $request->product_id)
            ->where('product_variant_id', $request->variant_id)
            ->get();

        $matchingItem = null;
        foreach ($existingItems as $item) {
            $normalizedItemOptions = $this->normalizeOptions($item->selected_options);

            $optionsMatch = false;
            if ($normalizedReqOptions === null && $normalizedItemOptions === null) {
                $optionsMatch = true;
            } elseif ($normalizedReqOptions !== null && $normalizedItemOptions !== null) {
                $optionsMatch = (json_encode($normalizedReqOptions) === json_encode($normalizedItemOptions));
            }

            $reqInstructions = trim($request->special_instructions ?? '');
            $itemInstructions = trim($item->special_instructions ?? '');
            $instructionsMatch = ($reqInstructions === $itemInstructions);

            if ($optionsMatch && $instructionsMatch) {
                $matchingItem = $item;
                break;
            }
        }

        if ($matchingItem) {
            // زيادة الكمية للمنتج المطابق بدلاً من إنشاء عنصر مكرر
            $matchingItem->quantity += $request->quantity;
            $matchingItem->price = $finalPrice;
            $matchingItem->special_instructions = $request->special_instructions;
            $matchingItem->save();
            $cartItem = $matchingItem;
        } else {
            // Create new cart item
            $cartItem = Cart::create([
                'user_id' => $request->user()->id,
                'product_id' => $request->product_id,
                'product_variant_id' => $request->variant_id,
                'quantity' => $request->quantity,
                'product_name' => $request->product_name ?? $product->name,
                'price' => $finalPrice,
                'image_url' => $request->image_url ?? $product->image_url,
                'sku' => $request->sku ?? $product->sku,
                'weight' => $request->weight,
                'dimensions' => $request->dimensions,
                'category' => $request->category,
                'brand' => $request->brand,
                'description' => $request->description,
                'short_description' => $request->short_description,
                'status' => $request->status ?? 'active',
                'featured' => $request->featured ?? false,
                'variant_attributes' => $request->variant_attributes,
                'currency' => $request->currency ?? 'USD',
                'color' => $request->color,
                'color_code' => $request->color_code,
                'size' => $request->size,
                'variant_name' => $request->variant_name,
                'variant_value' => $request->variant_value,
                'selected_image_index' => $request->selected_image_index,
                'selected_options' => $normalizedReqOptions,
                'special_instructions' => $request->special_instructions,
                'seller_type' => $sellerType,
            ]);
        }

        // إشعار للإضافة للسلة
        if (isset($cartItem) && $cartItem->wasRecentlyCreated) {
            Notification::create([
                'user_id' => $request->user()->id,
                'type' => 'success',
                'title' => 'تمت الإضافة للسلة',
                'message' => 'تم إضافة ' . ($request->product_name ?? 'المنتج') . ' إلى سلة التسوق',
                'read' => false,
            ]);
        }

        \Log::info('=== CART ITEM SAVED ===');
        \Log::info('Product Name:', [$cartItem->product_name]);
        \Log::info('Price:', [$cartItem->price]);
        \Log::info('Image URL:', [$cartItem->image_url]);
        \Log::info('Currency:', [$cartItem->currency]);
        \Log::info('SKU:', [$cartItem->sku]);
        \Log::info('Cart Item Full Data:', $cartItem->toArray());
        
        // Return the full cart with totals after adding
        $cartItems = Cart::with(['product.tax', 'variant'])
            ->where('user_id', $request->user()->id)
            ->get();

        // Add total and tax to each cart item
        $cartItems->transform(function ($item) {
            $item->total = ($item->price ?? 0) * $item->quantity;

            // Calculate tax for this item based on product's tax
            $itemTax = 0;
            // Only calculate tax if product has a valid tax_id and active tax
            if ($item->product && $item->product->tax_id && $item->product->tax && $item->product->tax->is_active) {
                if ($item->product->tax->type === 'percentage') {
                    $itemTax = ($item->total * $item->product->tax->rate) / 100;
                } else {
                    $itemTax = $item->product->tax->rate * $item->quantity;
                }
            }
            $item->tax = $itemTax;

            return $item;
        });

        // Calculate totals
        $subtotal = $cartItems->sum(function ($item) {
            return ($item->price ?? 0) * $item->quantity;
        });
        $tax = $cartItems->sum(function ($item) {
            return $item->tax ?? 0;
        });
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

        // Return the full cart with totals after updating
        $cartItems = Cart::with(['product.tax', 'variant'])
            ->where('user_id', $request->user()->id)
            ->get();

        // Add total and tax to each cart item
        $cartItems->transform(function ($item) {
            $item->total = ($item->price ?? 0) * $item->quantity;

            // Calculate tax for this item based on product's tax
            $itemTax = 0;
            // Only calculate tax if product has a valid tax_id and active tax
            if ($item->product && $item->product->tax_id && $item->product->tax && $item->product->tax->is_active) {
                if ($item->product->tax->type === 'percentage') {
                    $itemTax = ($item->total * $item->product->tax->rate) / 100;
                } else {
                    $itemTax = $item->product->tax->rate * $item->quantity;
                }
            }
            $item->tax = $itemTax;

            return $item;
        });

        // Calculate totals
        $subtotal = $cartItems->sum(function ($item) {
            return ($item->price ?? 0) * $item->quantity;
        });
        $tax = $cartItems->sum(function ($item) {
            return $item->tax ?? 0;
        });
        $total = $subtotal + $tax;
        $totalItems = $cartItems->sum('quantity');

        return response()->json([
            'items' => $cartItems,
            'subtotal' => $subtotal,
            'tax' => $tax,
            'total' => $total,
            'total_items' => $totalItems,
        ]);
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

    public function clearCart(Request $request)
    {
        \Log::info('=== CLEARING CART FOR USER ===');
        \Log::info('User ID:', [$request->user()->id]);

        Cart::where('user_id', $request->user()->id)->delete();

        \Log::info('✅ Cart cleared successfully');

        return response()->json([
            'message' => 'Cart cleared successfully'
        ]);
    }

    private function normalizeOptions($opts)
    {
        if (empty($opts)) {
            return null;
        }

        if (is_string($opts)) {
            $decoded = json_decode($opts, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $opts = $decoded;
            } else {
                return null;
            }
        }

        if (!is_array($opts)) {
            return null;
        }

        $size = !empty($opts['size']) ? $opts['size'] : null;
        $extras = !empty($opts['extras']) && is_array($opts['extras']) ? $opts['extras'] : [];
        $removals = !empty($opts['removals']) && is_array($opts['removals']) ? $opts['removals'] : [];

        // If all options are empty or default, normalize to null
        if (empty($size) && empty($extras) && empty($removals)) {
            return null;
        }

        if (!empty($extras)) {
            usort($extras, function ($a, $b) {
                $nameA = is_array($a) ? ($a['name'] ?? '') : (string)$a;
                $nameB = is_array($b) ? ($b['name'] ?? '') : (string)$b;
                return strcmp($nameA, $nameB);
            });
        }
        if (!empty($removals)) {
            sort($removals);
        }

        return [
            'size' => $size,
            'extras' => array_values($extras),
            'removals' => array_values($removals),
        ];
    }

    private function deduplicateUserCart($userId)
    {
        try {
            $items = Cart::where('user_id', $userId)->get();
            if ($items->count() < 2) {
                return;
            }

            $seen = [];
            foreach ($items as $item) {
                $normOptions = $this->normalizeOptions($item->selected_options);
                $optionsKey = $normOptions ? json_encode($normOptions) : 'none';
                $instructionsKey = trim($item->special_instructions ?? '');
                $key = "{$item->product_id}_{$item->product_variant_id}_{$optionsKey}_{$instructionsKey}";

                if (isset($seen[$key])) {
                    $primaryItem = $seen[$key];
                    $primaryItem->quantity += $item->quantity;
                    $primaryItem->save();
                    $item->delete();
                } else {
                    $seen[$key] = $item;
                }
            }
        } catch (\Exception $e) {
            \Log::error('Error deduplicating user cart:', ['error' => $e->getMessage()]);
        }
    }
}
