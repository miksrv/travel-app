<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddAddressCountry extends Migration {
    public function up() {
        $this->forge->addField([
            'id' => [
                'type'           => 'SMALLINT',
                'constraint'     => 5,
                'null'           => false,
                'unique'         => true,
                'auto_increment' => true
            ],
            'name' => [
                'type'       => 'VARCHAR',
                'constraint' => 50,
                'null'       => false
            ],
        ]);

        $this->forge->addPrimaryKey('id');
        $this->forge->createTable('address_country');
    }

    public function down() {
        $this->forge->dropTable('address_country');
    }
}
