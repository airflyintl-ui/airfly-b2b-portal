<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Airline;

class AirlineController extends Controller
{
    /**
     * Airline List
     */
    public function index()
    {
        return response()->json([
            'success' => true,
            'airlines' => Airline::latest()->get()
        ]);
    }

    /**
     * Add Airline
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'code' => 'required|unique:airlines,code',
        ]);

        $logo = null;

        if ($request->hasFile('logo')) {

            $file = $request->file('logo');

            $logo = time().'_'.$file->getClientOriginalName();

            $file->move(public_path('uploads/airlines'), $logo);
        }

        $airline = Airline::create([
            'name' => $request->name,
            'code' => strtoupper($request->code),
            'logo' => $logo,
            'status' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Airline Added Successfully',
            'airline' => $airline
        ]);
    }

    /**
     * Single Airline
     */
    public function show($id)
    {
        return response()->json([
            'success' => true,
            'airline' => Airline::findOrFail($id)
        ]);
    }

    /**
     * Update Airline
     */
    public function update(Request $request, $id)
    {
        $airline = Airline::findOrFail($id);

        $request->validate([
            'name' => 'required',
            'code' => 'required|unique:airlines,code,' . $id,
        ]);

        if ($request->hasFile('logo')) {

            $file = $request->file('logo');

            $logo = time().'_'.$file->getClientOriginalName();

            $file->move(public_path('uploads/airlines'), $logo);

            $airline->logo = $logo;
        }

        $airline->name = $request->name;
        $airline->code = strtoupper($request->code);
        $airline->status = $request->status ?? true;

        $airline->save();

        return response()->json([
            'success' => true,
            'message' => 'Airline Updated Successfully'
        ]);
    }

    /**
     * Delete Airline
     */
    public function destroy($id)
    {
        Airline::findOrFail($id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Airline Deleted Successfully'
        ]);
    }
}