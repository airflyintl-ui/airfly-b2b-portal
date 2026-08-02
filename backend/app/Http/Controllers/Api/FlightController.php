<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Flight;
use App\Models\Airline;

class FlightController extends Controller
{

    /**
     * Flight List
     */
    public function index()
    {
        return response()->json([
            'success' => true,
            'flights' => Flight::with('airline')
                ->latest()
                ->get()
        ]);
    }



    /**
     * Add Flight
     */
    public function store(Request $request)
    {

        $request->validate([

            'airline_id' => 'required|exists:airlines,id',

            'flight_no' => 'required',

            'from' => 'required',

            'to' => 'required',

            'departure_time' => 'required',

            'arrival_time' => 'required',

            'economy_fare' => 'required|numeric',

            'business_fare' => 'required|numeric',

            'available_seats' => 'required|integer',

        ]);



        $flight = Flight::create([

            'airline_id' => $request->airline_id,

            'flight_no' => strtoupper($request->flight_no),

            'from' => strtoupper($request->from),

            'to' => strtoupper($request->to),

            'departure_time' => $request->departure_time,

            'arrival_time' => $request->arrival_time,

            'economy_fare' => $request->economy_fare,

            'business_fare' => $request->business_fare,

            'available_seats' => $request->available_seats,

            'status' => 1,

        ]);



        return response()->json([

            'success' => true,

            'message' => 'Flight Added Successfully',

            'flight' => $flight

        ]);

    }




    /**
     * Flight Search
     */
    public function search(Request $request)
    {

        $request->validate([

            'from' => 'required',

            'to' => 'required',

            'date' => 'required'

        ]);



        $flights = Flight::with('airline')

            ->where('from', strtoupper($request->from))

            ->where('to', strtoupper($request->to))

            ->whereDate(
                'departure_time',
                $request->date
            )

            ->where('status',1)

            ->get();



        return response()->json([

            'success'=>true,

            'flights'=>$flights

        ]);

    }




    /**
     * Single Flight
     */
    public function show($id)
    {

        return response()->json([

            'success'=>true,

            'flight'=>Flight::with('airline')
                ->findOrFail($id)

        ]);

    }





    /**
     * Update Flight
     */
    public function update(Request $request,$id)
    {

        $flight = Flight::findOrFail($id);



        $flight->update([

            'airline_id'=>$request->airline_id,

            'flight_no'=>$request->flight_no,

            'from'=>strtoupper($request->from),

            'to'=>strtoupper($request->to),

            'departure_time'=>$request->departure_time,

            'arrival_time'=>$request->arrival_time,

            'economy_fare'=>$request->economy_fare,

            'business_fare'=>$request->business_fare,

            'available_seats'=>$request->available_seats,

            'status'=>$request->status ?? 1,

        ]);



        return response()->json([

            'success'=>true,

            'message'=>'Flight Updated Successfully',

            'flight'=>$flight

        ]);

    }





    /**
     * Delete Flight
     */
    public function destroy($id)
    {

        $flight = Flight::findOrFail($id);

        $flight->delete();



        return response()->json([

            'success'=>true,

            'message'=>'Flight Deleted Successfully'

        ]);

    }

}