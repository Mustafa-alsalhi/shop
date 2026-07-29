<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PaymentRequest;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class PaymentRequestController extends Controller
{
    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_id' => 'required|exists:orders,id',
            'payment_method' => 'required|string',
            'payment_method_name' => 'required|string',
            'payer_name' => 'required|string|max:255',
            'reference_number' => 'required|string|max:255',
            'phone_number' => 'required|string|max:20',
            'payment_notes' => 'nullable|string',
            'payment_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:10240',
            'payment_amount' => 'required|numeric|min:0',
            'payment_fee' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->all();
        $data['user_id'] = auth()->id();
        $data['status'] = 'pending';

        // Handle image upload
        if ($request->hasFile('payment_image')) {
            $image = $request->file('payment_image');
            $path = $image->store('payment_images', 'public');
            $data['payment_image_path'] = $path;
        }

        $paymentRequest = PaymentRequest::create($data);

        return response()->json([
            'status' => 'success',
            'message' => 'Payment request created successfully',
            'data' => $paymentRequest
        ], 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $paymentRequest = PaymentRequest::with(['order', 'user'])
            ->where('user_id', auth()->id())
            ->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $paymentRequest
        ]);
    }

    /**
     * Get user's payment requests
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $paymentRequests = PaymentRequest::with(['order'])
            ->where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $paymentRequests
        ]);
    }
}
