<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    protected $fillable = [
        'airline_id',
        'flight_no',
        'from',
        'to',
        'departure_time',
        'arrival_time',
        'economy_fare',
        'business_fare',
        'available_seats',
        'status',
    ];

    protected $casts = [
        'departure_time' => 'datetime',
        'arrival_time'   => 'datetime',
        'economy_fare'   => 'decimal:2',
        'business_fare'  => 'decimal:2',
        'status'         => 'boolean',
    ];

    /**
     * Airline Relationship
     */
    public function airline()
    {
        return $this->belongsTo(Airline::class);
    }

    /**
     * Bookings Relationship
     */
    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}