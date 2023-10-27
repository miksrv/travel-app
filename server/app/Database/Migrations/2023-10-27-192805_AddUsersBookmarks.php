<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddUsersBookmarks extends Migration {
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
                'null'       => true
            ],
            'place' => [
                'type'       => 'VARCHAR',
                'constraint' => 15,
                'null'       => true
            ],
        ]);

        $this->forge->addPrimaryKey('id');
        $this->forge->addForeignKey('user', 'users', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('place', 'places', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('users_bookmarks');
    }

    public function down() {
        $this->forge->dropTable('users_bookmarks');
    }
}
