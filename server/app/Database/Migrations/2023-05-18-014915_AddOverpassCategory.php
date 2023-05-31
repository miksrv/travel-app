<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddOverpassCategory extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'category' => [
                'type'       => 'VARCHAR',
                'constraint' => 50,
                'null'       => false
            ],
            'map_subcategory' => [
                'type'       => 'VARCHAR',
                'constraint' => 50,
                'null'       => true
            ],
            'name' => [
                'type'       => 'VARCHAR',
                'constraint' => 50,
                'unique'     => true,
                'null'       => false
            ],
            'title' => [
                'type'       => 'VARCHAR',
                'constraint' => 50,
                'null'       => false
            ],
        ]);
        $this->forge->addPrimaryKey('name');
        $this->forge->addForeignKey('category', 'category', 'name', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('map_subcategory', 'subcategory', 'name', 'CASCADE', 'CASCADE');
        $this->forge->createTable('overpass_category');
    }

    public function down()
    {
        $this->forge->dropTable('overpass_category');
    }
}
