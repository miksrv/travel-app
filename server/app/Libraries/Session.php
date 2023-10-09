<?php namespace App\Libraries;

use App\Models\SessionsHistoryModel;
use App\Models\SessionsModel;
use Config\Services;
use ReflectionException;

class Session {

    public string $id;
    public float | null $latitude;
    public float | null $longitude;

    /**
     * Обновляет текущую сессию пользователя по его IP и User Agent, возвращает ID сессии в БД
     * @param float|null $latitude
     * @param float|null $longitude
     * @throws ReflectionException
     */
    public function __construct(float $latitude = null, float $longitude = null) {
        $request = Services::request();

        $ip = $request->getIPAddress();
        $ua = $request->getUserAgent()->getAgentString();

        $sessionModel = new SessionsModel();
        $findSession  = $sessionModel
            ->where(['ip' => $ip, 'user_agent' => $ua])
            ->first();

        // Если сесси в БД с такими IP и UA нет, то добавляем новую
        if (empty($findSession) || !$findSession->id) {
            $sessionData = (object) [
                'id'         => md5($ip . $ua),
                'ip'         => $ip,
                'user_agent' => $ua,
                'latitude'   => $latitude,
                'longitude'  => $longitude
            ];

            $sessionModel->insert($sessionData);
            $this->_saveSessionHistory(
                $sessionData->id,
                $latitude,
                $longitude
            );

            $this->latitude  = $latitude;
            $this->longitude = $longitude;

            return $this->id = $sessionData->id;
        }

        // Если сессия уже есть в БД и положение сейчас отличается от того, что было сохранено,
        // То создается новая запись в истории сессий
        if (($latitude && $longitude) &&
            ($latitude !== $findSession->latitude || $longitude !== $findSession->longitude)
        ) {
            $this->_saveSessionHistory(
                $findSession->id,
                $latitude,
                $longitude
            );
        }

        $this->latitude  = $latitude ?? $findSession->latitude;
        $this->longitude = $longitude ?? $findSession->longitude;

        // В любом случае обновляем текущую сессию
        $sessionModel->update($findSession->id, [
            'latitude'  => $this->latitude,
            'longitude' => $this->longitude
        ]);

        return $this->id = $findSession->id;
    }

    /**
     * Сохраняем сессию в истории
     * @param string $session
     * @param float $latitude
     * @param float $longitude
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