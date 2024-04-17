<?php namespace App\Libraries;

class EmailLibrary {
    public function send(string $mailTo, string $subject, $message): void {
        $config['protocol'] = 'smtp';
        $config['SMTPHost'] = getenv('smtp.host');
        $config['SMTPUser'] = getenv('smtp.user');
        $config['SMTPPass'] = getenv('smtp.pass');
        $config['SMTPPort'] = getenv('smtp.port');
        $config['mailType'] = 'html';
        $config['SMTPCrypto'] = 'ssl';

        $email = \Config\Services::email();

        $email->initialize($config);
        $email->setFrom(getenv('smtp.mail'), 'geometki.com');
        $email->setTo($mailTo);

        $email->setSubject($subject);
        $email->setMessage($message);

        $email->send();
    }
}
