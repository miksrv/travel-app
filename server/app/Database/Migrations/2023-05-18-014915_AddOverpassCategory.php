<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddOverpassCategory extends Migration {
    public function up() {
        $this->forge->addField([
            'id' => [
                'type'       => 'SMALLINT',
                'constraint' => 5,
                'null'       => false,
                'unique'     => true,
                'auto_increment' => true
            ],
            'category' => [
                'type'       => 'VARCHAR',
                'constraint' => 50,
                'null'       => false
            ],
            'subcategory' => [
                'type'       => 'VARCHAR',
                'constraint' => 50,
                'null'       => true
            ],
            'name' => [
                'type'       => 'VARCHAR',
                'constraint' => 50,
                'null'       => false
            ],
            'title' => [
                'type'       => 'VARCHAR',
                'constraint' => 50,
                'null'       => false
            ],
            'category_map' => [
                'type'       => 'VARCHAR',
                'constraint' => 50,
                'null'       => true
            ],
        ]);

        $this->forge->addPrimaryKey('id');
//        $this->forge->addForeignKey('category', 'category', 'name', 'CASCADE', 'CASCADE');
//        $this->forge->addForeignKey('subcategory', 'subcategory', 'name', 'CASCADE', 'CASCADE');
        $this->forge->createTable('overpass_category');
    }

    public function down()
    {
        $this->forge->dropTable('overpass_category');
    }
}
