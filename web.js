var express = require('express');
var moment = require('moment-timezone');
var request = require('request');
var logger = require('morgan');
var compression = require('compression');
var path = require('path');
var qs = require("querystring");

var app = express();

// log everything and compress responses
app.use(logger(':method :url :status :res[content-length] - :response-time ms'));
app.use(compression());
app.use('/winner', express.static(path.join(__dirname, 'winner')));

function convertTime(time) {
    // convert time to format expected by droidchatty
    return moment(time).tz('America/Los_Angeles').format('MMM DD, YYYY h:mma z');
}

function orderTree(root, depth) {
    var nodes = [ {
        category: root.post.category,
        id: root.post.id,
        author: root.post.author,
        'depth': depth,
        date: convertTime(root.post.date),
        body: root.post.body
    }];

    for (var i = 0; i < root.children.length; i++) {
        nodes = nodes.concat(orderTree(root.children[i], depth + 1));
    }

    return nodes;
}

app.get('/', function(request, response) {
  response.send('This is the production shackapi for use in droidchatty.');
});

app.get("/*", function(req, res, next) {
    // disable caching
    res.setHeader('Cache-Control', 'no-cache, no-store, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});

app.get('/page.php', function(req, res) {
    var page = req.query.page || 1;
    var limit = 40;
    
    var options = {
        offset: (page - 1) * limit,
        limit: limit,
        user: req.query.user || ""
    };

    var url = 'http://winchatty.com/v2/getChattyRootPosts?' + qs.stringify(options);
    request({uri: url, gzip: true}, function(error, response, body) {
        if (error) {
            res.send(error);
            return;
        }

        var comments = [];
        try {
            var r = JSON.parse(body);
            if (!r.error && r.rootPosts) {
                var posts = r.rootPosts;
                var count = posts.length;

                for (i = 0; i < count; i++) {
                    comments.push({
                        body: posts[i].body,
                        category: posts[i].category,
                        id: posts[i].id,
                        author: posts[i].author,
                        date: convertTime(posts[i].date),
                        reply_count: posts[i].postCount,
                        replied: posts[i].isParticipant
                    });
                }
            }
        } catch (err) {
            console.error("Error parsing page " + page, err);
        }

        res.setHeader('Content-type', 'application/json');
        res.send({comments: comments});
    });
});

app.get('/thread.php', function(req, res) {

    var id = req.query.id;

    var url = 'http://winchatty.com/v2/getThread?id=' + id;
    request({uri: url, gzip: true}, function(error, response, body) {
        if (error) {
            res.send(error);
            return;
        }

        var ordered = [];
        try {
            var r = JSON.parse(body);
            if (!r.error && r.threads && r.threads.length > 0) {
                var posts = r.threads[0].posts;

                // sort all the posts by id, so they are in chronological order
                posts.sort(function(a, b) { return a.id - b.id; });

                var root = {};
                var nodes = {};

                // convert list of posts into a tree
                for (var i = 0; i < posts.length; i++) {
                    var post = posts[i];

                    var new_node = {
                        'post': post,
                        'children': []
                    };

                    if (post.id === post.threadId) {
                        root = new_node
                    } else {
                        var parent = nodes[post.parentId];
                        parent.children.push(new_node);
                    }

                    nodes[post.id] = new_node;
                }

                // convert tree to depth first list
                ordered = orderTree(root, 0);
            }
        } catch (err) {
            console.error("Error parsing thread id " + id, err);
        }

        res.setHeader('Content-type', 'application/json');
        res.send({replies: ordered});

    });
});

app.get("/search.php", function(req, res) {

    var page = req.query.page || 1;
    var limit = 35;

    var options = {
        terms: req.query.terms || "",
        author: req.query.author || "",
        parentAuthor: req.query.parentAuthor || "",
        category: req.query.category || "",
        offset: (page - 1) * limit,
        limit: limit
    };

    var url = 'http://winchatty.com/v2/search?' + qs.stringify(options);
    request({uri: url, gzip: true}, function(error, response, body) {
        if (error) {
            res.send(error);
            return;
        }

        var result = [];
        try {
            var r = JSON.parse(body);
            if (!r.error && r.posts) {
                var posts = r.posts;

                for (var i = 0; i < posts.length; i++) {
                    result.push({
                        id: posts[i].id,
                        preview: posts[i].body,
                        author: posts[i].author,
                        date: convertTime(posts[i].date)
                    });
                }
            }
        } catch (err) {
            console.error("Error parsing search results.", err);
        }

        res.setHeader('Content-type', 'application/json');
        res.send({comments: result});
    });
});

app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.send('Something broke!');
});

process.on('uncaughtException', function(exception) {
    console.log(exception);
});


var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
