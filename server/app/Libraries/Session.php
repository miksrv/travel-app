<?php namespace App\Libraries;

use App\Entities\User;
use App\Models\SessionsHistoryModel;
use App\Models\SessionsModel;
use Config\Services;
use ReflectionException;

class Session {

    public string $id;
    public float | null $latitude = null;
    public float | null $longitude = null;
    public User | null $userData;
    private SessionsModel $sessionModel;

    private string $ip;
    private string $ua;

    /**
     * Обновляет текущую сессию пользователя по его IP и User Agent, возвращает ID сессии в БД
     * @param float|null $latitude
     * @param float|null $longitude
     * @throws ReflectionException
     */
    public function __construct(float $latitude = null, float $longitude = null) {
        helper('jwt');

        $request = Services::request();
        $header  = $request->getServer('HTTP_AUTHORIZATION') ?? null;

        $this->userData = validateJWTFromRequest($header);
        $this->sessionModel = new SessionsModel();

        $this->ip = $request->getIPAddress();
        $this->ua = $request->getUserAgent()->getAgentString();

        $findSession = $this->sessionModel
            ->where(['user_ip' => $this->ip, 'user_agent' => $this->ua])
            ->first();

        if ($findSession && $findSession->id) {
            $this->id = $findSession->id;
            $this->latitude  = $findSession->latitude;
            $this->longitude = $findSession->longitude;
        }

        // Если сессии в БД с такими IP и UA нет, то добавляем новую
        if (!$findSession || !$findSession->id) {
            $sessionData = (object) [
                'id'         => md5($this->ip . $this->ua),
                'user_id'    => $this->userData->id ?? null,
                'user_ip'    => $this->ip,
                'user_agent' => $this->ua,
                'latitude'   => $latitude,
                'longitude'  => $longitude
            ];

            $this->sessionModel->insert($sessionData);
            $this->_saveSessionHistory(
                $sessionData->id,
                $latitude,
                $longitude
            );

            $this->latitude  = $latitude;
            $this->longitude = $longitude;
            $this->id = $sessionData->id;

            return $sessionData->id;
        }

        // Если сессия уже есть в БД и положение сейчас отличается от того, что было сохранено,
        // То создается новая запись в истории сессий
        if (($latitude && $longitude) &&
            ($latitude !== $this->latitude || $longitude !== $this->longitude)
        ) {
            $this->_saveSessionHistory(
                $this->id,
                $latitude,
                $longitude
            );
        }

        $this->latitude  = $latitude ?? $this->latitude;
        $this->longitude = $longitude ?? $this->longitude;

        // В любом случае обновляем текущую сессию
        $this->sessionModel->update($this->id, [
            'latitude'  => $this->latitude,
            'longitude' => $this->longitude,
            'user_id'   => $this->userData->id ?? $findSession->user ?? null,
        ]);

        return $this->id;
    }

    /**
     * @param string $userId
     * @return void
     * @throws ReflectionException
     */
    public function saveUserSession(string $userId): void {
        if ($this->id && $userId) {
            $this->sessionModel->update($this->id, ['user_id' => $userId]);
        }
    }

    /**
     * Сохраняем сессию в истории
     * @param string $session
     * @param float|null $latitude
     * @param float|null $longitude
     * @return string|null
     * @throws ReflectionException
     */
    protected function _saveSessionHistory(string $session, float | null $latitude, float | null $longitude): ?string {
        try {
            $historyModel = new SessionsHistoryModel();

            $historyModel->insert([
                'session'   => $session,
                'latitude'  => $latitude ?? null,
                'longitude' => $longitude ?? null
            ]);

            return $historyModel->getInsertID();
        } catch (Exception $e) {
            log_message('error', '{exception}', ['exception' => $e]);
            return null;
        }
    }
}