<?
require_once 'include/Common.php';
require_once 'include/Parser.php';
require_once 'include/SearchParser.php';

$terms = '';
$author = '';
$parentAuthor = '';
$category = '';
$page = 1;

if (isset($_GET['terms']))
    $terms = $_GET['terms'];

if (isset($_GET['author']))
    $author = $_GET['author'];

if (isset($_GET['parentAuthor']))
    $parentAuthor = $_GET['parentAuthor'];

if (isset($_GET['category']))
    $category = $_GET['category'];

if (isset($_GET['page']))
    $page = intval($_GET['page']);


$parser = new SearchParser();
$story = $parser->search($terms, $author, $parentAuthor, $category, $page);

send_json($story);
?>
