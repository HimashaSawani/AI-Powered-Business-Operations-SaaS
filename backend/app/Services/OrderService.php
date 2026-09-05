<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\InventoryMovement;
use App\Models\AiCustomerScore;
use App\Events\OrderCreated;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Exception;

class OrderService
{
    /**
     * Executes the complete Order creation lifecycle inside an ACID Database Transaction.
     * Guarantees that Order, Items, Inventory Deductions, Movements, and Payments are atomic.
     *
     * @param array $payload
     * @param int $organizationId
     * @param int|null $userId
     * @return Order
     * @throws Exception
     */
    public function createOrderWithTransaction(array $payload, int $organizationId, ?int $userId = null): Order
    {
        return DB::transaction(function () use ($payload, $organizationId, $userId) {
            // 1. Verify Customer exists in organization
            $customer = Customer::withoutGlobalScopes()
                ->where('organization_id', $organizationId)
                ->findOrFail($payload['customer_id']);

            // 2. Validate items and inventory availability
            $itemsData = $payload['items'] ?? [];
            if (empty($itemsData)) {
                throw new Exception("Order must contain at least one item.");
            }

            $subtotal = 0.00;
            $itemsToProcess = [];

            foreach ($itemsData as $item) {
                $product = Product::withoutGlobalScopes()
                    ->where('organization_id', $organizationId)
                    ->lockForUpdate() // Prevent race conditions on concurrent inventory deductions
                    ->findOrFail($item['product_id']);

                $qty = (int) $item['quantity'];
                if ($qty <= 0) {
                    throw new Exception("Quantity for product {$product->name} must be greater than zero.");
                }

                if ($product->current_stock < $qty) {
                    throw new Exception("Insufficient inventory for '{$product->name}' (SKU: {$product->sku}). Available: {$product->current_stock}, Requested: {$qty}.");
                }

                $unitPrice = (float) ($item['unit_price'] ?? $product->price);
                $lineSubtotal = round($unitPrice * $qty, 2);
                $subtotal += $lineSubtotal;

                $itemsToProcess[] = [
                    'product' => $product,
                    'quantity' => $qty,
                    'unit_price' => $unitPrice,
                    'subtotal' => $lineSubtotal,
                ];
            }

            // 3. Tax and Total calculation
            $taxRate = (float) ($payload['tax_rate'] ?? 0.10); // 10% default sales tax
            $taxAmount = round($subtotal * $taxRate, 2);
            $discountAmount = (float) ($payload['discount_amount'] ?? 0.00);
            $totalAmount = max(0, round($subtotal + $taxAmount - $discountAmount, 2));

            // Generate unique Order Number
            $orderNumber = 'ORD-' . strtoupper(Str::random(3)) . '-' . rand(1000, 9999);

            // 4. Create Order master record
            $order = Order::create([
                'organization_id' => $organizationId,
                'customer_id' => $customer->id,
                'user_id' => $userId,
                'order_number' => $orderNumber,
                'status' => 'confirmed',
                'subtotal' => $subtotal,
                'tax_amount' => $taxAmount,
                'discount_amount' => $discountAmount,
                'total_amount' => $totalAmount,
                'payment_status' => 'paid',
                'notes' => $payload['notes'] ?? 'Order placed via OpsMind AI Sales Studio',
            ]);

            // 5. Create Order Items and update Inventory with audit movement logs
            foreach ($itemsToProcess as $processed) {
                $product = $processed['product'];
                $qty = $processed['quantity'];

                // Create Order Item line
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'quantity' => $qty,
                    'unit_price' => $processed['unit_price'],
                    'subtotal' => $processed['subtotal'],
                ]);

                // Reduce inventory stock
                $newStock = $product->current_stock - $qty;
                $product->current_stock = $newStock;
                $product->refreshStockStatus();

                // Create audit-trail inventory movement
                InventoryMovement::create([
                    'organization_id' => $organizationId,
                    'product_id' => $product->id,
                    'user_id' => $userId,
                    'type' => 'SALE',
                    'quantity' => -$qty,
                    'balance_after' => $newStock,
                    'reference_type' => 'Order',
                    'reference_id' => (string) $order->id,
                    'notes' => "Sale fulfilled for {$order->order_number} to {$customer->name}",
                ]);
            }

            // 6. Record Payment
            $paymentMethod = $payload['payment_method'] ?? 'credit_card';
            $payment = Payment::create([
                'organization_id' => $organizationId,
                'order_id' => $order->id,
                'transaction_reference' => 'TXN-' . strtoupper(Str::random(8)),
                'amount' => $totalAmount,
                'payment_method' => $paymentMethod,
                'status' => 'successful',
            ]);

            // 7. Update AI customer health score based on fresh purchase event
            $this->updateAiCustomerScore($customer, $organizationId);

            // 8. Dispatch domain event for decoupled customer metrics update, audit trail, and notifications
            OrderCreated::dispatch($order, $userId);


            return $order->load(['items.product', 'customer', 'payments']);
        });
    }

    /**
     * Trigger dynamic AI score update reflecting recent purchase and reduced churn likelihood.
     */
    protected function updateAiCustomerScore(Customer $customer, int $organizationId): void
    {
        $recencyDays = 0; // Purchased just now
        $orderCount = $customer->total_orders;
        $ltv = (float) $customer->lifetime_value;

        // Fresh purchase reduces churn risk significantly
        $churnProb = round(max(0.04, 0.40 / (1 + ($orderCount * 0.4) + ($ltv / 1500))), 2);
        $riskLevel = $churnProb > 0.5 ? 'HIGH' : ($churnProb > 0.25 ? 'MEDIUM' : 'LOW');

        AiCustomerScore::updateOrCreate(
            [
                'organization_id' => $organizationId,
                'customer_id' => $customer->id,
            ],
            [
                'churn_risk_score' => $churnProb,
                'risk_level' => $riskLevel,
                'key_drivers' => [
                    "Recent transaction placed today",
                    "Lifetime order frequency increased to {$orderCount} orders",
                    "Cumulative account spend at \${$ltv}"
                ],
                'suggested_action' => "Send personalized post-purchase thank you note and automated satisfaction survey.",
                'calculated_at' => now(),
            ]
        );
    }
}
