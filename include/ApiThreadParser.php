<?
class ApiThreadParser extends ApiParser
{
    public function getThread($threadID)
    {
		$url = "http://www.shacknews.com/api/chat/thread/{$threadID}.json";
		$html = $this->downloadApi($url);

		$json = json_decode($html, true);
        return $this->parseThread($json['data']['comments']);
    }

    public function parseThread($thread)
    {
        $replies = array();
        $post_ids = array();
        $this->parseComments($thread, 0, $replies, $post_ids);
        return array('replies' => $replies);
	}

    function parseComments($thread, $depth, &$replies, &$post_ids)
    {
        foreach ($thread as $comment)
        {
            // ignore duplicate ids, stupid api
            $id = intval($comment['id']);
            if (isset($post_ids[$id]))
                continue;

            $reply = array(
                'category' => $comment['mod_type'],
                'id' => $id,
                'author' => $comment['user'],
                'depth' => $depth,
                'date' => $comment['post_time'],
                'body' => $comment['body']
            );

            $replies[] = $reply;
            $post_ids[$id] = true;

            $children = $comment['comments'];
            if ($children)
                $this->parseComments($children, $depth + 1, $replies);
        }
    }


}

function ApiThreadParser()
{
    return new ApiThreadParser();
}
