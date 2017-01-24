define(function () {

    ko.bindingHandlers.keyDown = {
        init: function (element, valueAccessor, allBindings, viewModel) {
            var codes = valueAccessor();

            $(element).bind('keydown', function (event) {
                if(codes.hasOwnProperty(event.keyCode)){
                    if (_.isFunction(codes[event.keyCode].handler)) {
                        codes[event.keyCode].handler(viewModel);
                    }

                    if(!codes[event.keyCode].hasOwnProperty('preventDefault') || codes[event.keyCode].preventDefault) {
                        event.preventDefault();
                    }

                    if(!codes[event.keyCode].hasOwnProperty('stopPropagation') || codes[event.keyCode].stopPropagation) {                        
                        event.stopPropagation();
                    }                    
                }
            });
        }
    };
});