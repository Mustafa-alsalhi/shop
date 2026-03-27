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
        $wishlistItems = Wishlist::with('product')
            ->where('user_id', $request->user()->id)
            ->get();
            
        return response()->json($wishlistItems);
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $wishlistItem = Wishlist::firstOrCreate(
            [
                'user_id' => $request->user()->id,
                'product_id' => $request->product_id,
            ]
        );

        return response()->json($wishlistItem, 201);
    }

    public function destroy(Request $request, $id)
    {
        $wishlistItem = Wishlist::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $wishlistItem->delete();

        return response()->json([
            'message' => 'Item removed from wishlist'
        ]);
    }
}
