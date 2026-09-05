<?php

namespace App\Events;

use App\Models\Ticket;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Section 32 — Domain Event: Ticket Created
 *
 * Fired after a support ticket is created.
 * Can trigger notification broadcasts, SLA timer starts, etc.
 */
class TicketCreated
{
    use Dispatchable, SerializesModels;

    public function __construct(public readonly Ticket $ticket)
    {
    }
}
