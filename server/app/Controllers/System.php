<?php

namespace App\Controllers;

use App\Libraries\EmailLibrary;
use App\Libraries\PlacesContent;
use App\Models\PlacesModel;
use App\Models\PlacesTagsModel;
use App\Models\SendingMail;
use App\Models\TagsModel;
use App\Models\UsersModel;
use CodeIgniter\I18n\Time;
use CodeIgniter\RESTful\ResourceController;
use ReflectionException;
use Exception;

set_time_limit(0);

const MONTH_EMAIL_LIMIT = 2000;
const DAY_EMAIL_LIMIT = 500;

class System extends ResourceController
{
    /**
     * We recalculate and update the geotag tag usage counter
     * @return void
     * @throws ReflectionException
     */
    public function calculateTagsCount(): void
    {
        $tagsModel      = new TagsModel();
        $placeTagsModel = new PlacesTagsModel();
        $updatedRows    = 0;

        if ($tagsData = $tagsModel->select('id, count')->findAll()) {
            foreach ($tagsData as $tag) {
                $count = $placeTagsModel->where('tag_id', $tag->id)->countAllResults();

                if ($tag->count !== $count) {
                    $tagsModel->update($tag->id, ['count' => $count]);
                    $updatedRows++;
                }
            }
        }

        echo $updatedRows;
    }

    /**
     * We update the activity time of some users to simulate that they are active on the site
     * @return void
     * @throws ReflectionException
     */
    public function generateUsersOnline(): void
    {
        $usersModel = new UsersModel();
        $usersData  = $usersModel->select('id, updated_at')->like('email', '%@geometki.com')->findAll();

        if (!$usersData) {
            return ;
        }

        $numItems   = ceil(count($usersData) * 0.3);
        $randomKeys = array_rand($usersData, $numItems);

        foreach ($randomKeys as $key) {
            $randomSeconds = rand(0, 5 * 60);
            $currentTime   = new Time("now -{$randomSeconds} seconds");

            $usersModel->update($usersData[$key]->id, [
                'updated_at'  => $usersData[$key]->updated_at,
                'activity_at' => $currentTime,
            ]);
        }
    }

    /**
     * @throws ReflectionException
     */
    public function sendEmail(): void
    {
        $sendingEmailModel = new SendingMail();
        $sendingEmailData  = $sendingEmailModel
            ->select('activity.type, activity.place_id, sending_mail.*')
            ->join('activity', 'activity.id = sending_mail.activity_id', 'left')
            ->where('sending_mail.status = "created"')
            ->where('sending_mail.created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)')
            ->orderBy('created_at', 'DESC')
            ->findAll();

        $monthEmailCount = $sendingEmailModel
            ->select('id')
            ->where('status = "completed"')
            ->where('created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)')
            ->countAllResults();

        /**
         * If you have exceeded the hoster's limits for sending emails, then we will not send anything.
         */
        if (empty($sendingEmailData)
            || $monthEmailCount >= MONTH_EMAIL_LIMIT
            || count($sendingEmailData) >= DAY_EMAIL_LIMIT)
        {
            return;
        }

        $placeContent = new PlacesContent(350);
        $emailLibrary = new EmailLibrary();
        $placesIds    = [];
        $placesData   = [];

        // Collect all places IDs
        foreach ($sendingEmailData as $item) {
            if ($item->place_id) {
                $placesIds[] = $item->place_id;
            }
        }

        // If we have collected IDs of places, we will get information about them from the database and download translations
        if ($placesIds) {
            $placesModel = new PlacesModel();
            $placesData  = $placesModel->select('id, photos')->whereIn('id', $placesIds)->findAll();
            $placeContent->translate($placesIds);
        }

        // We begin to sort through all unsent letters
        foreach ($sendingEmailData as $item) {
            /**
             * If there is no address where to send the letter,
             * OR if it is NOT a notification and there is no body of the letter, we immediately reject it
             */
            if (empty($item->email) || (empty($item->type) && !$item->message)) {
                $sendingEmailModel->update($item->id, ['status' => 'rejected']);

                continue ;
            }

            $locale  = $item->locale ?? 'ru';
            $message = '';
            $subject = isset($item->type) && $item->type
                ? lang('SendingMail.emailSubject_' . $item->type , [], $locale)
                : $item->subject;

            $findPlace = array_search($item->place_id, array_column($placesData, 'id'));

            /**
             * If the letter is a notification, then we look for an interesting place by its ID in a previously prepared
             * We will need the name of the geotag and the cover image
             */
            if ($findPlace !== false) {
                $placeId    = $placesData[$findPlace]->id;
                $placeTitle = $placeContent->title($placeId);
                $placeCover = $placesData[$findPlace]->photos && file_exists(UPLOAD_PHOTOS . $placeId . '/cover.jpg')
                    ? PATH_PHOTOS . $placeId . '/cover.jpg'
                    : null;

                $message .= "<h2>{$placeTitle}</h2>";
                $message .= "<p>{$subject}</p>";

                if ($placeCover) {
                    $emailLibrary->email->attach($placeCover);
                    $cid = $emailLibrary->email->setAttachmentCID($placeCover);

                    $message .= "<p><img src='cid:{$cid}' alt='{$placeTitle}' style='width: 100%'>";
                }
                $message .= '<p>' . lang('SendingMail.placeModified' , [], $locale) . '</p>';
                $message  = view('email', [
                    'message'     => $message,
                    'preheader'   => lang('SendingMail.placeModified' , [], $locale),
                    'actionText'  => lang('SendingMail.placeOpenText' , [], $locale),
                    'actionLink'  => 'https://geometki.com/places/' . $placeId,
                    'unsubscribe' => 'https://geometki.com/unsubscribe?mail=' . $item->id,
                ]);

            } else {
                $message = view('email', ['message' => $item->message]);
            }

            try {
                $emailLibrary->send($item->email, $subject, $message);
                $sendingEmailModel->update($item->id, ['status' => 'completed']);
            } catch (Exception $e) {
                log_message('error', '{exception}', ['exception' => $e]);
                $sendingEmailModel->update($item->id, ['status' => 'error']);
            }
        }
    }
}