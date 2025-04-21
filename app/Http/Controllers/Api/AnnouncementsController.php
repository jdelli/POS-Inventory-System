<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Announcements;
use App\Models\User;
use App\Models\UserAnnouncements;
use App\Notifications\NewAnnouncementNotification;
use App\Events\NewAnnouncement;


class AnnouncementsController extends Controller
{
    public function index()
    {
        return response()->json(Announcements::latest()->get());
    }

    public function store(Request $request)
{
    $validated = $request->validate([
        'title' => 'required|string|max:255',
        'content' => 'required|string',
    ]);

    try {
        // Step 1: Save the announcement
        $announcement = Announcements::create([
            'title' => $validated['title'],
            'content' => $validated['content'],
            'date' => now(),
            'created_by' => auth()->id() ?? null,
        ]);

        // Step 2: Attempt to broadcast (fail silently)
        try {
            event(new \App\Events\NewAnnouncement($announcement));
        } catch (\Exception $e) {
            \Log::warning('Broadcast failed: ' . $e->getMessage());
        }

        // Step 3: Notify all users (fail silently per user)
        $users = \App\Models\User::all();

        foreach ($users as $user) {
            try {
                if (in_array(\Illuminate\Notifications\Notifiable::class, class_uses($user))) {
                    $user->notify(new \App\Notifications\NewAnnouncementNotification($announcement));
                }
            } catch (\Exception $e) {
                \Log::warning("Notification failed for user {$user->id}: " . $e->getMessage());
            }

            // Always create the pivot record
            \App\Models\UserAnnouncements::create([
                'user_id' => $user->id,
                'announcement_id' => $announcement->id,
                'is_read' => false,
            ]);
        }

        // Return JSON response for frontend
        return response()->json($announcement);
    } catch (\Exception $e) {
        \Log::error('Error creating announcement: ' . $e->getMessage());
        return response()->json(['error' => 'Failed to post announcement.'], 500);
    }
}

    public function unread()
    {
        $userId = auth()->id();

        $unread = UserAnnouncements::with('announcement')
            ->where('user_id', $userId)
            ->where('is_read', false)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($unread);
    }

    public function markAsRead($id)
    {
        $userId = auth()->id();

        $record = UserAnnouncements::where('user_id', $userId)
            ->where('announcement_id', $id)
            ->first();

        if (!$record) {
            return response()->json(['error' => 'Record not found'], 404);
        }

        $record->is_read = true;
        $record->save();

        return response()->json(['message' => 'Marked as read']);
    }
}
