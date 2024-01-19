<?php namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddSessionHistory extends Migration {
    public function up() {
        $this->forge->addField([
            'id' => [
                'type'       => 'VARCHAR',
                'constraint' => 32,
                'null'       => false,
                'unique'     => true
            ],
            'session_id' => [
                'type'       => 'VARCHAR',
                'constraint' => 32,
                'null'       => false,
            ],
            'lat' => [
                'type' => 'DECIMAL(16,12)',
                'null' => false,
            ],
            'lng' => [
                'type' => 'DECIMAL(16,12)',
                'null' => false,
            ],
            'created_at DATETIME default current_timestamp',
            'updated_at DATETIME default current_timestamp',
            'deleted_at' => [
                'type' => 'DATETIME',
                'null' => true
            ]
        ]);

        $this->forge->addPrimaryKey('id');
        $this->forge->addForeignKey('session_id', 'sessions', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('sessions_history');
    }

    public function down() {
        $this->forge->dropTable('sessions_history');
    }
}
