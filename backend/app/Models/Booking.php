<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [

        'agent_id',
        'flight_id',

        'pnr',

        'passenger_name',
        'passport',
        'nationality',
        'date_of_birth',
        'gender',

        'phone',
        'email',

        'journey_type',
        'travel_class',

        'adults',
        'children',
        'infants',

        'total_amount',

        'ticket_number',

        'payment_status',
        'booking_status',

        'remarks',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
    ];

    /**
     * Agent Relationship
     */
    public function agent()
    {
        return $this->belongsTo(Agent::class);
    }

    /**
     * Flight Relationship
     */
    public function flight()
    {
        return $this->belongsTo(Flight::class);
    }
}