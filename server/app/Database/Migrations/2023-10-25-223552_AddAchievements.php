<?php namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddAchievements extends Migration {
    public function up() {
        $this->forge->addField([
            'id' => [
                'type'           => 'SMALLINT',
                'constraint'     => 5,
                'null'           => false,
                'unique'         => true,
                'auto_increment' => true
            ],
            'title_en' => [
                'type'       => 'VARCHAR',
                'constraint' => 200,
                'null'       => true,
            ],
            'title_ru' => [
                'type'       => 'VARCHAR',
                'constraint' => 200,
                'null'       => true,
            ],
            'content_en' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
                'null'       => true,
            ],
            'content_ru' => [
                'type'       => 'VARCHAR',
                'constraint' => 255,
                'null'       => true,
            ],
            'category_id' => [
                'type'       => 'VARCHAR',
                'constraint' => 50,
                'null'       => true,
            ],
            'min_count_places' => [
                'type'       => 'SMALLINT',
                'constraint' => 5,
                'null'       => true
            ],
            'min_count_edits' => [
                'type'       => 'SMALLINT',
                'constraint' => 5,
                'null'       => true
            ],
            'min_count_photos' => [
                'type'       => 'SMALLINT',
                'constraint' => 5,
                'null'       => true
            ],
            'min_count_likes' => [
                'type'       => 'SMALLINT',
                'constraint' => 5,
                'null'       => true
            ],
            'min_count_reputation' => [
                'type'       => 'SMALLINT',
                'constraint' => 5,
                'null'       => true
            ],
        ]);

        $this->forge->addPrimaryKey('id');
        $this->forge->addForeignKey('category_id', 'category', 'name', 'CASCADE', 'CASCADE');
        $this->forge->createTable('achievements');
    }

    public function down() {
        $this->forge->dropTable('achievements');
    }
}
