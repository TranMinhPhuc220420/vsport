<?php

namespace App\Services\Ops;

use App\Support\DeployCheckReport;
use App\Support\OpsHeartbeat;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class DeployCheckService
{
    public function run(bool $strict = false): DeployCheckReport
    {
        $items = [];

        $this->checkAppKey($items);
        $this->checkProductionDebug($items);
        $this->checkDatabase($items);
        $this->checkMigrations($items);
        $this->checkMail($items);
        $this->checkQueue($items);
        $this->checkStripe($items);
        $this->checkStorage($items);
        $this->checkSchedulerHeartbeats($items);
        $this->checkBuildAssets($items);

        $items[] = [
            'level' => 'info',
            'message' => 'Stripe webhook URL: '.url('/stripe/webhook'),
        ];

        $items[] = [
            'level' => 'info',
            'message' => 'Cron entry: * * * * * php '.base_path('artisan').' schedule:run >> /dev/null 2>&1',
        ];

        return new DeployCheckReport($items);
    }

    /**
     * @param  list<array{level: string, message: string}>  $items
     */
    private function checkAppKey(array &$items): void
    {
        $key = (string) config('app.key');

        if ($key === '' || str_starts_with($key, 'base64:') === false) {
            $items[] = [
                'level' => 'fail',
                'message' => 'APP_KEY is missing. Run php artisan key:generate.',
            ];

            return;
        }

        $items[] = [
            'level' => 'pass',
            'message' => 'APP_KEY is configured.',
        ];
    }

    /**
     * @param  list<array{level: string, message: string}>  $items
     */
    private function checkProductionDebug(array &$items): void
    {
        if (! app()->environment('production')) {
            $items[] = [
                'level' => 'info',
                'message' => 'APP_ENV is '.config('app.env').' (production checks skipped where noted).',
            ];

            return;
        }

        if (config('app.debug')) {
            $items[] = [
                'level' => 'fail',
                'message' => 'APP_DEBUG must be false in production.',
            ];

            return;
        }

        $items[] = [
            'level' => 'pass',
            'message' => 'APP_DEBUG is disabled for production.',
        ];
    }

    /**
     * @param  list<array{level: string, message: string}>  $items
     */
    private function checkDatabase(array &$items): void
    {
        try {
            DB::connection()->getPdo();
            $items[] = [
                'level' => 'pass',
                'message' => 'Database connection OK.',
            ];
        } catch (\Throwable $exception) {
            $items[] = [
                'level' => 'fail',
                'message' => 'Database connection failed: '.$exception->getMessage(),
            ];
        }
    }

    /**
     * @param  list<array{level: string, message: string}>  $items
     */
    private function checkMigrations(array &$items): void
    {
        try {
            $migrator = app('migrator');

            if (! $migrator->repositoryExists()) {
                $items[] = [
                    'level' => 'fail',
                    'message' => 'Migrations table missing. Run php artisan migrate --force.',
                ];

                return;
            }

            $files = $migrator->getMigrationFiles($migrator->paths());
            $ran = $migrator->getRepository()->getRan();
            $pending = array_diff(array_keys($files), $ran);

            if ($pending !== []) {
                $items[] = [
                    'level' => 'fail',
                    'message' => 'Pending migrations detected. Run php artisan migrate --force.',
                ];

                return;
            }
        } catch (\Throwable $exception) {
            $items[] = [
                'level' => 'fail',
                'message' => 'Unable to read migration status: '.$exception->getMessage(),
            ];

            return;
        }

        $items[] = [
            'level' => 'pass',
            'message' => 'Database migrations are up to date.',
        ];
    }

    /**
     * @param  list<array{level: string, message: string}>  $items
     */
    private function checkMail(array &$items): void
    {
        if (! app()->environment('production')) {
            return;
        }

        if (config('mail.default') === 'log') {
            $items[] = [
                'level' => 'warn',
                'message' => 'MAIL_MAILER is log — order status emails will not reach customers.',
            ];

            return;
        }

        $from = (string) config('mail.from.address');

        if ($from === '' || str_contains($from, 'example.com')) {
            $items[] = [
                'level' => 'warn',
                'message' => 'MAIL_FROM_ADDRESS looks like a placeholder.',
            ];

            return;
        }

        $items[] = [
            'level' => 'pass',
            'message' => 'Mail transport configured.',
        ];
    }

    /**
     * @param  list<array{level: string, message: string}>  $items
     */
    private function checkQueue(array &$items): void
    {
        if (! app()->environment('production')) {
            return;
        }

        if (config('queue.default') === 'sync') {
            $items[] = [
                'level' => 'warn',
                'message' => 'QUEUE_CONNECTION is sync — queued order emails will send inline and block requests. Use database or redis and run a queue worker.',
            ];

            return;
        }

        $items[] = [
            'level' => 'pass',
            'message' => 'Queue connection is '.config('queue.default').'.',
        ];
    }

    /**
     * @param  list<array{level: string, message: string}>  $items
     */
    private function checkStripe(array &$items): void
    {
        $secret = (string) config('services.stripe.secret');
        $webhook = (string) config('services.stripe.webhook_secret');
        $publishable = (string) config('services.stripe.key');

        if ($secret === '' && $publishable === '') {
            $items[] = [
                'level' => 'info',
                'message' => 'Stripe is not configured — checkout will offer COD only.',
            ];

            return;
        }

        if ($secret === '' || $publishable === '') {
            $items[] = [
                'level' => 'fail',
                'message' => 'Stripe requires both STRIPE_KEY and STRIPE_SECRET.',
            ];

            return;
        }

        if ($webhook === '') {
            $items[] = [
                'level' => 'warn',
                'message' => 'STRIPE_WEBHOOK_SECRET is missing — card payments may stay pending after checkout.',
            ];
        } else {
            $items[] = [
                'level' => 'pass',
                'message' => 'Stripe keys and webhook secret are configured.',
            ];
        }
    }

    /**
     * @param  list<array{level: string, message: string}>  $items
     */
    private function checkStorage(array &$items): void
    {
        $hasSupabase = config('filesystems.disks.supabase.key')
            && config('filesystems.disks.supabase.bucket');

        if ($hasSupabase) {
            $items[] = [
                'level' => 'pass',
                'message' => 'Supabase Storage is configured for product images.',
            ];

            return;
        }

        $items[] = [
            'level' => 'warn',
            'message' => 'Supabase Storage is not configured — product images use the public disk.',
        ];
    }

    /**
     * @param  list<array{level: string, message: string}>  $items
     */
    private function checkSchedulerHeartbeats(array &$items): void
    {
        if (! app()->environment('production')) {
            $items[] = [
                'level' => 'info',
                'message' => 'Scheduler heartbeats are only enforced in production.',
            ];

            return;
        }

        $this->checkHeartbeat(
            $items,
            OpsHeartbeat::CARTS_RELEASE_EXPIRED,
            'carts:release-expired',
            hours: 2,
        );

        $this->checkHeartbeat(
            $items,
            OpsHeartbeat::ANALYTICS_SYNC,
            'analytics:sync',
            hours: 26,
        );

        $this->checkHeartbeat(
            $items,
            OpsHeartbeat::INVENTORY_LOW_STOCK_CHECK,
            'inventory:check-low-stock',
            hours: 26,
        );
    }

    /**
     * @param  list<array{level: string, message: string}>  $items
     */
    private function checkHeartbeat(
        array &$items,
        string $cacheKey,
        string $command,
        int $hours,
    ): void {
        $lastRun = OpsHeartbeat::lastRun($cacheKey);

        if ($lastRun === null) {
            $items[] = [
                'level' => 'warn',
                'message' => "No heartbeat for {$command}. Ensure cron runs schedule:run.",
            ];

            return;
        }

        if ($lastRun->lt(now()->subHours($hours))) {
            $items[] = [
                'level' => 'warn',
                'message' => "{$command} last ran {$lastRun->diffForHumans()} — expected within {$hours} hour(s).",
            ];

            return;
        }

        $items[] = [
            'level' => 'pass',
            'message' => "{$command} heartbeat OK (last run {$lastRun->toDateTimeString()}).",
        ];
    }

    /**
     * @param  list<array{level: string, message: string}>  $items
     */
    private function checkBuildAssets(array &$items): void
    {
        $manifest = public_path('build/manifest.json');

        if (! File::exists($manifest)) {
            $items[] = [
                'level' => 'fail',
                'message' => 'Frontend build missing. Run npm run build before deploy.',
            ];

            return;
        }

        $items[] = [
            'level' => 'pass',
            'message' => 'Vite build manifest found.',
        ];
    }
}
