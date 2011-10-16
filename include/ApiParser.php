<?
require_once 'Config.php';

class ApiParser
{
    protected function downloadApi($url)
    {
        $cookiejar = data_directory . 'Login.cookie';

        $curl = curl_init();
        curl_setopt($curl, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_HEADER, false);
        #curl_setopt($curl, CURLOPT_ENCODING, 'gzip');
        curl_setopt($curl, CURLOPT_COOKIEFILE, $cookiejar);
        curl_setopt($curl, CURLOPT_COOKIEJAR, $cookiejar);
        curl_setopt($curl, CURLOPT_USERPWD, SHACK_USER . ':' . SHACK_PASSWORD);

        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_POST, false);
        $html = curl_exec($curl);
        curl_close($curl);

        return $html;
    }
}
