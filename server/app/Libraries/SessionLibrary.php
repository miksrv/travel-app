<?php namespace App\Libraries;

use App\Entities\User;
use App\Models\SessionsHistoryModel;
use App\Models\SessionsModel;
use App\Models\UsersModel;
use Config\Services;
use JetBrains\PhpStorm\NoReturn;
use ReflectionException;

class SessionLibrary {
    public string | null $id = null;
    public float | null $lat = null;
    public float | null $lon = null;
    public User | null $user = null;
    public bool $isAuth = false;

    private \CodeIgniter\HTTP\IncomingRequest|\CodeIgniter\HTTP\CLIRequest $request;
    private SessionsModel $model;
    private string $ip;
    private string $ua;

    public function __construct() {
        helper('auth');

        $this->model   = new SessionsModel();
        $this->request = Services::request();

        $header = $this->request->getServer('HTTP_AUTHORIZATION') ?? null;

        $this->ip   = $this->request->getIPAddress();
        $this->ua   = $this->request->getUserAgent()->getAgentString();
        $this->user = validateAuthToken($header);

        if (
            $this->ua === 'node' &&
            $this->ip === $this->request->getServer('REMOTE_ADDR')
        ) {
            return $this;
        }

        if ($this->user) {
            $this->isAuth = true;
            $this->model->where('user_id', $this->user->id);
        } else {
            $this->model->where(['user_ip' => $this->ip, 'user_agent' => $this->ua]);
        }

        $sessionData = $this->model->orderBy('updated_at', 'DESC')->first();

        if ($sessionData) {
            $this->id  = $sessionData->id;
            $this->lat = $sessionData->lat ?? null;
            $this->lon = $sessionData->lon ?? null;

            return $this;
        }

        return $this;
    }

    /**
     * @throws ReflectionException
     */
    public function authorization(User $user): static {
        $this->user   = $user;
        $this->isAuth = true;
        $this->update();

        return $this;
    }

    /**
     * @throws ReflectionException
     */
    public function update(): static {
        if ($this->user) {
            $usersModel = new UsersModel();
            $usersModel->updateUserActivity($this->user->id);
        }

        if ($this->id) {
            $updateSession = new \App\Entities\Session();
            $updateSession->updated_at = time();

            if ($this->user && $this->user->id) {
                $updateSession->user_id    = $this->user->id;
                $updateSession->user_ip    = $this->ip;
                $updateSession->user_agent = $this->ua;
            }

            $this->model->update($this->id, $updateSession);

            return $this;
        }

        $session = new \App\Entities\Session();
        $session->id         = uniqid('s', true);
        $session->user_ip    = $this->ip;
        $session->user_agent = $this->ua;
        $session->user_id    = $this->user ? $this->user->id : null;

        $this->model->insert($session);

        $this->id = $session->id;

        return $this;
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
            $model = new SessionsModel();
            $model->update($this->id, [
                'lat' => $lat,
                'lon' => $lon,
            ]);

            if ($this->lat !== null && $this->lon !== null) {
                $historyModel = new SessionsHistoryModel();
                $historyModel->insert([
                    'session_id' => $this->id,
                    'lat'        => $lat,
                    'lon'        => $lon
                ]);
            }

            $this->lat = $lat;
            $this->lon = $lon;
        }
    }
}