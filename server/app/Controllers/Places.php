<?php namespace App\Controllers;

use App\Entities\Place;
use App\Entities\TranslationPlace;
use App\Entities\UserActivity;
use App\Libraries\PlaceTranslation;
use App\Libraries\Session;
use App\Models\PhotosModel;
use App\Models\PlacesModel;
use App\Models\PlacesTagsModel;
use App\Models\RatingModel;
use App\Models\TranslationsPlacesModel;
use App\Models\UsersActivityModel;
use App\Models\UsersBookmarksModel;
use CodeIgniter\I18n\Time;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;
use ReflectionException;

class Places extends ResourceController {
    /**
     * @example GET /places?sort=rating&order=ASC&category=historic&limit=20&offset=1
     * @return ResponseInterface
     */
    public function list(): ResponseInterface {
        $bookmarksUser = $this->request->getGet('bookmarkUser', FILTER_SANITIZE_SPECIAL_CHARS);
        $lat    = $this->request->getGet('latitude', FILTER_VALIDATE_FLOAT);
        $lon    = $this->request->getGet('longitude', FILTER_VALIDATE_FLOAT);
        $search = $this->request->getGet('search', FILTER_SANITIZE_SPECIAL_CHARS);

        $session = new Session();
        $bookmarksPlacesIds = [];

        // If filtering of interesting places by user bookmark is specified,
        // then we find all the bookmarks of this user, and then extract all the IDs of places in the bookmarks
        if ($bookmarksUser) {
            $bookmarksModel = new UsersBookmarksModel();
            $bookmarksData  = $bookmarksModel->select('place_id')->where('user_id', $bookmarksUser)->findAll();

            if ($bookmarksData) {
                foreach ($bookmarksData as $bookmark) {
                    $bookmarksPlacesIds[] = $bookmark->place;
                }
            }
        }

        // Filtering by user bookmarks (like any other) - if we don’t find a single place in the bookmarks, we return an empty array
        if ($bookmarksUser && empty($bookmarksPlacesIds)) {
            return $this->respond([
                'items'  => [],
                'count'  => 0,
            ]);
        }

        // Load translate library
        $placeTranslations = new PlaceTranslation('ru', 350);

        // When searching, we search by criteria in the translation array to return object IDs
        if ($search) {
            $placeTranslations->search($search);

            // At the same time, if we did not find anything based on the search conditions,
            // we immediately return an empty array and do not execute the code further
            if (empty($placeTranslations->placeIds)) {
                return $this->respond([
                    'items'  => [],
                    'count'  => 0,
                ]);
            }
        }

        if ($lat && $lon) {
            $distanceSelect = ", 6378 * 2 * ASIN(SQRT(POWER(SIN(({$lat} - abs(places.latitude)) * pi()/180 / 2), 2) +  COS({$lat} * pi()/180 ) * COS(abs(places.latitude) * pi()/180) *  POWER(SIN(({$lon} - places.longitude) * pi()/180 / 2), 2) )) AS distance";
        } else {
            $distanceSelect = $session->longitude && $session->latitude
                ? ", 6378 * 2 * ASIN(SQRT(POWER(SIN(({$session->latitude} - abs(places.latitude)) * pi()/180 / 2), 2) +  COS({$session->latitude} * pi()/180 ) * COS(abs(places.latitude) * pi()/180) *  POWER(SIN(({$session->longitude} - places.longitude) * pi()/180 / 2), 2) )) AS distance"
                : '';
        }

        $placesModel = new PlacesModel();
        $photosModel = new PhotosModel();
        $placesModel
            ->select('places.id, places.category, places.latitude, places.longitude, places.rating, places.views, category.title as category_title' . $distanceSelect)
            ->join('category', 'places.category = category.name', 'left');

        // If search or any other filter is not used, then we always use an empty array
        $searchPlacesIds = !$search && !$bookmarksUser
            ? []
            : array_unique(array_merge($placeTranslations->placeIds, $bookmarksPlacesIds));

        // Find all places
        // If a search was enabled, the second argument to the _makeListFilters function will contain the
        // IDs of the places found using the search criteria
        $placesList = $this->_makeListFilters($placesModel, $searchPlacesIds)->get()->getResult();
        $placesIds  = [];
        $result     = [];
        foreach ($placesList as $place) {
            $placesIds[] = $place->id;
        }

        // Find all photos for all places
        $photosData = $placesIds
            ? $photosModel
                ->havingIn('place_id', $placesIds)
                ->orderBy('order', 'DESC')
                ->findAll()
            : $placesIds;

        // We find translations for all objects if no search was used.
        // When searching, we already know translations for all found objects
        if (!$search) {
            $placeTranslations->translate($placesIds);
        }

        // Map photos and places
        foreach ($placesList as $place) {
            $photoId = array_search($place->id, array_column($photosData, 'place_id'));
            $counts  = array_count_values(array_column($photosData, 'place_id'))[$place->id] ?? 0;

            $return  = [
                'id'        => $place->id,
                'latitude'  => (float) $place->latitude,
                'longitude' => (float) $place->longitude,
                'rating'    => (float) $place->rating,
                'views'     => (int) $place->views,
                'title'     => $placeTranslations->title($place->id),
                'content'   => $placeTranslations->content($place->id),
                'category'  => [
                    'name'  => $place->category,
                    'title' => $place->category_title,
                ]
            ];

            if ($distanceSelect) {
                $return['distance'] = round((float) $place->distance, 1);
            }

            if ($photoId !== false && isset($photosData[$photoId])) {
                $return['photoCount'] = $counts;
                $return['photo'] = [
                    'filename'  => $photosData[$photoId]->filename,
                    'extension' => $photosData[$photoId]->extension,
                    'width'     => $photosData[$photoId]->width,
                    'height'    => $photosData[$photoId]->width
                ];
            }

            $result[] = $return;
        }

        return $this->respond([
            'items'  => $result,
            'count'  => $this->_makeListFilters($placesModel, $searchPlacesIds)->countAllResults(),
        ]);
    }

    /**
     * @param $id
     * @return ResponseInterface
     * @throws ReflectionException
     */
    public function show($id = null): ResponseInterface {
        $session = new Session();

        // Load translate library
        $placeTranslate = new PlaceTranslation('ru');
        $placeTranslate->translate([$id]);

        try {
            $distanceSelect = ($session->longitude && $session->latitude)
                ? ", 6378 * 2 * ASIN(SQRT(POWER(SIN(({$session->latitude} - abs(places.latitude)) * pi()/180 / 2), 2) +  COS({$session->latitude} * pi()/180 ) * COS(abs(places.latitude) * pi()/180) *  POWER(SIN(({$session->longitude} - places.longitude) * pi()/180 / 2), 2) )) AS distance"
                : '';

            $placesTagsModel = new PlacesTagsModel();
            $photosModel = new PhotosModel();
            $placesModel = new PlacesModel();
            $placeData   = $placesModel
                ->select(
                    'places.*,  users.id as user_id, users.name as user_name, users.avatar as user_avatar,
                    address_country.name as country_name, address_region.name as region_name, 
                    address_district.name as district_name, address_city.name as city_name,
                    category.title as category_title' . $distanceSelect)
                ->join('users', 'places.author = users.id', 'left')
                ->join('category', 'places.category = category.name', 'left')
                ->join('address_country', 'address_country.id = places.address_country', 'left')
                ->join('address_region', 'address_region.id = places.address_region', 'left')
                ->join('address_district', 'address_district.id = places.address_district', 'left')
                ->join('address_city', 'address_city.id = places.address_city', 'left')
                ->find($id);

            if (!$placeData) {
                return $this->failNotFound();
            }

            // Find all place photos
            $placeData->photo = $photosModel
                ->select(
                    'photos.author, photos.filename, photos.extension, photos.width, photos.place, 
                    photos.height, photos.order, translations_photos.title, photos.created_at,
                    users.id as user_id, users.name as user_name, users.avatar as user_avatar')
                ->join('users', 'photos.author = users.id', 'left')
                ->join('translations_photos', 'photos.id = translations_photos.photo AND language = "ru"', 'left')
                ->where(['place_id' => $placeData->id])
                ->orderBy('photos.order', 'DESC')
                ->findAll();

            // Collect tags
            $placeData->tags = $placesTagsModel
                ->select('tags.id, tags.title, tags.counter')
                ->join('tags', 'tags.id = places_tags.tag_id')
                ->where(['place_id' => $placeData->id])
                ->findAll();

            // Has the user already voted for this material or not?
            $ratingModel = new RatingModel();
            $ratingData  = $ratingModel
                ->select('id')
                ->where(['place_id' => $placeData->id, 'session_id' => $session->id])
                ->first();

            $response = [
                'id'        => $placeData->id,
                'created'   => $placeData->created_at ?? null,
                'updated'   => $placeData->updated_at ?? null,
                'latitude'  => (float) $placeData->latitude,
                'longitude' => (float) $placeData->longitude,
                'rating'    => (float) $placeData->rating,
                'views'     => (int) $placeData->views,
                'title'     => $placeTranslate->title($id),
                'content'   => $placeTranslate->content($id),
                'author'    => [
                    'id'     => $placeData->user_id,
                    'name'   => $placeData->user_name,
                    'avatar' => $placeData->user_avatar
                ],
                'category'  => [
                    'name'  => $placeData->category,
                    'title' => $placeData->category_title,
                ],
                'actions'   => [
                    'rating' => !$ratingData,
                ],
                'address'   => [],
                'tags'      => $placeData->tags,
            ];

            if ($placeData->address) {
                $response['address']['street'] = $placeData->address;
            }

            if ($placeData->photo) {
                $response['photoCount'] = count($placeData->photo);

                $response['photo'] = [
                    'filename'  => $placeData->photo[0]->filename,
                    'extension' => $placeData->photo[0]->extension,
                    'order'     => $placeData->photo[0]->order,
                    'width'     => $placeData->photo[0]->width,
                    'height'    => $placeData->photo[0]->height,
                    'title'     => $placeData->photo[0]->title,
                    'placeId'   => $placeData->photo[0]->place,
                    'created'   => $placeData->photo[0]->created_at,
                    'author'    => $placeData->photo[0]->user_id ? [
                        'id'     => $placeData->photo[0]->user_id,
                        'name'   => $placeData->photo[0]->user_name,
                        'avatar' => $placeData->photo[0]->user_avatar,
                    ] : null
                ];
            }

            if ($session->longitude && $session->latitude) {
                $response['distance'] = round((float) $placeData->distance, 1);
            }

            if ($placeData->address_country) {
                $response['address']['country'] = [
                    'id'   => (int) $placeData->address_country,
                    'name' => $placeData->country_name
                ];
            }

            if ($placeData->address_region) {
                $response['address']['region'] = [
                    'id'   => (int) $placeData->address_region,
                    'name' => $placeData->region_name
                ];
            }

            if ($placeData->address_district) {
                $response['address']['district'] = [
                    'id'   => (int) $placeData->address_district,
                    'name' => $placeData->district_name
                ];
            }

            if ($placeData->address_city) {
                $response['address']['city'] = [
                    'id'   => (int) $placeData->address_city,
                    'name' => $placeData->city_name
                ];
            }

            // Update view counts
            $placesModel->update($placeData->id, [
                'views'      => $placeData->views + 1,
                'updated_at' => $placeData->updated_at
            ]);

            return $this->respond((object) $response);
        } catch (Exception $e) {
            log_message('error', '{exception}', ['exception' => $e]);

            return $this->failNotFound();
        }
    }

    /**
     * @param $id
     * @return ResponseInterface
     * @throws ReflectionException
     */
    public function update($id = null): ResponseInterface {
        $session = new Session();
        $input   = $this->request->getJSON();

        if (!$session->isAuth) {
            return $this->failUnauthorized();
        }

        $placeTranslate = new PlaceTranslation('ru');
        $placeTranslate->translate([$id]);

        if (!$placeTranslate->title($id)) {
            return $this->failValidationErrors('There is no point with this ID');
        }

        if (!$input->content) {
            return $this->failValidationErrors('Cant save empty content');
        }

        $placesModel = new PlacesModel();
        $langModel   = new TranslationsPlacesModel();
        $translation = new TranslationPlace();

        $newContent = strip_tags(html_entity_decode($input->content));

        $translation->place    = $id;
        $translation->language = 'ru';
        $translation->author   = $session->userData->id;
        $translation->title    = isset($input->title) ? strip_tags(html_entity_decode($input->title)) : $placeTranslate->title($id);
        $translation->content  = $newContent;
        $translation->delta    = strlen($newContent) - strlen($placeTranslate->content($id));

        // If the author of the last edit is the same as the current one,
        // then you need to check when the content was last edited
        if ($placeTranslate->author($id) === $session->userData->id) {
            $time = new Time('now');
            $diff = $time->difference($placeTranslate->updated($id));

            // If the last time a user edited this content was less than or equal to 30 minutes,
            // then we will simply update the data and will not add a new version
            if (abs($diff->getMinutes()) <= 30) {
                $langModel->update($placeTranslate->id($id), $translation);
            } else {
                $langModel->insert($translation);

                // Make user activity
                $activityModel = new UsersActivityModel();
                $activity = new UserActivity();
                $activity->user = $session->userData->id;
                $activity->type = 'place';
                $activity->place = $id;
                $activityModel->insert($activity);

            }
        } else {
            $langModel->insert($translation);

            $activityModel = new UsersActivityModel();
            $activity = new UserActivity();
            $activity->user = $session->userData->id;
            $activity->type = 'place';
            $activity->place = $id;
            $activityModel->insert($activity);
        }

        // In any case, we update the time when the post was last edited
        $place = new Place();
        $place->updated_at = time();
        $placesModel->update($id, $place);

        return $this->respond((object) ['status' => true]);
    }

    /**
     * @param PlacesModel $placesModel
     * @param array $placeIds
     * @return PlacesModel
     */
    protected function _makeListFilters(PlacesModel $placesModel, array $placeIds = []): PlacesModel {
        $orderDefault  = 'DESC';
        $sortingFields = ['views', 'rating', 'title', 'category', 'distance', 'created_at', 'updated_at'];
        $orderFields   = ['ASC', 'DESC'];

        $sort     = $this->request->getGet('sort', FILTER_SANITIZE_SPECIAL_CHARS);
        $author   = $this->request->getGet('author', FILTER_SANITIZE_SPECIAL_CHARS);
        $exclude  = $this->request->getGet('excludePlaces', FILTER_SANITIZE_SPECIAL_CHARS);
        $order    = $this->request->getGet('order', FILTER_SANITIZE_SPECIAL_CHARS) ?? $orderDefault;
        $country  = $this->request->getGet('country', FILTER_SANITIZE_NUMBER_INT);
        $region   = $this->request->getGet('region', FILTER_SANITIZE_NUMBER_INT);
        $district = $this->request->getGet('district', FILTER_SANITIZE_NUMBER_INT);
        $city     = $this->request->getGet('city', FILTER_SANITIZE_NUMBER_INT);
        $limit    = $this->request->getGet('limit', FILTER_SANITIZE_NUMBER_INT) ?? 20;
        $offset   = $this->request->getGet('offset', FILTER_SANITIZE_NUMBER_INT) ?? 0;
        $category = $this->request->getGet('category', FILTER_SANITIZE_SPECIAL_CHARS);

        if ($country) {
            $placesModel->where(['address_country' => $country]);
        }

        if ($region) {
            $placesModel->where(['address_region' => $region]);
        }

        if ($district) {
            $placesModel->where(['address_district' => $district]);
        }

        if ($city) {
            $placesModel->where(['address_city' => $city]);
        }

        if ($category) {
            $placesModel->where(['places.category' => $category]);
        }

        if ($author) {
            $placesModel->where(['places.author' => $author]);
        }

        if ($exclude) {
            $exclude = explode(',', $exclude);
            $placesModel->whereNotIn('places.id', $exclude);
        }

        if ($placeIds && count($placeIds) >= 1) {
            $placesModel->whereIn('places.id', $placeIds);
        }

        if (in_array($sort, $sortingFields)) {
            $sort = $sort === 'updated_at' ? 'places.updated_at' : $sort;

            $placesModel->orderBy($sort, in_array($order, $orderFields) ? $order : $orderDefault);
        }

        return $placesModel->limit($limit <= 0 || $limit > 20 ? 20 : $limit, $offset);
    }
}