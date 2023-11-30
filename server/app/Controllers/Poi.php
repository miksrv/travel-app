<?php namespace App\Controllers;

use App\Models\PhotosModel;
use App\Models\PlacesModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;

class Poi extends ResourceController {
    /**
     * @return ResponseInterface
     */
    public function list(): ResponseInterface {
        $bounds      = $this->_getBounds();
        $placesModel = new PlacesModel();
        $placesData  = $placesModel
            ->select('id, category, latitude, longitude')
            ->where([
                'longitude >=' => $bounds[0],
                'latitude >=' => $bounds[1],
                'longitude <=' =>  $bounds[2],
                'latitude <=' =>  $bounds[3],
            ])->findAll();

        return $this->respond([
            'items' => $placesData,
        ]);
    }

    /**
     * @return ResponseInterface
     */
    public function photos(): ResponseInterface {
        $bounds      = $this->_getBounds();
        $photosModel = new PhotosModel();
        $photosData  = $photosModel
            ->select('photos.place_id, photos.latitude, photos.longitude, photos.filename, photos.extension, translations_photos.title')
            ->join('translations_photos', 'photos.id = translations_photos.photo_id AND language = "ru"', 'left')
            ->where([
                'longitude >=' => $bounds[0],
                'latitude >=' => $bounds[1],
                'longitude <=' =>  $bounds[2],
                'latitude <=' =>  $bounds[3],
            ])
            ->groupBy('photos.longitude, photos.latitude')
            ->findAll();

        $result = [];

        foreach ($photosData as $photo) {
            $result[] = (object) [
                'filename'  => $photo->filename,
                'extension' => $photo->extension,
                'latitude'  => $photo->latitude,
                'longitude' => $photo->longitude,
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
        try {
            $photosModel = new PhotosModel();
            $placesModel = new PlacesModel();
            $placeData   = $placesModel
                ->select('places.*, translations_places.title, translations_places.content')
                ->join('translations_places', 'places.id = translations_places.place_id AND language = "ru"')
                ->find($id);

            if ($placeData) {
                $placeData->photos = $photosModel
                    ->select(
                        'photos.filename, photos.extension, photos.width,
                        photos.height, photos.order, translations_photos.title')
                    ->join('translations_photos', 'photos.id = translations_photos.photo_id AND language = "ru"', 'left')
                    ->where(['place_id' => $placeData->id])
                    ->orderBy('order', 'DESC')
                    ->findAll();

                $response = [
                    'id'      => $placeData->id,
                    'rating'  => (int) $placeData->rating,
                    'views'   => (int) $placeData->views,
                    'title'   => strip_tags(html_entity_decode($placeData->title)),
                    'content' => strip_tags(html_entity_decode($placeData->content))
                ];

                if ($placeData->photos) {
                    $response['photosCount'] = count($placeData->photos);
                    $response['photos']      = [
                        (object) [
                            'filename'  => $placeData->photos[0]->filename,
                            'extension' => $placeData->photos[0]->extension,
                            'width'     => $placeData->photos[0]->width,
                            'height'    => $placeData->photos[0]->width
                        ]
                    ];
                }

                return $this->respond($response);
            }

            return $this->failNotFound();
        } catch (Exception $e) {
            log_message('error', '{exception}', ['exception' => $e]);

            return $this->failNotFound();
        }
    }

    /**
     * Getting the map boundaries from the GET parameter
     * @return array
     */
    protected function _getBounds(): array {
        // left (lon), top (lat), right (lon), bottom (lat)
        $bounds = $this->request->getGet('bounds', FILTER_SANITIZE_SPECIAL_CHARS);
        $bounds = explode(',', $bounds);

        if (count($bounds) !== 4) {
            return $this->failValidationErrors('Empty map bound parameter');
        }

        return $bounds;
    }
}