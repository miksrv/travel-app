<?php namespace App\Controllers;

use App\Libraries\LocaleLibrary;
use App\Libraries\PlacesContent;
use App\Models\PhotosModel;
use App\Models\PlacesModel;
use App\Models\SessionsModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

class Poi extends ResourceController {
    public function __construct() {
        new LocaleLibrary();
    }

    /**
     * @return ResponseInterface
     */
    public function list(): ResponseInterface {
        $categories = $this->request->getGet('categories', FILTER_SANITIZE_SPECIAL_CHARS);
        $author = $this->request->getGet('author', FILTER_SANITIZE_SPECIAL_CHARS);
        $bounds = $this->_getBounds();

        $placesModel = new PlacesModel();
        $placesData  = $placesModel
            ->select('id, category, lat, lon')
            ->where([
                'lon >=' => $bounds[0],
                'lat >=' => $bounds[1],
                'lon <=' => $bounds[2],
                'lat <=' => $bounds[3],
            ]);

        if (isset($categories)) {
            $placesData->whereIn('category', explode(',', $categories));
        }

        if ($author) {
            $placesData->where('user_id', $author);
        }

        $result = $placesData->findAll();

        return $this->respond([
            'items' => $result,
            'count' => count($result)
        ]);
    }

    /**
     * @return ResponseInterface
     */
    public function photos(): ResponseInterface {
        $locale = $this->request->getLocale();
        $bounds = $this->_getBounds();

        $photosModel = new PhotosModel();
        $photosData  = $photosModel
            ->select('place_id as placeId, lat, lon, filename, extension, title_en, title_ru')
            ->where([
                'lon >=' => $bounds[0],
                'lat >=' => $bounds[1],
                'lon <=' => $bounds[2],
                'lat <=' => $bounds[3],
            ])
            ->groupBy('photos.lon, photos.lat')
            ->findAll();

        foreach ($photosData as $photo) {
            $photoPath = PATH_PHOTOS . $photo->placeId . '/' . $photo->filename;

            $photo->full    = $photoPath . '.' . $photo->extension;
            $photo->preview = $photoPath . '_preview.' . $photo->extension;
            $photo->title   = $locale === 'ru' ?
                ($photo->title_ru ?: $photo->title_en) :
                ($photo->title_en ?: $photo->title_ru);

            unset($photo->title_ru, $photo->title_en, $photo->extension, $photo->filename);
        }

        return $this->respond([
            'items' => $photosData,
            'count' => count($photosData)
        ]);
    }

    /**
     * @param $id
     * @return ResponseInterface
     */
    public function show($id = null): ResponseInterface {
        $placeContent = new PlacesContent();
        $placeContent->translate([$id]);

        if (!$placeContent->title($id)) {
            return $this->failNotFound();
        }

        $placesModel = new PlacesModel();
        $placeData   = $placesModel
            ->select('id, rating, views, photos, photos, comments, bookmarks')
            ->find($id);

        $placeData->title = $placeContent->title($id);

        if ($placeData->photos && file_exists(UPLOAD_PHOTOS . $id . '/cover.jpg')) {
            $placeData->cover = [
                'full'    => PATH_PHOTOS . $id . '/cover.jpg',
                'preview' => PATH_PHOTOS . $id . '/cover_preview.jpg',
            ];
        }

        return $this->respond($placeData);
    }

    /**
     * @return ResponseInterface
     */
    public function users(): ResponseInterface {
        $sessionsModel = new SessionsModel();
        $sessionsData  = $sessionsModel
            ->select('lat, lon')
            ->where(['lat !=' => null, 'lon !=' => null])
            ->findAll();

        if (!$sessionsData) {
            return $this->respond(['items' => []]);
        }

        $result = [];
        foreach ($sessionsData as $item) {
            $result[] = [$item->lat, $item->lon];
        }

        return $this->respond(['items' => $result]);
    }

    /**
     * Getting the map boundaries from the GET parameter
     * @return ResponseInterface|array
     */
    protected function _getBounds(): ResponseInterface | array {
        // left (lon), top (lat), right (lon), bottom (lat)
        $bounds = $this->request->getGet('bounds', FILTER_SANITIZE_SPECIAL_CHARS);
        $bounds = explode(',', $bounds);

        if (count($bounds) !== 4) {
            return $this->failValidationErrors('Empty map bound parameter');
        }

        return $bounds;
    }
}