<?php

/**
 * Backfill missing activity records for existing rating rows.
 *
 * Run from CLI:
 *   php spark system:backfill-rating-activity
 *
 * Dry-run (preview only, no writes):
 *   php spark system:backfill-rating-activity --dry-run
 */

namespace App\Commands;

use CodeIgniter\CLI\BaseCommand;
use CodeIgniter\CLI\CLI;

class BackfillRatingActivity extends BaseCommand
{
    protected $group       = 'system';
    protected $name        = 'system:backfill-rating-activity';
    protected $description = 'Create missing activity records for rating rows that have no corresponding activity entry';

    public function run(array $params): void
    {
        $isDryRun = in_array('--dry-run', $params, true);

        if ($isDryRun) {
            CLI::write('[DRY RUN] No records will be written.', 'yellow');
        }

        $db = db_connect();

        // Fetch all rating rows that have no matching activity record (LEFT JOIN approach)
        $ratings = $db->table('rating r')
            ->select('r.id, r.place_id, r.user_id, r.session_id, r.created_at, r.updated_at')
            ->join('activity a', "a.rating_id = r.id AND a.type = 'rating' AND a.deleted_at IS NULL", 'left')
            ->where('a.id IS NULL')
            ->where('r.deleted_at IS NULL')
            ->get()
            ->getResultObject();

        $total = count($ratings);

        if ($total === 0) {
            CLI::write('Nothing to backfill — all rating rows already have activity records.', 'green');
            return;
        }

        CLI::write("Found {$total} rating row(s) without an activity record.", 'yellow');

        $inserted = 0;

        foreach ($ratings as $rating) {
            $id = substr(bin2hex(random_bytes(7)), 0, 13);

            CLI::write("  rating {$rating->id} → activity {$id} (place {$rating->place_id}, {$rating->created_at})");

            if ($isDryRun) {
                continue;
            }

            $db->table('activity')->insert([
                'id'         => $id,
                'type'       => 'rating',
                'views'      => 0,
                'user_id'    => $rating->user_id,
                'session_id' => $rating->session_id,
                'place_id'   => $rating->place_id,
                'rating_id'  => $rating->id,
                'created_at' => $rating->created_at,
                'updated_at' => $rating->updated_at,
            ]);

            $inserted++;
        }

        if ($isDryRun) {
            CLI::write("[DRY RUN] Would have inserted {$total} record(s).", 'yellow');
        } else {
            CLI::write("Done. Inserted {$inserted} activity record(s).", 'green');
        }
    }
}
