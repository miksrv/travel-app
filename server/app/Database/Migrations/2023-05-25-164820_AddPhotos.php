<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddPhotos extends Migration {
    public function up()
    {
        $this->forge->addField([
            'id' => [
                'type'       => 'VARCHAR',
                'constraint' => 15,
                'null'       => false,
                'unique'     => true
            ],
            'place_id' => [
                'type'       => 'VARCHAR',
                'constraint' => 15,
                'null'       => true,
            ],
            'user_id' => [
                'type'       => 'VARCHAR',
                'constraint' => 15,
                'null'       => true,
            ],
            'lat' => [
                'type' => 'DECIMAL(10,6)',
                'null' => false,
            ],
            'lon' => [
                'type' => 'DECIMAL(10,6)',
                'null' => false,
            ],
            'title_en' => [
                'type'       => 'VARCHAR',
                'constraint' => 200,
                'null'       => true
            ],
            'title_ru' => [
                'type'       => 'VARCHAR',
                'constraint' => 200,
                'null'       => true
            ],
            'filename' => [
                'type'       => 'VARCHAR',
                'constraint' => 200,
                'null'       => false,
            ],
            'extension' => [
                'type'       => 'VARCHAR',
                'constraint' => 200,
                'null'       => false,
            ],
            'filesize' => [
                'type'       => 'INT',
                'constraint' => 11,
                'null'       => false,
            ],
            'width' => [
                'type'       => 'SMALLINT',
                'constraint' => 5,
                'null'       => false,
            ],
            'height' => [
                'type'       => 'SMALLINT',
                'constraint' => 5,
                'null'       => false,
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
        $this->forge->addForeignKey('place_id', 'places', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('photos');
    }

    public function down()
    {
        $this->forge->dropTable('photos');
    }
}
