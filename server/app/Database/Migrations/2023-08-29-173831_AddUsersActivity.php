<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddUsersActivity extends Migration {
    public function up() {
        $this->forge->addField([
            'id' => [
                'type'       => 'VARCHAR',
                'constraint' => 15,
                'null'       => false,
                'unique'     => true
            ],
            'user' => [
                'type'       => 'VARCHAR',
                'constraint' => 15,
                'null'       => false,
            ],
            'type' => [
                'type'       => 'ENUM("photo", "place", "rating")',
                'null'       => false,
            ],
            'photo' => [
                'type'       => 'VARCHAR',
                'constraint' => 15,
                'null'       => true,
            ],
            'place' => [
                'type'       => 'VARCHAR',
                'constraint' => 15,
                'null'       => true,
            ],
            'rating' => [
                'type'       => 'VARCHAR',
                'constraint' => 15,
                'null'       => true,
            ],
            'created_at DATETIME default current_timestamp',
            'updated_at DATETIME default current_timestamp',
            'deleted_at' => [
                'type' => 'DATETIME',
                'null' => true
            ]
        ]);

        $this->forge->addPrimaryKey('id');
        $this->forge->addForeignKey('user', 'users', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('photo', 'photos', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('place', 'places', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('rating', 'rating', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('users_activity');
    }

    public function down() {
        $this->forge->dropTable('users_activity');
    }
}
