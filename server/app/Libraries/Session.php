<?php namespace App\Libraries;

use App\Entities\User;
use App\Models\SessionsHistoryModel;
use App\Models\SessionsModel;
use Config\Services;
use ReflectionException;

class Session {
    public string $id;
    public float | null $lat = null;
    public float | null $lng = null;
    public string | null $userId = null;
    public bool $isAuth = false;
    public User | null $userData;
    private SessionsModel $sessionModel;

    private string $ip;
    private string $ua;

    /**
     * Обновляет текущую сессию пользователя по его IP и User Agent, возвращает ID сессии в БД
     * @param float|null $lat
     * @param float|null $lng
     * @throws ReflectionException
     */
    public function __construct(float $lat = null, float $lng = null) {
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

        if ($this->userData && $this->userData->id) {
            $this->isAuth = true;
            $this->userId = $this->userData->id;
        }

        if ($findSession && $findSession->id) {
            $this->id     = $findSession->id;
            $this->lat    = $findSession->lat;
            $this->lng    = $findSession->lng;
            $this->userId = $findSession->user_id;
        }

        // Если сессии в БД с такими IP и UA нет, то добавляем новую
        if (!$findSession || !$findSession->id) {
            $sessionData = (object) [
                'id'         => md5($this->ip . $this->ua),
                'user_id'    => $this->userId,
                'user_ip'    => $this->ip,
                'user_agent' => $this->ua,
                'lat'        => $lat,
                'lng'        => $lng
            ];

            $this->sessionModel->insert($sessionData);
            $this->_saveSessionHistory(
                $sessionData->id,
                $lat,
                $lng
            );

            $this->lat = $lat;
            $this->lng = $lng;
            $this->id  = $sessionData->id;

            return $sessionData->id;
        }

        // Если сессия уже есть в БД и положение сейчас отличается от того, что было сохранено,
        // То создается новая запись в истории сессий
        if (($lat && $lng) &&
            ($lat !== $this->lat || $lng !== $this->lng)
        ) {
            $this->_saveSessionHistory($this->id, $lat, $lng);
        }

        $this->lat = $lat ?? $this->lat;
        $this->lng = $lng ?? $this->lng;

        return $this->id;
    }

    /**
     * @return bool
     * @throws ReflectionException
     */
    public function update(): bool {
        return $this->sessionModel->update($this->id, [
            'lat'     => $this->lat,
            'lng'     => $this->lng,
            'user_id' => !empty($this->userId) ? $this->userId : null,
        ]);
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
     * @param float|null $lat
     * @param float|null $lng
     * @return string|null
     * @throws ReflectionException
     */
    protected function _saveSessionHistory(
        string $session,
        float | null $lat,
        float | null $lng
    ): ?string
    {
        try {
            $historyModel = new SessionsHistoryModel();
            $historyModel->insert([
                'session_id' => $session,
                'lat'        => $lat ?? null,
                'lng'        => $lng ?? null
            ]);

            return $historyModel->getInsertID();
        } catch (Exception $e) {
            log_message('error', '{exception}', ['exception' => $e]);
            return null;
        }
    }
}