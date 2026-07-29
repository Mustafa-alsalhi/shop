<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ReviewController extends Controller
{
    /**
     * Store a newly created review in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int $productId
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request, $productId)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $product = Product::findOrFail($productId);
        $user = Auth::user();

        // Check if user already reviewed
        $existingReview = Review::where('product_id', $productId)
            ->where('user_id', $user->id)
            ->first();

        if ($existingReview) {
            return response()->json([
                'success' => false,
                'message' => 'لقد قمت بتقييم هذا المنتج مسبقاً'
            ], 422);
        }

        try {
            DB::beginTransaction();

            $review = Review::create([
                'product_id' => $productId,
                'user_id' => $user->id,
                'rating' => $request->rating,
                'comment' => $request->comment,
                'is_approved' => true
            ]);

            // Update product average rating
            $productReviews = Review::where('product_id', $productId)->where('is_approved', true);
            $avgRating = $productReviews->avg('rating');
            $reviewsCount = $productReviews->count();

            $product->update([
                'rating' => $avgRating,
                'reviews_count' => $reviewsCount
            ]);

            // Load user data for the response
            $review->load('user');

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'تم إضافة تقييمك بنجاح',
                'data' => $review
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء إضافة التقييم',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
