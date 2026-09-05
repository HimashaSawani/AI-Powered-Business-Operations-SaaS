<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AiCustomerScore extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'organization_id',
        'customer_id',
        'churn_risk_score',
        'risk_level',
        'key_drivers',
        'suggested_action',
        'calculated_at',
    ];

    protected $casts = [
        'churn_risk_score' => 'float',
        'key_drivers' => 'array',
        'calculated_at' => 'datetime',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
