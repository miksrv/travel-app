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
            'category' => [
                'type'       => 'VARCHAR',
                'constraint' => 50,
                'null'       => true
            ],
            'lat' => [
                'type' => 'DECIMAL(16,12)',
                'null' => false
            ],
            'lng' => [
                'type' => 'DECIMAL(16,12)',
                'null' => false
            ],
            'rating' => [
                'type' => 'DECIMAL(2,1)',
                'null' => true
            ],
            'views' => [
                'type'       => 'MEDIUMINT',
                'constraint' => 10,
                'null'       => false,
                'default'    => 0
            ],
            'address_en' => [
                'type'       => 'VARCHAR',
                'constraint' => 250,
                'null'       => true
            ],
            'address_ru' => [
                'type'       => 'VARCHAR',
                'constraint' => 250,
                'null'       => true
            ],
            'country_id' => [
                'type'       => 'SMALLINT',
                'constraint' => 5,
                'null'       => true
            ],
            'region_id' => [
                'type'       => 'INT',
                'constraint' => 11,
                'null'       => true
            ],
            'district_id' => [
                'type'       => 'INT',
                'constraint' => 11,
                'null'       => true
            ],
            'city_id' => [
                'type'       => 'INT',
                'constraint' => 11,
                'null'       => true
            ],
            'user_id' => [
                'type'       => 'VARCHAR',
                'constraint' => 15,
                'null'       => true
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
        $this->forge->addForeignKey('category', 'category', 'name', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('country_id', 'location_countries', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('region_id', 'location_regions', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('district_id', 'location_districts', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('city_id', 'location_cities', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('places');
    }

    public function down() {
        $this->forge->dropTable('places');
    }
}
