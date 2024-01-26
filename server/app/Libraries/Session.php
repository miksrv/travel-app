<?php namespace App\Libraries;

use App\Entities\User;
use App\Models\SessionsHistoryModel;
use App\Models\SessionsModel;
use Config\Services;
use JetBrains\PhpStorm\NoReturn;
use ReflectionException;

class Session {
    public string $id;
    public float | null $lat = null;
    public float | null $lon = null;
    public string | null $userId = null;
    public bool $isAuth = false;
    public User | null $user;
    private SessionsModel $model;

    private string $ip;
    private string $ua;

    /**
     * @throws ReflectionException
     */
    public function __construct() {
        helper('jwt');

        $request  = Services::request();
        $header   = $request->getServer('HTTP_AUTHORIZATION') ?? null;
        $this->ip = $request->getIPAddress();
        $this->ua = $request->getUserAgent()->getAgentString();

        $this->model = new SessionsModel();
        $this->user  = validateJWTFromRequest($header);

        $sessionId = md5($this->ip . $this->ua);
        $session   = $this->model;

        if ($this->user && $this->user->id) {
            $this->isAuth = true;
            $this->userId = $this->user->id;
            $session->where('user_id', $this->user->id);
        } else {
            $session->where('id', $sessionId);
        }

        $session = $session->first();

        if ($session) {
            $this->id     = $sessionId;
            $this->lat    = $session->lat;
            $this->lon    = $session->lon;
            $this->userId = $session->user_id;
        }

        // Если сессии в БД с такими IP и UA нет, то добавляем новую
        if (!$session || !$session->id) {
            $data = (object) [
                'id'         => $sessionId,
                'user_id'    => $this->userId,
                'user_ip'    => $this->ip,
                'user_agent' => $this->ua,
            ];

            $this->model->insert($data);
            $this->id = $sessionId;
        }
    }

    /**
     * @param string|null $userId
     * @return void
     * @throws ReflectionException
     */
    #[NoReturn] public function update(string $userId = null): void {
        $this->model->update($this->id, [
            'user_ip'    => $this->ip,
            'user_agent' => $this->ua,
            'user_id'    => $userId ?? $this->userId ?? null,
        ]);
    }

    /**
     * @param float $lat
     * @param float $lon
     * @return void
     * @throws ReflectionException
     */
    #[NoReturn] public function updateLocation(float $lat, float $lon): void {
        if ($this->id &&
            $lat && $lon &&
            ($this->lat !== $lat || $this->lon !== $lon)
        ) {
            $historyModel = new SessionsHistoryModel();

            $this->model->update($this->id, [
                'lat' => $lat,
                'lon' => $lon,
            ]);

            $historyModel->insert([
                'session_id' => $this->id,
                'lat'        => $lat,
                'lon'        => $lon
            ]);

            $this->lat = $lat;
            $this->lon = $lon;
        }
    }
}