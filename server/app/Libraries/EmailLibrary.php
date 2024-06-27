<?php namespace App\Libraries;

class EmailLibrary extends \Config\Services {
    public \CodeIgniter\Email\Email $email;

    public function __construct() {
        $config['protocol'] = 'smtp';
        $config['SMTPHost'] = getenv('smtp.host');
        $config['SMTPUser'] = getenv('smtp.user');
        $config['SMTPPass'] = getenv('smtp.pass');
        $config['SMTPPort'] = (int) getenv('smtp.port');
        $config['mailType'] = 'html';
        $config['SMTPCrypto'] = 'ssl';

        $this->email = \Config\Services::email();
        $this->email->initialize($config);
    }

    public function send(string $mailTo, string $subject, $message): void {
        $this->email->setFrom(getenv('smtp.mail'), 'geometki.com');
        $this->email->setTo($mailTo);

        $this->email->setSubject($subject);
        $this->email->setMessage($message);

        $this->email->send();
    }
}
