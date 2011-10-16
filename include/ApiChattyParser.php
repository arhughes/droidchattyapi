<?
class ApiChattyParser extends ApiParser
{
    public function getStory($page, $user)
    {
        $url = "http://www.shacknews.com/api/chat/index.json?page=$page";
        $html = $this->downloadApi($url);
        $json = json_decode($html, true);
        return $this->parseStory($json['data']['comments'], $user);
    }

    function parseStory($story, $user)
    {
        $threads = array();
        foreach ($story as $comment)
        {
            # read all the stuff we care about
            $thread = array(
                'id' => $comment['id'],
                'date' => $comment['post_time'],
                'category' => $comment['mod_type'],
                'author' => $comment['user'],
                'body' => $comment['body'],
                'reply_count' => $comment['post_count'],
                'last_reply_id' => $comment['last_id'],
                'replied' => false
            );

            # see if this user participated in this thread
            if (strcasecmp($user, $thread['author']) == 0)
            {
                $thread['replied'] = true;
            }
            else
            {
                foreach ($comment['participant'] as $participant)
                {
                    if (strcasecmp($user, $participant['user']) == 0)
                    {
                        $thread['replied'] = true;
                        break;
                    }
                }
            }

            $threads[] = $thread;

        }

        return array('comments' => $threads);
    }

}

function ApiChattyParser()
{
    return new ApiChattyParser();
}
