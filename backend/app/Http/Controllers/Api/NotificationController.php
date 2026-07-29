<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NotificationController extends Controller
{
    /**
     * Get user notifications
     */
    public function getNotifications(Request $request)
    {
        $user = $request->user();

        $query = DB::table('notifications')->where('user_id', $user->id);
        
        // If admin, also include global notifications without user_id
        if ($user->role === 'admin') {
            $query->orWhereNull('user_id');
        }

        $notifications = $query
            ->orderBy('id', 'desc')
            ->limit(50)
            ->get()
            ->map(function ($notif) {
                // Ensure backward compatibility if some fields are not there
                return [
                    'id' => $notif->id,
                    'title' => $notif->title ?? 'إشعار جديد',
                    'message' => $notif->message ?? '',
                    'type' => $notif->type ?? 'info',
                    'read' => (bool)$notif->read,
                    'link' => $notif->link ?? null,
                    'created_at' => \Carbon\Carbon::parse($notif->created_at)->diffForHumans()
                ];
            });

        $unreadCount = DB::table('notifications')
            ->where(function($q) use ($user) {
                $q->where('user_id', $user->id);
                if ($user->role === 'admin') {
                    $q->orWhereNull('user_id');
                }
            })
            ->where('read', false)
            ->count();

        return response()->json([
            'status' => 'success',
            'data' => [
                'notifications' => $notifications,
                'unread_count' => $unreadCount
            ]
        ]);
    }

    /**
     * Mark a notification as read
     */
    public function markAsRead(Request $request, $id)
    {
        $user = $request->user();
        
        DB::table('notifications')
            ->where('id', $id)
            ->update([
                'read' => true,
                'read_at' => now()
            ]);

        return response()->json(['status' => 'success']);
    }

    /**
     * Mark all as read
     */
    public function markAllAsRead(Request $request)
    {
        $user = $request->user();
        
        DB::table('notifications')
            ->where(function($q) use ($user) {
                $q->where('user_id', $user->id);
                if ($user->role === 'admin') {
                    $q->orWhereNull('user_id');
                }
            })
            ->where('read', false)
            ->update([
                'read' => true,
                'read_at' => now()
            ]);

        return response()->json(['status' => 'success']);
    }

    /**
     * Create notification manually helper for admin
     */
    public static function notifyAdmin($title, $message, $type = 'info', $link = null)
    {
        // Get first admin
        $admin = \App\Models\User::where('role', 'admin')->first();
        if ($admin) {
            self::notifyUser($admin->id, $title, $message, $type, $link);
        }
    }

    /**
     * Create notification manually helper for a specific user
     */
    public static function notifyUser($userId, $title, $message, $type = 'info', $link = null)
    {
        DB::table('notifications')->insert([
            'user_id' => $userId,
            'title' => $title,
            'message' => $message,
            'type' => $type,
            'link' => $link,
            'read' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
