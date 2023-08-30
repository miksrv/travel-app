<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddPlacesTags extends Migration {
    public function up() {
        $this->forge->addField([
            'id' => [
                'type'       => 'VARCHAR',
                'constraint' => 15,
                'null'       => false,
                'unique'     => true
            ],
            'tag' => [
                'type'       => 'VARCHAR',
                'constraint' => 15,
                'null'       => false,
            ],
            'place' => [
                'type'       => 'VARCHAR',
                'constraint' => 15,
                'null'       => false,
            ],
        ]);

        $this->forge->addPrimaryKey('id');
        $this->forge->addForeignKey('tag', 'tags', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('place', 'places', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('places_tags');
    }

    public function down() {
        $this->forge->dropTable('places_tags');
    }
}
