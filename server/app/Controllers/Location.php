<?php

namespace App\Controllers;

class Location extends BaseController
{
    /**
     * The array contains input data obtained via GET or POST
     * @var array
     */
    protected $source;

    /**
     * Device data
     * @var
     */
    protected array $rawData;

    /**
     * Device request source string
     * @var
     */
    protected string $rawInput;


    function update() {
        $this->_select_source();

        $data = [
            'lat' => $this->source->lat,
            'lon' => $this->source->lon,
        ];

        $response = ['state' => TRUE, 'data' => (object) $data];

        $this->_response($response, 200);
    }


    /**
     * The method defines a global variable as a data source
     * @return mixed
     */
    protected function _select_source() {
        if ( ! empty($this->request->getJSON())) {
            return $this->source =$this->request->getJSON();
        }

        $response = array('state' => false, 'error' => 'Empty data input array');

        log_message('error', '[' .  __METHOD__ . '] {error}', $response);

        $this->_response($response);
    }

    /**
     * Generates an answer for the client
     * @param $data
     * @param int $code
     */
    protected function _response($data, $code = 400)
    {
        $this->response
            ->setStatusCode($code)
            ->setJSON($data)
            ->send();

        exit();
    }
}
