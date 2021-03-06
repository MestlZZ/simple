﻿define(['templateSettings'],
    function (templateSettings) {

        var ctor = function (spec) {

            var section = {
                id: spec.id,
                title: spec.title,
                imageUrl: spec.imageUrl,
                questions: spec.questions
            };

            var questions = _.filter(section.questions, function (question) {
                    return question.affectProgress;
                });

            section.affectProgress = questions.length > 0;

            section.score = ko.computed(function () {
                var result = _.reduce(questions, function (memo, question) { return memo + question.score(); }, 0);
                var questionsLength = questions.length;
                return questionsLength === 0 ? 0 : Math.floor(result / questionsLength);
            });

            section.isCompleted = ko.computed(function () {
                return section.score() >= templateSettings.masteryScore.score;
            });

            return section;
        };

        return ctor;
    }
);