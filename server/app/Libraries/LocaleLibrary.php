<?php namespace App\Libraries;

use Config\Services;

class LocaleLibrary {
    public function __construct() {
        $config  = config('App');
        $request = Services::request();
        $header  = $request->header('Locale');
        $locale  = $header ? $header->getValue() : $config->defaultLocale;

        if (in_array($locale, $config->supportedLocales)) {
            $request->setLocale($locale);
        } else {
            $request->setLocale($config->defaultLocale);
        }
    }
}