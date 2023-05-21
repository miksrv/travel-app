<?php namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddPhotos extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => [
                'type'       => 'VARCHAR',
                'constraint' => 40,
                'null'       => false,
                'unique'     => true
            ],
            'title' => [
                'type'       => 'VARCHAR',
                'constraint' => 200,
                'null'       => false,
            ],
            'latitude' => [
                'type'       => 'FLOAT',
                'constraint' => 11,
                'null'       => false,
            ],
            'longitude' => [
                'type'       => 'FLOAT',
                'constraint' => 11,
                'null'       => false,
            ],
            'place' => [
                'type'       => 'VARCHAR',
                'constraint' => 40,
                'null'       => true,
            ],
            'author' => [
                'type'       => 'VARCHAR',
                'constraint' => 40,
                'null'       => true,
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
        $this->forge->addForeignKey('author', 'users', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('place', 'places', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('photos');
    }

    public function down()
    {
        $this->forge->dropTable('photos');
    }
}
