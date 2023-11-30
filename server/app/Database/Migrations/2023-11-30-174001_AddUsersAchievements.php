<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddUserAchievements extends Migration {
    public function up() {
        $this->forge->addField([
            'id' => [
                'type'       => 'VARCHAR',
                'constraint' => 15,
                'null'       => false,
                'unique'     => true
            ],
            'user_id' => [
                'type'       => 'VARCHAR',
                'constraint' => 15,
                'null'       => false,
            ],
            'achievements_id' => [
                'type'       => 'SMALLINT',
                'constraint' => 5,
                'null'       => false,
            ],
        ]);

        $this->forge->addPrimaryKey('id');
        $this->forge->addForeignKey('user_id', 'users', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('achievements_id', 'achievements', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('user_achievements');
    }

    public function down() {
        $this->forge->dropTable('user_achievements');
    }
}
