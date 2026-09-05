<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AdjustStockRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => 'required|string|in:PURCHASE,SALE,RETURN,DAMAGE,ADJUSTMENT,TRANSFER',
            'quantity' => 'required|integer|not_in:0',
            'notes' => 'nullable|string',
        ];
    }
}
