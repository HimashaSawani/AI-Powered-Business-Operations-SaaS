<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\TicketMessage;
use App\Jobs\ProcessTicketAiClassification;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TicketController extends Controller
{
    public function index(Request $request)
    {
        $query = Ticket::with(['customer', 'assignedUser', 'messages'])->latest();

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('priority') && $request->priority !== 'all') {
            $query->where('priority', $request->priority);
        }

        if ($request->has('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        return response()->json($query->paginate(20));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'subject' => 'required|string|max:255',
            'priority' => 'nullable|string|in:low,medium,high,urgent',
            'category' => 'nullable|string',
            'message' => 'required|string',
        ]);

        $orgId = $request->user()->current_organization_id ?? 1;
        $ticketNumber = 'TCK-' . rand(2000, 9999);

        // Pre-classify sentiment for immediate UI display
        $text = strtolower($validated['subject'] . ' ' . $validated['message']);
        $sentiment = (str_contains($text, 'charged twice') || str_contains($text, 'broken') || str_contains($text, 'upset')) 
            ? 'negative' 
            : 'neutral';

        $ticket = Ticket::create([
            'organization_id' => $orgId,
            'customer_id' => $validated['customer_id'],
            'assigned_user_id' => $request->user()->id,
            'ticket_number' => $ticketNumber,
            'subject' => $validated['subject'],
            'status' => 'open',
            'priority' => $validated['priority'] ?? ($sentiment === 'negative' ? 'high' : 'medium'),
            'sentiment' => $sentiment,
            'ai_confidence' => 0.94,
            'category' => $validated['category'] ?? (str_contains($text, 'charge') ? 'Billing' : 'Technical Support'),
            'assigned_team' => str_contains($text, 'charge') ? 'Billing Team' : 'Support Engineering',
        ]);

        TicketMessage::create([
            'ticket_id' => $ticket->id,
            'user_id' => $request->user()->id,
            'sender_type' => 'customer',
            'sender_name' => $ticket->customer->name,
            'message' => $validated['message'],
        ]);

        // Dispatch background queue job to call Python AI Microservice for deep NLP
        ProcessTicketAiClassification::dispatch($ticket);

        return response()->json($ticket->load(['customer', 'messages']), 201);
    }

    public function reply(Request $request, $id)
    {
        $request->validate([
            'message' => 'required|string',
            'status' => 'nullable|string|in:open,in_progress,waiting_on_customer,resolved,closed',
        ]);

        $ticket = Ticket::findOrFail($id);

        $msg = TicketMessage::create([
            'ticket_id' => $ticket->id,
            'user_id' => $request->user()->id,
            'sender_type' => 'staff',
            'sender_name' => $request->user()->name,
            'message' => $request->message,
        ]);

        if ($request->status) {
            $ticket->status = $request->status;
            $ticket->save();
        }

        return response()->json([
            'message' => $msg,
            'ticket' => $ticket->fresh(['customer', 'messages.user']),
        ]);
    }
}
