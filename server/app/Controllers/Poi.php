<?php namespace App\Controllers;

use App\Libraries\LocaleLibrary;
use App\Libraries\PlacesContent;
use App\Models\PhotosModel;
use App\Models\PlacesModel;
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
        $author   = $this->request->getGet('author', FILTER_SANITIZE_SPECIAL_CHARS);
        $category = $this->request->getGet('category', FILTER_SANITIZE_SPECIAL_CHARS);
        $bounds   = $this->_getBounds();

        $placesModel = new PlacesModel();
        $placesData  = $placesModel
            ->select('id, category, lat, lon')
            ->where([
                'lon >=' => $bounds[0],
                'lat >=' => $bounds[1],
                'lon <=' =>  $bounds[2],
                'lat <=' =>  $bounds[3],
            ]);

        if ($category) {
            $placesData->where('category', $category);
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
        $bounds      = $this->_getBounds();
        $photosModel = new PhotosModel();
        $photosData  = $photosModel
            ->select('photos.place_id, photos.lat, photos.lon, photos.filename, photos.extension')
            ->where([
                'lon >=' => $bounds[0],
                'lat >=' => $bounds[1],
                'lon <=' =>  $bounds[2],
                'lat <=' =>  $bounds[3],
            ])
            ->groupBy('photos.lon, photos.lat')
            ->findAll();

        $result = [];

        foreach ($photosData as $photo) {
            $result[] = (object) [
                'filename'  => $photo->filename,
                'extension' => $photo->extension,
                'lat'       => $photo->lat,
                'lon'       => $photo->lon,
                'title'     => $photo->title,
                'placeId'   => $photo->place_id,
            ];
        }

        return $this->respond([
            'items' => $result,
        ]);
    }

    /**
     * @param $id
     * @return ResponseInterface
     */
    public function show($id = null): ResponseInterface {
        // Load translate library
        $placeContent = new PlacesContent();
        $placeContent->translate([$id]);

        if (!$placeContent->title($id)) {
            return $this->failNotFound();
        }

        $placesModel = new PlacesModel();
        $placeData   = $placesModel
            ->select('id, rating, views, photos, photos')
            ->find($id);

        $response = [
            'id'     => $placeData->id,
            'rating' => (int) $placeData->rating,
            'views'  => (int) $placeData->views,
            'photos' => (int) $placeData->photos,
            'title'  => $placeContent->title($id),
        ];

        // Place cover
        if ($placeData->photos && file_exists(UPLOAD_PHOTOS . $id . '/cover.jpg')) {
            $response['cover'] = [
                'full'    => PATH_PHOTOS . $id . '/cover.jpg',
                'preview' => PATH_PHOTOS . $id . '/cover_preview.jpg',
            ];
        }

        return $this->respond($response);
    }

    /**
     * Getting the map boundaries from the GET parameter
     * @return ResponseInterface|array
     */
    protected function _getBounds(): ResponseInterface | array
    {
        // left (lon), top (lat), right (lon), bottom (lat)
        $bounds = $this->request->getGet('bounds', FILTER_SANITIZE_SPECIAL_CHARS);
        $bounds = explode(',', $bounds);

        if (count($bounds) !== 4) {
            return $this->failValidationErrors('Empty map bound parameter');
        }

        return $bounds;
    }
}