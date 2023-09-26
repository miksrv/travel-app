<?php namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddPlaces extends Migration {
    public function up() {
        $this->forge->addField([
            'id' => [
                'type'       => 'VARCHAR',
                'constraint' => 15,
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
                'type'       => 'VARCHAR',
                'constraint' => 50,
                'null'       => true
            ],
            'tags' => [
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
            'address_region' => [
                'type'       => 'INT',
                'constraint' => 11,
                'null'       => true
            ],
            'address_district' => [
                'type'       => 'INT',
                'constraint' => 11,
                'null'       => true
            ],
            'address_city' => [
                'type'       => 'INT',
                'constraint' => 11,
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
                'constraint' => 15,
                'null'       => true
            ],
            'rating' => [
                'type'       => 'DECIMAL(2,1)',
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
        $this->forge->addForeignKey('category', 'category', 'name', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('address_country', 'address_country', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('address_region', 'address_region', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('address_district', 'address_district', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('address_city', 'address_city', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('places');
    }

    public function down() {
        $this->forge->dropTable('places');
    }
}
