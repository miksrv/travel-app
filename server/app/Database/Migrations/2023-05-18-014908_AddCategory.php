<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddCategory extends Migration{
    public function up()
    {
        $this->forge->addField([
            'name'           => [
                'type'       => 'VARCHAR',
                'constraint' => 50,
                'null'       => false,
                'unique'     => true
            ],
            'title_en'       => [
                'type'       => 'VARCHAR',
                'constraint' => 50,
                'null'       => false
            ],
            'title_ru'       => [
                'type'       => 'VARCHAR',
                'constraint' => 50,
                'null'       => false
            ],
            'content_en'     => [
                'type'       => 'VARCHAR',
                'constraint' => 300,
                'null'       => true
            ],
            'content_ru'     => [
                'type'       => 'VARCHAR',
                'constraint' => 300,
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
