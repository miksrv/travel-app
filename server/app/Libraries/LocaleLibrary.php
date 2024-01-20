<?php namespace App\Libraries;

use Config\Services;

class LocaleLibrary {
   public string $locale = 'ru';

    public function __construct() {
        $request = Services::request();
        $header  = $request->header('Locale');

        if (isset($header)) {
            $this->locale = $header->getValue();
        }
    }
}