<?php

namespace App\Console\Commands;

use App\Services\Ops\DeployCheckService;
use Illuminate\Console\Command;

class DeployCheck extends Command
{
    protected $signature = 'vsport:deploy-check {--strict : Treat warnings as failures}';

    protected $description = 'Validate production readiness (env, DB, Stripe, scheduler heartbeats, build assets)';

    public function handle(DeployCheckService $deployCheck): int
    {
        $strict = (bool) $this->option('strict');
        $report = $deployCheck->run($strict);

        foreach ($report->items as $item) {
            match ($item['level']) {
                'pass' => $this->line("<fg=green>✓</> {$item['message']}"),
                'warn' => $this->line("<fg=yellow>!</> {$item['message']}"),
                'fail' => $this->line("<fg=red>✗</> {$item['message']}"),
                default => $this->line("· {$item['message']}"),
            };
        }

        if ($report->hasFailures()) {
            $this->newLine();
            $this->error('Deploy check failed.');

            return self::FAILURE;
        }

        if ($strict && $report->hasWarnings()) {
            $this->newLine();
            $this->error('Deploy check failed in strict mode (warnings present).');

            return self::FAILURE;
        }

        $this->newLine();
        $this->info('Deploy check passed.');

        return self::SUCCESS;
    }
}
