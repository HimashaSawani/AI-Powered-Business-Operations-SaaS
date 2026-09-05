<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

/**
 * Section 30 — Unit Test: Order Calculation Logic
 *
 * Tests the pure arithmetic of order subtotals, tax, discount, and total.
 * No database required — these are pure function tests.
 */
class OrderCalculatorTest extends TestCase
{
    // ── Subtotal Calculation ──────────────────────────────────────────────────

    public function test_subtotal_is_sum_of_all_line_items(): void
    {
        $items = [
            ['quantity' => 2, 'unit_price' => 25.00],
            ['quantity' => 1, 'unit_price' => 50.00],
            ['quantity' => 3, 'unit_price' => 10.00],
        ];

        $subtotal = $this->calculateSubtotal($items);

        $this->assertEquals(130.00, $subtotal);
    }

    public function test_subtotal_for_single_item(): void
    {
        $items = [['quantity' => 5, 'unit_price' => 19.99]];
        $subtotal = $this->calculateSubtotal($items);

        $this->assertEquals(99.95, $subtotal);
    }

    public function test_subtotal_is_zero_when_no_items(): void
    {
        $subtotal = $this->calculateSubtotal([]);
        $this->assertEquals(0.00, $subtotal);
    }

    // ── Tax Calculation ───────────────────────────────────────────────────────

    public function test_tax_is_applied_at_10_percent_default(): void
    {
        $subtotal = 100.00;
        $taxRate  = 0.10;
        $tax      = $this->calculateTax($subtotal, $taxRate);

        $this->assertEquals(10.00, $tax);
    }

    public function test_tax_calculation_rounds_to_two_decimal_places(): void
    {
        $subtotal = 33.33;
        $taxRate  = 0.10;
        $tax      = $this->calculateTax($subtotal, $taxRate);

        $this->assertEquals(3.33, $tax);
    }

    // ── Discount Application ──────────────────────────────────────────────────

    public function test_total_deducts_discount_correctly(): void
    {
        $subtotal        = 200.00;
        $taxAmount       = 20.00;
        $discountAmount  = 15.00;
        $total           = $this->calculateTotal($subtotal, $taxAmount, $discountAmount);

        $this->assertEquals(205.00, $total);
    }

    public function test_total_cannot_go_below_zero_when_discount_exceeds_amount(): void
    {
        $subtotal       = 10.00;
        $taxAmount      = 1.00;
        $discountAmount = 500.00; // Massive discount
        $total          = $this->calculateTotal($subtotal, $taxAmount, $discountAmount);

        $this->assertEquals(0.00, $total);
    }

    // ── Quantity Validation ───────────────────────────────────────────────────

    public function test_zero_quantity_item_is_rejected(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->validateQuantity(0);
    }

    public function test_negative_quantity_is_rejected(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->validateQuantity(-5);
    }

    public function test_positive_quantity_is_accepted(): void
    {
        $result = $this->validateQuantity(3);
        $this->assertEquals(3, $result);
    }

    // ── Helpers (Pure Functions mirroring OrderService logic) ─────────────────

    private function calculateSubtotal(array $items): float
    {
        return round(array_reduce($items, function (float $carry, array $item) {
            return $carry + ($item['unit_price'] * $item['quantity']);
        }, 0.00), 2);
    }

    private function calculateTax(float $subtotal, float $taxRate): float
    {
        return round($subtotal * $taxRate, 2);
    }

    private function calculateTotal(float $subtotal, float $taxAmount, float $discountAmount): float
    {
        return max(0.00, round($subtotal + $taxAmount - $discountAmount, 2));
    }

    private function validateQuantity(int $quantity): int
    {
        if ($quantity <= 0) {
            throw new \InvalidArgumentException("Quantity must be greater than zero. Got: {$quantity}");
        }
        return $quantity;
    }
}
