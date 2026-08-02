<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;

class Agent extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'agents';

    /**
     * Mass Assignable Fields
     */
    protected $fillable = [
        'agency_name',
        'owner_name',
        'email',
        'phone',
        'password',
        'wallet',
        'status',
    ];

    /**
     * Hidden Fields
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Casts
     */
    protected $casts = [
        'wallet' => 'decimal:2',
        'email_verified_at' => 'datetime',
    ];

    /**
     * Agent has many Bookings
     */
    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * Agent has many Recharge Requests
     */
    public function recharges()
    {
        return $this->hasMany(Recharge::class);
    }

    /**
     * Agent has many Wallet Transactions
     */
    public function walletTransactions()
    {
        return $this->hasMany(WalletTransaction::class);
    }
}