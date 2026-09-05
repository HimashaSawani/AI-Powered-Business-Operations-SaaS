<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Section 32 — Form Request: Store Ticket
 */
class StoreTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'customer_id' => 'required|integer|exists:customers,id',
            'subject'     => 'required|string|max:255',
            'message'     => 'required|string',
            'priority'    => 'nullable|string|in:low,medium,high,urgent',
            'category'    => 'nullable|string|max:100',
        ];
    }
}
