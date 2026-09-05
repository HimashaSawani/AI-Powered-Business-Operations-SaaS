<?php

namespace App\Actions;

use App\Models\AuditLog;
use App\Models\Ticket;
use App\Models\TicketMessage;
use App\Events\TicketCreated as TicketCreatedEvent;
use App\Jobs\ProcessTicketAiClassification;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Str;

/**
 *  Create Ticket
 *
 * Orchestrates ticket creation:
 * 1. Creates the ticket record with pre-classification
 * 2. Creates the opening message
 * 3. Fires TicketCreated domain event
 * 4. Dispatches AI classification background job
 * 5. Writes audit log entry
 */
class CreateTicket
{
    public function execute(array $payload, int $organizationId, int $userId): Ticket
    {
        $text      = strtolower(($payload['subject'] ?? '') . ' ' . ($payload['message'] ?? ''));
        $sentiment = (str_contains($text, 'charged twice') || str_contains($text, 'broken') || str_contains($text, 'upset'))
            ? 'negative'
            : 'neutral';

        // 1. Create ticket with smart pre-classification
        $ticket = Ticket::create([
            'organization_id' => $organizationId,
            'customer_id'     => $payload['customer_id'],
            'assigned_user_id'=> $userId,
            'ticket_number'   => 'TCK-' . rand(2000, 9999),
            'subject'         => $payload['subject'],
            'status'          => 'open',
            'priority'        => $payload['priority'] ?? ($sentiment === 'negative' ? 'high' : 'medium'),
            'sentiment'       => $sentiment,
            'ai_confidence'   => 0.94,
            'category'        => $payload['category'] ?? (str_contains($text, 'charge') ? 'Billing' : 'Technical Support'),
            'assigned_team'   => str_contains($text, 'charge') ? 'Billing Team' : 'Support Engineering',
        ]);

        // 2. Create opening message
        TicketMessage::create([
            'ticket_id'   => $ticket->id,
            'user_id'     => $userId,
            'sender_type' => 'customer',
            'sender_name' => $ticket->customer?->name ?? 'Customer',
            'message'     => $payload['message'],
        ]);

        // 3. Raise domain event
        event(new TicketCreatedEvent($ticket));

        // 4. Dispatch background AI deep-classification
        ProcessTicketAiClassification::dispatch($ticket);

        // 5. Audit log
        AuditLog::create([
            'organization_id' => $organizationId,
            'user_id'         => $userId,
            'action'          => 'ticket_create',
            'entity_type'     => 'Ticket',
            'entity_id'       => $ticket->ticket_number,
            'summary'         => "Ticket {$ticket->ticket_number} created: \"{$ticket->subject}\" (Priority: {$ticket->priority})",
            'old_values'      => [],
            'new_values'      => ['status' => 'open', 'priority' => $ticket->priority, 'sentiment' => $sentiment],
            'ip_address'      => Request::ip(),
        ]);

        return $ticket->load(['customer', 'messages']);
    }
}
