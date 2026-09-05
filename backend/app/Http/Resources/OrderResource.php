<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Section 32 — API Resource: Order
 *
 * Transforms Order model into a consistent JSON API response
 * with nested customer and items relationships.
 */
class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'order_number'    => $this->order_number,
            'status'          => $this->status,
            'payment_status'  => $this->payment_status,
            'subtotal'        => (float) $this->subtotal,
            'tax_amount'      => (float) $this->tax_amount,
            'discount_amount' => (float) $this->discount_amount,
            'total_amount'    => (float) $this->total_amount,
            'notes'           => $this->notes,
            'customer'        => $this->whenLoaded('customer', fn() => [
                'id'     => $this->customer->id,
                'name'   => $this->customer->name,
                'email'  => $this->customer->email,
            ]),
            'items'           => $this->whenLoaded('items', fn() =>
                $this->items->map(fn($item) => [
                    'product_id'   => $item->product_id,
                    'product_name' => $item->product?->name,
                    'sku'          => $item->product?->sku,
                    'quantity'     => $item->quantity,
                    'unit_price'   => (float) $item->unit_price,
                    'subtotal'     => (float) $item->subtotal,
                ])
            ),
            'created_at'      => $this->created_at?->toISOString(),
        ];
    }
}
