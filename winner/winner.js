function random(max) {
  return Math.floor(Math.random() * max);
}

function getPostAuthors(posts, options) {
  var op = posts[0].author;
  var authors = {};
  for (var i = 0; i < posts.length; i++) {
    var author = posts[i].author;
    if ((!options.ignoreOP || author != op) && (!options.directRepliesOnly || posts[i].parentId == options.id))
      authors[author] = true;
  }
  return Object.keys(authors);
}

function pickWinnersFromPosts(posts, options) {
  var names = getPostAuthors(posts, options);
  var winners = [];
  for (var i = 0; i < options.winners && names.length > 0; i++) {
    var index = random(names.length);
    winners.push(names[index]);
    names.splice(index, 1);
  }
  return winners;
}

function pick(callback) {
  var options = {
    id: $('#id').val() || 0,
    winners: $('#winner_count').val(),
    ignoreOP: $('#ignore_op').is(':checked'),
    directRepliesOnly: $('#direct_replies_only').is(':checked')
  };

  if (options.id === 0) {
    callback('["You must specify a thead id."]');
  } else {
    var url = 'https://winchatty.com/v2/getSubthread?id=' + options.id;
    $.getJSON(url, function(data) {
      if (data.error === true) {
        callback('["Error fetching thread"]');
      } else {
        var thread = data.subthreads[0].posts;
        var winners = pickWinnersFromPosts(thread, options);
        callback(winners);
      }
    });
  }
}

function pickWinners() {

  var winners_div = document.getElementById("winners");
  winners_div.innerHTML = "Picking winners...";

  pick(function(winners) {
    var ul = document.createElement("ul");
    for (var i = 0; i < winners.length; i++) {
      var li = document.createElement("li");
      li.innerHTML = winners[i];
      ul.appendChild(li);
    }
    winners_div.innerHTML = "";
    winners_div.appendChild(ul);    
  });
}
