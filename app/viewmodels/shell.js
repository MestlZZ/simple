define([
    'knockout', 'underscore', 'durandal/app', 'durandal/composition', 'plugins/router',
    'routing/routes', 'context', 'includedModules/modulesInitializer', 'templateSettings',
    'progressContext', 'constants', 'userContext', 'errorsHandler',
    'modules/progress/index', 'account/index', 'xApi/xApiInitializer'
], function(ko, _, app, composition, router, routes, context, modulesInitializer, templateSettings,
    progressContext, constants, userContext, errorsHandler, progressProvider, account, xApiInitializer) {

    'use strict';
    var viewmodel = {
        router: null,
        cssName: null,
        isInReviewMode: false,
        title: '',
        createdOn: null,
        logoUrl: '',
        pdfExportEnabled: false,
        isClosed: ko.observable(false),
        isNavigatingToAnotherView: ko.observable(false),

        viewSettings: viewSettings,
        activate: activate
    };

    viewmodel.router = router;
    viewmodel.cssName = ko.computed(function() {
        var activeItem = router.activeItem();
        if (_.isObject(activeItem)) {
            var moduleId = activeItem.__moduleId__;
            moduleId = moduleId.slice(moduleId.lastIndexOf('/') + 1);
            return moduleId;
        }
        return '';
    });
    viewmodel.isInReviewMode = router.getQueryStringValue('reviewApiUrl');

    router.on('router:route:activating')
        .then(function(newView) {
            var currentView = router.activeItem();
            if (newView && currentView && newView.__moduleId__ === currentView.__moduleId__) {
                return;
            }
            viewmodel.isNavigatingToAnotherView(true);
        });
    
    app.on(constants.events.appClosed)
        .then(function() {
            viewmodel.isClosed(true);
        });

    return viewmodel;

    //public methods
    function activate() {
        return context.initialize()
            .then(userContext.initialize)
            .then(initializeProgressProvider)
            .then(initxApi)
            .then(initApp)
            .then(account.enable)
            .then(initRouter);

        function initxApi(){
            if(templateSettings.xApi.enabled){
                return xApiInitializer.initialize(templateSettings.xApi);
            }
        }

        function initializeProgressProvider() {
            if (!modulesInitializer.hasModule('lms') && location.href.indexOf('/preview/') === -1) {
                return progressProvider.initialize().then(function(provider) {
                    progressContext.use(provider);
                });
            }
        }

        function initApp(){
            return Q.fcall(function(){
                viewmodel.logoUrl = templateSettings.logoUrl;
                viewmodel.pdfExportEnabled = templateSettings.pdfExport.enabled;
                viewmodel.title = app.title = context.course.title;
                viewmodel.createdOn = context.course.createdOn;
                progressContext.restoreProgress();
                app.trigger(constants.events.appInitialized);
            });
        }

        function initRouter() {
            return router.map(routes.routes).buildNavigationModel().mapUnknownRoutes('viewmodels/404', '404').activate().then(function() {
                errorsHandler.startHandle();
            });
        }
    }

    function viewSettings() {
        var settings = {
            rootLinkEnabled: true,
            exitButtonVisible: true,
            treeOfContentVisible: true
        };

        var activeInstruction = router.activeInstruction();
        if (_.isObject(activeInstruction)) {
            settings.rootLinkEnabled = !activeInstruction.config.rootLinkDisabled && !router.isNavigationLocked();
            settings.exitButtonVisible = !activeInstruction.config.hideExitButton;
            settings.treeOfContentVisible = templateSettings.treeOfContent.enabled && activeInstruction.config.displayTreeOfContent;
        }
        return settings;
    }

    
});