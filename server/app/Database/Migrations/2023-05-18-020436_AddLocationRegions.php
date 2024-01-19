<?php namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddLocationRegions extends Migration {
    public function up() {
        $this->forge->addField([
            'id' => [
                'type'           => 'INT',
                'constraint'     => 11,
                'null'           => false,
                'unique'         => true,
                'auto_increment' => true
            ],
            'country_id'     => [
                'type'       => 'SMALLINT',
                'constraint' => 5,
                'null'       => false
            ],
            'title_en'       => [
                'type'       => 'VARCHAR',
                'constraint' => 100,
                'null'       => false
            ],
            'title_ru'       => [
                'type'       => 'VARCHAR',
                'constraint' => 100,
                'null'       => false
            ],
            'created_at DATETIME default current_timestamp',
            'updated_at DATETIME default current_timestamp',
            'deleted_at' => [
                'type' => 'DATETIME',
                'null' => true
            ]
        ]);

        $this->forge->addPrimaryKey('id');
        $this->forge->addForeignKey('country_id', 'location_countries', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('location_regions');
    }

    public function down() {
        $this->forge->dropTable('location_regions');
    }
}
