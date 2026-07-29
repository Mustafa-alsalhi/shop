<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tax;
use Illuminate\Http\Request;

class TaxController extends Controller
{
    /**
     * Display a listing of taxes.
     */
    public function index()
    {
        $taxes = Tax::all();
        return response()->json($taxes);
    }

    /**
     * Store a newly created tax.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'rate' => 'required|numeric|min:0|max:100',
            'type' => 'required|in:percentage,fixed',
            'is_active' => 'boolean',
            'is_default' => 'boolean',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
        ]);

        // If setting as default, remove default from other taxes
        if ($request->is_default) {
            Tax::where('is_default', true)->update(['is_default' => false]);
        }

        $tax = Tax::create($request->all());
        return response()->json($tax, 201);
    }

    /**
     * Display the specified tax.
     */
    public function show($id)
    {
        $tax = Tax::findOrFail($id);
        return response()->json($tax);
    }

    /**
     * Update the specified tax.
     */
    public function update(Request $request, $id)
    {
        $tax = Tax::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'rate' => 'required|numeric|min:0|max:100',
            'type' => 'required|in:percentage,fixed',
            'is_active' => 'boolean',
            'is_default' => 'boolean',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
        ]);

        // If setting as default, remove default from other taxes
        if ($request->is_default && !$tax->is_default) {
            Tax::where('is_default', true)->update(['is_default' => false]);
        }

        $tax->update($request->all());
        return response()->json($tax);
    }

    /**
     * Remove the specified tax.
     */
    public function destroy($id)
    {
        $tax = Tax::findOrFail($id);
        $tax->delete();
        return response()->json(['message' => 'Tax deleted successfully']);
    }

    /**
     * Get active taxes
     */
    public function active()
    {
        $taxes = Tax::active()->get();
        return response()->json($taxes);
    }

    /**
     * Get default tax
     */
    public function default()
    {
        $tax = Tax::active()->default()->first();
        return response()->json($tax);
    }
}
