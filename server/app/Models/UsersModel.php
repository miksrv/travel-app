<?php namespace App\Models;

use App\Entities\User;
use CodeIgniter\I18n\Time;
use Exception;
use ReflectionException;

class UsersModel extends MyBaseModel {
    protected $table      = 'users';
    protected $primaryKey = 'id';

    protected $useAutoIncrement = false;

    protected $returnType     = User::class;
    protected $useSoftDeletes = true;

    protected array $hiddenFields = ['deleted_at'];

    protected $allowedFields = [
        'name',
        'email',
        'password',
        'auth_type',
        'language',
        'experience',
        'level',
        'avatar',
        'website',
        'reputation',
        'created_at',
        'updated_at',
        'activity_at',
    ];

    protected $useTimestamps = true;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
    protected $deletedField  = 'deleted_at';

    protected $validationRules      = [];
    protected $validationMessages   = [];
    protected $skipValidation       = true;
    protected $cleanValidationRules = true;

    protected $allowCallbacks = true;
    protected $beforeInsert   = ['beforeInsert'];
    protected $afterInsert    = [];
    protected $beforeUpdate   = [];
    protected $afterUpdate    = [];
    protected $beforeFind     = [];
    protected $afterFind      = ['prepareOutput'];
    protected $beforeDelete   = [];
    protected $afterDelete    = [];

    /**
     * @param array $data
     * @return array
     */
    protected function beforeInsert(array $data): array {
        $data['data']['id'] = uniqid();

        return $data;
    }

    /**
     * @param array $data
     * @return array
     */
    private function getUpdatedDataWithHashedPassword(array $data): array {
        if (isset($data['data']['password'])) {
            $plaintextPassword = $data['data']['password'];
            $data['data']['password'] = $this->hashPassword($plaintextPassword);
        }

        return $data;
    }

    /**
     * @param string $plaintextPassword
     * @return string
     */
    private function hashPassword(string $plaintextPassword): string {
        return password_hash($plaintextPassword, PASSWORD_BCRYPT);
    }

    /**
     * @param string $emailAddress
     * @return User|array|null
     */
    public function findUserByEmailAddress(string $emailAddress): User | array | null
    {
        return $this
            ->select('id, name, avatar, email, password')
            ->where(['email' => $emailAddress])
            ->first();
    }

    /**
     * @param string $userId
     * @return void
     * @throws ReflectionException
     * @throws Exception
     */
    public function updateUserActivity(string $userId): void {
        $userData = $this->select('updated_at')->find($userId);

        $user = new User();
        $user->updated_at  = $userData->updated_at;
        $user->activity_at = Time::now();

        $this->update($userId, $user);
    }
}