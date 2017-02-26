var ImageSources = [
    {
        name: 'imgur',
        check: function(url) {
            return /https?\:\/\/imgur\.com\/\w+$/.test(url);
        },
        expand: function(url) {
            return url.replace(/imgur/, 'i.imgur') + ".jpg";
        }
    },
    {
        name: 'reddituploads',
        check: function(url) {
            return /https?\:\/\/i\.reddituploads\.com\/\w+/.test(url);
        },
        expand: function(url) {
            return url;
        }
    },
    {
        name: 'default',
        check: function(url) {
            return /[^:?]+\.(jpg|jpeg|png|gif|bmp|svg)$/i.test(url);
        },
        expand: function(url) {
            return url;
        }
    }
];
