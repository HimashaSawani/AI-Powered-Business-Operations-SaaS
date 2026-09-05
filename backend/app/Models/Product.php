<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'organization_id',
        'category_id',
        'supplier_id',
        'sku',
        'name',
        'description',
        'price',
        'cost',
        'current_stock',
        'reorder_level',
        'status',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'cost' => 'decimal:2',
        'current_stock' => 'integer',
        'reorder_level' => 'integer',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function movements()
    {
        return $this->hasMany(InventoryMovement::class)->latest();
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function refreshStockStatus(): void
    {
        if ($this->current_stock <= 0) {
            $this->status = 'out_of_stock';
        } elseif ($this->current_stock <= $this->reorder_level) {
            $this->status = 'low_stock';
        } else {
            $this->status = 'in_stock';
        }
        $this->save();
    }
}
