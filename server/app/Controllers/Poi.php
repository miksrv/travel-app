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
        try {
            $photosModel = new PhotosModel();
            $placesModel = new PlacesModel();
            $placeData   = $placesModel
                ->select('places.*, places_content.title, places_content.content')
                ->join('places_content', 'places.id = places_content.place_id AND locale = "ru"')
                ->find($id);

            if ($placeData) {
                $placeData->photos = $photosModel
                    ->select('photos.filename, photos.extension, photos.width, photos.height, photos.order')
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