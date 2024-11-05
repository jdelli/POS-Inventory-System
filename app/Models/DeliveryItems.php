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
        'quantity',
        'date',
    ];

    public function deliveryReceipts()
    {
        return $this->belongsTo(DeliveryReceipt::class);
    }
}
