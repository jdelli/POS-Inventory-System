<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeliveryReceipt extends Model
{
    use HasFactory;



    protected $fillable = [
        'delivery_number',
        'delivered_by',
        'date',
        
    ];


    public function items()
    {
        return $this->hasMany(DeliveryItems::class);
    }
}
