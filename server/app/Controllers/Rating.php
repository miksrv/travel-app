<?php namespace App\Controllers;

use App\Libraries\Session;
use App\Libraries\UserActivity;
use App\Libraries\UserNotify;
use App\Models\PlacesModel;
use App\Models\RatingModel;
use App\Models\UsersModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;
use ReflectionException;

class Rating extends ResourceController {

    /**
     * @param $id
     * @return ResponseInterface
     */
    public function show($id = null): ResponseInterface {
        try {
            $session     = new Session();
            $ratingModel = new RatingModel();
            $ratingData  = $ratingModel->select('value, session_id, user_id')->where(['place_id' => $id])->findAll();
            $response    = ['rating' => 0, 'count'  => 0];

            if (!$ratingData) {
                return $this->respond($response);
            }

            $response['count'] = count($ratingData);

            foreach ($ratingData as $item) {
                if ($item->session_id === $session->id || $item->user_id === $session?->userId) {
                    $response['vote'] = $item->value;
                }

                $response['rating'] += $item->value;
            }

            $response['rating'] = round($response['rating'] / $response['count'], 1);

            return $this->respond($response);
        } catch (Exception $e) {
            log_message('error', '{exception}', ['exception' => $e]);

            return $this->failServerError();
        }
    }

    /**
     * Adding a new rating
     * @return ResponseInterface
     * @throws ReflectionException
     */
    public function set(): ResponseInterface {
        try {
            $input = $this->request->getJSON();

            if (empty($input) || !$input->place || !(int) $input->score) {
                return $this->failValidationErrors('Not enough data to change the rating');
            }

            $session     = new Session();
            $ratingModel = new RatingModel();
            $placesModel = new PlacesModel();
            $usersModel  = new UsersModel();
            $placesData  = $placesModel->select('id, user_id, rating, updated_at')->find($input->place);
            $usersData   = $usersModel->select('id, reputation, updated_at')->find($placesData->user_id);
            $ratingData  = $ratingModel->where('place_id', $placesData->id)->findAll();

            $inputRating  = (int) $input->score;
            $ratingValue  = $inputRating;
            $alreadyVoted = null; // Пользователь меняет свою оценку? Будем тут хранить ID записи рейтинга

            if (!$placesData) {
                return $this->failNotFound();
            }

            // Рассчитаем новую оценку для места
            if ($ratingData) {
                foreach ($ratingData as $item) {
                    if ($item->session_id === $session->id || $item->user_id === $session?->userId) {
                        $alreadyVoted = $item->id;
                    }

                    $ratingValue += $item->value;
                }

                $ratingValue = round($ratingValue / (count($ratingData) + 1), 1);
            }

            // Теперь изменим репутацию автора материала
            $userRating = $usersData->reputation + ($inputRating > 2 ? 1 : -1);

            // Создаем новую модель рейтинга для сохранения
            $rating = new \App\Entities\Rating();
            $rating->place_id   = $input->place;
            $rating->user_id    = $session->userId ?? null;
            $rating->session_id = $session->id;
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
            if ($session->isAuth) {
                $userActivity = new UserActivity();
                $userActivity->rating($placesData->id, $ratingModel->getInsertID());
            }

            /* NOTIFICATIONS */
            // If a user gives a rating to a material that is not his own,
            // we will send a notification to the author of the material about the change in the rating of his place
            $userNotify = new UserNotify();
            if (!$session->isAuth || $placesData->user_id !== $session->userId) {
                $userNotify->rating($placesData->user_id, $placesData->id);
            }

            return $this->respondCreated();
        } catch (Exception $e) {
            log_message('error', '{exception}', ['exception' => $e]);

            return $this->failNotFound();
        }
    }
}