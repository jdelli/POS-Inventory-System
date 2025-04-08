<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    use HasFactory;

    protected $fillable = [
        'supplier_name',
        'delivery_number',
        'product_category',
        'date',

    ];


    public function supplierStocks()
    {
        return $this->hasMany(SupplierStocks::class);
    }

}
