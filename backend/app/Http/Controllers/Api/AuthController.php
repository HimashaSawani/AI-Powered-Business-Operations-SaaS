<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Organization;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials do not match our records.'],
            ]);
        }

        $token = $user->createToken('opsmind-access-token')->plainTextToken;
        $organization = $user->currentOrganization;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'avatar' => $user->avatar,
            ],
            'organization' => $organization ? [
                'id' => $organization->id,
                'name' => $organization->name,
                'slug' => $organization->slug,
                'plan' => $organization->plan,
            ] : null,
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        $organization = $user->currentOrganization;

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'avatar' => $user->avatar,
            ],
            'organization' => $organization,
            'available_organizations' => $user->organizations,
        ]);
    }

    public function switchTenant(Request $request)
    {
        $request->validate([
            'organization_id' => 'required|exists:organizations,id',
        ]);

        $user = $request->user();
        
        // Ensure user has access unless super admin
        if (!$user->isSuperAdmin() && !$user->organizations()->where('organizations.id', $request->organization_id)->exists()) {
            return response()->json(['message' => 'Unauthorized tenant switch.'], 403);
        }

        $user->current_organization_id = $request->organization_id;
        $user->save();

        return response()->json([
            'message' => 'Active organization updated.',
            'organization' => $user->currentOrganization,
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'company_name' => 'required|string|max:255',
            'plan' => 'nullable|string|in:Starter,Pro,Enterprise',
        ]);

        $slug = \Illuminate\Support\Str::slug($request->company_name);
        // Ensure unique slug
        if (Organization::where('slug', $slug)->exists()) {
            $slug = $slug . '-' . rand(100, 999);
        }

        $organization = Organization::create([
            'name' => $request->company_name,
            'slug' => $slug,
            'plan' => $request->input('plan', 'Pro'),
            'status' => 'active',
            'settings' => ['currency' => 'USD', 'tax_rate' => 0.08],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'owner',
            'current_organization_id' => $organization->id,
            'avatar' => 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        ]);

        $organization->users()->attach($user->id, ['role' => 'owner']);

        $token = $user->createToken('opsmind-access-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'avatar' => $user->avatar,
            ],
            'organization' => [
                'id' => $organization->id,
                'name' => $organization->name,
                'slug' => $organization->slug,
                'plan' => $organization->plan,
            ],
        ], 201);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json([
                'message' => 'If this email is registered in our system, a password reset link has been dispatched.',
            ], 200);
        }

        return response()->json([
            'message' => 'Password reset instructions have been sent to ' . $request->email,
            'reset_token' => bin2hex(random_bytes(16)),
        ], 200);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully.']);
    }
}
