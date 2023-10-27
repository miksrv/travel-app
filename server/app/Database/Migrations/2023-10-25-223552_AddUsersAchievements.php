<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddUsersAchievements extends Migration {
    public function up() {
        $this->forge->addField([
            'id' => [
                'type'           => 'INT',
                'constraint'     => 11,
                'null'           => false,
                'unique'         => true,
                'auto_increment' => true
            ],
            'name' => [
                'type'       => 'VARCHAR',
                'constraint' => 200,
                'null'       => true,
            ],
            'text' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
                'null'       => true,
            ],
            'min_count_places' => [
                'type'       => 'SMALLINT',
                'constraint' => 5,
                'null'       => true
            ],
            'min_count_edits' => [
                'type'       => 'SMALLINT',
                'constraint' => 5,
                'null'       => true
            ],
            'min_count_photos' => [
                'type'       => 'SMALLINT',
                'constraint' => 5,
                'null'       => true
            ],
            'min_count_likes' => [
                'type'       => 'SMALLINT',
                'constraint' => 5,
                'null'       => true
            ],
            'min_count_reputation' => [
                'type'       => 'SMALLINT',
                'constraint' => 5,
                'null'       => true
            ],
        ]);

        $this->forge->addPrimaryKey('id');
        $this->forge->createTable('users_achievements');
    }

    public function down() {
        $this->forge->dropTable('users_achievements');
    }
}
