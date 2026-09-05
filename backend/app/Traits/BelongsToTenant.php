<?php

namespace App\Traits;

use App\Models\Organization;
use App\Scopes\TenantScope;
use Illuminate\Support\Facades\Auth;

trait BelongsToTenant
{
    /**
     * Boot the BelongsToTenant trait for a model.
     */
    protected static function bootBelongsToTenant(): void
    {
        static::addGlobalScope(new TenantScope);

        static::creating(function ($model) {
            if (!$model->organization_id) {
                if (Auth::check() && Auth::user()->current_organization_id) {
                    $model->organization_id = Auth::user()->current_organization_id;
                } elseif (app()->bound('current_organization_id')) {
                    $model->organization_id = app('current_organization_id');
                }
            }
        });
    }

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }
}
