<?
require_once 'include/Common.php';
require_once 'include/Parser.php';
require_once 'include/ThreadParser.php';
require_once 'include/ChattyParser.php';

$page = 1;
if (isset($_GET['page']))
    $page = intval($_GET['page']);

$user = "";
if (isset($_GET['user']))
    $user = $_GET['user'];

$parser = new ChattyParser();
$story = $parser->getStory($page, $user);

send_json($story);
?>
