<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentRequest;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class PaymentRequestController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $paymentRequests = PaymentRequest::with(['order', 'user'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $paymentRequests
        ]);
    }

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
            ->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $paymentRequest
        ]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $paymentRequest = PaymentRequest::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,approved,rejected',
            'admin_notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $paymentRequest->update($request->all());

        // Update payment date if approved
        if ($request->status === 'approved' && !$paymentRequest->payment_date) {
            $paymentRequest->payment_date = now();
            $paymentRequest->save();
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Payment request updated successfully',
            'data' => $paymentRequest
        ]);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $paymentRequest = PaymentRequest::findOrFail($id);

        // Delete image if exists
        if ($paymentRequest->payment_image_path) {
            Storage::disk('public')->delete($paymentRequest->payment_image_path);
        }

        $paymentRequest->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Payment request deleted successfully'
        ]);
    }

    /**
     * Get payment requests by status.
     *
     * @param  string  $status
     * @return \Illuminate\Http\Response
     */
    public function getByStatus($status)
    {
        $paymentRequests = PaymentRequest::with(['order', 'user'])
            ->where('status', $status)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'status' => 'success',
            'data' => $paymentRequests
        ]);
    }

    /**
     * Get payment requests statistics.
     *
     * @return \Illuminate\Http\Response
     */
    public function getStatistics()
    {
        $stats = [
            'total' => PaymentRequest::count(),
            'pending' => PaymentRequest::where('status', 'pending')->count(),
            'approved' => PaymentRequest::where('status', 'approved')->count(),
            'rejected' => PaymentRequest::where('status', 'rejected')->count(),
            'total_amount' => PaymentRequest::sum('payment_amount'),
        ];

        return response()->json([
            'status' => 'success',
            'data' => $stats
        ]);
    }
}
