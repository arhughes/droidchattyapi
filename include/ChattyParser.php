<?
class ChattyParser extends Parser
{
    public function getStory($page, $user)
    {
        $url = "http://www.shacknews.com/chatty?page=$page";
        return $this->parseStory($this->download($url), $user);
    }

    public function post($username, $password, $parentID, $storyID, $body)
    {
        $postURL = 'http://www.shacknews.com/post_chatty.x';

        if ($parentID == 0)
            $parentID = '';

        $postArgs = array(
            'parent_id' => $parentID,
            'content_type_id' => '17',
            'content_id' => '17', 
            'page' => '', 
            'parent_url' => '/chatty',
            'body' => $body);

        $retVal = $this->userDownload($postURL, $username, $password, $postArgs);

        if (strpos($retVal, 'Error processing post') !== false)
        {
            # Try it with content_type = 2 instead.  This is needed for Shacknews
            # article posts
            $postArgs['content_type_id'] = 2;
            $postArgs['content_id'] = 2;
            $retVal = $this->userDownload($postURL, $username, $password, $postArgs);
        }

        # We'll just chill for a few seconds to let Shacknews create and cache
        # this post, because the new site seems to require it.  This ensures
        # that the client will see the new post when it refreshes.
        sleep(5);

        return $retVal;
    }

    public function parseStory($html, $user)
    {
        $this->init($html);

        $o = array(
            'comments'      => array(),
            'current_page' => false,
            'last_page'    => false);

        #
        # Page navigation (current page)
        #
        #										<div class="pagenavigation"> 
        #<a rel="nofollow" href="/chatty?page=3" class="nextprev">&laquo; Previous</a> 
        #<a rel="nofollow" href="/chatty?page=1">1</a> 
        #<a rel="nofollow" href="/chatty?page=2">2</a> 
        #<span>...</span> 
        #<a rel="nofollow" href="/chatty?page=2">2</a> 
        #<a rel="nofollow" href="/chatty?page=3">3</a> 
        #<a rel="nofollow" class="selected_page" href="/chatty?page=4">4</a> 
        #<a rel="nofollow" href="/chatty?page=5">5</a> 
        #<span>...</span> 
        #<a rel="nofollow" href="/chatty?page=8">8</a> 
        #<a rel="nofollow" href="/chatty?page=9">9</a> 
        #<a rel="nofollow" href="/chatty?page=5" class="nextprev">Next &raquo;</a></div> <!-- class="pagenavigation" --> 
        #
        $this->seek(1, array('<div class="pagenavigation">', '>'));

        # May not be present if there's only 1 page.
        if ($this->peek(1, '<a rel="nofollow" class="selected_page"') === false)
        {
            $o['current_page'] = 1;
        }
        else
        {
            $o['current_page'] = $this->clip(
                array('<a rel="nofollow" class="selected_page"', '>'),
                '</a>');
        }

        #
        # Number of threads (last_page)
        #
        # <div id="chatty_settings" class="">	
        # <a href="/chatty">268 Threads*</a><span class="pipe"> |</span> 
        # <a href="/chatty">4,438 Comments</a> 
        #
        $this->seek(1, array('<div id="chatty_settings" class="">', '>'));

        $numThreads = $this->clip(
            array('<a href="/chatty">', '>'),
            ' Threads');
        $o['last_page'] = max(ceil($numThreads / 30), 1);

        #
        # Threads
        #
        while ($this->peek(1, '<div class="fullpost') !== false)
        {
            $thread = ThreadParser()->parseThreadTree($this);

	    if ($thread['body'] === false)
		break;

            // don't return all the replies, just say if this user participated
            $thread['replied'] = false;
            foreach ($thread['replies'] as $i => $reply)
            {
                if (strcasecmp($reply['author'], $user) == 0)
                    $thread['replied'] = true;
            }
            unset($thread['replies']);

            $o['comments'][] = $thread;

            if (count($o['comments']) > 50)
                throw new Exception('Too many threads.  Something is wrong.' . print_r($o, true));
        }   

        return $o;
    }

    public function locatePost($post_id, $unused)
    {
        $post_id = intval($post_id);

        # Locate the thread to find the root thread ID.
        $thread = ThreadParser()->getThreadTree($post_id);

        return array(
            'story' => (-1) * intval($thread['id']),
            'page' => 1,
            'thread' => $thread['id']);
    }
}

function ChattyParser()
{
    return new ChattyParser();
}
