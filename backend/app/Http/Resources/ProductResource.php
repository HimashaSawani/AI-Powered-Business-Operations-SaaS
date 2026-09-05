<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'organization_id' => $this->organization_id,
            'category_id' => $this->category_id,
            'supplier_id' => $this->supplier_id,
            'name' => $this->name,
            'sku' => $this->sku,
            'price' => (float) $this->price,
            'cost' => (float) $this->cost,
            'current_stock' => (int) $this->current_stock,
            'reorder_level' => (int) $this->reorder_level,
            'status' => $this->status,
            'description' => $this->description,
            'category' => $this->whenLoaded('category'),
            'supplier' => $this->whenLoaded('supplier'),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
