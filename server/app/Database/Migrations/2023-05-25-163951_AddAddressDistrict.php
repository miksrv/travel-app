<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddAddressDistrict extends Migration {
    public function up() {
        $this->forge->addField([
            'id' => [
                'type'           => 'INT',
                'constraint'     => 11,
                'null'           => false,
                'unique'         => true,
                'auto_increment' => true
            ],
            'country' => [
                'type'       => 'SMALLINT',
                'constraint' => 5,
                'null'       => false
            ],
            'region' => [
                'type'       => 'INT',
                'constraint' => 11,
                'null'       => true
            ],
            'name' => [
                'type'       => 'VARCHAR',
                'constraint' => 100,
                'null'       => false
            ],
        ]);

        $this->forge->addPrimaryKey('id');
        $this->forge->addForeignKey('country', 'address_country', 'id', 'CASCADE', 'CASCADE');
        $this->forge->addForeignKey('region', 'address_region', 'id', 'CASCADE', 'CASCADE');
        $this->forge->createTable('address_district');
    }

    public function down() {
        $this->forge->dropTable('address_district');
    }
}
