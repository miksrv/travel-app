<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddTranslationsPlaces extends Migration {
    public function up() {
        $this->forge->addField([
            'id' => [
                'type'       => 'VARCHAR',
                'constraint' => 15,
                'null'       => false,
                'unique'     => true
            ],
            'place' => [
                'type'       => 'VARCHAR',
                'constraint' => 15,
                'null'       => true,
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
        $this->forge->addForeignKey('place', 'places', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('translations_places');
    }

    public function down() {
        $this->forge->dropTable('translations_places');
    }
}
