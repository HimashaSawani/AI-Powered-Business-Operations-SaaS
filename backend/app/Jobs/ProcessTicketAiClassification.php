<?php

namespace App\Jobs;

use App\Models\Ticket;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ProcessTicketAiClassification implements ShouldQueue
{
    use Queueable;

    public $ticket;

    /**
     * Create a new job instance
     */
    public function __construct(Ticket $ticket)
    {
        $this->ticket = $ticket;
    }

    /**
     * Execute the job: Dispatches ticket content to Python AI NLP microservice.
     */
    public function handle(): void
    {
        $ticket = $this->ticket->fresh(['customer', 'messages']);
        $initialMessage = $ticket->messages()->first()?->message ?? $ticket->subject;

        try {
            // Call Python AI Microservice (port 8001)
            $response = Http::timeout(3)->post('http://127.0.0.1:8001/api/ai/classify-ticket', [
                'ticket_id' => $ticket->id,
                'subject' => $ticket->subject,
                'message' => $initialMessage,
                'customer_name' => $ticket->customer?->name ?? 'Customer',
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                $ticket->category = ucfirst($data['category'] ?? $ticket->category);
                $ticket->priority = strtolower($data['priority'] ?? $ticket->priority);
                $ticket->sentiment = strtolower($data['sentiment'] ?? 'neutral');
                $ticket->ai_confidence = $data['confidence'] ?? 0.90;
                $ticket->assigned_team = $data['assigned_team'] ?? 'Customer Support';
                $ticket->save();

                Log::info("AI Classification completed for Ticket #{$ticket->ticket_number}", $data);
            }
        } catch (\Throwable $e) {
            Log::warning("AI Classification microservice call failed for Ticket #{$ticket->ticket_number}: {$e->getMessage()}");
            
            // Fallback heuristic classification
            if (stripos($initialMessage, 'charged twice') !== false || stripos($initialMessage, 'billing') !== false) {
                $ticket->category = 'Billing';
                $ticket->priority = 'high';
                $ticket->sentiment = 'negative';
                $ticket->ai_confidence = 0.94;
                $ticket->assigned_team = 'Billing & Payments Team';
                $ticket->save();
            }
        }
    }
}
