<?php namespace App\Libraries;

use Config\Services;

class LocaleLibrary {
   public string $locale = 'ru';

    public function __construct() {
        $request = Services::request();

        $this->locale = $request->header('Locale')->getValue() ?? 'ru';
    }
}