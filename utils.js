(function(exports) {
    var utils = {
            getId: function (functionObject) {
                var range,
                    randomIndex = (Math.floor(Math.random()*90000) + 10000).toString();

                if (!functionObject) {
                    return randomIndex;
                }

                range = functionObject.range;

                if (range) {
                    return range[0].toString() + "-" + range[1].toString();
                } else if (functionObject.name) {
                    return functionObject.name;
                } else {
                    return randomIndex;
                }
            },
            getBaseName: function (functionObject) {
                var name = functionObject.name,
                namePath,
                splitRegx = /\.|\//;

                if (functionObject && name){
                    namePath = name.split(splitRegx);

                    return namePath[namePath.length - 1];
                }
            },

            //D3
            distance: function (source, target) {
                return Math.sqrt(Math.pow(source.x - target.x, 2) + Math.pow(source.y - target.y, 2));
            },

            //loader
            showLoader: function () {
                var views = chrome.extension.getViews();
                    myWindow = views[views.length - 1];
                //var myWindow = chrome.extension.getViews()[0];
                myWindow.document.getElementsByClassName('loading')[0].style.display = "block";
                this.updateLoaderStatus();
            },
            hideLoader: function () {
                var views = chrome.extension.getViews();
                    myWindow = views[views.length - 1];
                myWindow.document.getElementsByClassName('loading')[0].style.display = "none";
            },
            updateLoaderStatus: function (status) {
                status = status || "Getting Source Code";
                var views = chrome.extension.getViews();
                    myWindow = views[views.length - 1];
                myWindow.document.getElementsByClassName('loading-status')[0].innerHTML = status;
            }
        }
    exports.UTILS = utils;
})(window);