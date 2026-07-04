<?php

namespace App\Console\Commands;

use App\Services\Catalog\CatalogToOptionsMigrator;
use Illuminate\Console\Command;

class MigrateCatalogToOptions extends Command
{
    protected $signature = 'catalog:migrate-to-options';

    protected $description = 'Migrate legacy colorway/size catalog data to the product options model';

    public function handle(CatalogToOptionsMigrator $migrator): int
    {
        if (! $migrator->legacySchemaExists()) {
            $this->info('Legacy colorway schema not found — nothing to migrate.');

            return self::SUCCESS;
        }

        $migrator->migrate();
        $this->info('Catalog migrated to product options successfully.');

        return self::SUCCESS;
    }
}
