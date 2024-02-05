<?php namespace App\Database\Migrations;

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
            'type' => [
                'type' => 'ENUM("photo", "place", "rating", "edit", "cover")',
                'null' => false,
            ],
            'user_id' => [
                'type'       => 'VARCHAR',
                'constraint' => 15,
                'null'       => true,
            ],
            'photo_id' => [
                'type'       => 'VARCHAR',
                'constraint' => 15,
                'null'       => true,
            ],
            'place_id' => [
                'type'       => 'VARCHAR',
                'constraint' => 15,
                'null'       => true,
            ],
            'rating_id' => [
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
        $this->forge->addForeignKey('user_id', 'users', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('photo_id', 'photos', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('place_id', 'places', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('rating_id', 'rating', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('users_activity');
    }

    public function down() {
        $this->forge->dropTable('users_activity');
    }
}
