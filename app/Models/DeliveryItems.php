<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeliveryItems extends Model
{
    use HasFactory;

    protected $fillable = [
        'delivery_receipts_id',
        'product_name',
        'date',
    ];

    public function deliveryReceipts()
    {
        return $this->belongsTo(DeliveryReceipts::class);
    }
}
