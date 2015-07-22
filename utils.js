(function(exports) {
    var utils = {
            getId: function (functionObject) {
                var range = functionObject.range;
                
                return range[0].toString() + "-" + range[1].toString();
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
            }
        }
    exports.UTILS = utils;
})(window);