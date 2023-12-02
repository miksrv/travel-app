<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddUsersLevels extends Migration {
    public function up() {
        $this->forge->addField([
            'level' => [
                'type'       => 'SMALLINT',
                'constraint' => 2,
                'null'       => false,
                'unique'     => true,
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
            'experience' => [
                'type'       => 'SMALLINT',
                'constraint' => 5,
                'null'       => true
            ],
        ]);

        $this->forge->addPrimaryKey('id');
        $this->forge->createTable('users_levels');
    }

    public function down() {
        $this->forge->dropTable('users_levels');
    }
}
