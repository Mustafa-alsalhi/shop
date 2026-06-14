<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * Get all notifications for the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $notifications = Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'title' => $notification->title,
                    'message' => $notification->message,
                    'data' => $notification->data,
                    'read' => $notification->read,
                    'read_at' => $notification->read_at ? $notification->read_at->toISOString() : null,
                    'link' => $notification->link,
                    'timestamp' => $notification->created_at->toISOString(),
                ];
            });

        return response()->json([
            'data' => $notifications,
        ]);
    }

    /**
     * Get unread notifications for the authenticated user.
     */
    public function unread(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $notifications = Notification::where('user_id', $user->id)
            ->unread()
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'title' => $notification->title,
                    'message' => $notification->message,
                    'data' => $notification->data,
                    'read' => $notification->read,
                    'read_at' => $notification->read_at ? $notification->read_at->toISOString() : null,
                    'link' => $notification->link,
                    'timestamp' => $notification->created_at->toISOString(),
                ];
            });

        return response()->json([
            'data' => $notifications,
        ]);
    }

    /**
     * Mark a specific notification as read.
     */
    public function markAsRead(Request $request, $id): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $notification = Notification::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$notification) {
            return response()->json(['error' => 'Notification not found'], 404);
        }

        $notification->markAsRead();

        return response()->json([
            'message' => 'Notification marked as read',
            'data' => [
                'id' => $notification->id,
                'read' => $notification->read,
                'read_at' => $notification->read_at ? $notification->read_at->toISOString() : null,
            ],
        ]);
    }

    /**
     * Mark all notifications as read for the authenticated user.
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        Notification::where('user_id', $user->id)
            ->unread()
            ->update([
                'read' => true,
                'read_at' => now(),
            ]);

        return response()->json([
            'message' => 'All notifications marked as read',
        ]);
    }

    /**
     * Delete a specific notification.
     */
    public function destroy(Request $request, $id): JsonResponse
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $notification = Notification::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$notification) {
            return response()->json(['error' => 'Notification not found'], 404);
        }

        $notification->delete();

        return response()->json([
            'message' => 'Notification deleted',
        ]);
    }

    /**
     * Create a new notification (for internal use).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'type' => 'required|in:success,error,warning,info',
            'title' => 'nullable|string|max:255',
            'message' => 'nullable|string',
            'data' => 'nullable|array',
            'link' => 'nullable|string',
        ]);

        $notification = Notification::create([
            'user_id' => $validated['user_id'],
            'type' => $validated['type'],
            'title' => $validated['title'] ?? null,
            'message' => $validated['message'] ?? null,
            'data' => $validated['data'] ?? null,
            'link' => $validated['link'] ?? null,
            'read' => false,
        ]);

        return response()->json([
            'message' => 'Notification created',
            'data' => [
                'id' => $notification->id,
                'type' => $notification->type,
                'title' => $notification->title,
                'message' => $notification->message,
                'data' => $notification->data,
                'read' => $notification->read,
                'link' => $notification->link,
                'timestamp' => $notification->created_at->toISOString(),
            ],
        ], 201);
    }
}
