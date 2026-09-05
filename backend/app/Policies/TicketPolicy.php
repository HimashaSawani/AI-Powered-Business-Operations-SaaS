<?php

namespace App\Policies;

use App\Models\Ticket;
use App\Models\User;

/**
 * Section 32 — Policy: Ticket
 *
 * Enforces tenant-scoped ticket access.
 */
class TicketPolicy
{
    /**
     * View a ticket — same organization only.
     */
    public function view(User $user, Ticket $ticket): bool
    {
        return $user->current_organization_id === $ticket->organization_id;
    }

    /**
     * Update ticket status/priority — same organization, manager or owner.
     */
    public function update(User $user, Ticket $ticket): bool
    {
        return $user->current_organization_id === $ticket->organization_id;
    }
}
