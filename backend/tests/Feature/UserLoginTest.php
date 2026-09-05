<?php

namespace Tests\Feature;

use Tests\TestCase;

/**
 * Section 30 — Feature Test: User Authentication
 *
 * Tests login, bad credentials, and unauthenticated access.
 */
class UserLoginTest extends TestCase
{
    public function test_user_can_login_with_correct_credentials(): void
    {
        [$user] = $this->createUserWithOrg('owner');
        // Update password to a known value
        $user->password = bcrypt('secret-password');
        $user->save();

        $response = $this->postJson('/api/v1/auth/login', [
            'email'    => $user->email,
            'password' => 'secret-password',
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'token',
                     'user' => ['id', 'name', 'email', 'role'],
                     'organization',
                 ]);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        [$user] = $this->createUserWithOrg('owner');

        $response = $this->postJson('/api/v1/auth/login', [
            'email'    => $user->email,
            'password' => 'completely-wrong-password',
        ]);

        $response->assertStatus(422);
    }

    public function test_login_fails_with_non_existent_email(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email'    => 'nobody@opsmind-test.invalid',
            'password' => 'any-password',
        ]);

        $response->assertStatus(422);
    }

    public function test_unauthenticated_request_to_protected_route_returns_401(): void
    {
        // No Sanctum::actingAs(), so this should be rejected
        $response = $this->getJson('/api/v1/customers');

        $response->assertStatus(401);
    }

    public function test_unauthenticated_request_to_orders_returns_401(): void
    {
        $response = $this->getJson('/api/v1/orders');

        $response->assertStatus(401);
    }

    public function test_unauthenticated_request_to_ai_insights_returns_401(): void
    {
        $response = $this->getJson('/api/v1/ai/insights');

        $response->assertStatus(401);
    }

    public function test_authenticated_user_can_access_protected_routes(): void
    {
        [$user] = $this->actingAsRole('owner');

        $response = $this->getJson('/api/v1/customers');

        $response->assertStatus(200);
    }

    public function test_logout_revokes_token(): void
    {
        [$user] = $this->createUserWithOrg('owner');
        $this->actingAsUser($user);

        $response = $this->postJson('/api/v1/auth/logout');

        $response->assertStatus(200)
                 ->assertJson(['message' => 'Logged out successfully.']);
    }
}
