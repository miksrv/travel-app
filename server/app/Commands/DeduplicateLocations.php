<?php

/**
 * Run from CLI:
 *   php spark system:deduplicate-locations
 *
 * Dry run (no changes, only preview):
 *   php spark system:deduplicate-locations --dry-run
 */

namespace App\Commands;

use CodeIgniter\CLI\BaseCommand;
use CodeIgniter\CLI\CLI;
use CodeIgniter\Database\BaseConnection;

/**
 * Merges duplicate rows in location tables caused by provider switch (Yandex → Nominatim).
 *
 * Duplicates appear when title_ru matches but title_en differs across providers.
 * For each duplicate group the most recently created record is kept as canonical;
 * all FK references in child tables and in places are rewritten to the canonical ID,
 * then the stale rows are hard-deleted.
 *
 * updated_at columns are never touched — all writes go through DB builder, not models.
 */
class DeduplicateLocations extends BaseCommand
{
    protected $group       = 'system';
    protected $name        = 'system:deduplicate-locations';
    protected $description = 'Merge duplicate location rows caused by Yandex→Nominatim provider switch';

    private BaseConnection $db;
    private bool $dryRun = false;

    /** @var array<string, list<string>> place IDs affected per table */
    private array $affectedPlaces = [];

    private int $totalMerged = 0;

    public function run(array $params): void
    {
        $this->dryRun = array_key_exists('dry-run', $params);
        $this->db     = \Config\Database::connect();

        if ($this->dryRun) {
            CLI::write('[DRY RUN] No changes will be written to the database.', 'yellow');
            CLI::newLine();
        }

        $this->db->transStart();

        $this->deduplicateCountries();
        $this->deduplicateRegions();
        $this->deduplicateDistricts();
        $this->deduplicateLocalities();

        if ($this->dryRun) {
            $this->db->transRollback();
            CLI::newLine();
            CLI::write('[DRY RUN] Transaction rolled back — nothing was saved.', 'yellow');
        } else {
            $this->db->transComplete();

            if ($this->db->transStatus() === false) {
                CLI::write('Transaction FAILED. All changes rolled back.', 'red');
                return;
            }
        }

        CLI::newLine();
        $this->printAffectedPlaces();

        CLI::newLine();
        CLI::write(sprintf(
            'Done. Total duplicate records %s: %d.',
            $this->dryRun ? 'that would be merged' : 'merged',
            $this->totalMerged
        ), 'green');
    }

    // -------------------------------------------------------------------------
    // Per-table deduplication
    // -------------------------------------------------------------------------

    private function deduplicateCountries(): void
    {
        CLI::write('=== location_countries ===', 'cyan');

        $groups = $this->db->query("
            SELECT title_ru, COUNT(*) AS cnt
            FROM location_countries
            WHERE deleted_at IS NULL
              AND title_ru IS NOT NULL
              AND title_ru != ''
            GROUP BY title_ru
            HAVING cnt > 1
        ")->getResultArray();

        if (empty($groups)) {
            CLI::write('  No duplicates found.', 'dark_gray');
            return;
        }

        foreach ($groups as $group) {
            $records = $this->db->table('location_countries')
                ->where('title_ru', $group['title_ru'])
                ->where('deleted_at IS NULL', null, false)
                ->orderBy('created_at', 'DESC')
                ->get()
                ->getResultArray();

            $canonical = $records[0];
            $staleIds  = array_column(array_slice($records, 1), 'id');

            $this->logMerge('location_countries', $canonical, $staleIds);

            foreach ($staleIds as $staleId) {
                // Rewrite FK references
                $this->rewrite('location_regions',    'country_id', $staleId, $canonical['id']);
                $this->rewrite('location_districts',  'country_id', $staleId, $canonical['id']);
                $this->rewrite('location_localities', 'country_id', $staleId, $canonical['id']);
                $this->rewritePlaces('country_id',    $staleId,     $canonical['id']);

                // Remove stale row
                $this->hardDelete('location_countries', $staleId);
            }

            $this->totalMerged += count($staleIds);
        }
    }

    private function deduplicateRegions(): void
    {
        CLI::newLine();
        CLI::write('=== location_regions ===', 'cyan');

        // Group by title_ru within the same country
        $groups = $this->db->query("
            SELECT country_id, title_ru, COUNT(*) AS cnt
            FROM location_regions
            WHERE deleted_at IS NULL
              AND title_ru IS NOT NULL
              AND title_ru != ''
            GROUP BY country_id, title_ru
            HAVING cnt > 1
        ")->getResultArray();

        if (empty($groups)) {
            CLI::write('  No duplicates found.', 'dark_gray');
            return;
        }

        foreach ($groups as $group) {
            $records = $this->db->table('location_regions')
                ->where('country_id', $group['country_id'])
                ->where('title_ru', $group['title_ru'])
                ->where('deleted_at IS NULL', null, false)
                ->orderBy('created_at', 'DESC')
                ->get()
                ->getResultArray();

            $canonical = $records[0];
            $staleIds  = array_column(array_slice($records, 1), 'id');

            $this->logMerge('location_regions', $canonical, $staleIds);

            foreach ($staleIds as $staleId) {
                $this->rewrite('location_districts',  'region_id', $staleId, $canonical['id']);
                $this->rewrite('location_localities', 'region_id', $staleId, $canonical['id']);
                $this->rewritePlaces('region_id',     $staleId,    $canonical['id']);
                $this->hardDelete('location_regions', $staleId);
            }

            $this->totalMerged += count($staleIds);
        }
    }

    private function deduplicateDistricts(): void
    {
        CLI::newLine();
        CLI::write('=== location_districts ===', 'cyan');

        $groups = $this->db->query("
            SELECT country_id, region_id, title_ru, COUNT(*) AS cnt
            FROM location_districts
            WHERE deleted_at IS NULL
              AND title_ru IS NOT NULL
              AND title_ru != ''
            GROUP BY country_id, region_id, title_ru
            HAVING cnt > 1
        ")->getResultArray();

        if (empty($groups)) {
            CLI::write('  No duplicates found.', 'dark_gray');
            return;
        }

        foreach ($groups as $group) {
            $records = $this->db->table('location_districts')
                ->where('country_id', $group['country_id'])
                ->where('region_id',  $group['region_id'])
                ->where('title_ru',   $group['title_ru'])
                ->where('deleted_at IS NULL', null, false)
                ->orderBy('created_at', 'DESC')
                ->get()
                ->getResultArray();

            $canonical = $records[0];
            $staleIds  = array_column(array_slice($records, 1), 'id');

            $this->logMerge('location_districts', $canonical, $staleIds);

            foreach ($staleIds as $staleId) {
                $this->rewrite('location_localities', 'district_id', $staleId, $canonical['id']);
                $this->rewritePlaces('district_id',   $staleId,      $canonical['id']);
                $this->hardDelete('location_districts', $staleId);
            }

            $this->totalMerged += count($staleIds);
        }
    }

    private function deduplicateLocalities(): void
    {
        CLI::newLine();
        CLI::write('=== location_localities ===', 'cyan');

        $groups = $this->db->query("
            SELECT country_id, region_id, district_id, title_ru, COUNT(*) AS cnt
            FROM location_localities
            WHERE deleted_at IS NULL
              AND title_ru IS NOT NULL
              AND title_ru != ''
            GROUP BY country_id, region_id, district_id, title_ru
            HAVING cnt > 1
        ")->getResultArray();

        if (empty($groups)) {
            CLI::write('  No duplicates found.', 'dark_gray');
            return;
        }

        foreach ($groups as $group) {
            $builder = $this->db->table('location_localities')
                ->where('title_ru', $group['title_ru'])
                ->where('deleted_at IS NULL', null, false)
                ->orderBy('created_at', 'DESC');

            // NULL-safe parent ID matching
            $this->whereNullable($builder, 'country_id',  $group['country_id']);
            $this->whereNullable($builder, 'region_id',   $group['region_id']);
            $this->whereNullable($builder, 'district_id', $group['district_id']);

            $records   = $builder->get()->getResultArray();
            $canonical = $records[0];
            $staleIds  = array_column(array_slice($records, 1), 'id');

            $this->logMerge('location_localities', $canonical, $staleIds);

            foreach ($staleIds as $staleId) {
                $this->rewritePlaces('locality_id', $staleId, $canonical['id']);
                $this->hardDelete('location_localities', $staleId);
            }

            $this->totalMerged += count($staleIds);
        }
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    /** Rewrite a FK column in a location table (does not touch updated_at). */
    private function rewrite(string $table, string $column, int $staleId, int $canonicalId): void
    {
        $count = $this->db->table($table)
            ->where($column, $staleId)
            ->where('deleted_at IS NULL', null, false)
            ->countAllResults(false);

        if ($count === 0) {
            return;
        }

        CLI::write(sprintf(
            '    [%s] Rewrite %s: %d → %d (%d row(s))',
            $table, $column, $staleId, $canonicalId, $count
        ), 'light_gray');

        if (!$this->dryRun) {
            $this->db->table($table)
                ->set($column, $canonicalId)
                ->where($column, $staleId)
                ->update();
        }
    }

    /** Rewrite a FK column in places; records the affected place IDs for the summary. */
    private function rewritePlaces(string $column, int $staleId, int $canonicalId): void
    {
        $rows = $this->db->table('places')
            ->select('id')
            ->where($column, $staleId)
            ->where('deleted_at IS NULL', null, false)
            ->get()
            ->getResultArray();

        if (empty($rows)) {
            return;
        }

        $placeIds = array_column($rows, 'id');

        CLI::write(sprintf(
            '    [places] Rewrite %s: %d → %d. Affected places: %s',
            $column, $staleId, $canonicalId, implode(', ', $placeIds)
        ), 'light_gray');

        $key = $column . ':' . $staleId . '→' . $canonicalId;
        $this->affectedPlaces[$key] = array_merge($this->affectedPlaces[$key] ?? [], $placeIds);

        if (!$this->dryRun) {
            $this->db->table('places')
                ->set($column, $canonicalId)
                ->where($column, $staleId)
                ->update();
        }
    }

    /** Hard-delete a single row by primary key (bypasses soft-delete). */
    private function hardDelete(string $table, int $id): void
    {
        CLI::write(sprintf('    [%s] Delete stale row ID=%d', $table, $id), 'light_gray');

        if (!$this->dryRun) {
            $this->db->table($table)->where('id', $id)->delete();
        }
    }

    /**
     * Apply a nullable WHERE condition: IS NULL when value is null,
     * exact match otherwise.
     */
    private function whereNullable(\CodeIgniter\Database\BaseBuilder $builder, string $column, mixed $value): void
    {
        if ($value === null) {
            $builder->where("{$column} IS NULL", null, false);
        } else {
            $builder->where($column, $value);
        }
    }

    /** Print a structured log line for a merge group. */
    private function logMerge(string $table, array $canonical, array $staleIds): void
    {
        CLI::write(sprintf(
            '  Merge into ID=%d (title_ru="%s", title_en="%s", created=%s) ← stale IDs: [%s]',
            $canonical['id'],
            $canonical['title_ru'],
            $canonical['title_en'],
            $canonical['created_at'],
            implode(', ', $staleIds)
        ), 'white');
    }

    /** Print a deduplicated summary of all places that were touched. */
    private function printAffectedPlaces(): void
    {
        if (empty($this->affectedPlaces)) {
            CLI::write('No places were affected.', 'dark_gray');
            return;
        }

        $allIds = [];
        foreach ($this->affectedPlaces as $ids) {
            foreach ($ids as $id) {
                $allIds[$id] = true;
            }
        }

        $uniqueIds = array_keys($allIds);

        CLI::write(sprintf(
            'Places affected (%d unique): %s',
            count($uniqueIds),
            implode(', ', $uniqueIds)
        ), 'yellow');

        CLI::newLine();
        CLI::write('Breakdown by FK column:', 'yellow');
        foreach ($this->affectedPlaces as $key => $ids) {
            CLI::write(sprintf('  %s → [%s]', $key, implode(', ', array_unique($ids))), 'light_gray');
        }
    }
}
