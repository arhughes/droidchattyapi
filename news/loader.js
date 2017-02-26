const IMAGE_TYPE_IMAGE = 0;
const IMAGE_TYPE_VIDEO = 1;

var ImageSources = [
    {
        name: 'imgur',
        check: function(url, success, next) {
            var match = /https?\:\/\/imgur\.com\/\w+$/.test(url);
            if (match) success();
            else next();
        },
        expand: function(url) {
            return url.replace(/imgur/, 'i.imgur') + ".jpg";
        }
    },
    {
        name: 'imgurvideo',
        check: function(url, success, next) {
            var match = /https?\:\/\/(i\.)?imgur\.com\/\w+\.gifv?$/.test(url);
            if (match) success(IMAGE_TYPE_VIDEO);
            else next();
        },
        expand: function(url) {
            var match = /https?\:\/\/(i\.)?imgur\.com\/(\w+)\.gifv?$/.exec(url);
            var id = match[2];
            return 'https://i.imgur.com/' + id + '.mp4';
        }
    },
    {
        name: 'reddituploads',
        check: function(url, success, next) {
            var match = /https?\:\/\/i\.reddituploads\.com\/\w+/.test(url);
            if (match) success();
            else next();
        },
        expand: function(url) {
            return url;
        }
    },
    {
        name: 'default',
        check: function(url, success, next) {
            var match = /[^:?]+\.(jpg|jpeg|png|gif|bmp|svg)$/i.test(url);
            if (match) success();
            else next();
        },
        expand: function(url) {
            return url;
        }
    }
];
