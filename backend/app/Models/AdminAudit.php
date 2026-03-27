<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdminAudit extends Model
{
    use HasFactory;

    protected $fillable = [
        'admin_id',
        'action',
        'path',
        'ip_address',
        'user_agent',
        'details',
        'created_at'
    ];

    protected $casts = [
        'details' => 'json',
        'created_at' => 'datetime'
    ];

    /**
     * Get the admin that performed the action
     */
    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    /**
     * Scope to get actions by admin
     */
    public function scopeByAdmin($query, $adminId)
    {
        return $query->where('admin_id', $adminId);
    }

    /**
     * Scope to get actions by type
     */
    public function scopeByAction($query, $action)
    {
        return $query->where('action', $action);
    }

    /**
     * Scope to get actions in date range
     */
    public function scopeInDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    /**
     * Scope to get sensitive actions
     */
    public function scopeSensitive($query)
    {
        $sensitiveActions = ['delete', 'destroy', 'update', 'create', 'store'];
        return $query->whereIn('action', $sensitiveActions);
    }

    /**
     * Get formatted action description
     */
    public function getActionDescriptionAttribute()
    {
        $descriptions = [
            'get' => 'Viewed',
            'post' => 'Created',
            'put' => 'Updated',
            'patch' => 'Modified',
            'delete' => 'Deleted'
        ];

        return $descriptions[strtolower($this->action)] ?? ucfirst($this->action);
    }

    /**
     * Get truncated user agent
     */
    public function getShortUserAgentAttribute()
    {
        if (strlen($this->user_agent) > 100) {
            return substr($this->user_agent, 0, 100) . '...';
        }
        return $this->user_agent;
    }

    /**
     * Get location from IP (placeholder for IP geolocation service)
     */
    public function getLocationAttribute()
    {
        // This is a placeholder. In production, you would use an IP geolocation service
        return $this->ip_address;
    }
}
