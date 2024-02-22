<?php namespace App\Controllers;

use App\Entities\Place;
use App\Libraries\Geocoder;
use App\Libraries\LocaleLibrary;
use App\Libraries\PlaceTags;
use App\Libraries\PlacesContent;
use App\Libraries\SessionLibrary;
use App\Libraries\ActivityLibrary;
use App\Models\PhotosModel;
use App\Models\PlacesModel;
use App\Models\PlacesTagsModel;
use App\Models\RatingModel;
use App\Models\PlacesContentModel;
use App\Models\UsersBookmarksModel;
use CodeIgniter\Files\File;
use CodeIgniter\I18n\Time;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;
use Config\Services;
use Geocoder\Exception\Exception;
use ReflectionException;

class Places extends ResourceController {
    protected bool $coordinatesAvailable = false;

    protected SessionLibrary $session;

    public function __construct() {
        new LocaleLibrary();

        $this->session = new SessionLibrary();
    }

    public function random(): ResponseInterface{
        $placesModel = new PlacesModel();
        $placesData  = $placesModel
            ->select('id')
            ->orderBy('id', 'RANDOM')
            ->first();

        return $this->respond(['id' => $placesData->id]);
    }

    /**
     * @return ResponseInterface
     * @throws \Exception
     * @example GET /places?sort=rating&order=ASC&category=historic&limit=20&offset=1
     */
    public function list(): ResponseInterface {
        $bookmarksUser = $this->request->getGet('bookmarkUser', FILTER_SANITIZE_SPECIAL_CHARS);
        $lat    = $this->request->getGet('lat', FILTER_VALIDATE_FLOAT);
        $lon    = $this->request->getGet('lon', FILTER_VALIDATE_FLOAT);
        $tag    = $this->request->getGet('tag', FILTER_SANITIZE_SPECIAL_CHARS);
        $search = $this->request->getGet('search', FILTER_SANITIZE_SPECIAL_CHARS);
        $locale = $this->request->getLocale();
        $bookmarksPlacesIds = [];

        // if filtering of interesting places by user bookmark is specified,
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

        // if filtering by tag ID
        if ($tag) {
            $placesTagsModel = new PlacesTagsModel();
            $placesTagsData  = $placesTagsModel
                ->select('place_id')
                ->where('tag_id', $tag)
                ->groupBy('place_id')
                ->findAll();

            if (!empty($placesTagsData)) {
                $tag = [];

                foreach ($placesTagsData as $item) {
                    $tag[] = $item->place_id;
                }
            } else {
                return $this->respond([
                    'items'  => [],
                    'count'  => 0,
                ]);
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
        $placeContent = new PlacesContent(350);

        // When searching, we search by criteria in the translation array to return object IDs
        if ($search) {
            $placeContent->search($search);

            // At the same time, if we did not find anything based on the search conditions,
            // we immediately return an empty array and do not execute the code further
            if (empty($placeContent->placeIds)) {
                return $this->respond([
                    'items'  => [],
                    'count'  => 0,
                ]);
            }
        }

        if ($lat && $lon) {
            $distanceSelect = ", 6378 * 2 * ASIN(SQRT(POWER(SIN(($lat - abs(lat)) * pi()/180 / 2), 2) +  COS($lat * pi()/180 ) * COS(abs(lat) * pi()/180) *  POWER(SIN(($lon - lon) * pi()/180 / 2), 2) )) AS distance";
        } else {
            $distanceSelect = $this->session->lon && $this->session->lat
                ? ", 6378 * 2 * ASIN(SQRT(POWER(SIN(({$this->session->lat} - abs(places.lat)) * pi()/180 / 2), 2) +  COS({$this->session->lat} * pi()/180 ) * COS(abs(places.lat) * pi()/180) *  POWER(SIN(({$this->session->lon} - places.lon) * pi()/180 / 2), 2) )) AS distance"
                : '';
        }

        if ($distanceSelect) {
            $this->coordinatesAvailable = true;
        }

        $placesModel = new PlacesModel();
        $placesModel
            ->select('places.id, places.category, places.lat, places.lon, places.rating, places.views,
                places.photos, places.country_id, places.region_id, places.district_id, places.locality_id, 
                places.updated_at,
                location_countries.title_en as country_en, location_countries.title_ru as country_ru, 
                location_regions.title_en as region_en, location_regions.title_ru as region_ru, 
                location_districts.title_en as district_en, location_districts.title_ru as district_ru, 
                location_localities.title_en as city_en, location_localities.title_ru as city_ru,
                category.title_en as category_en, category.title_ru as category_ru' .
                $distanceSelect)
            ->join('location_countries', 'location_countries.id = places.country_id', 'left')
            ->join('location_regions', 'location_regions.id = places.region_id', 'left')
            ->join('location_districts', 'location_districts.id = places.district_id', 'left')
            ->join('location_localities', 'location_localities.id = places.locality_id', 'left')
            ->join('category', 'places.category = category.name', 'left');

        // If search or any other filter is not used, then we always use an empty array
        $searchPlacesIds = !$search && !$bookmarksUser && !$tag
            ? []
            : array_unique(array_merge($placeContent->placeIds, $bookmarksPlacesIds, $tag));

        // Find all places
        // If a search was enabled, the second argument to the _makeListFilters function will contain the
        // IDs of the places found using the search criteria
        $placesList = $this->_makeListFilters($placesModel, $searchPlacesIds)->get()->getResult();
        $placesIds  = [];
        $response   = [];
        foreach ($placesList as $place) {
            $placesIds[] = $place->id;
        }

        // We find translations for all objects if no search was used.
        // When searching, we already know translations for all found objects
        if (!$search) {
            $placeContent->translate($placesIds);
        }

        // Mapping places to array list
        foreach ($placesList as $place) {
            $return  = [
                'id'        => $place->id,
                'lat'       => (float) $place->lat,
                'lon'       => (float) $place->lon,
                'rating'    => (float) $place->rating,
                'views'     => (int) $place->views,
                'photos'    => (int) $place->photos,
                'title'     => $placeContent->title($place->id),
                'content'   => $placeContent->content($place->id),
                'updated'   => new \DateTime($place->updated_at),
                'category'  => [
                    'name'  => $place->category,
                    'title' => $place->{"category_$locale"},
                ]
            ];

            if ($distanceSelect && $place->distance) {
                $return['distance'] = round((float) $place->distance, 1);
            }

            if ($place->country_id) {
                $return['address']['country'] = [
                    'id'    => (int) $place->country_id,
                    'title' => $place->{"country_$locale"}
                ];
            }

            if ($place->region_id) {
                $return['address']['region'] = [
                    'id'    => (int) $place->region_id,
                    'title' => $place->{"region_$locale"}
                ];
            }

            if ($place->district_id) {
                $return['address']['district'] = [
                    'id'    => (int) $place->district_id,
                    'title' => $place->{"district_$locale"}
                ];
            }

            if ($place->locality_id) {
                $return['address']['locality'] = [
                    'id'    => (int) $place->locality_id,
                    'title' => $place->{"city_$locale"}
                ];
            }

            // Place cover
            if ($place->photos && file_exists(UPLOAD_PHOTOS . $place->id . '/cover.jpg')) {
                $return['cover'] = [
                    'full'    => PATH_PHOTOS . $place->id . '/cover.jpg',
                    'preview' => PATH_PHOTOS . $place->id . '/cover_preview.jpg',
                ];
            }

            $response[] = $return;
        }

        return $this->respond([
            'items'  => $response,
            'count'  => $this->_makeListFilters($placesModel, $searchPlacesIds)->countAllResults(),
        ]);
    }

    /**
     * @param $id
     * @return ResponseInterface
     * @throws ReflectionException
     */
    public function show($id = null): ResponseInterface {
        $locale = $this->request->getLocale();

        // Load translate library
        $placeContent = new PlacesContent();
        $placeContent->translate([$id]);

        if (!$placeContent->title($id)) {
            return $this->failNotFound();
        }

        $distanceSelect = ($this->session->lon && $this->session->lat)
            ? ", 6378 * 2 * ASIN(SQRT(POWER(SIN(({$this->session->lat} - abs(places.lat)) * pi()/180 / 2), 2) +  COS({$this->session->lat} * pi()/180 ) * COS(abs(places.lat) * pi()/180) *  POWER(SIN(({$this->session->lon} - places.lon) * pi()/180 / 2), 2) )) AS distance"
            : '';

        $placesTagsModel = new PlacesTagsModel();
        $placesModel = new PlacesModel();
        $placeData   = $placesModel
            ->select(
                'places.*,
                    users.id as user_id, users.name as user_name, users.avatar as user_avatar,
                    location_countries.title_en as country_en, location_countries.title_ru as country_ru, 
                    location_regions.title_en as region_en, location_regions.title_ru as region_ru, 
                    location_districts.title_en as district_en, location_districts.title_ru as district_ru, 
                    location_localities.title_en as city_en, location_localities.title_ru as city_ru,
                    category.title_ru as category_ru, category.title_en as category_en' .
                $distanceSelect)
            ->join('users', 'places.user_id = users.id', 'left')
            ->join('category', 'places.category = category.name', 'left')
            ->join('location_countries', 'location_countries.id = places.country_id', 'left')
            ->join('location_regions', 'location_regions.id = places.region_id', 'left')
            ->join('location_districts', 'location_districts.id = places.district_id', 'left')
            ->join('location_localities', 'location_localities.id = places.locality_id', 'left')
            ->find($id);

        if (!$placeData) {
            return $this->failNotFound();
        }

        // Collect tags
        $placeData->tags = $placesTagsModel
            ->join('tags', 'tags.id = places_tags.tag_id')
            ->where(['place_id' => $placeData->id])
            ->findAll();

        // Has the user already voted for this material or not?
        $ratingModel = new RatingModel();
        $ratingData  = $ratingModel
            ->select('id')
            ->where(['place_id' => $placeData->id, 'session_id' => $this->session->id])
            ->first();

        $avatar   = $placeData->user_avatar ? explode('.', $placeData->user_avatar) : null;
        $response = [
            'id'        => $placeData->id,
            'created'   => $placeData->created_at ?? null,
            'updated'   => $placeData->updated_at ?? null,
            'lat'       => (float) $placeData->lat,
            'lon'       => (float) $placeData->lon,
            'rating'    => (float) $placeData->rating,
            'views'     => (int) $placeData->views,
            'photos'    => (int) $placeData->photos,
            'title'     => $placeContent->title($id),
            'content'   => $placeContent->content($id),
            'author'    => [
                'id'     => $placeData->user_id,
                'name'   => $placeData->user_name,
                'avatar' => $avatar
                    ? PATH_AVATARS . $placeData->user_id . '/' . $avatar[0] . '_small.' . $avatar[1]
                    : null
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

        if ($this->session->lon && $this->session->lat) {
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

        if ($placeData->locality_id) {
            $response['address']['locality'] = [
                'id'    => $placeData->locality_id,
                'title' => $placeData->{"city_$locale"}
            ];
        }

        // Place cover
        if ($placeData->photos && file_exists(UPLOAD_PHOTOS . $id . '/cover.jpg')) {
            $response['cover'] = [
                'full'    => PATH_PHOTOS . $id . '/cover.jpg',
                'preview' => PATH_PHOTOS . $id . '/cover_preview.jpg',
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
    }

    /**
     * Create new place
     * @return ResponseInterface
     * @throws ReflectionException
     * @throws Exception
     */
    public function create(): ResponseInterface {
        if (!$this->session->isAuth) {
            return $this->failUnauthorized();
        }

        $input = $this->request->getJSON();
        $rules = [
            'title'    => 'required|min_length[8]|max_length[200]',
            'category' => 'required|is_not_unique[category.name]',
            'lat'      => 'numeric|min_length[3]',
            'lon'      => 'numeric|min_length[3]',
        ];

        if (!$this->validateData((array) $input, $rules)) {
            return $this->failValidationErrors($this->validator->getErrors());
        }

        $placeTags    = new PlaceTags();
        $placesModel  = new PlacesModel();

        $geocoder = new Geocoder();
        $place    = new \App\Entities\Place();

        $geocoder->coordinates($input->lat, $input->lon);

        $placeTitle   = isset($input->title) ? strip_tags(html_entity_decode($input->title)) : null;
        $placeContent = isset($input->content) ? strip_tags(html_entity_decode($input->content)) : null;

        $place->lat         = $input->lat;
        $place->lon         = $input->lon;
        $place->user_id     = $this->session->user?->id;
        $place->category    = $input->category;
        $place->address_en  = $geocoder->addressEn;
        $place->address_ru  = $geocoder->addressRu;
        $place->country_id  = $geocoder->countryId;
        $place->region_id   = $geocoder->regionId;
        $place->district_id = $geocoder->districtId;
        $place->locality_id = $geocoder->localityId;

        $placesModel->insert($place);

        $newPlaceId = $placesModel->getInsertID();

        if (!empty($input->tags)) {
            $placeTags->saveTags($input->tags, $newPlaceId);
        }

        $placesContentModel = new PlacesContentModel();

        $content = new \App\Entities\PlaceContent();
        $content->place_id = $newPlaceId;
        $content->language = 'ru';
        $content->user_id  = $this->session->user?->id;
        $content->title    = $placeTitle;
        $content->content  = $placeContent;

        $placesContentModel->insert($content);

        $activity = new ActivityLibrary();
        $activity->place($newPlaceId);

        return $this->respondCreated((object) ['id' => $newPlaceId]);
    }

    /**
     * Update place content by ID
     * @param $id
     * @return ResponseInterface
     * @throws ReflectionException
     * @throws Exception
     */
    public function update($id = null): ResponseInterface {
        if (!$this->session->isAuth) {
            return $this->failUnauthorized();
        }

        $locale = $this->request->getLocale();
        $input  = $this->request->getJSON();
        $rules  = [
            'title'    => 'if_exist|required|min_length[8]|max_length[200]',
            'category' => 'if_exist|required|is_not_unique[category.name]',
            'lat'      => 'if_exist|numeric|min_length[3]',
            'lon'      => 'if_exist|numeric|min_length[3]',
        ];

        if (!$this->validateData((array) $input, $rules)) {
            return $this->failValidationErrors($this->validator->getErrors());
        }

        $placeTags    = new PlaceTags();
        $placesModel  = new PlacesModel();
        $placeContent = new PlacesContent();
        $activity     = new ActivityLibrary();
        $placeData    = $placesModel->find($id);

        $placeContent->translate([$id]);

        if (!$placeContent->title($id) || !$placeData) {
            return $this->failValidationErrors('There is no point with this ID');
        }

        // Save place tags
        $updatedTags    = $placeTags->saveTags($input->tags ?? [], $id);
        $updatedContent = isset($input->content) ? strip_tags(html_entity_decode($input->content)) : null;
        $updatedTitle   = isset($input->title) ? strip_tags(html_entity_decode($input->title)) : null;

        // Save place content
        if ($updatedContent || $updatedTitle) {
            $contentModel = new PlacesContentModel();
            $placeEntity  = new \App\Entities\PlaceContent();
            $placeEntity->locale   = $locale;
            $placeEntity->place_id = $id;
            $placeEntity->user_id  = $this->session->user?->id;
            $placeEntity->title    = !empty($updatedTitle) ? $updatedTitle : $placeContent->title($id);
            $placeEntity->content  = !empty($updatedContent) ? $updatedContent : $placeContent->content($id);

            if ($updatedContent) {
                $placeEntity->delta = strlen($updatedContent) - strlen($placeContent->content($id));
            }

            // If the author of the last edit is the same as the current one,
            // then you need to check when the content was last edited
            if ($placeContent->author($id) === $this->session->user?->id) {
                $time = new Time('now');
                $diff = $time->difference($placeContent->updated($id));

                // If the last time a user edited this content was less than or equal to 30 minutes,
                // then we will simply update the data and will not add a new version
                if (abs($diff->getMinutes()) <= 30) {
                    $contentModel->update($placeContent->id($id), $placeEntity);
                } else {
                    $contentModel->insert($placeEntity);
                    $activity->owner($placeData->user_id)->edit($id);
                }
            } else {
                $contentModel->insert($placeEntity);
                $activity->owner($placeData->user_id)->edit($id);
            }
        }

        // In any case, we update the time when the post was last edited
        $place = new Place();
        $place->updated_at = time();

        $lat = isset($input->lat) ? round($input->lat, 6) : $placeData->lat;
        $lon = isset($input->lon) ? round($input->lon, 6) : $placeData->lon;

        // Check and update coordinates, address and location
        if ($lat !== $placeData->lat || $lon !== $placeData->lon) {
            $geocoder = new Geocoder();
            $geocoder->coordinates($lat, $lon);

            $place->lat = $lat;
            $place->lon = $lon;
            $place->address_ru  = $geocoder->addressRu;
            $place->address_en  = $geocoder->addressEn;
            $place->country_id  = $geocoder->countryId;
            $place->region_id   = $geocoder->regionId;
            $place->district_id = $geocoder->districtId;
            $place->locality_id = $geocoder->localityId;
        }

        // Change category
        if (isset($input->category)) {
            $place->category = $input->category;
        }

        $placesModel->update($id, $place);

        return $this->respond((object) [
            'content' => !empty($updatedContent) ? $updatedContent : $placeContent->content($id),
            'tags'    => $updatedTags
        ]);
    }

    /**
     * @throws ReflectionException
     */
    public function cover($id = null): ResponseInterface {
        if (!$this->session->isAuth) {
            return $this->failUnauthorized();
        }

        $input = $this->request->getJSON();

        if (!isset($input->x) || !isset($input->y) || !$input->photoId || !$input->width || !$input->height) {
            return $this->failValidationErrors('Incorrect data format when saving cover image');
        }

        if ($input->width < PLACE_COVER_WIDTH || $input->height < PLACE_COVER_HEIGHT) {
            return $this->failValidationErrors('The width and length measurements are not correct, they are less than the minimum values');
        }

        $placesModel = new PlacesModel();
        $photosModel = new PhotosModel();
        $placeData   = $placesModel->select('id, user_id')->find($id);
        $photoData   = $photosModel->select('id, filename, extension')->find($input->photoId);

        if (!$placeData || !$photoData) {
            return $this->failValidationErrors('There is no point with this ID');
        }

        $photoDir = UPLOAD_PHOTOS . $id . '/';
        $file = new File($photoDir . $photoData->filename . '.' . $photoData->extension);

        list($width, $height) = getimagesize($file->getRealPath());

//        if ($input->width > $width || $input->height > $height) {
//            return $this->failValidationErrors('The cover dimensions cannot exceed the image dimensions');
//        }

        $image = Services::image('gd'); // imagick
        $image->withFile($file->getRealPath())
            ->crop($input->width, $input->height, $input->x, $input->y)
            ->save($photoDir . 'cover.jpg');

        $image->withFile($file->getRealPath())
            ->fit(PLACE_COVER_PREVIEW_WIDTH, PLACE_COVER_PREVIEW_HEIGHT, 'center')
            ->save($photoDir . '/cover_preview.jpg');

        $placesModel->update($id, ['updated_at' => new Time('now')]);

        $userActivity = new ActivityLibrary();
        $userActivity->owner($placeData->user_id)->cover($id);

        return $this->respondUpdated();
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
        $locality = $this->request->getGet('locality', FILTER_SANITIZE_NUMBER_INT);
        $limit    = $this->request->getGet('limit', FILTER_SANITIZE_NUMBER_INT) ?? 20;
        $offset   = $this->request->getGet('offset', FILTER_SANITIZE_NUMBER_INT) ?? 0;
        $category = $this->request->getGet('category', FILTER_SANITIZE_SPECIAL_CHARS);

        if (!$this->coordinatesAvailable) {
            $sortingFields = array_diff($sortingFields, ['distance']);
        }

        if ($country) {
            $placesModel->where(['places.country_id' => $country]);
        }

        if ($region) {
            $placesModel->where(['places.region_id' => $region]);
        }

        if ($district) {
            $placesModel->where(['places.district_id' => $district]);
        }

        if ($locality) {
            $placesModel->where(['places.locality_id' => $locality]);
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
            $sort = $sort === 'created_at' ? 'places.created_at' : $sort;
            $placesModel->orderBy($sort, in_array($order, $orderFields) ? $order : $orderDefault);
        }

        return $placesModel->limit($limit <= 0 || $limit > 21 ? 21 : $limit, abs($offset));
    }
}