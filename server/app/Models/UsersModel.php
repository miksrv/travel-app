<?php namespace App\Models;

use App\Entities\User;

class UsersModel extends MyBaseModel {
    protected $table      = 'users';
    protected $primaryKey = 'id';

    protected $useAutoIncrement = false;

    protected $returnType     = User::class;
    protected $useSoftDeletes = true;

    protected array $hiddenFields = ['deleted_at']; // 'created_at', 'updated_at',

    // The updatable fields
    protected $allowedFields = [
        'name',
        'email',
        'password',
        'level',
        'avatar',
        'website',
        'reputation',
        'created_at',
    ];

    // Dates
    protected $useTimestamps = true;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
    protected $deletedField  = 'deleted_at';

    // Validation
    protected $validationRules = [];
    protected $validationMessages   = [];
    protected $skipValidation       = true;
    protected $cleanValidationRules = true;

    // Callbacks
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
     * @return User
     */
    public function findUserByEmailAddress(string $emailAddress): object {
        $userData = $this->where(['email' => $emailAddress])->first();

        if (!$userData) {
            throw new Exception('User does not exist for specified email address');
        }

        return $userData;
    }
}