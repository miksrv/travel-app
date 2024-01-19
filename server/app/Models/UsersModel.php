<?php namespace App\Models;

class UsersModel extends MyBaseModel {
    protected $table      = 'users';
    protected $primaryKey = 'id';

    protected $useAutoIncrement = false;

    protected $returnType     = \App\Entities\User::class;
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
     * @return User|null
     */
    public function findUserByEmailAddress(string $emailAddress):? \App\Entities\User {
        $userData = $this
            ->select('id, name, avatar, email, password')
            ->where(['email' => $emailAddress])
            ->first();

        if (!$userData) {
            return null;
        }

        $user = new \App\Entities\User();

        $user->id       = $userData->id;
        $user->name     = $userData->name;
        $user->avatar   = $userData->avatar;
        $user->email    = $userData->email;
        $user->password = $userData->password;

        return $user;
    }
}