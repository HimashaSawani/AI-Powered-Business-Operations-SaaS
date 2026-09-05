<?php

namespace App\Listeners;

use App\Events\InventoryLow;
use App\Models\SystemNotification;

/**
 * Section 32 — Listener: Send Inventory Alert
 *
 * Listens to InventoryLow event.
 * Creates a system notification so staff see an alert in their notification bell.
 */
class SendInventoryAlert
{
    public function handle(InventoryLow $event): void
    {
        $product = $event->product;

        // Prevent duplicate alerts for the same product within 24 hours
        $recentAlert = SystemNotification::where('type', 'inventory_alert')
            ->where('created_at', '>=', now()->subHours(24))
            ->whereJsonContains('data->sku', $product->sku)
            ->exists();

        if ($recentAlert) {
            return;
        }

        SystemNotification::create([
            'organization_id' => $product->organization_id,
            'type'            => 'inventory_alert',
            'severity'        => $product->current_stock <= 0 ? 'critical' : 'warning',
            'title'           => "⚠️ Inventory Alert: {$product->name}",
            'message'         => "Current Stock: {$product->current_stock}, Reorder Level: {$product->reorder_level}. Immediate restocking recommended.",
            'data'            => [
                'sku'           => $product->sku,
                'product_id'    => $product->id,
                'current_stock' => $product->current_stock,
                'reorder_level' => $product->reorder_level,
            ],
            'read_at'         => null,
        ]);
    }
}
