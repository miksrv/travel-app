<?php namespace App\Controllers;

use App\Entities\Place;
use App\Libraries\Geocoder;
use App\Libraries\LocaleLibrary;
use App\Libraries\PlaceTags;
use App\Libraries\PlacesContent;
use App\Libraries\Session;
use App\Libraries\UserActivity;
use App\Libraries\UserNotify;
use App\Models\PhotosModel;
use App\Models\PlacesModel;
use App\Models\PlacesTagsModel;
use App\Models\RatingModel;
use App\Models\PlacesContentModel;
use App\Models\UsersBookmarksModel;
use CodeIgniter\I18n\Time;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;
use Geocoder\Exception\Exception;
use ReflectionException;

class Places extends ResourceController {
    protected bool $coordinatesAvailable = false;

    public function random(): ResponseInterface{
        $placesModel = new PlacesModel();
        $placesData  = $placesModel
            ->select('id')
            ->orderBy('id', 'RANDOM')
            ->first();

        return $this->respond($placesData && ['id' => $placesData->id]);
    }

    /**
     * @example GET /places?sort=rating&order=ASC&category=historic&limit=20&offset=1
     * @return ResponseInterface
     */
    public function list(): ResponseInterface {
        $bookmarksUser = $this->request->getGet('bookmarkUser', FILTER_SANITIZE_SPECIAL_CHARS);
        $lat    = $this->request->getGet('lat', FILTER_VALIDATE_FLOAT);
        $lon    = $this->request->getGet('lon', FILTER_VALIDATE_FLOAT);
        $search = $this->request->getGet('search', FILTER_SANITIZE_SPECIAL_CHARS);

        $localeLibrary = new LocaleLibrary();

        $locale  = $localeLibrary->locale;
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
        $placeTranslations = new PlacesContent(350);

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
            $distanceSelect = ", 6378 * 2 * ASIN(SQRT(POWER(SIN(({$lat} - abs(places.lat)) * pi()/180 / 2), 2) +  COS({$lat} * pi()/180 ) * COS(abs(places.lat) * pi()/180) *  POWER(SIN(({$lon} - places.lon) * pi()/180 / 2), 2) )) AS distance";
        } else {
            $distanceSelect = $session->lon && $session->lat
                ? ", 6378 * 2 * ASIN(SQRT(POWER(SIN(({$session->lat} - abs(places.lat)) * pi()/180 / 2), 2) +  COS({$session->lat} * pi()/180 ) * COS(abs(places.lat) * pi()/180) *  POWER(SIN(({$session->lon} - places.lon) * pi()/180 / 2), 2) )) AS distance"
                : '';
        }

        $placesModel = new PlacesModel();
        $photosModel = new PhotosModel();
        $placesModel
            ->select('places.id, places.category, places.lat, places.lon, places.rating, places.views,
                category.title_en as category_en, category.title_ru as category_ru' .
                $distanceSelect)
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
                'lat'       => (float) $place->lat,
                'lon'       => (float) $place->lon,
                'rating'    => (float) $place->rating,
                'views'     => (int) $place->views,
                'title'     => $placeTranslations->title($place->id),
                'content'   => $placeTranslations->content($place->id),
                'category'  => [
                    'name'  => $place->category,
                    'title' => $place->{"category_$locale"},
                ]
            ];

            if ($distanceSelect && $place->distance) {
                $return['distance'] = round((float) $place->distance, 1);
                $this->coordinatesAvailable = true;
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
        $localeLibrary = new LocaleLibrary();

        $locale  = $localeLibrary->locale;
        $session = new Session();

        // Load translate library
        $placeContent = new PlacesContent();
        $placeContent->translate([$id]);

        try {
            $distanceSelect = ($session->lon && $session->lat)
                ? ", 6378 * 2 * ASIN(SQRT(POWER(SIN(({$session->lat} - abs(places.lat)) * pi()/180 / 2), 2) +  COS({$session->lat} * pi()/180 ) * COS(abs(places.lat) * pi()/180) *  POWER(SIN(({$session->lon} - places.lon) * pi()/180 / 2), 2) )) AS distance"
                : '';

            $placesTagsModel = new PlacesTagsModel();
            $photosModel = new PhotosModel();
            $placesModel = new PlacesModel();
            $placeData   = $placesModel
                ->select(
                    'places.*,  
                    users.id as user_id, users.name as user_name, users.avatar as user_avatar,
                    location_countries.title_en as country_en, location_countries.title_ru as country_ru, 
                    location_regions.title_en as region_en, location_regions.title_ru as region_ru, 
                    location_districts.title_en as district_en, location_districts.title_ru as district_ru, 
                    location_cities.title_en as city_en, location_cities.title_ru as city_ru,
                    category.title_ru as category_ru, category.title_en as category_en' .
                    $distanceSelect)
                ->join('users', 'places.user_id = users.id', 'left')
                ->join('category', 'places.category = category.name', 'left')
                ->join('location_countries', 'location_countries.id = places.country_id', 'left')
                ->join('location_regions', 'location_regions.id = places.region_id', 'left')
                ->join('location_districts', 'location_districts.id = places.district_id', 'left')
                ->join('location_cities', 'location_cities.id = places.city_id', 'left')
                ->find($id);

            if (!$placeData) {
                return $this->failNotFound();
            }

            // Find all place photos
            $placeData->photo = $photosModel
                ->select(
                    'photos.user_id, photos.filename, photos.extension, photos.width, photos.place_id, 
                    photos.height, photos.order, photos.title_ru, photos.created_at,
                    users.id as user_id, users.name as user_name, users.avatar as user_avatar')
                ->join('users', 'photos.user_id = users.id', 'left')
                ->where(['place_id' => $placeData->id])
                ->orderBy('photos.order', 'DESC')
                ->findAll();

            // Collect tags
            $placeData->tags = $placesTagsModel
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
                'lat'       => (float) $placeData->lat,
                'lon'       => (float) $placeData->lon,
                'rating'    => (float) $placeData->rating,
                'views'     => (int) $placeData->views,
                'title'     => $placeContent->title($id),
                'content'   => $placeContent->content($id),
                'author'    => [
                    'id'     => $placeData->user_id,
                    'name'   => $placeData->user_name,
                    'avatar' => $placeData->user_avatar
                ],
                'category'  => [
                    'name'  => $placeData->category,
                    'title' => $placeData->{"category_$locale"},
                ],
                'actions'   => [
                    'rating' => !$ratingData,
                ],
                'address'   => [],
            ];

            if ($placeData->tags) {
                $tagsTitles = [];

                foreach ($placeData->tags as $tagItem) {
                    $tagsTitles[] = [
                        'id'    => $tagItem->id,
                        'title' => $tagItem->{"title_$locale"} ?? $tagItem->title_en ?? $tagItem->title_ru
                    ];
                }

                $response['tags'] = $tagsTitles;
            }

            $response['address']['street'] = $placeData->{"address_$locale"};

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

            if ($session->lon && $session->lat) {
                $response['distance'] = round((float) $placeData->distance, 1);
            }

            if ($placeData->country_id) {
                $response['address']['country'] = [
                    'id'    => $placeData->country_id,
                    'title' => $placeData->{"country_$locale"}
                ];
            }

            if ($placeData->region_id) {
                $response['address']['region'] = [
                    'id'    => $placeData->region_id,
                    'title' => $placeData->{"region_$locale"}
                ];
            }

            if ($placeData->district_id) {
                $response['address']['district'] = [
                    'id'    => $placeData->district_id,
                    'title' => $placeData->{"district_$locale"}
                ];
            }

            if ($placeData->city_id) {
                $response['address']['city'] = [
                    'id'    => $placeData->city_id,
                    'title' => $placeData->{"city_$locale"}
                ];
            }

            // Update view counts
            $placesModel->update($placeData->id, [
                'views'      => $placeData->views + 1,
                'updated_at' => $placeData->updated_at
            ]);

            // Get random place ID
            $placesData = $placesModel
                ->select('id')
                ->orderBy('id', 'RANDOM')
                ->first();

                    $response['randomId'] = $placesData->id;

            return $this->respond((object) $response);
        } catch (Exception $e) {
            log_message('error', '{exception}', ['exception' => $e]);

            return $this->failNotFound();
        }
    }

    /**
     * Create new place
     * @return ResponseInterface
     * @throws ReflectionException
     * @throws Exception
     */
    public function create(): ResponseInterface {
        $session = new Session();
        $input   = $this->request->getJSON();

        $placeTags    = new PlaceTags();
        $placesModel  = new PlacesModel();
        $userActivity = new UserActivity();

        $geocoder = new Geocoder();
        $place    = new \App\Entities\Place();

        $geocoder->coordinates($input->coordinates->lat, $input->coordinates->lon);

        $placeTitle   = strip_tags(html_entity_decode($input->title));
        $placeContent = strip_tags(html_entity_decode($input->content));

        $place->lat         = $input->coordinates->lat;
        $place->lon         = $input->coordinates->lon;
        $place->user_id     = $session->userId;
        $place->category    = $input->category;
        $place->address_en  = $geocoder->addressEn;
        $place->address_ru  = $geocoder->addressRu;
        $place->country_id  = $geocoder->countryId;
        $place->region_id   = $geocoder->regionId;
        $place->district_id = $geocoder->districtId;
        $place->city_id     = $geocoder->cityId;

        $placesModel->insert($place);

        $newPlaceId = $placesModel->getInsertID();

        if (!empty($input->tags)) {
            $placeTags->saveTags($input->tags, $newPlaceId);
        }

        $placesContentModel = new PlacesContentModel();

        $content = new \App\Entities\PlaceContent();
        $content->place_id = $newPlaceId;
        $content->language = 'ru';
        $content->user_id  = $session->userId;
        $content->title    = $placeTitle;
        $content->content  = $placeContent;

        $placesContentModel->insert($content);

        $userActivity->place($newPlaceId);

        return $this->respondCreated((object) ['id' => $newPlaceId]);
    }

    /**
     * Update place content by ID
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

        $placeTags    = new PlaceTags();
        $placesModel  = new PlacesModel();
        $placeContent = new PlacesContent();
        $placeData    = $placesModel->find($id);

        $placeContent->translate([$id]);

        if (!$placeContent->title($id) || !$placeData) {
            return $this->failValidationErrors('There is no point with this ID');
        }

        // Save place tags
        $updatedTags    = $placeTags->saveTags($input->tags, $id);
        $updatedContent = strip_tags(html_entity_decode($input->content ?? null));
        $updatedTitle   = strip_tags(html_entity_decode($input->title ?? null));
        $coordinates    = $input->coordinates ?? null;

        // Save place content
        if ($updatedContent || $updatedTitle) {
            $userActivity = new UserActivity();
            $contentModel = new PlacesContentModel();
            $placeEntity  = new \App\Entities\PlaceContent();
            $placeEntity->locale   = 'ru';
            $placeEntity->place_id = $id;
            $placeEntity->user_id  = $session->userId;
            $placeEntity->title    = $updatedTitle ?? $placeContent->title($id);
            $placeEntity->content  = $updatedContent;
            $placeEntity->delta    = strlen($updatedContent) - strlen($placeContent->content($id));

            // If the author of the last edit is the same as the current one,
            // then you need to check when the content was last edited
            if ($placeContent->author($id) === $session->userId) {
                $time = new Time('now');
                $diff = $time->difference($placeContent->updated($id));

                // If the last time a user edited this content was less than or equal to 30 minutes,
                // then we will simply update the data and will not add a new version
                if (abs($diff->getMinutes()) <= 30) {
                    $contentModel->update($placeContent->id($id), $placeEntity);
                } else {
                    $contentModel->insert($placeEntity);
                    $userActivity->edit($id);
                }
            } else {
                $contentModel->insert($placeEntity);
                $userActivity->edit($id);
            }

            // We add a notification to the author that his material has been edited
            if ($placeData->user_id !== $session->userId) {
                $userNotify = new UserNotify();
                $userNotify->place($placeContent->author($id), $id);
            }
        }

        // In any case, we update the time when the post was last edited
        $place      = new Place();
        $place->lat = $coordinates->lat ? round($coordinates->lat, 5) : $placeData->lat;
        $place->lon = $coordinates->lon ? round($coordinates->lon, 5) : $placeData->lon;
        $place->updated_at = time();
        $placesModel->update($id, $place);

        return $this->respond((object) [
            'status'  => true,
            'content' => !empty($updatedContent) ? $updatedContent : $placeContent->content($id),
            'tags'    => $updatedTags
        ]);
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

        if (!$this->coordinatesAvailable) {
            $sortingFields = array_diff($sortingFields, ['distance']);
        }

        if ($country) {
            $placesModel->where(['country_id' => $country]);
        }

        if ($region) {
            $placesModel->where(['region_id' => $region]);
        }

        if ($district) {
            $placesModel->where(['district_id' => $district]);
        }

        if ($city) {
            $placesModel->where(['city_id' => $city]);
        }

        if ($category) {
            $placesModel->where(['places.category' => $category]);
        }

        if ($author) {
            $placesModel->where(['places.user_id' => $author]);
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