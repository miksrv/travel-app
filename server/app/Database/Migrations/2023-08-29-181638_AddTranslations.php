<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddTranslations extends Migration {
    public function up() {
        $this->forge->addField([
            'id' => [
                'type'       => 'VARCHAR',
                'constraint' => 15,
                'null'       => false,
                'unique'     => true
            ],
            'language' => [
                'type'       => 'ENUM("ru", "en")',
                'default'    => 'ru',
                'null'       => false,
            ],
            'title' => [
                'type'       => 'VARCHAR',
                'constraint' => 200,
                'null'       => true
            ],
            'content' => [
                'type' => 'TEXT',
                'null' => true
            ],
        ]);

        $this->forge->addPrimaryKey('id');
        $this->forge->createTable('translations');
    }

    public function down() {
        $this->forge->dropTable('translations');
    }
}
