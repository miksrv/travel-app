<?php namespace App\Controllers;

use App\Entities\Photo;
use App\Entities\Place;
use App\Libraries\LocaleLibrary;
use App\Libraries\PlacesContent;
use App\Libraries\SessionLibrary;
use App\Libraries\UserActivity;
use App\Models\PhotosModel;
use App\Models\PlacesModel;
use App\Models\UsersActivityModel;
use CodeIgniter\Files\File;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;
use Config\Services;
use ReflectionException;

/**
 * Available methods:
 *   - actions()
 *   - list()
 *   - upload($id)
 *   - delete($id)
 */
class Photos extends ResourceController {

    protected SessionLibrary $session;

    public function __construct() {
        new LocaleLibrary();

        $this->session = new SessionLibrary();
    }

    /**
     * Getting a list of actions available to the user for a photo by their ID
     * @example /photos?ids=1,2,3,4,5
     * @return ResponseInterface
     */
    public function actions(): ResponseInterface {
        $photos  = $this->request->getGet('ids', FILTER_SANITIZE_SPECIAL_CHARS);
        $IDList  = explode(',', $photos);

        if (empty($IDList)) {
            return $this->failValidationErrors('No photos IDs');
        }

        $resultData  = [];
        $photosModel = new PhotosModel();
        $photosData  = $photosModel->select('id, user_id')->whereIn('id', $IDList)->findAll();

        if (empty($photosData)) {
            return $this->failValidationErrors('Photos with this IDs not exists');
        }

        foreach ($photosData as $photo) {
            $resultData[] = [
                'id'     => $photo->id,
                'remove' => $photo->user_id === $this->session->user?->id
            ];
        }

        return $this->respond(['items' => $resultData]);
    }

    /**
     * Getting a list of all photos
     * GET parameters:
     *   - author (string)
     *   - place (string)
     *   - limit (int)
     *   - offset (int)
     * @return ResponseInterface
     */
    public function list(): ResponseInterface {
        $locale = $this->request->getLocale();
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
            $title = $locale === 'ru' ?
                ($photo->title_ru ?? $photo->title_en) :
                ($photo->title_en ?? $photo->title_ru);

            $photoPath = 'uploads/places/' . $photo->place_id . '/' . $photo->filename;

            $result[] = (object) [
                'id'        => $photo->id,
                'full'      => $photoPath . '.' . $photo->extension,
                'preview'   => $photoPath . '_preview.' . $photo->extension,
                // 'filename'  => $photo->filename,
                // 'extension' => $photo->extension,
                // 'width'     => $photo->width,
                // 'height'    => $photo->height,
                'title'     => $title,
                'placeId'   => $photo->place_id,
                'created'   => $photo->created_at,
                'user'      => $photo->user_id ? [
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
     * Uploading a photo by place ID
     * @param null $id
     * @return ResponseInterface
     * @throws ReflectionException
     */
    public function upload($id = null): ResponseInterface {
        if (!$photo = $this->request->getFile('photo')) {
            return $this->failValidationErrors('No photo for upload');
        }

        if (!$this->session->isAuth) {
            return $this->failUnauthorized();
        }

        $userActivity = new UserActivity();
        $placesModel  = new PlacesModel();
        $placesData   = $placesModel->select('id, lat, lon, photos')->find($id);

        $placeContent = new PlacesContent();
        $placeContent->translate([$id]);

        if (!$placesData || !$placesData->id) {
            return $this->failValidationErrors('There is no point with this ID');
        }

//        if (!$this->validate([
//            'image' => 'uploaded[image]|is_image[image]|mime_in[image,image/jpg,image/jpeg,image/gif,image/png,image/webp,image/heic]'
//        ])) {
//            return $this->failValidationErrors($this->validator->getErrors());
//        }

        if (!$photo->hasMoved()) {
            $photoDir = UPLOAD_PHOTOS . $placesData->id . '/';
            $newName  = $photo->getRandomName();
            $photo->move($photoDir, $newName, true);

            $file = new File($photoDir . $newName);
            $name = pathinfo($file, PATHINFO_FILENAME);
            $ext  = $file->getExtension();

            $image = Services::image('gd'); // imagick
            $image->withFile($file->getRealPath())
                ->fit(700, 500, 'center')
                ->save($photoDir . $name . '_preview.' . $ext);

            // If this first uploaded photo - we automated make place cover image
            if ($placesData->photos === 0) {
                $image->withFile($file->getRealPath())
                    ->fit(PLACE_COVER_WIDTH, PLACE_COVER_HEIGHT, 'center')
                    ->save($photoDir . '/cover.jpg');

                $image->withFile($file->getRealPath())
                    ->fit(PLACE_COVER_PREVIEW_WIDTH, PLACE_COVER_PREVIEW_HEIGHT, 'center')
                    ->save($photoDir . '/cover_preview.jpg');
            }

            $coordinates = $this->_readPhotoLocation($file->getRealPath());
            $photosModel = new PhotosModel();

            list($width, $height) = getimagesize($file->getRealPath());

            // Save photo to DB
            $photo = new Photo();
            $photo->lat = $coordinates->lat ?? $placesData->lat;
            $photo->lon = $coordinates->lon ?? $placesData->lon;
            $photo->place_id  = $placesData->id;
            $photo->user_id   = $this->session->user?->id;
            $photo->title_en  = $placeContent->title($id);
            $photo->title_ru  = $placeContent->title($id);
            $photo->filename  = $name;
            $photo->extension = $ext;
            $photo->filesize  = $file->getSize();
            $photo->width     = $width;
            $photo->height    = $height;
            $photosModel->insert($photo);

            $photoId = $photosModel->getInsertID();

            $userActivity->photo($photoId, $placesData->id);
        } else {
            echo $photo->getErrorString();
            exit();
        }

        // Update the time when the place was last edited
        $place = new Place();
        $place->updated_at = time();
        $place->photos     = $placesData->photos + 1;
        $placesModel->update($id, $place);

        return $this->respondCreated((object) [
            'id'        => $photo->id,
            'full'      => 'uploads/places/' . $placesData->id . $name . '.' . $ext,
            'preview'   => 'uploads/places/' . $placesData->id . $name . '_preview.' . $ext,
            // 'filename'  => $photo->filename,
            // 'extension' => $photo->extension,
            // 'width'     => $photo->width,
            // 'height'    => $photo->height,
            'title'     => $photo->title,
            'placeId'   => $photo->place_id,
            'created'   => $photo->created_at
        ]);
    }

    /**
     * @throws ReflectionException
     */
    public function delete($id = null): ResponseInterface {
        if (!$this->session->isAuth) {
            return $this->failUnauthorized();
        }

        $photosModel = new PhotosModel();
        $photoData   = $photosModel->select('id, user_id, place_id')->find($id);

        if (!$photoData) {
            return $this->failValidationErrors('No photo found with this ID');
        }

        if ($photoData->user_id !== $this->session->user?->id) {
            return $this->failValidationErrors('You can not delete this photo');
        }

        $placesModel = new PlacesModel();
        $placesData  = $placesModel->select('id, photos')->find($photoData->place_id);

        $photosModel->delete($id);

        // If this was last photo of place - we need to remove place cover files
        if ($placesData->photos === 1) {
            unlink(UPLOAD_PHOTOS . $photoData->place_id . '/cover.jpg');
            unlink(UPLOAD_PHOTOS . $photoData->place_id . '/cover_preview.jpg');
        }

        $activityModel = new UsersActivityModel();

        $activityModel->where(['photo_id' => $id, 'user_id' => $this->session->user?->id])->delete();

        // Update the time when the place was last edited
        $place = new Place();
        $place->updated_at = time();
        $place->photos     = $placesData->photos - 1;
        $placesModel->update($id, $place);

        return $this->respondDeleted(['id' => $id]);
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
            'lon' => round($lng, 7)
        ];
    }

    /**
     * @return PhotosModel
     */
    protected function _makeListFilters(): PhotosModel {
        $author = $this->request->getGet('author', FILTER_SANITIZE_SPECIAL_CHARS);
        $place  = $this->request->getGet('place', FILTER_SANITIZE_SPECIAL_CHARS);

        $photosModel = new PhotosModel();
        $photosModel
            ->select(
                'photos.id, photos.place_id, photos.user_id, photos.filename, photos.extension, photos.width, 
                    photos.height, photos.title_ru, photos.title_en, photos.created_at,
                    users.id as user_id, users.name as user_name, users.avatar as user_avatar')
            ->join('users', 'photos.user_id = users.id', 'left');

        if ($place) {
            $photosModel->where(['photos.place_id' => $place]);
        }

        if ($author) {
            $photosModel->where(['photos.user_id' => $author]);
        }

        $photosModel->orderBy('photos.created_at', 'DESC');

        return $photosModel;
    }
}