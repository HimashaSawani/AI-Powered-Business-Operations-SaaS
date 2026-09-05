<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class AuditLogService
{
    /**
     * Record an immutable audit log entry.
     *
     * @param string $action Action name (e.g. 'CREATED', 'UPDATED', 'DELETED', 'STOCK_ADJUSTED')
     * @param Model|string $entity Entity instance or entity name
     * @param string $summary Human readable action summary
     * @param array|null $oldValues Attributes state prior to change
     * @param array|null $newValues Attributes state after change
     * @param int|null $organizationId
     * @param int|null $userId
     * @return AuditLog
     */
    public function log(
        string $action,
        Model|string $entity,
        string $summary,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?int $organizationId = null,
        ?int $userId = null
    ): AuditLog {
        $user = Auth::user();
        $finalUserId = $userId ?? $user?->id;
        $finalOrgId = $organizationId ?? $user?->current_organization_id ?? 1;
        $userName = $user?->name ?? 'System Process';
        $ipAddress = request()?->ip() ?? '127.0.0.1';

        $entityType = is_object($entity) ? class_basename($entity) : $entity;
        $entityId = is_object($entity) ? (string) $entity->getKey() : null;

        return AuditLog::create([
            'organization_id' => $finalOrgId,
            'user_id' => $finalUserId,
            'user_name' => $userName,
            'action' => strtoupper($action),
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'summary' => $summary,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => $ipAddress,
        ]);
    }
}
