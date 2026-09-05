<?php

namespace App\Actions;

use App\Models\AuditLog;
use App\Models\InventoryMovement;
use App\Events\InventoryLow;
use App\Services\InventoryService;
use Illuminate\Support\Facades\Request;

/**
 * Section 32 — Action: Adjust Inventory
 *
 * Orchestrates an inventory adjustment:
 * 1. Calls InventoryService for atomic stock update
 * 2. Fires InventoryLow event if stock drops below reorder level
 * 3. Writes immutable audit log entry
 */
class AdjustInventory
{
    public function __construct(private InventoryService $inventoryService)
    {
    }

    public function execute(
        int $productId,
        string $type,
        int $quantity,
        int $organizationId,
        ?int $userId = null,
        ?string $notes = null
    ): InventoryMovement {
        // 1. Atomic stock adjustment with movement record
        $movement = $this->inventoryService->recordMovement(
            productId:      $productId,
            type:           $type,
            quantity:       $quantity,
            organizationId: $organizationId,
            userId:         $userId,
            notes:          $notes
        );

        $product = $movement->product()->withoutGlobalScopes()->first();

        // 2. Fire InventoryLow event if below reorder level
        if ($product && $product->current_stock <= $product->reorder_level) {
            event(new InventoryLow($product));
        }

        // 3. Immutable audit trail
        AuditLog::create([
            'organization_id' => $organizationId,
            'user_id'         => $userId,
            'action'          => 'inventory_adjust',
            'entity_type'     => 'Product',
            'entity_id'       => $product?->sku ?? (string) $productId,
            'summary'         => "Stock adjusted: {$product?->name} ({$quantity > 0 ? '+' : ''}{$quantity} units via {$type}). New balance: {$movement->balance_after}",
            'old_values'      => ['stock' => $movement->balance_after - $quantity],
            'new_values'      => ['stock' => $movement->balance_after],
            'ip_address'      => Request::ip(),
        ]);

        return $movement;
    }
}
