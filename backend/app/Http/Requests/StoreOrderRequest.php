<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Section 32 — Form Request: Store Order
 *
 * Validates order creation payload before it reaches the controller.
 */
class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'customer_id'      => 'required|integer|exists:customers,id',
            'items'            => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.quantity'   => 'required|integer|min:1',
            'items.*.unit_price' => 'nullable|numeric|min:0',
            'tax_rate'         => 'nullable|numeric|min:0|max:1',
            'discount_amount'  => 'nullable|numeric|min:0',
            'payment_method'   => 'nullable|string|in:credit_card,bank_transfer,cash,stripe,paypal',
            'notes'            => 'nullable|string|max:1000',
        ];
    }

    public function messages(): array
    {
        return [
            'items.required' => 'An order must contain at least one item.',
            'items.min'      => 'An order must contain at least one item.',
            'items.*.product_id.exists' => 'One or more products do not exist.',
            'items.*.quantity.min'      => 'Item quantity must be at least 1.',
        ];
    }
}
