<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Recharge extends Model
{
    use HasFactory;

    protected $fillable = [
        'agent_id',
        'amount',
        'payment_method',
        'transaction_id',
        'slip',
        'status',
    ];

    /**
     * Agent Relationship
     */
    public function agent()
    {
        return $this->belongsTo(Agent::class);
    }
}