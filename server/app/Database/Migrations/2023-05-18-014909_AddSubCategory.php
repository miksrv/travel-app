<?php namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddSubCategory extends Migration {
    public function up() {
        $this->forge->addField([
            'category' => [
                'type'       => 'VARCHAR',
                'constraint' => 50,
                'null'       => false
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
            'info' => [
                'type'       => 'VARCHAR',
                'constraint' => 300,
                'null'       => true
            ],
        ]);

        $this->forge->addPrimaryKey('name');
        $this->forge->addForeignKey('category', 'category', 'name', 'CASCADE', 'CASCADE');
        $this->forge->createTable('subcategory');
    }

    public function down() {
        $this->forge->dropTable('subcategory');
    }
}
