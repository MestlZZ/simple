define(['context', 'translation', '../constants', './httpWrapper', './urlProvider',
        './auth'
    ],
    function (context, translation, constants, httpWrapper, urlProvider, auth) {
        'use strict';

        function ProgressStorageProvider(courseId, templateId) {
            var _progress = null;
            this.courseId = courseId;
            this.templateId = templateId;

            this.progressKey = constants.progressKey + this.courseId + this.templateId;
            this.resultKey = constants.resultKey + this.courseId + this.templateId;

            this.getProgress = function () {
                return _progress;
            };

            this.getProgressFromServer = function () {
                return httpWrapper.get(urlProvider.progressStorageUrl + 'progress', {
                    courseId: this.courseId,
                    templateId: this.templateId,
                }, auth.headers).then(function (response) {
                    _progress = JSON.parse(response.progress);
                });
            }

            this.saveProgress = function (progress) {
                return httpWrapper.post(urlProvider.progressStorageUrl + 'progress', {
                    courseId: this.courseId,
                    templateId: this.templateId,
                    jsonProgress: progress ? JSON.stringify(progress) : null
                }, auth.headers);
            };

            this.saveResults = function (getScore, getStatus, errorMessage) {
                //TODO: now we use only localStorage for save results
                var result = {
                    score: context.course.score(),
                    status: context.course.getStatus()
                };

                try {
                    localStorage.setItem(this.resultKey, JSON.stringify(result));
                } catch (e) {
                    alert(translation.getTextByKey('[not enough memory to save progress]'));
                }
                return true;
            };

            this.removeProgress = function (callback) {
                 return httpWrapper.post(urlProvider.progressStorageUrl + 'progress', {
                    courseId: this.courseId,
                    templateId: this.templateId,
                    jsonProgress: null
                }, auth.headers);
            };
        }

        return ProgressStorageProvider;
    });