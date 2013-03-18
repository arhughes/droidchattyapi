<?
require_once 'include/Common.php';
require_once 'include/Parser.php';
require_once 'include/ThreadParser.php';

header('Content-type: application/json');

$threadID = 0;
if (isset($_GET['id']))
    $threadID = intval($_GET['id']);

$parser = new ThreadParser();
$replies = $parser->getThreadReplyCount($threadID);

send_json($replies);
?>
