<?php namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddSubCategory extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => [
                'type'       => 'TINYINT',
                'constraint' => 2,
                'null'       => false,
                'unique'     => true
            ],
            'category' => [
                'type'       => 'TINYINT',
                'constraint' => 2,
                'null'       => false,
            ],
            'name' => [
                'type'       => 'VARCHAR',
                'constraint' => 50,
                'null'       => false,
                'unique'     => true
            ],
            'title' => [
                'type'       => 'VARCHAR',
                'constraint' => 50,
                'null'       => false,
            ],
            'info' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
                'null'       => true,
            ],
        ]);
        $this->forge->addPrimaryKey('id');
        $this->forge->addForeignKey('category', 'category', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('subcategory');
    }

    public function down()
    {
        $this->forge->dropTable('subcategory');
    }
}
