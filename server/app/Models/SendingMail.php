<?php namespace App\Models;

class SendingMail extends MyBaseModel {
    protected $table            = 'sending_mail';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = \App\Entities\SendingMail::class;
    protected $useSoftDeletes   = true;
    protected $protectFields    = true;
    protected $allowedFields    = [
        'activity_id',
        'status',
        'email',
        'locale',
        'subject',
        'message',
        'sent_email',
    ];

    protected bool $allowEmptyInserts = false;

    // Dates
    protected $useTimestamps = false;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';
    protected $deletedField  = 'deleted_at';

    // Validation
    protected $validationRules      = [];
    protected $validationMessages   = [];
    protected $skipValidation       = false;
    protected $cleanValidationRules = true;

    // Callbacks
    protected $allowCallbacks = true;
    protected $beforeInsert   = ['beforeInsert'];
    protected $afterInsert    = [];
    protected $beforeUpdate   = [];
    protected $afterUpdate    = [];
    protected $beforeFind     = [];
    protected $afterFind      = [];
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
     * @param string $email
     * @param bool $activity
     * @return object|array|null
     */
    public function checkSendLastEmail(string $email, bool $activity = true): object|array|null {
        return $this
            ->select('created_at')
            ->where("email = '{$email}' AND activity_id " . ($activity ? 'IS NOT NULL' : 'IS NULL'))
            ->orderBy('created_at', 'DESC')
            ->first();
    }
}
