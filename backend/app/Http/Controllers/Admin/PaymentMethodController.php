<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentMethod;
use Illuminate\Http\Request;

class PaymentMethodController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $methods = PaymentMethod::orderBy('name')->paginate(10);
        return response()->json($methods);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        return response()->json(['message' => 'Create form']);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        \Log::info('=== Payment Method Store Request ===', $request->all());
        
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:payment_methods',
            'description' => 'nullable|string',
            'fee' => 'required|numeric|min:0',
            'is_active' => 'boolean',
            'config' => 'nullable|array',
            'icon' => 'nullable|string|max:255',
            'icon_image' => 'nullable|string|max:255'
        ]);

        // Explicitly create with all fields
        $method = new PaymentMethod();
        $method->name = $request->name;
        $method->code = $request->code;
        $method->description = $request->description;
        $method->fee = $request->fee;
        $method->is_active = $request->is_active;
        $method->config = $request->config;
        $method->icon = $request->icon;
        $method->icon_image = $request->icon_image;
        $method->save();
        
        \Log::info('=== Payment Method Created ===', $method->toArray());
        
        return response()->json([
            'message' => 'Payment method created successfully',
            'method' => $method
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
        $method = PaymentMethod::findOrFail($id);
        return response()->json($method);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        $method = PaymentMethod::findOrFail($id);
        return response()->json($method);
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
        \Log::info('=== Payment Method Update Request ===', $request->all());
        
        $method = PaymentMethod::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:payment_methods,code,' . $id,
            'description' => 'nullable|string',
            'fee' => 'required|numeric|min:0',
            'is_active' => 'boolean',
            'config' => 'nullable|array',
            'icon' => 'nullable|string|max:255',
            'icon_image' => 'nullable|string|max:255'
        ]);

        // Explicitly update all fields
        $method->name = $request->name;
        $method->code = $request->code;
        $method->description = $request->description;
        $method->fee = $request->fee;
        $method->is_active = $request->is_active;
        $method->config = $request->config;
        $method->icon = $request->icon;
        $method->icon_image = $request->icon_image;
        $method->save();
        
        \Log::info('=== Payment Method Updated ===', $method->toArray());
        
        return response()->json([
            'message' => 'Payment method updated successfully',
            'method' => $method
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
        $method = PaymentMethod::findOrFail($id);
        $method->delete();
        
        return response()->json([
            'message' => 'Payment method deleted successfully'
        ]);
    }

    /**
     * Upload payment method icon
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function uploadIcon(Request $request)
    {
        $request->validate([
            'icon' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        try {
            if ($request->hasFile('icon')) {
                $file = $request->file('icon');
                $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                
                // Create directory if it doesn't exist
                $uploadPath = public_path('uploads/payment-methods');
                if (!file_exists($uploadPath)) {
                    mkdir($uploadPath, 0755, true);
                }
                
                // Upload file
                $file->move($uploadPath, $filename);
                
                // Generate URL
                $iconUrl = asset('uploads/payment-methods/' . $filename);
                
                return response()->json([
                    'success' => true,
                    'icon_url' => $iconUrl,
                    'filename' => $filename
                ]);
            }
            
            return response()->json([
                'success' => false,
                'message' => 'No file uploaded'
            ], 400);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload icon: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get active payment methods for checkout
     *
     * @return \Illuminate\Http\Response
     */
    public function getActive()
    {
        $methods = PaymentMethod::where('is_active', true)
            ->orderBy('name')
            ->get();
            
        return response()->json($methods);
    }
}
