<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class NewSalesUpdate implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $date;

    public function __construct($date)
    {
        $this->date = $date;
    }

    public function broadcastOn()
    {
        return new Channel('daily-sales'); // public channel
    }

    public function broadcastWith()
    {
        return [
            'date' => $this->date,
        ];
    }

    public function broadcastAs()
    {
        return 'new-sales-update';
    }
}