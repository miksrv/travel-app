<?php namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddCategory extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'name' => [
                'type'       => 'VARCHAR',
                'constraint' => 50,
                'null'       => false,
                'unique'     => true
            ],
            'title' => [
                'type'       => 'VARCHAR',
                'constraint' => 50,
                'null'       => false
            ],
            'info' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
                'null'       => true
            ],
        ]);
        $this->forge->addPrimaryKey('name');
        $this->forge->createTable('category');
    }

    public function down()
    {
        $this->forge->dropTable('category');
    }
}
