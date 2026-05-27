<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class DropUsersLevels extends Migration {
    public function up(): void {
        $this->forge->dropTable('users_levels', true);
    }

    public function down(): void {
        // Intentionally empty — this table is replaced by Config/Levels.php
    }
}
