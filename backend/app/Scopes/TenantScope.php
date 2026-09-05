<?php

namespace App\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Support\Facades\Auth;

class TenantScope implements Scope
{
    /**
     * Apply the tenant scope to a given Eloquent query builder.
     */
    public function apply(Builder $builder, Model $model): void
    {
        $organizationId = null;

        if (Auth::check() && Auth::user()->current_organization_id) {
            $organizationId = Auth::user()->current_organization_id;
        } elseif (app()->bound('current_organization_id')) {
            $organizationId = app('current_organization_id');
        }

        if ($organizationId) {
            $builder->where($model->getTable() . '.organization_id', $organizationId);
        }
    }
}
