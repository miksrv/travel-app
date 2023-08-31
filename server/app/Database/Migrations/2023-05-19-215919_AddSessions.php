<?php namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddSessions extends Migration {
    public function up() {
        $this->forge->addField([
            'id' => [
                'type'       => 'VARCHAR',
                'constraint' => 32,
                'null'       => false,
                'unique'     => true
            ],
            'ip' => [
                'type'       => 'VARCHAR',
                'constraint' => 300,
                'null'       => false,
            ],
            'user' => [
                'type'       => 'VARCHAR',
                'constraint' => 15,
                'null'       => true,
            ],
            'user_agent' => [
                'type'       => 'VARCHAR',
                'constraint' => 300,
                'null'       => false,
            ],
            'latitude' => [
                'type'       => 'DECIMAL(16,12)',
                'null'       => false,
            ],
            'longitude' => [
                'type'       => 'DECIMAL(16,12)',
                'null'       => false,
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
        $this->forge->createTable('sessions');
    }

    public function down() {
        $this->forge->dropTable('sessions');
    }
}
