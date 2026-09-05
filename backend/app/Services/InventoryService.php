<?php

namespace App\Services;

use App\Models\Product;
use App\Models\InventoryMovement;
use Illuminate\Support\Facades\DB;
use Exception;

class InventoryService
{
    /**
     * Records a verified inventory movement and updates product stock levels.
     *
     * @param int $productId
     * @param string $type PURCHASE | SALE | RETURN | DAMAGE | ADJUSTMENT | TRANSFER
     * @param int $quantity Delta quantity (positive for additions, negative for reductions)
     * @param int $organizationId
     * @param int|null $userId
     * @param string|null $referenceType
     * @param string|null $referenceId
     * @param string|null $notes
     * @return InventoryMovement
     * @throws Exception
     */
    public function recordMovement(
        int $productId,
        string $type,
        int $quantity,
        int $organizationId,
        ?int $userId = null,
        ?string $referenceType = null,
        ?string $referenceId = null,
        ?string $notes = null
    ): InventoryMovement {
        return DB::transaction(function () use (
            $productId,
            $type,
            $quantity,
            $organizationId,
            $userId,
            $referenceType,
            $referenceId,
            $notes
        ) {
            $product = Product::withoutGlobalScopes()
                ->where('organization_id', $organizationId)
                ->lockForUpdate()
                ->findOrFail($productId);

            $newStock = $product->current_stock + $quantity;

            if ($newStock < 0) {
                throw new Exception("Inventory movement would result in negative stock ({$newStock}) for '{$product->name}'. Action rejected.");
            }

            $product->current_stock = $newStock;
            $product->refreshStockStatus();

            return InventoryMovement::create([
                'organization_id' => $organizationId,
                'product_id' => $product->id,
                'user_id' => $userId,
                'type' => strtoupper($type),
                'quantity' => $quantity,
                'balance_after' => $newStock,
                'reference_type' => $referenceType ?? 'ManualEntry',
                'reference_id' => $referenceId,
                'notes' => $notes ?? "Inventory {$type} adjustment recorded",
            ]);
        });
    }
}
