<?php

namespace Tests;

use App\Models\Organization;
use App\Models\User;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

abstract class TestCase extends BaseTestCase
{
    use RefreshDatabase;

    /**
     * Create an organization and a user belonging to it, returning both.
     *
     * @param string $role  owner | manager | staff
     */
    protected function createUserWithOrg(string $role = 'owner'): array
    {
        $organization = Organization::create([
            'name' => 'Test Org ' . uniqid(),
            'slug' => 'test-org-' . uniqid(),
            'plan' => 'professional',
            'status' => 'active',
        ]);

        $user = User::create([
            'name' => ucfirst($role) . ' User',
            'email' => $role . '-' . uniqid() . '@opsmind-test.com',
            'password' => bcrypt('password'),
            'role' => $role,
            'current_organization_id' => $organization->id,
        ]);

        $user->organizations()->attach($organization->id, ['role' => $role]);

        return [$user, $organization];
    }

    /**
     * Authenticate as a given user via Sanctum and return the user.
     */
    protected function actingAsUser(User $user): User
    {
        Sanctum::actingAs($user);
        return $user;
    }

    /**
     * Authenticate as a new user with the given role and return [$user, $organization].
     */
    protected function actingAsRole(string $role = 'owner'): array
    {
        [$user, $org] = $this->createUserWithOrg($role);
        $this->actingAsUser($user);
        return [$user, $org];
    }
}
