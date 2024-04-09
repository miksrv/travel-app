<?php namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use Config\Services;

define('MAX_PLACES_PER_ITERATION', 50);

set_time_limit(0);

function searchImage($directory) {
    // Открываем директорию для чтения
    $dirHandle = opendir($directory);

    // Проходим по содержимому директории
    while (($file = readdir($dirHandle)) !== false) {
        // Пропускаем специальные директории . и ..
        if ($file == "." || $file == "..") {
            continue;
        }

        // Формируем полный путь к файлу
        $filePath = $directory . "/" . $file;

        // Если это директория, рекурсивно вызываем функцию для поиска в ней
        if (is_dir($filePath)) {
            searchImage($filePath);
        }

        // Проверяем, соответствует ли файл имени изображения
        if (is_file($filePath) && pathinfo($filePath, PATHINFO_FILENAME) == 'cover') {
            // Если найдено изображение с указанным именем, возвращаем путь к нему
            list($width, $height) = getimagesize($filePath);

            if ($width > PLACE_COVER_WIDTH && $height > PLACE_COVER_HEIGHT) {
                $image = Services::image('gd'); // imagick
                $image->withFile($filePath)
                    ->fit(PLACE_COVER_WIDTH, PLACE_COVER_HEIGHT)
                    ->save($filePath);

                echo $filePath;
            }
        }
    }

    // Закрываем дескриптор директории
    closedir($dirHandle);

    // Если изображение с указанным именем не найдено, возвращаем false
    return false;
}

class Migrate extends ResourceController {

    public function fixedCoverSizes(): void {
        searchImage(UPLOAD_PHOTOS);
    }
}