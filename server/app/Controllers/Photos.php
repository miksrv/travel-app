<?php namespace App\Controllers;

use CodeIgniter\Files\File;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;
use Config\Services;

class Photos extends ResourceController
{
    public function upload(): ResponseInterface
    {
        $rules = [
            'image' => 'uploaded[image]|is_image[image]|mime_in[image,image/jpg,image/jpeg,image/gif,image/png,image/webp,image/heic]'
        ];

        if (!$this->validate($rules)) {
            return $this->failValidationErrors($this->validator->getErrors());
        }

        $img = $this->request->getFile('image');

        if (!$img->hasMoved()) {

            if (!is_dir(UPLOAD_TEMP)) {
                mkdir(UPLOAD_TEMP,0777, TRUE);
            }

            $newName = $img->getRandomName();
            $img->move(UPLOAD_TEMP, $newName);

            $file = new File(UPLOAD_TEMP . $newName);
            $name = pathinfo($file, PATHINFO_FILENAME);

            $image = Services::image('gd'); // imagick
            $image->withFile($file->getRealPath())
                ->fit(700, 500, 'center')
                ->save(UPLOAD_TEMP . $name . '_thumb.' . $file->getExtension());

            $coordinates = $this->_readPhotoLocation($file->getRealPath());

            return $this->respondCreated([
                'name'      => $name,
                'extension' => $file->getExtension(),
                'filesize'  => $file->getSize(),
                'latitude'  => $coordinates->lat,
                'longitude' => $coordinates->lng,
            ]);
        }

        return $this->failServerError();
    }

    /**
     * Returns an array of latitude and longitude from the Image file
     * @param image $file
     * @return float[]:number |boolean
     */
    protected function _readPhotoLocation(string $file): ?object {
        if (!is_file($file)) {
            return false;
        }

            $info = exif_read_data($file);

        if (!isset($info['GPSLatitude']) || !isset($info['GPSLongitude']) ||
            !isset($info['GPSLatitudeRef']) || !isset($info['GPSLongitudeRef']) ||
            !in_array($info['GPSLatitudeRef'], array('E','W','N','S')) || !in_array($info['GPSLongitudeRef'], array('E','W','N','S'))) {

            return false;
        }

        $GPSLatitudeRef  = strtolower(trim($info['GPSLatitudeRef']));
        $GPSLongitudeRef = strtolower(trim($info['GPSLongitudeRef']));

        $lat_degrees_a = explode('/',$info['GPSLatitude'][0]);
        $lat_minutes_a = explode('/',$info['GPSLatitude'][1]);
        $lat_seconds_a = explode('/',$info['GPSLatitude'][2]);
        $lng_degrees_a = explode('/',$info['GPSLongitude'][0]);
        $lng_minutes_a = explode('/',$info['GPSLongitude'][1]);
        $lng_seconds_a = explode('/',$info['GPSLongitude'][2]);

        $lat_degrees = $lat_degrees_a[0] / $lat_degrees_a[1];
        $lat_minutes = $lat_minutes_a[0] / $lat_minutes_a[1];
        $lat_seconds = $lat_seconds_a[0] / $lat_seconds_a[1];
        $lng_degrees = $lng_degrees_a[0] / $lng_degrees_a[1];
        $lng_minutes = $lng_minutes_a[0] / $lng_minutes_a[1];
        $lng_seconds = $lng_seconds_a[0] / $lng_seconds_a[1];

        $lat = (float) $lat_degrees+((($lat_minutes*60)+($lat_seconds))/3600);
        $lng = (float) $lng_degrees+((($lng_minutes*60)+($lng_seconds))/3600);

        //If the latitude is South, make it negative.
        //If the longitude is west, make it negative
        $GPSLatitudeRef  == 's' ? $lat *= -1 : '';
        $GPSLongitudeRef == 'w' ? $lng *= -1 : '';

        return (object) [
            'lat' => round($lat, 7),
            'lng' => round($lng, 7)
        ];
    }
}