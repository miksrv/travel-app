<?php namespace App\Controllers;

use App\Entities\Photo;
use App\Entities\UserActivity;
use App\Libraries\Session;
use App\Models\PhotosModel;
use App\Models\PlacesModel;
use App\Models\UsersActivityModel;
use CodeIgniter\Files\File;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;
use Config\Services;

class Photos extends ResourceController {
    /**
     * @return ResponseInterface
     */
    public function list(): ResponseInterface {
        $limit  = $this->request->getGet('limit', FILTER_SANITIZE_NUMBER_INT) ?? 40;
        $offset = $this->request->getGet('offset', FILTER_SANITIZE_NUMBER_INT) ?? 0;

        $photosData = $this->_makeListFilters()->orderBy('photos.created_at')->findAll($limit, $offset);

        if (empty($photosData)) {
            return $this->respond([
                'items' => $photosData,
                'count' => 0
            ]);
        }

        $result = [];

        foreach ($photosData as $photo) {
            $result[] = (object) [
                'filename'  => $photo->filename,
                'extension' => $photo->extension,
                // 'filesize'  => $photo->filesize,
                'order'     => $photo->order,
                'width'     => $photo->width,
                'height'    => $photo->height,
                'title'     => $photo->title,
                'placeId'   => $photo->place,
                'created'   => $photo->created_at,
                'author'    => $photo->user_id ? [
                    'id'     => $photo->user_id,
                    'name'   => $photo->user_name,
                    'avatar' => $photo->user_avatar,
                ] : null
            ];
        }

        return $this->respond([
            'items' => $result,
            'count' => $this->_makeListFilters()->countAllResults()
        ]);
    }

    /**
     * @return ResponseInterface
     */
    public function upload($id = null): ResponseInterface {
        $session = new Session();
        $rules   = [
            'image' => 'uploaded[image]|is_image[image]|mime_in[image,image/jpg,image/jpeg,image/gif,image/png,image/webp,image/heic]'
        ];

        if (!$session->isAuth) {
            return $this->failUnauthorized();
        }

        if (!$this->validate($rules)) {
            return $this->failValidationErrors($this->validator->getErrors());
        }

        $placesModel = new PlacesModel();
        $placesData  = $placesModel->select('id, latitude, longitude')->find($id);

        if (!$placesData || !$placesData->id) {
            return $this->failValidationErrors('There is no point with this ID');
        }

        $img = $this->request->getFile('image');

        if (!$img->hasMoved()) {

//            if (!is_dir(UPLOAD_TEMP)) {
//                mkdir(UPLOAD_TEMP,0777, TRUE);
//            }

            $photoDir = UPLOAD_PHOTOS . '/' . $placesData->id . '/';
            $newName  = $img->getRandomName();
            $img->move($photoDir, $newName);

            $file = new File($photoDir . $newName);
            $name = pathinfo($file, PATHINFO_FILENAME);

            $image = Services::image('gd'); // imagick
            $image->withFile($file->getRealPath())
                ->fit(700, 500, 'center')
                ->save($photoDir . $name . '_thumb.' . $file->getExtension());

            $coordinates = $this->_readPhotoLocation($file->getRealPath());
            $photosModel = new PhotosModel();

            list($width, $height) = getimagesize($file->getRealPath());

            // Save photo to DB
            $photo = new Photo();
            $photo->latitude  = $coordinates->lat ?? $placesData->latitude;
            $photo->longitude = $coordinates->lng ?? $placesData->longitude;
            $photo->place     = $placesData->id;
            $photo->author    = $session->userData->id;
            $photo->filename  = $name;
            $photo->extension = $file->getExtension();
            $photo->filesize  = $file->getSize();
            $photo->width     = $width;
            $photo->height    = $height;

            $photosModel->insert($photo);

            // Make user activity
            $activityModel = new UsersActivityModel();
            $activity      = new UserActivity();
            $activity->user  = $session->userData->id;
            $activity->type  = 'photo';
            $activity->place = $placesData->id;
            $activity->photo = $photosModel->getInsertID();
            $activityModel->insert($activity);

            return $this->respondCreated([
                'name'      => $name,
                'extension' => $file->getExtension(),
                'latitude'  => $coordinates->lat,
                'longitude' => $coordinates->lng,
            ]);
        }

        return $this->failServerError();
    }

    /**
     * Returns an array of latitude and longitude from the Image file
     * @param string $file
     * @return object|null :number |boolean
     */
    protected function _readPhotoLocation(string $file): ?object {
        if (!is_file($file)) {
            return null;
        }

            $info = exif_read_data($file);

        if (!isset($info['GPSLatitude']) || !isset($info['GPSLongitude']) ||
            !isset($info['GPSLatitudeRef']) || !isset($info['GPSLongitudeRef']) ||
            !in_array($info['GPSLatitudeRef'], array('E','W','N','S')) || !in_array($info['GPSLongitudeRef'], array('E','W','N','S'))) {

            return null;
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

        // if the latitude is South, make it negative.
        if ($GPSLatitudeRef  == 's') {
            $lat *= -1;
        }

        // if the longitude is west, make it negative
        if ($GPSLongitudeRef == 'w') {
            $lng *= -1;
        }

        return (object) [
            'lat' => round($lat, 7),
            'lng' => round($lng, 7)
        ];
    }

    /**
     * @return PhotosModel
     */
    protected function _makeListFilters(): PhotosModel {
        $author = $this->request->getGet('author', FILTER_SANITIZE_SPECIAL_CHARS);

        $photosModel = new PhotosModel();
        $photosModel
            ->select(
                'photos.place, photos.author, photos.filename, photos.extension, photos.width, 
                    photos.height, photos.order, translations_photos.title, photos.created_at,
                    users.id as user_id, users.name as user_name, users.avatar as user_avatar')
            ->join('users', 'photos.author = users.id', 'left')
            ->join('translations_photos', 'photos.id = translations_photos.photo AND language = "ru"', 'left');

        if ($author) {
            $photosModel->where(['photos.author' => $author]);
        }

        return $photosModel;
    }
}