<?
class SearchParser extends Parser
{
   public function search($terms, $author, $parentAuthor, $category, $page)
   {
      if (empty($category))
         $category = 'all';
   
      $url = 'http://www.shacknews.com/search'
         . '?chatty=1'
         . '&type=4'
         . '&chatty_term=' . urlencode($terms)
         . '&chatty_user=' . urlencode($author)
         . '&chatty_author=' . urlencode($parentAuthor) 
         . '&chatty_filter=' . urlencode($category)
         . '&page=' . urlencode($page)
         . '&result_sort=postdate_desc';
      
      $this->init($this->download($url));
      
      $results = array();
    
        $totalResults = str_replace(',', '', $this->clip(
            array('<h2 class="search-num-found"', '>'),
            ' '));
      
      while ($this->peek(1, '<li class="result') !== false)
      {

         $o = array(
            'id' => false,
            'preview' => false,
            'author' => false,
            'date' => false);
            
        $o['author'] = $this->clip(
            array('<span class="chatty-author">', '<a class="more"', '>'),
            ':</a></span>');

        $o['date'] = $this->clip(
            array('<span class="postdate"', '>', ' '),
            '</span>');

        $o['id'] = $this->clip(
            array('<a href="/chatty', 'chatty/', '/'),
            '"');

        $o['preview'] = $this->clip(
            '>',
            '</a>');

         $results[] = $o;
      }
      
      return array('comments' => $results);
   }
}

function SearchParser()
{
   return new SearchParser();
}
