<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'organization_id',
        'name',
        'email',
        'phone',
        'company',
        'status',
        'health_score',
        'health_factors',
        'timeline',
        'lifetime_value',
        'total_orders',
        'last_order_at',
    ];

    protected $casts = [
        'lifetime_value' => 'decimal:2',
        'health_score' => 'integer',
        'health_factors' => 'array',
        'timeline' => 'array',
        'last_order_at' => 'datetime',
    ];

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function tickets()
    {
        return $this->hasMany(Ticket::class);
    }

    public function notes()
    {
        return $this->hasMany(CustomerNote::class)->latest();
    }

    public function aiScores()
    {
        return $this->hasMany(AiCustomerScore::class);
    }

    public function latestAiScore()
    {
        return $this->hasOne(AiCustomerScore::class)->latestOfMany();
    }
}
