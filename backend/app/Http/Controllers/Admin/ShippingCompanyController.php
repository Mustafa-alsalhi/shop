<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ShippingCompany;
use Illuminate\Http\Request;

class ShippingCompanyController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $companies = ShippingCompany::orderBy('name')->paginate(10);
        return response()->json($companies);
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
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:shipping_companies',
            'description' => 'nullable|string',
            'cost' => 'required|numeric|min:0',
            'is_active' => 'boolean',
            'delivery_days' => 'required|integer|min:1',
            'tracking_url' => 'nullable|string|max:255'
        ]);

        $company = ShippingCompany::create($request->all());
        
        return response()->json([
            'message' => 'Shipping company created successfully',
            'company' => $company
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
        $company = ShippingCompany::findOrFail($id);
        return response()->json($company);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        $company = ShippingCompany::findOrFail($id);
        return response()->json($company);
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
        $company = ShippingCompany::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:shipping_companies,code,' . $id,
            'description' => 'nullable|string',
            'cost' => 'required|numeric|min:0',
            'is_active' => 'boolean',
            'delivery_days' => 'required|integer|min:1',
            'tracking_url' => 'nullable|string|max:255'
        ]);

        $company->update($request->all());
        
        return response()->json([
            'message' => 'Shipping company updated successfully',
            'company' => $company
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
        $company = ShippingCompany::findOrFail($id);
        $company->delete();
        
        return response()->json([
            'message' => 'Shipping company deleted successfully'
        ]);
    }

    /**
     * Get active shipping companies for checkout
     *
     * @return \Illuminate\Http\Response
     */
    public function getActive()
    {
        $companies = ShippingCompany::where('is_active', true)
            ->orderBy('name')
            ->get();
            
        return response()->json($companies);
    }
}
