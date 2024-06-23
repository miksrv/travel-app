<?php namespace App\Controllers;

use App\Entities\Place;
use App\Libraries\Geocoder;
use App\Libraries\LocaleLibrary;
use App\Libraries\PlaceTags;
use App\Libraries\PlacesContent;
use App\Libraries\SessionLibrary;
use App\Libraries\ActivityLibrary;
use App\Models\ActivityModel;
use App\Models\PhotosModel;
use App\Models\PlacesModel;
use App\Models\PlacesTagsModel;
use App\Models\PlacesContentModel;
use App\Models\TagsModel;
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

    protected $model;

    public function __construct() {
        new LocaleLibrary();

        $this->model   = new PlacesModel();
        $this->session = new SessionLibrary();
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
                    $bookmarksPlacesIds[] = $bookmark->place_id;
                }
            }
        }

        // if filtering by tag ID
        if ($tag) {
            $tagModel = new TagsModel();
            $tagData  = $tagModel
                ->select('id')
                ->orWhere(['title_ru' => $tag, 'title_en' => $tag])
                ->first();

            if (!$tagData || !$tagData->id) {
                return $this->respond([
                    'items'  => [],
                    'count'  => 0,
                ]);
            }

            $placesTagsModel = new PlacesTagsModel();
            $placesTagsData  = $placesTagsModel
                ->select('place_id')
                ->where('tag_id', $tagData->id)
                ->groupBy('place_id')
                ->findAll();

            if (empty($placesTagsData)) {
                return $this->respond([
                    'items'  => [],
                    'count'  => 0,
                ]);
            }

            $tag = [];
            foreach ($placesTagsData as $item) {
                $tag[] = $item->place_id;
            }
        } else {
            $tag = [];
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

        $coordinates = $lat && $lon
            ? $this->model->makeDistanceSQL($lat, $lon)
            : $this->model->makeDistanceSQL($this->session->lat, $this->session->lon);

        if ($coordinates) {
            $this->coordinatesAvailable = true;
        }

        $this->model
            ->select('places.*, users.id as user_id, users.name as user_name, users.avatar as user_avatar,
                location_countries.title_en as country_en, location_countries.title_ru as country_ru, 
                location_regions.title_en as region_en, location_regions.title_ru as region_ru, 
                location_districts.title_en as district_en, location_districts.title_ru as district_ru, 
                location_localities.title_en as city_en, location_localities.title_ru as city_ru,
                category.title_en as category_en, category.title_ru as category_ru' . $coordinates)
            ->join('users', 'places.user_id = users.id', 'left')
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
        $placesList = $this->_makeListFilters($this->model, $searchPlacesIds)->get()->getResult();
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
            $avatar = $place->user_avatar ? explode('.', $place->user_avatar) : null;
            $return = [
                'id'        => $place->id,
                'lat'       => (float) $place->lat,
                'lon'       => (float) $place->lon,
                'rating'    => (float) $place->rating,
                'views'     => (int) $place->views,
                'photos'    => (int) $place->photos,
                'comments'  => (int) $place->comments,
                'bookmarks' => (int) $place->bookmarks,
                'title'     => $placeContent->title($place->id),
                'content'   => $placeContent->content($place->id),
                'category'  => [
                    'name'  => $place->category,
                    'title' => $place->{"category_$locale"},
                ],
                'author'    => [
                    'id'     => $place->user_id,
                    'name'   => $place->user_name,
                    'avatar' => $avatar
                        ? PATH_AVATARS . $place->user_id . '/' . $avatar[0] . '_small.' . $avatar[1]
                        : null
                ],
            ];

            if ($coordinates && $place->distance) {
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
            'count'  => $this->_makeListFilters($this->model, $searchPlacesIds)->countAllResults(),
        ]);
    }

    /**
     * @param $id
     * @return ResponseInterface
     * @throws ReflectionException
     * @throws \Exception
     */
    public function show($id = null): ResponseInterface {
        $locale = $this->request->getLocale();
        $lat    = $this->request->getGet('lat', FILTER_VALIDATE_FLOAT);
        $lon    = $this->request->getGet('lon', FILTER_VALIDATE_FLOAT);

        // Load translate library
        $placeContent = new PlacesContent();
        $placeContent->translate([$id]);

        if (!$placeContent->title($id)) {
            return $this->failNotFound();
        }

        $coordinates = $lat && $lon
            ? $this->model->makeDistanceSQL($lat, $lon)
            : $this->model->makeDistanceSQL($this->session->lat, $this->session->lon);

        $placeData = $this->model->getPlaceDataByID($id, $coordinates);

        if (!$placeData) {
            return $this->failNotFound();
        }

        // Collect tags
        $placesTagsModel = new PlacesTagsModel();
        $placeData->tags = $placesTagsModel->getAllTagsForPlaceById($id);

        $avatar = $placeData->user_avatar ? explode('.', $placeData->user_avatar) : null;
        $placeData->editors = $this->_editors($id, $placeData->user_id);
        $placeData->author  = [
            'id'       => $placeData->user_id,
            'name'     => $placeData->user_name,
            'activity' => $placeData->activity_at ? new \DateTime($placeData->activity_at) : null,
            'avatar'   => $avatar
                ? PATH_AVATARS . $placeData->user_id . '/' . $avatar[0] . '_small.' . $avatar[1]
                : null
        ];

        $placeData->category = [
            'name'  => $placeData->category,
            'title' => $placeData->{"category_$locale"},
        ];

        if ($placeData->photos && file_exists(UPLOAD_PHOTOS . $id . '/cover.jpg')) {
            $placeData->cover = [
                'full'    => PATH_PHOTOS . $id . '/cover.jpg',
                'preview' => PATH_PHOTOS . $id . '/cover_preview.jpg',
            ];
        }

        $placeData->address = (object) [];

        if ($coordinates && $placeData->distance) {
            $placeData->distance = round((float) $placeData->distance, 1);
        }

        $locations = [
            'country'   => ['country_id', 'country'],
            'region'    => ['region_id', 'region'],
            'district'  => ['district_id', 'district'],
            'locality'  => ['locality_id', 'city']
        ];

        foreach ($locations as $field => $ids) {
            if ($placeData->{$ids[0]}) {
                $placeData->address->{$field} = [
                    'id'    => $placeData->{$ids[0]},
                    'title' => $placeData->{$ids[1] . "_$locale"}
                ];
            }
        }

        if ($placeData->{"address_$locale"}) {
            $placeData->address->street = $placeData->{"address_$locale"};
        }

        if ($placeData->tags) {
            $tags = [];

            foreach ($placeData->tags as $tag) {
                $tags[] = $locale === 'en' && !empty($tag->title_en)
                    ? $tag->title_en
                    : (!empty($tag->title_ru) ? $tag->title_ru : $tag->title_en);
            }

            $placeData->tags = $tags;
        }

        $placeData->title   = $placeContent->title($id);
        $placeData->content = $placeContent->content($id);

        unset($placeData->user_id, $placeData->user_name, $placeData->user_avatar, $placeData->activity_at,
            $placeData->country_id, $placeData->region_id, $placeData->district_id, $placeData->locality_id,
            $placeData->address_en, $placeData->address_ru,
            $placeData->country_en, $placeData->country_ru,
            $placeData->region_en, $placeData->region_ru,
            $placeData->district_en, $placeData->district_ru,
            $placeData->city_en, $placeData->city_ru,
            $placeData->category_en, $placeData->category_ru,
        );

        // Incrementing view counter
        $this->model
            ->set('views', 'views + 1', false)
            ->set('updated_at', $placeData->updated)
            ->where('id', $placeData->id)
            ->update();

        return $this->respond($placeData);
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

        $placeTitle   = isset($input->title) ? strip_tags(html_entity_decode($input->title)) : null;
        $placeContent = isset($input->content) ? strip_tags(html_entity_decode($input->content)) : null;

        $existingPlace = $this->model
            ->select('id')
            ->where(['user_id' => $this->session->user?->id, 'lat' => $input->lat, 'lon' => $input->lon])
            ->first();

        if ($existingPlace) {
            return $this->respondCreated(['id' => $existingPlace->id]);
        }

        $placeTags = new PlaceTags();
        $geocoder  = new Geocoder();
        $place     = new \App\Entities\Place();

        $geocoder->coordinates($input->lat, $input->lon);

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

        $this->model->insert($place);

        $newPlaceId = $this->model->getInsertID();

        if (!empty($input->tags)) {
            $placeTags->saveTags($input->tags, $newPlaceId);
        }

        try {
            $placesContentModel = new PlacesContentModel();

            $content = new \App\Entities\PlaceContent();
            $content->place_id = $newPlaceId;
            $content->language = 'ru';
            $content->user_id  = $this->session->user?->id;
            $content->title    = $placeTitle;
            $content->content  = $placeContent;

            $placesContentModel->insert($content);
        } catch (Exception $e) {
            $this->model->delete($newPlaceId);

            log_message('error', '{exception}', ['exception' => $e]);

            return $this->failValidationErrors(lang('Places.createFailError'));
        }


        $activity = new ActivityLibrary();
        $activity->place($newPlaceId);

        return $this->respondCreated(['id' => $newPlaceId]);
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
        $placeContent = new PlacesContent();
        $activity     = new ActivityLibrary();
        $placeData    = $this->model->find($id);

        $placeContent->translate([$id]);

        if (!$placeContent->title($id) || !$placeData) {
            return $this->failValidationErrors('There is no point with this ID');
        }

        // Save place tags
        $updatedTags    = isset($input->tags) ? $placeTags->saveTags($input->tags, $id) : null;
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
            if ($placeContent->author($id) === $this->session->user?->id && $placeContent->locale($id) === $locale) {
                $time = new Time('now');
                $diff = $time->difference($placeContent->updated($id));

                // If the last time a user edited this content was less than or equal to 3 months,
                // then we will simply update the data and will not add a new version
                if (abs($diff->getMonths()) <= 3) {
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

        $this->model->update($id, $place);

        $return = ['content' => !empty($updatedContent) ? $updatedContent : $placeContent->content($id)];

        if (isset($input->tags)) {
            $return['tags'] = $updatedTags;
        }

        return $this->respond($return);
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
            return $this->failValidationErrors(lang('Places.coverIncorrectData'));
        }

        if ($input->width < PLACE_COVER_WIDTH || $input->height < PLACE_COVER_HEIGHT) {
            return $this->failValidationErrors(lang('Places.coverFailDimensions'));
        }

        $photosModel = new PhotosModel();
        $placeData   = $this->model->select('id, user_id')->find($id);
        $photoData   = $photosModel->select('id, filename, extension')->find($input->photoId);

        if (!$placeData || !$photoData) {
            return $this->failValidationErrors(lang('Places.coverPointNotExist'));
        }

        $photoDir = UPLOAD_PHOTOS . $id . '/';
        $file = new File($photoDir . $photoData->filename . '.' . $photoData->extension);

        list($width, $height) = getimagesize($file->getRealPath());

        if ($input->width > $width || $input->height > $height) {
            return $this->failValidationErrors(lang('Places.coverExceedDimensions'));
        }

        $image = Services::image('gd'); // imagick
        $image->withFile($file->getRealPath())
            ->crop($input->width, $input->height, $input->x, $input->y)
            ->fit(PLACE_COVER_WIDTH, PLACE_COVER_HEIGHT)
            ->save($photoDir . 'cover.jpg');

        $image->withFile($file->getRealPath())
            ->fit(PLACE_COVER_PREVIEW_WIDTH, PLACE_COVER_PREVIEW_HEIGHT)
            ->save($photoDir . '/cover_preview.jpg');

        $this->model->update($id, ['updated_at' => new Time('now')]);

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
        $sortingFields = ['views', 'rating', 'comments', 'bookmarks', 'category', 'distance', 'created_at', 'updated_at'];
        $orderFields   = ['ASC', 'DESC'];

        $sort     = $this->request->getGet('sort', FILTER_SANITIZE_SPECIAL_CHARS);
        $author   = $this->request->getGet('author', FILTER_SANITIZE_SPECIAL_CHARS);
        $exclude  = $this->request->getGet('excludePlaces', FILTER_SANITIZE_SPECIAL_CHARS);
        $order    = $this->request->getGet('order', FILTER_SANITIZE_SPECIAL_CHARS) ?? $orderDefault;
        $country  = $this->request->getGet('country', FILTER_SANITIZE_NUMBER_INT);
        $region   = $this->request->getGet('region', FILTER_SANITIZE_NUMBER_INT);
        $district = $this->request->getGet('district', FILTER_SANITIZE_NUMBER_INT);
        $locality = $this->request->getGet('locality', FILTER_SANITIZE_NUMBER_INT);
        $limit    = abs($this->request->getGet('limit', FILTER_SANITIZE_NUMBER_INT) ?? 20);
        $offset   = abs($this->request->getGet('offset', FILTER_SANITIZE_NUMBER_INT) ?? 0);
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

        return $placesModel->limit(min($limit, 40), $offset);
    }

    /**
     * @param string $placeId
     * @param string $excludeUserId
     * @return array
     */
    protected function _editors(string $placeId, string $excludeUserId): array {
        $model = new ActivityModel();
        $data  = $model->gePlaceEditors($placeId, $excludeUserId);

        if (empty($data)) {
            return [];
        }

        foreach ($data as $user) {
            $avatar = $user->avatar ? explode('.', $user->avatar) : null;
            $user->avatar = $avatar
                ? PATH_AVATARS . $user->id . '/' . $avatar[0] . '_small.' . $avatar[1]
                : null;
        }


        return $data;
    }
}