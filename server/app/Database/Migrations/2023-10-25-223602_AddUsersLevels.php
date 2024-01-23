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
            'title_en' => [
                'type'       => 'VARCHAR',
                'constraint' => 200,
                'null'       => true,
            ],
            'title_ru' => [
                'type'       => 'VARCHAR',
                'constraint' => 200,
                'null'       => true,
            ],
            'experience' => [
                'type'       => 'SMALLINT',
                'constraint' => 5,
                'null'       => true
            ],
        ]);

        $this->forge->addPrimaryKey('level');
        $this->forge->createTable('users_levels');
    }

    public function down() {
        $this->forge->dropTable('users_levels');
    }
}
