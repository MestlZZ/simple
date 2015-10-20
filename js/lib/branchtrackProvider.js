﻿(function () {
    'use strict';

    function BranchtrackProvider() {
        var instances = {},
            messageProvider = 'branchtrack',
            supportedMessageTypes = {
                init: 'branchtrack:player:init',        //first time init
                start: 'branchtrack:player:start',      //start of playing, t.i. before first scene appear, including on restart
                scene: 'branchtrack:player:scene',      //new scene shown
                choice: 'branchtrack:player:choice',    //user hit the choice
                finish: 'branchtrack:player:finish'     //user reached last scene
            };

        return {
            create: createInstance,
            destroy: destroyInstance,
            instances: instances
        };

        function createInstance(projectId) {
            if (!projectId) {
                return;
            }

            if (isEmpty(instances)) {
                subscribeMessageEvent();
            }

            var branchtrack = new BranchtrackInstance(projectId);

            instances[projectId] = branchtrack;
            return instances[projectId];
        }

        function destroyInstance(instance) {
            if (instances[instance.projectId] !== 'undefined') {
                delete instances[instance.projectId];
            }

            if (isEmpty(instances)) {
                unsubscribeMessageEvent();
            }
        }

        function subscribeMessageEvent() {
            window.addEventListener('message', messageEventHadler);
        }

        function unsubscribeMessageEvent() {
            window.removeEventListener('message', messageEventHadler);
        }

        function messageEventHadler(event) {
            var data = JSON.parse(event.data);
            if (data.provider !== messageProvider) {
                return;
            }
            var projectId = data.details.project.permalink,
                messageDataType = data.type,
                branchtrackInstance = instances[projectId];

            if (typeof branchtrackInstance === 'undefined' || branchtrackInstance === null) {
                return;
            }

            if (messageDataType === supportedMessageTypes.scene && data.details.scene.score > 0) {
                branchtrackInstance.score = data.details.scene.score;
            }
        }

        function isEmpty(obj) {
            for (var key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    return false;
                }
            }

            return true;
        }
    }

    window.Branchtrack = BranchtrackProvider();

    function BranchtrackInstance(projectId) {
        this.projectId = projectId;
        this.score = 0;
    }

    BranchtrackInstance.prototype = {
        reset: function () {
            this.score = 0;
        },
        destroy: function () {
            Branchtrack.destroy(this);
        }
    };
})();