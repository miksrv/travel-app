<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class LocationCountries extends Migration {
    public function up()
    {
        $this->forge->addField([
            'id' => [
                'type'           => 'SMALLINT',
                'constraint'     => 5,
                'null'           => false,
                'unique'         => true,
                'auto_increment' => true
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
            'created_at DATETIME default current_timestamp',
            'updated_at DATETIME default current_timestamp',
            'deleted_at' => [
                'type' => 'DATETIME',
                'null' => true
            ]
        ]);

        $this->forge->addPrimaryKey('id');
        $this->forge->createTable('location_countries');
    }

    public function down()
    {
        $this->forge->dropTable('location_countries');
    }
}
