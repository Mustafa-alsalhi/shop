<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Policy;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PolicyController extends Controller
{
    /**
     * Display a listing of the policies.
     */
    public function index()
    {
        $policies = Policy::active()->get();
        return response()->json([
            'data' => $policies
        ]);
    }

    /**
     * Display the specified policy.
     */
    public function show($type)
    {
        $policy = Policy::active()->byType($type)->first();
        
        if (!$policy) {
            return response()->json([
                'message' => 'Policy not found'
            ], 404);
        }

        return response()->json([
            'data' => $policy
        ]);
    }

    /**
     * Store a newly created policy (Admin only).
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:return_policy,exchange_policy,cancellation_policy,shipping_policy,privacy_policy,terms_of_service,cookies_policy',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'content' => 'required|string',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $policy = Policy::create($request->all());

        return response()->json([
            'message' => 'Policy created successfully',
            'data' => $policy
        ], 201);
    }

    /**
     * Update the specified policy (Admin only).
     */
    public function update(Request $request, $id)
    {
        $policy = Policy::find($id);
        
        if (!$policy) {
            return response()->json([
                'message' => 'Policy not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'type' => 'in:return_policy,exchange_policy,cancellation_policy,shipping_policy,privacy_policy,terms_of_service,cookies_policy',
            'title' => 'string|max:255',
            'description' => 'nullable|string',
            'content' => 'string',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $policy->update($request->all());

        return response()->json([
            'message' => 'Policy updated successfully',
            'data' => $policy
        ]);
    }

    /**
     * Remove the specified policy (Admin only).
     */
    public function destroy($id)
    {
        $policy = Policy::find($id);
        
        if (!$policy) {
            return response()->json([
                'message' => 'Policy not found'
            ], 404);
        }

        $policy->delete();

        return response()->json([
            'message' => 'Policy deleted successfully'
        ]);
    }
}
