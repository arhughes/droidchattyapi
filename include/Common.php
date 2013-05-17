<?
function send_json($o)
{
	$json = json_encode($o);
	$json = str_replace('\\/', '/', $json);
	$json = str_replace('\r', '', $json);

	if (!headers_sent())
	{
		header('Cache-Control: private');
		header('Expires: 1 Jan 1011 10:00:00 GMT');
		header('Content-type: application/json');
		header('Content-length: ' . strlen($json));
	}

	echo $json;
}
?>
