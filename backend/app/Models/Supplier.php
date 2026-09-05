<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'organization_id',
        'name',
        'email',
        'phone',
        'lead_time_days',
    ];

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
