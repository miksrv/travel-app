<?php namespace App\Controllers;

use App\Libraries\EmailLibrary;
use App\Models\PlacesTagsModel;
use App\Models\SendingMail;
use App\Models\TagsModel;
use App\Models\UsersModel;
use CodeIgniter\I18n\Time;
use CodeIgniter\RESTful\ResourceController;
use Config\Services;
use ReflectionException;
use Exception;

set_time_limit(0);

class System extends ResourceController {
    /**
     * We recalculate and update the geotag tag usage counter
     * @return void
     * @throws ReflectionException
     */
    public function calculateTagsCount(): void {
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
    public function generateUsersOnline(): void {
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
    public function sendEmail(): void {
        $sendingEmailModel = new SendingMail();
        $sendingEmailData  = $sendingEmailModel
            ->select('activity.type, sending_mail.*')
            ->join('activity', 'activity.id = sending_mail.activity_id', 'left')
            ->where('status', 'created')
            ->orderBy('created_at', 'DESC')
            ->findAll();

        if (empty($sendingEmailData)) {
            return;
        }

        $emailLibrary = new EmailLibrary();

        foreach ($sendingEmailData as $item) {
            if (empty($item->email)) {
                $sendingEmailModel->update($item->id, ['status' => 'rejected']);

                continue ;
            }

            $locale  = $item->locale ?? 'ru';
            $subject = isset($item->type) && $item->type
                ? lang('SendingMail.emailSubject_' . $item->type , [], $locale)
                : $item->subject;

            $message = view('email', ['message' => 'Привет, как дела?']);

            try {
                $emailLibrary->send($item->email, $subject, $message);
                $sendingEmailModel->update($item->id, ['status' => 'completed']);
            } catch (Exception $e) {
                $sendingEmailModel->update($item->id, ['status' => 'error']);
            }
        }
    }
}