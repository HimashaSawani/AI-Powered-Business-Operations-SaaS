<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * API Resource: Ticket
 *
 * Transforms Ticket model to consistent JSON with AI classification fields.
 */
class TicketResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'ticket_number' => $this->ticket_number,
            'subject'       => $this->subject,
            'status'        => $this->status,
            'priority'      => $this->priority,
            'category'      => $this->category,
            'assigned_team' => $this->assigned_team,
            // AI Classification Fields
            'sentiment'     => $this->sentiment,
            'ai_confidence' => $this->ai_confidence,
            'customer'      => $this->whenLoaded('customer', fn() => [
                'id'    => $this->customer->id,
                'name'  => $this->customer->name,
                'email' => $this->customer->email,
            ]),
            'messages'      => $this->whenLoaded('messages', fn() =>
                $this->messages->map(fn($msg) => [
                    'id'          => $msg->id,
                    'sender_type' => $msg->sender_type,
                    'sender_name' => $msg->sender_name,
                    'message'     => $msg->message,
                    'created_at'  => $msg->created_at?->toISOString(),
                ])
            ),
            'created_at'    => $this->created_at?->toISOString(),
            'updated_at'    => $this->updated_at?->toISOString(),
        ];
    }
}
