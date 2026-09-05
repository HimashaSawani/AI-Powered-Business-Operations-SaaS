<?php

namespace App\Events;

use App\Models\Product;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Section 32 — Domain Event: Inventory Low
 *
 * Fired when a product's stock drops to or below its reorder level.
 * Triggers: SendInventoryAlert listener (creates system notification).
 */
class InventoryLow
{
    use Dispatchable, SerializesModels;

    public function __construct(public readonly Product $product)
    {
    }
}
