<?php namespace App\Controllers;

use App\Libraries\LocaleLibrary;
use App\Models\PlacesModel;
use App\Models\SendingMail;
use App\Models\UsersModel;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;
use ReflectionException;

class Mail extends ResourceController {
    public function __construct() {
        new LocaleLibrary();
    }

    /**
     * @return ResponseInterface
     * @throws ReflectionException
     */
   public function unsubscribe(): ResponseInterface {
       $mail = $this->request->getGet('mail', FILTER_SANITIZE_SPECIAL_CHARS);

       if (!$mail) {
           return $this->failValidationErrors('Empty mail parameter');
       }

       $sendingEmailModel = new SendingMail();
       $sendingEmailData  = $sendingEmailModel
           ->select('sending_mail.id, activity_id, activity.place_id, activity.type')
           ->join('activity', 'activity.id = sending_mail.activity_id', 'left')
           ->find($mail);

       if (!$sendingEmailData) {
           return $this->failValidationErrors('No mail with this ID was found');
       }

       if (!$sendingEmailData->activity_id) {
           return $this->failValidationErrors('Тип письма, от которого вы хотите отписаться, не явлется рассылкой. Рассылка вам приходить не будет.');
       }

       $placeModel = new PlacesModel();
       $userModel  = new UsersModel();
       $placeData  = $placeModel->select('user_id')->find($sendingEmailData->place_id);
       $userData   = $userModel->select('settings, updated_at')->find($placeData->user_id);
       $configItem = $this->_mapActivityType($sendingEmailData->type);

       $settings = $userData->settings;
       $settings->{$configItem} = false;

       $userModel->update($placeData->user_id, ['settings' => json_encode((object) $settings), 'updated_at' => $userData->updated_at]);

       return $this->respond('Вы отписались от этого типа рассылки. Пожалуйста, проверте остальные типы подписок в своем личном кабинете.');
   }

   protected function _mapActivityType(string $activityType): string {
       return match ($activityType) {
           'comment' => 'emailComment',
           'edit'    => 'emailEdit',
           'photo'   => 'emailPhoto',
           'rating'  => 'emailRating',
           'cover'   => 'emailCover',

           default => '',
       };
   }
}