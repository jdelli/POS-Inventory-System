<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class NewAnnouncement implements ShouldBroadcastNow
{
    use InteractsWithSockets, SerializesModels;

    public $announcement;

    public function __construct($announcement)
    {
        $this->announcement = $announcement;
    }

    public function broadcastOn()
    {
        return new Channel('announcements');
    }

    public function broadcastWith()
    {
        return [
            'id' => $this->announcement->id,
            'title' => $this->announcement->title,
            'content' => $this->announcement->content,
        ];
    }

    public function broadcastAs(): string
    {
        return 'new-announcement';
    }
}
