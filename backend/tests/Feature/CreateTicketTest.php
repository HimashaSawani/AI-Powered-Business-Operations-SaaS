<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Customer;
use Illuminate\Support\Facades\Queue;
use App\Jobs\ProcessTicketAiClassification;

/**
 * Section 30 — Feature Test: Ticket Creation
 *
 * Tests ticket creation response structure, AI classification job dispatch,
 * and validation rules.
 */
class CreateTicketTest extends TestCase
{
    private function createCustomer(int $orgId): Customer
    {
        return Customer::create([
            'organization_id' => $orgId,
            'name'            => 'Jane Doe',
            'email'           => 'jane-' . uniqid() . '@test.com',
            'status'          => 'active',
            'total_orders'    => 5,
            'lifetime_value'  => 820.00,
        ]);
    }

    public function test_ticket_creation_returns_201_with_ticket_number(): void
    {
        [$user, $org] = $this->actingAsRole('owner');
        $customer = $this->createCustomer($org->id);

        $response = $this->postJson('/api/v1/tickets', [
            'customer_id' => $customer->id,
            'subject'     => 'I was charged twice for my order.',
            'message'     => 'I noticed two charges on my credit card for order ORD-5082.',
            'priority'    => 'high',
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'ticket_number',
                     'status',
                     'subject',
                     'priority',
                 ]);
    }

    public function test_ticket_status_is_open_on_creation(): void
    {
        [$user, $org] = $this->actingAsRole('owner');
        $customer = $this->createCustomer($org->id);

        $response = $this->postJson('/api/v1/tickets', [
            'customer_id' => $customer->id,
            'subject'     => 'Product arrived damaged',
            'message'     => 'The product box was broken upon arrival.',
        ]);

        $response->assertStatus(201)
                 ->assertJsonPath('status', 'open');
    }

    public function test_ticket_creation_dispatches_ai_classification_job(): void
    {
        Queue::fake();

        [$user, $org] = $this->actingAsRole('owner');
        $customer = $this->createCustomer($org->id);

        $this->postJson('/api/v1/tickets', [
            'customer_id' => $customer->id,
            'subject'     => 'Cannot access my account',
            'message'     => 'I keep getting an error when trying to log in.',
        ])->assertStatus(201);

        Queue::assertPushed(ProcessTicketAiClassification::class);
    }

    public function test_ticket_creation_fails_without_subject(): void
    {
        [$user, $org] = $this->actingAsRole('owner');
        $customer = $this->createCustomer($org->id);

        $response = $this->postJson('/api/v1/tickets', [
            'customer_id' => $customer->id,
            'message'     => 'A message without a subject.',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['subject']);
    }

    public function test_ticket_creation_fails_without_message(): void
    {
        [$user, $org] = $this->actingAsRole('owner');
        $customer = $this->createCustomer($org->id);

        $response = $this->postJson('/api/v1/tickets', [
            'customer_id' => $customer->id,
            'subject'     => 'Billing issue',
        ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['message']);
    }

    public function test_billing_ticket_gets_high_priority_sentiment_pre_classification(): void
    {
        [$user, $org] = $this->actingAsRole('owner');
        $customer = $this->createCustomer($org->id);

        $response = $this->postJson('/api/v1/tickets', [
            'customer_id' => $customer->id,
            'subject'     => 'I was charged twice',
            'message'     => 'Duplicate charge on my account.',
        ]);

        $data = $response->json();
        $this->assertEquals('negative', $data['sentiment']);
    }
}
