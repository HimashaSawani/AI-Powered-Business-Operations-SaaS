<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AiInsight extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'organization_id',
        'insight_code',
        'category', // INVENTORY, CUSTOMER_RETENTION, HELPDESK, REVENUE
        'title',
        'description',
        'severity', // CRITICAL, WARNING, INFO, OPPORTUNITY
        'impact_metric',
        'recommended_action',
        'status', // active, dismissed, applied
        'confidence_score',
    ];

    protected $casts = [
        'confidence_score' => 'float',
    ];
}
