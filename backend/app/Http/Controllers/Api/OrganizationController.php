<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use Illuminate\Http\Request;

/**
 * Organization Controller — Owner/Admin level tenant management.
 * Staff users are blocked at the policy level.
 */
class OrganizationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user->isOwner()) {
            return response()->json(['message' => 'Unauthorized. Owner role required.'], 403);
        }

        $organizations = $user->isSuperAdmin()
            ? Organization::all()
            : $user->organizations;

        return response()->json($organizations);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();

        if (!$user->isOwner()) {
            return response()->json(['message' => 'Unauthorized. Owner role required.'], 403);
        }

        $org = Organization::findOrFail($id);

        // Non-super-admin must belong to the org
        if (!$user->isSuperAdmin() && !$user->organizations()->where('organizations.id', $id)->exists()) {
            return response()->json(['message' => 'Forbidden. You do not have access to this organization.'], 403);
        }

        return response()->json($org);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        if (!$user->isSuperAdmin()) {
            return response()->json(['message' => 'Super Admin role required to create organizations.'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:organizations,slug',
            'plan' => 'nullable|string|in:starter,professional,enterprise',
        ]);

        $org = Organization::create([
            'name'   => $validated['name'],
            'slug'   => $validated['slug'],
            'plan'   => $validated['plan'] ?? 'starter',
            'status' => 'active',
        ]);

        return response()->json($org, 201);
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();

        if (!$user->isOwner()) {
            return response()->json(['message' => 'Unauthorized. Owner role required.'], 403);
        }

        $org = Organization::findOrFail($id);

        if (!$user->isSuperAdmin() && !$user->organizations()->where('organizations.id', $id)->exists()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'plan' => 'sometimes|string|in:starter,professional,enterprise',
        ]);

        $org->update($validated);

        return response()->json($org);
    }
}
