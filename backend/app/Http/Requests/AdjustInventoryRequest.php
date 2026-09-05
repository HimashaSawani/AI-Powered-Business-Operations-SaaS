<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Form Request: Adjust Inventory
 */
class AdjustInventoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'type'     => 'required|string|in:PURCHASE,SALE,RETURN,DAMAGE,ADJUSTMENT,TRANSFER',
            'quantity' => 'required|integer|not_in:0',
            'notes'    => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'quantity.not_in' => 'Quantity cannot be zero.',
            'type.in'         => 'Type must be one of: PURCHASE, SALE, RETURN, DAMAGE, ADJUSTMENT, TRANSFER.',
        ];
    }
}
