(function(exports) {
    var utils = {
            getId: function (functionObject) {
                var range = functionObject.range;

                if (range) {
                    return range[0].toString() + "-" + range[1].toString();
                } else {
                    return functionObject.name;
                }
                
            },
            getBaseName: function (functionObject) {
                var name = functionObject.name,
                namePath;

                if (functionObject && name){
                    namePath = name.split('.');
                    //console.log("name: ", name, ", baseName: ", namePath[namePath.length - 1]);
                    
                    return namePath[namePath.length - 1];
                }
            },

            //D3
            distance: function (source, target) {
                return Math.sqrt(Math.pow(source.x - target.x, 2) + Math.pow(source.y - target.y, 2));
            },

            //loader
            showLoader: function () {
                var myWindow = chrome.extension.getViews({type: "popup"})[0];
                debugger
                myWindow.document.getElementsByClassName('loading')[0].style.display = "block";
                this.updateLoaderStatus();
            },
            hideLoader: function () {
                var myWindow = chrome.extension.getViews({type: "popup"})[0];
                myWindow.document.getElementsByClassName('loading')[0].style.display = "none";
            },
            updateLoaderStatus: function (status) {
                status = status || "Getting Source Code";
                var myWindow = chrome.extension.getViews({type: "popup"})[0];
                myWindow.document.getElementsByClassName('loading-status')[0].innerHTML = status;
            }
        }
    exports.UTILS = utils;
})(window);