<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Notification;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\Chat;


class NotificationController extends Controller
{
    public function getUnreadCounts(Request $request)
    {
        $user = $request->user();

        // Count unread announcements
        $unreadAnnouncements = $user->announcements()
            ->wherePivot('is_read', false)
            ->count();

        // Count unread chat messages
        $unreadChatMessages = Chat::where('receiver_id', $user->id)
            ->where('is_read', false)
            ->count();

        return response()->json([
            'unread_announcements' => $unreadAnnouncements,
            'unread_chat_messages' => $unreadChatMessages,
        ]);
    }

    // Mark an announcement as read
    public function markAnnouncementAsRead($id, Request $request)
    {
        $user = $request->user();

        $user->announcements()->updateExistingPivot($id, ['is_read' => true]);

        return response()->json(['message' => 'Announcement marked as read']);
    }

    // Mark a chat message as read
    public function markChatMessageAsRead($id, Request $request)
    {
        $user = $request->user();

        $message = Chat::where('id', $id)
            ->where('receiver_id', $user->id)
            ->firstOrFail();

        $message->update(['is_read' => true]);

        return response()->json(['message' => 'Chat message marked as read']);
    }
}
