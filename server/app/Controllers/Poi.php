<?php namespace App\Controllers;

use App\Libraries\DbscanLibrary;
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
        // https://github.com/matthiasmullie/geo/tree/master

        $categories = $this->request->getGet('categories', FILTER_SANITIZE_SPECIAL_CHARS);
        $zoom   = $this->request->getGet('zoom', FILTER_SANITIZE_NUMBER_INT) ?? 10;
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

        $placesData  = $placesData->findAll();
        $totalPoints = count($placesData);

        // Создаем матрицу расстояний
        $distanceMatrix = [];
        foreach ($placesData as $point1) {
            foreach ($placesData as $point2) {
                $distanceMatrix[$point1->id][$point2->id] = $this->calculateDistance(
                    $point1->lat,
                    $point1->lon,
                    $point2->lat,
                    $point2->lon
                );
            }
        }

        $dbscanLibrary = new DbscanLibrary($distanceMatrix, array_column($placesData, 'id'));

        // Устанавливаем параметры для DBSCAN
        $epsilon  = $this->calculateEpsilon($zoom); // Примерное расстояние в км для формирования кластера
        $clusters = $dbscanLibrary->dbscan($epsilon, 3);

        $clustersData = [];
        foreach ($clusters as $clusterItem) {
            $lat = 0;
            $lon = 0;
            $count = count($clusterItem);

            if ($count === 0) {
                continue;
            }

            foreach ($clusterItem as $clusterPoint) {
                $findPoint = array_search($clusterPoint, array_column($placesData, 'id'));
                $lat += $placesData[$findPoint]->lat;
                $lon += $placesData[$findPoint]->lon;
            }

            $lat = round($lat / $count, 6);
            $lon = round($lon / $count, 6);

            $clustersData[] = [
                'lat' => $lat,
                'lon' => $lon,
                'type'  => 'cluster',
                'count' => $count
            ];
        }

        // Проходим по всем точкам, которые не попали в кластеры
        foreach ($placesData as $key => $point) {
            $isClustered = false;

            foreach ($clusters as $cluster) {
                if (in_array($point->id, $cluster)) {
                    $isClustered = true;
                    break;
                }
            }

            if ($isClustered) {
                unset($placesData[$key]);
            }

            $point->type = 'point';
        }

        return $this->respond([
            'test'    => $distanceMatrix,
            'epsilon' => $this->calculateEpsilon($zoom),
            'check' => count($placesData),
            'count' => $totalPoints,
            'items' => array_merge($clustersData, $placesData)
        ]);
    }

    static function calculateDistance($lat1, $lon1, $lat2, $lon2): float|int {
        $r = 6371; // Радиус Земли в километрах

        // Преобразование градусов в радианы
        $lat1 = deg2rad($lat1);
        $lon1 = deg2rad($lon1);
        $lat2 = deg2rad($lat2);
        $lon2 = deg2rad($lon2);

        // Разница широт и долгот
        $dlat = $lat2 - $lat1;
        $dlon = $lon2 - $lon1;

        // Формула гаверсинусов для вычисления расстояния между точками
        $a = sin($dlat / 2) * sin($dlat / 2) +
            cos($lat1) * cos($lat2) *
            sin($dlon / 2) * sin($dlon / 2);
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return round($r * $c, 3);
    }

    static function calculateEpsilon($zoom) {
        // Минимальное и максимальное значение зума, при котором epsilon будет минимальным и максимальным соответственно
        switch ($zoom) {
            case 6: return 2;
            case 7: return 1.7;
            case 8: return 1.5;
            case 9: return 1.3;
            case 10: return 1.1;
            case 11: return 0.9;
            case 12: return 0.8;
            case 13: return 0.7;
            case 14: return 0.5;
            case 15: return 0.3;
            case 16: return 0.1;
            case 17: return 0.02;
            case 18: return 0.001;
        }

        $minZoom = 6;
        $maxZoom = 18;

        // Минимальное и максимальное значение epsilon, которые соответствуют минимальному и максимальному зуму
        $minEpsilon = 10;
        $maxEpsilon = 0.001;

        // Интерполяция значения epsilon в зависимости от зума
        $epsilon = $minEpsilon + (($zoom - $minZoom) / ($maxZoom - $minZoom)) * ($maxEpsilon - $minEpsilon);

        return $epsilon;
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
            ->findAll(500);

        if (!$sessionsData) {
            return $this->respond(['items' => []]);
        }

        foreach ($sessionsData as $key => $item) {
            $sessionsData[$key] = [$item->lat, $item->lon];
        }

        return $this->respond(['items' => $sessionsData]);
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