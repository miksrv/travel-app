<?php namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddSendingMail extends Migration {
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
            'activity_id' => [
                'type'       => 'VARCHAR',
                'constraint' => 15,
                'null'       => true
            ],
            'status' => [
                'type'    => 'ENUM("created", "process", "completed", "error", "rejected")',
                'null'    => false,
                'default' => 'created'
            ],
            'email' => [
                'type' => 'TEXT',
                'null' => true
            ],
            'subject' => [
                'type'       => 'VARCHAR',
                'constraint' => 15,
                'null'       => true
            ],
            'message' => [
                'type' => 'TEXT',
                'null' => true
            ],
            'sent_email' => [
                'type' => 'TEXT',
                'null' => true
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
        $this->forge->addForeignKey('activity_id', 'activity', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('sending_mail');
    }

    public function down() {
        $this->forge->dropTable('sending_mail');
    }
}
