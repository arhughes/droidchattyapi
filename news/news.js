class Source {
    constructor(name, generator) {
        this.name = name;
        this.generator = generator;
    }
}

class Item {
    constructor(title, link, comments = false) {
        this.title = title;
        this.link = link;
        this.comments = comments;
    }
}

function hackernews(callback) {
    $.get({url: "source/hackernews"}, function(xml) {
        try {
            var data = [];
            $(xml).find("item").each(function(child) {
                data.push(new Item(
                    $(this).find('title').text(),
                    $(this).find('link').text(),
                    $(this).find('comments').text()
                ));
            });
            callback(data);
        } catch (err) {
            console.error("An error occured parsing hackernews", err);
            callback(new Item('', "an error occured"));
        }
    })
    .fail(function() {
        callback(["an error occured"]);
    });
}

function reddit(url, callback) {
    $.getJSON(url, function(content) {
        try {
            var data = [];
            content['data']['children'].forEach(function(child) {
                data.push(new Item(
                    child.data.title.replace(/&amp;/ig, "&"),
                    child.data.url.replace(/&amp;/ig, "&"),
                    "https://www.reddit.com" + child.data.permalink
                ));
            });
            callback(data);
        } catch (err) {
            console.error("An error occured parsing data from " + url, err);
            callback(["an error occured"]);
        }
    })
    .fail(function() {
        callback(["an error occured"]);
    });
}

function redditfrontpage(callback) {
    reddit("https://www.reddit.com/.json", callback);
}

function randroid(callback) {
    reddit("https://www.reddit.com/r/android/.json", callback);
}

function techmeme(callback) {
    $.get({url: "source/techmeme"}, function(xml) {
        try {
            var data = [];
            $(xml).find("item").each(function(child) {
                data.push(new Item(
                    $(this).find('title').text(),
                    $(this).find('link').text()
                ));
            });
            callback(data);
        } catch (err) {
            console.error("An error occured parsing hackernews", err);
            callback(new Item('', "an error occured"));
        }
    })
    .fail(function() {
        callback(["an error occured"]);
    });
}

function bogleheads(callback) {
    $.get({url: "source/bogleheads"}, function(xml) {
        try {
            var data = [];
            $(xml).find("item").each(function(child) {
                data.push(new Item(
                    $(this).find('title').text(),
                    $(this).find('link').text()
                ));
            });
            callback(data);
        } catch (err) {
            console.error("An error occured parsing hackernews", err);
            callback(new Item('', "an error occured"));
        }
    })
    .fail(function() {
        callback(["an error occured"]);
    });
}

function getHost(url) {
    var domain = url.split('/')[2].split(':')[0];
    if (domain.startsWith("www."))
        domain = domain.substring(4);
    return domain;
}

// display the items to the specified list
function display(list, data) {
    data.forEach(function(current) {
        var li = $("<li>").appendTo(list);

        var a = $('<a>', {text: current.title, href: current.link}).appendTo(li)[0];
        
        for (var i = 0; i < ImageSources.length; i++) {
            var source = ImageSources[i];
            if (source.check(current.link)) {
                $(a).data('image-type', source.name);
                $(a).click(toggleImage);
                $(li).addClass('image');
                break;
            }
        }
        

        // only show the host and comments link if this site has comments
        if (current.comments) {
            li.append(" (" + getHost(current.link) + ") ");
            li.append($('<a>', {text: "(comments)", href: current.comments, class: 'comments'}));
        }
    });
}

function toggleImage() {
    var a = this;

    // remove any existing previews
    var preview = $(a).children("img");
    if (preview.length > 0) {
        $(preview).remove();
        return false;
    }

    // add new image preview
    var type = $(a).data('image-type');
    var source = imageLookup[type];
    var imageUrl = source.expand(a.href);
    $(a).append("<img src='" + imageUrl + "'/>");

    // load the original href so it will show up as visited
    $("#track").attr('src', a.href);

    return false;
}

var imageLookup = {};
ImageSources.forEach(function(source) {
    imageLookup[source.name] = source;
});

// setup our list of sources with their titles
var sources = [
    new Source("hackernews", hackernews),
    new Source("reddit", redditfrontpage),
    new Source("randroid", randroid),
    new Source("techmeme", techmeme),
    new Source("bogleheads", bogleheads)
];

var cell_width = Math.floor(100.0 / sources.length) + "%";

// create a holder for each source, then load each source and display it
var content = $("#content");
var row = $("<tr/>").appendTo(content);
sources.forEach(function(current) {
    var cell = $("<td><h2>" + current.name + "</h2></td>").appendTo(row);
    cell.css("width", cell_width);
    var list = $("<ol/>").appendTo(cell);

    var loader = $.Deferred(function() {
        var self = this;
        current.generator(function(data) {
            self.resolve(data);
        });
    }); 

    $.when(loader).done(function(data) { display(list, data); });
});
