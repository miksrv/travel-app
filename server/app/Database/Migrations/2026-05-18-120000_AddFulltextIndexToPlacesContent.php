<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddFulltextIndexToPlacesContent extends Migration {
    public function up()
    {
        $this->db->simpleQuery(
            'ALTER TABLE places_content ADD FULLTEXT INDEX ft_title (title)'
        );

        $this->db->simpleQuery(
            'ALTER TABLE places_content ADD FULLTEXT INDEX ft_content (content)'
        );
    }

    public function down()
    {
        $this->db->simpleQuery(
            'ALTER TABLE places_content DROP INDEX ft_title'
        );

        $this->db->simpleQuery(
            'ALTER TABLE places_content DROP INDEX ft_content'
        );
    }
}
