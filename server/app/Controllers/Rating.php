<?php namespace App\Controllers;

use App\Libraries\LocaleLibrary;
use App\Libraries\SessionLibrary;
use App\Libraries\ActivityLibrary;
use App\Models\PlacesModel;
use App\Models\RatingModel;
use App\Models\UsersModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;
use Exception;

class Rating extends ResourceController {

    protected SessionLibrary $session;

    public function __construct() {
        new LocaleLibrary();

        $this->session = new SessionLibrary();
    }

    /**
     * @param $id
     * @return ResponseInterface
     */
    public function show($id = null): ResponseInterface {
        $ratingModel = new RatingModel();
        $ratingData  = $ratingModel->select('value, session_id, user_id')->where(['place_id' => $id])->findAll();
        $response    = ['rating' => 0, 'count'  => 0];

        if (!$ratingData) {
            return $this->respond($response);
        }

        $response['count'] = count($ratingData);

        foreach ($ratingData as $item) {
            if ($item->session_id === $this->session->id || $item->user_id === $this->session->user?->id) {
                $response['vote'] = $item->value;
            }

            $response['rating'] += $item->value;
        }

        $response['rating'] = round($response['rating'] / $response['count'], 1);

        return $this->respond($response);
    }

    /**
     * Adding a new rating
     * @return ResponseInterface
     */
    public function set(): ResponseInterface {
        try {
            $input = $this->request->getJSON();

            if (empty($input) || !$input->place || !(int) $input->score) {
                return $this->failValidationErrors('Not enough data to change the rating');
            }

            $ratingModel = new RatingModel();
            $placesModel = new PlacesModel();
            $usersModel  = new UsersModel();
            $placesData  = $placesModel->select('id, user_id, rating, updated_at')->find($input->place);
            $usersData   = $usersModel->select('id, reputation, updated_at')->find($placesData->user_id);
            $ratingData  = $ratingModel->where('place_id', $placesData->id)->findAll();

            $inputRating  = (int) $input->score;
            $alreadyVoted = null; // Пользователь меняет свою оценку? Будем тут хранить ID записи рейтинга
            $ratingValue  = $inputRating;

            if (!$placesData) {
                return $this->failNotFound();
            }

            helper('rating');

            // Рассчитаем новую оценку для места
            if ($ratingData) {
                foreach ($ratingData as $item) {
                    if ($item->session_id === $this->session->id || $item->user_id === $this->session->user?->id) {
                        $alreadyVoted = $item->id;
                        continue;
                    }

                    $ratingValue += $item->value;
                }

                $ratingValue = $ratingValue
                    ? round($ratingValue / (count($ratingData) + ($alreadyVoted ? 0 : 1)), 1)
                    : null;
            }

            // Теперь изменим репутацию автора материала
            $userRating = $usersData->reputation + transformRating($inputRating);

            // Создаем новую модель рейтинга для сохранения
            $rating = new \App\Entities\Rating();
            $rating->place_id   = $input->place;
            $rating->user_id    = $this->session->user?->id ?? null;
            $rating->session_id = $this->session->id;
            $rating->value      = $inputRating;

            $usersModel->update($placesData->user_id, ['reputation' => $userRating, 'updated_at' => $usersData->updated_at]);
            $placesModel->update($placesData->id, ['rating' => $ratingValue, 'updated_at' => $placesData->updated_at]);

            // Редактируем оценку пользователя
            if ($alreadyVoted) {
                $ratingModel->update($alreadyVoted, ['value' => $inputRating]);
                return $this->respondUpdated();
            }

            // Добавляем новую оценку (пользователь ни разу не голосовал еще)
            $ratingModel->insert($rating);

            /* ACTIVITY */
            $activity = new ActivityLibrary();
            $activity->owner($placesData->user_id)->rating($placesData->id, $ratingModel->getInsertID());

            return $this->respondCreated();
        } catch (Exception $e) {
            log_message('error', '{exception}', ['exception' => $e]);

            return $this->failNotFound();
        }
    }
}