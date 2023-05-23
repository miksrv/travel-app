<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddSessionHistory extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => [
                'type'       => 'VARCHAR',
                'constraint' => 32,
                'null'       => false,
                'unique'     => true
            ],
            'session' => [
                'type'       => 'VARCHAR',
                'constraint' => 32,
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
        ]);
        $this->forge->addPrimaryKey('id');
        $this->forge->addForeignKey('session', 'sessions', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('sessions_history');
    }

    public function down()
    {
        $this->forge->dropTable('sessions_history');
    }
}
