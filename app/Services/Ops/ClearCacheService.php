<?php

namespace App\Services\Ops;

use Illuminate\Support\Facades\Artisan;

class ClearCacheService
{
    /**
     * @return array{success: bool, message: string, commands: list<array{command: string, success: bool, output: string}>}
     */
    public function run(bool $warm = false): array
    {
        $commands = [
            'optimize:clear',
            'cache:clear',
        ];

        if ($warm) {
            $commands = [
                ...$commands,
                'config:cache',
                'route:cache',
                'view:cache',
            ];
        }

        $results = [];
        $success = true;

        foreach ($commands as $command) {
            $exitCode = Artisan::call($command);
            $output = trim(Artisan::output());

            $commandSucceeded = $exitCode === 0;

            $results[] = [
                'command' => $command,
                'success' => $commandSucceeded,
                'output' => $output,
            ];

            if (! $commandSucceeded) {
                $success = false;
            }
        }

        return [
            'success' => $success,
            'message' => $success
                ? ($warm
                    ? 'Cache cleared and rebuilt successfully.'
                    : 'Cache cleared successfully.')
                : 'One or more cache commands failed.',
            'commands' => $results,
        ];
    }
}
