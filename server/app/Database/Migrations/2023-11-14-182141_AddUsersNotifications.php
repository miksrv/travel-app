<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddUsersNotifications extends Migration {
    public function up() {
        $this->forge->addField([
            'id' => [
                'type'       => 'VARCHAR',
                'constraint' => 15,
                'null'       => false,
                'unique'     => true
            ],
            'type' => [
                'type' => 'ENUM("photo", "place", "rating", "edit", "cover", "experience", "level", "achievements")',
                'null' => false,
            ],
            'read' => [
                'type'    => 'BOOLEAN',
                'default' => false,
            ],
            'user_id' => [
                'type'       => 'VARCHAR',
                'constraint' => 15,
                'null'       => true
            ],
            'activity_id' => [
                'type'       => 'VARCHAR',
                'constraint' => 15,
                'null'       => true
            ],
            'created_at DATETIME default current_timestamp',
        ]);

        $this->forge->addPrimaryKey('id');
        $this->forge->addForeignKey('user_id', 'users', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('activity_id', 'activity', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('users_notifications');
    }

    public function down() {
        $this->forge->dropTable('users_notifications');
    }
}
