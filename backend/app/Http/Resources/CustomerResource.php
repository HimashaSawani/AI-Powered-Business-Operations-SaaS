<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Section 32 — API Resource: Customer
 *
 * Transforms Customer model into a consistent JSON API response
 * including health score and latest AI churn assessment.
 */
class CustomerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'name'           => $this->name,
            'email'          => $this->email,
            'phone'          => $this->phone,
            'company'        => $this->company,
            'status'         => $this->status,
            'health_score'   => $this->health_score,
            'health_factors' => $this->health_factors,
            'timeline'       => $this->timeline,
            'lifetime_value' => (float) $this->lifetime_value,
            'total_orders'   => $this->total_orders,
            'last_order_at'  => $this->last_order_at?->toISOString(),
            'latest_ai_score'=> $this->whenLoaded('latestAiScore', fn() => $this->latestAiScore ? [
                'churn_risk_score' => $this->latestAiScore->churn_risk_score,
                'risk_level'       => $this->latestAiScore->risk_level,
                'key_drivers'      => $this->latestAiScore->key_drivers,
                'suggested_action' => $this->latestAiScore->suggested_action,
                'calculated_at'    => $this->latestAiScore->calculated_at?->toISOString(),
            ] : null),
            'created_at'     => $this->created_at?->toISOString(),
        ];
    }
}
