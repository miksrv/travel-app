<?php namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddPlaces extends Migration
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
            'overpass_id' => [
                'type'       => 'BIGINT',
                'constraint' => 15,
                'null'       => true,
                'unique'     => true
            ],
            'category' => [
                'type'       => 'TINYINT',
                'constraint' => 2,
                'null'       => true
            ],
            'subcategory' => [
                'type'       => 'TINYINT',
                'constraint' => 2,
                'null'       => true
            ],
            'title' => [
                'type'       => 'VARCHAR',
                'constraint' => 200,
                'null'       => false
            ],
            'content' => [
                'type' => 'TEXT',
                'null' => true
            ],
            'address' => [
                'type'       => 'VARCHAR',
                'constraint' => 250,
                'null'       => true
            ],
            'address_country' => [
                'type'       => 'SMALLINT',
                'constraint' => 5,
                'null'       => true
            ],
            'address_province' => [
                'type'       => 'SMALLINT',
                'constraint' => 5,
                'null'       => true
            ],
            'address_area' => [
                'type'       => 'SMALLINT',
                'constraint' => 5,
                'null'       => true
            ],
            'address_city' => [
                'type'       => 'SMALLINT',
                'constraint' => 5,
                'null'       => true
            ],
            'latitude' => [
                'type'       => 'DECIMAL(16,12)',
                'null'       => false
            ],
            'longitude' => [
                'type'       => 'DECIMAL(16,12)',
                'null'       => false
            ],
            'author' => [
                'type'       => 'VARCHAR',
                'constraint' => 40,
                'null'       => true
            ],
            'rating' => [
                'type'       => 'TINYINT',
                'constraint' => 2,
                'null'       => true
            ],
            'views' => [
                'type'       => 'MEDIUMINT',
                'constraint' => 5,
                'null'       => false,
                'default'    => 0
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
        $this->forge->addForeignKey('category', 'category', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('subcategory', 'subcategory', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('places');
    }

    public function down()
    {
        $this->forge->dropTable('places');
    }
}
