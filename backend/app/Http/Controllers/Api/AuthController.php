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

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully.']);
    }
}
