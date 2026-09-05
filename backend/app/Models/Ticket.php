<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'organization_id',
        'customer_id',
        'assigned_user_id',
        'assigned_team',
        'ticket_number',
        'subject',
        'status', // open, in_progress, waiting_on_customer, resolved, closed
        'priority', // low, medium, high, urgent
        'sentiment', // negative, neutral, positive
        'ai_confidence',
        'category',
    ];

    protected $casts = [
        'ai_confidence' => 'float',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_user_id');
    }

    public function messages()
    {
        return $this->hasMany(TicketMessage::class)->oldest();
    }
}
