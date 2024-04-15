<?php namespace App\Controllers;

use App\Entities\Photo;
use App\Libraries\LocaleLibrary;
use App\Libraries\PlacesContent;
use App\Libraries\SessionLibrary;
use App\Libraries\ActivityLibrary;
use App\Models\PhotosModel;
use App\Models\PlacesModel;
use App\Models\ActivityModel;
use CodeIgniter\Files\File;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;
use Config\Services;
use Exception;
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
                'remove' => $photo->user_id === $this->session->user?->id,
                'rotate' => $this->session->isAuth
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

        $photosData = $this->_makeListFilters()->orderBy('photos.created_at')->findAll(abs($limit), abs($offset));

        if (empty($photosData)) {
            return $this->respond([
                'items' => $photosData,
                'count' => 0
            ]);
        }

        $result = [];

        foreach ($photosData as $photo) {
            $title = $locale === 'ru' ?
                ($photo->title_ru ?: $photo->title_en) :
                ($photo->title_en ?: $photo->title_ru);

            $photoPath = PATH_PHOTOS . $photo->place_id . '/' . $photo->filename;

            $avatar   = $photo->user_avatar ? explode('.', $photo->user_avatar) : null;
            $result[] = (object) [
                'id'      => $photo->id,
                'full'    => $photoPath . '.' . $photo->extension,
                'preview' => $photoPath . '_preview.' . $photo->extension,
                'width'   => $photo->width,
                'height'  => $photo->height,
                'title'   => $title,
                'placeId' => $photo->place_id,
                'created' => $photo->created_at,
                'author'  => $photo->user_id ? [
                    'id'     => $photo->user_id,
                    'name'   => $photo->user_name,
                    'avatar' => $avatar
                        ? PATH_AVATARS . $photo->user_id . '/' . $avatar[0] . '_small.' . $avatar[1]
                        : null
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
        if (!$this->session->isAuth) {
            return $this->failUnauthorized();
        }

        if (!$photo = $this->request->getFile('photo')) {
            return $this->failValidationErrors('No photo for upload');
        }

        $placesModel = new PlacesModel();
        $placesData  = $placesModel->select('id, lat, lon, photos, user_id')->find($id);

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

            list($width, $height) = getimagesize($file->getRealPath());

            // Calculating Aspect Ratio
            $orientation = $width > $height ? 'h' : 'v';
            $width       = $orientation === 'h' ? $width : $height;
            $height      = $orientation === 'h' ? $height : $width;

            // If the uploaded image dimensions exceed the maximum
            if ($width > PHOTO_MAX_WIDTH || $height > PHOTO_MAX_HEIGHT) {
                $image = Services::image('gd');
                $image->withFile($file->getRealPath())
                    ->fit(PHOTO_MAX_WIDTH, PHOTO_MAX_HEIGHT)
                    ->reorient(true)
                    ->save($photoDir . $name . '.' . $ext);

                list($width, $height) = getimagesize($file->getRealPath());
            }

            $image = Services::image('gd'); // imagick
            $image->withFile($file->getRealPath())
                ->fit(PHOTO_PREVIEW_WIDTH, PHOTO_PREVIEW_HEIGHT)
                ->save($photoDir . $name . '_preview.' . $ext);

            // If this first uploaded photo - we automated make place cover image
            if ($placesData->photos === 0) {
                $image->withFile($file->getRealPath())
                    ->fit(PLACE_COVER_WIDTH, PLACE_COVER_HEIGHT)
                    ->save($photoDir . '/cover.jpg');

                $image->withFile($file->getRealPath())
                    ->fit(PLACE_COVER_PREVIEW_WIDTH, PLACE_COVER_PREVIEW_HEIGHT)
                    ->save($photoDir . '/cover_preview.jpg');
            }

            $coordinates = $this->_readPhotoLocation($file->getRealPath());
            $photosModel = new PhotosModel();

            // Save photo to DB
            $photo = new Photo();
            $photo->lat = $coordinates?->lat ?? $placesData->lat;
            $photo->lon = $coordinates?->lon ?? $placesData->lon;
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

            sleep(1);

            $activity = new ActivityLibrary();
            $activity->owner($placesData->user_id)->photo($photoId, $placesData->id);
        } else {
           return  $this->failValidationErrors($photo->getErrorString());
        }

        // Update the time and photos count
        $placesModel->update($id, ['photos' => $placesData->photos + 1]);

        $photoPath = PATH_PHOTOS . $placesData->id . '/';

        return $this->respondCreated((object) [
            'id'        => $photoId,
            'full'      => $photoPath . $name . '.' . $ext,
            'preview'   => $photoPath . $name . '_preview.' . $ext,
            // 'filename'  => $photo->filename,
            // 'extension' => $photo->extension,
            'width'     => $photo->width,
            'height'    => $photo->height,
            'title'     => $photo->title_en ?: $photo->title_ru,
            'placeId'   => $photo->place_id
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

        $activityModel = new ActivityModel();
        $activityModel->where(['photo_id' => $id, 'user_id' => $this->session->user?->id])->delete();

        // Update photos count on the current place
        $placesModel->update($photoData->place_id, ['photos' => $placesData->photos - 1]);

        return $this->respondDeleted(['id' => $id]);
    }

    /**
     * @param $id
     * @return ResponseInterface
     * @throws ReflectionException
     */
    public function rotate($id = null): ResponseInterface {
        if (!$this->session->isAuth) {
            return $this->failUnauthorized();
        }

        $photosModel = new PhotosModel();
        $photoData   = $photosModel->select('id, place_id, filename, extension, width, height')->find($id);

        if (!$photoData) {
            return $this->failValidationErrors('No photo found with this ID');
        }

        $photoDir = UPLOAD_PHOTOS . $photoData->place_id . '/';
        $file  = new File($photoDir . $photoData->filename . '.' . $photoData->extension);
        $image = Services::image('gd');
        $name  = pathinfo($file->getRandomName(), PATHINFO_FILENAME);
        $image->withFile($file->getRealPath())
            ->rotate(90)
            ->save($photoDir . $name . '.' . $photoData->extension);

        $image->withFile($photoDir . $name . '.' . $photoData->extension)
            ->fit(PHOTO_PREVIEW_WIDTH, PHOTO_PREVIEW_HEIGHT)
            ->save($photoDir . $name . '_preview.' . $photoData->extension);

        unlink($photoDir . $photoData->filename . '.' . $photoData->extension);
        unlink($photoDir . $photoData->filename . '_preview.' . $photoData->extension);

        $photosModel->update($id, [
            'filename' => $name,
            'width'    => $photoData->height,
            'height'   => $photoData->width,
        ]);

        $photoPath = PATH_PHOTOS . $photoData->place_id . '/' . $name;

        return $this->respondDeleted([
            'id'      => $id,
            'full'    => $photoPath . '.' . $photoData->extension,
            'preview' => $photoPath . '_preview.' . $photoData->extension,
        ]);
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

        try {
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
        } catch (Exception $e) {
            log_message('error', '{exception}', ['exception' => $e]);

            return (object) [];
        }
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