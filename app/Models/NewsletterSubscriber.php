<?php

namespace App\Models;

use App\Enums\NewsletterSource;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $email
 * @property NewsletterSource $source
 * @property Carbon $subscribed_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class NewsletterSubscriber extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'email',
        'source',
        'subscribed_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'source' => NewsletterSource::class,
            'subscribed_at' => 'datetime',
        ];
    }
}
