<? 
require_once 'include/Common.php'; 
require_once 'include/Parser.php'; 
require_once 'include/ThreadParser.php'; 

header('Content-type: application/json'); 

// if each item is 1k, this should end up about 2mb. not sure whether we should gzip it too, but i am 
define('CACHE_SIZE', 2000); 

//  for some reason gzdecode() is not in my php server so  we can use this instead 
function gzfile_get_contents($filename, $use_include_path = 0) 
{ 
    //File does not exist 
    if( !@file_exists($filename) ) 
    {    return false;    } 
    
    //Read and imploding the array to produce a one line string 
   $data = gzfile($filename, $use_include_path); 
   $data = implode($data); 
   return $data; 
} 

$threadID = 0; 
if (isset($_GET['id'])) 
{ 
    $threadID = intval($_GET['id']); 

    $cached = ""; 
     
    // check if out cache file exists yet 
    if (file_exists(data_directory . 'Post.cache')) 
    { 
        $cached = gzfile_get_contents(data_directory . 'Post.cache'); 
         
        // unserialize is 3-4x faster than just storing php array in text form and doing  includes. also much faster than json_decode 
        $cached = unserialize($cached); 
    } 

    if (is_array($cached) && array_key_exists($threadID, $cached)) 
    { 
        // send cached data 
        send_json($cached[$threadID]); 
    } 
    else 
    { 
        $parser = new ThreadParser(); 
        $threads = $parser->getThread($threadID); 
         
        // we only need the root post 
        $tree['replies'][0] = $threads['replies'][0]; 
         
        // if we go over 20 past the cache size, perform a truncate operation 
        if (count($cached) > CACHE_SIZE + 20) 
        { 
            // sort array, so oldest posts get cut 
            krsort($cached); 
             
            $chunked = array_chunk($cached, CACHE_SIZE, true); 
            $cached = $chunked[0]; 
        } 
         
        // put the current item in the cache array 
        $cached[$threadID] = $tree; 
        // save cache array 
        file_put_contents(data_directory . 'Post.cache', gzencode(serialize($cached))); 
         
        // output 
        send_json($tree); 
    } 
} 
?> 
