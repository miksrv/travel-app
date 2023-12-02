<?php namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class ManageSeeder extends Seeder
{
    public function run()
    {
        $this->call('CategorySeeder');
        $this->call('OverpassCategorySeeder');
        $this->call('UserLevelsSeeder');
    }
}