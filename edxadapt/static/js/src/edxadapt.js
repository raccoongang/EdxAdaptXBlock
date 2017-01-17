/* Javascript for EdxAdaptXBlock. */
function EdxAdaptXBlock(runtime, element) {

    var options = $('#edx-adapt-options');
    var studentId = options.data('student-id');
    var apiBaseUrl = options.data('api-base-url');
    var courseId = options.data('course-id');
    var params = options.data('params');
    var skills = options.data('skills');

    /** Create user */
    var registerUser = function(){
        $.ajax({
            url: apiBaseUrl + '/course/' + courseId + '/user',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({'user_id': studentId}),
        })
        .done(function() {
            console.log("User Created");
            setStatusOk();
        })
        .fail(function() {
            console.log("Failed to create user");
            setStatusNok();
        });
    };

    /** Configure skill for the user */
    function configureUser() {
        var studentConfig = {
            'course_id': courseId,
            'params': params,
            'user_id': studentId,
            'skills_list': skills
        };
        return $.ajax({
            url: apiBaseUrl + '/parameters/bulk',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(studentConfig),
        })
        .done(function() {
            console.log("Skills: " + skills + " is  configured");
        })
        .fail(function() {
            console.log('Failed to configure skills: "'+skills+'" for user "'+studentId+'"');
            setStatusNok();
        });
    };

    /** Check if student already registered in EdxAdapt */
    function registerUserInEdxAdapt() {
        $.ajax({
            url: apiBaseUrl + '/course/' + courseId + '/user/' + studentId,
            type: 'GET',
            contentType: 'application/json',
        })
        .done(function(data, textStatus) {
            console.log("success", data, textStatus);
            setStatusOk();
        })
        .fail(function(jqXHR, textStatus) {
            if (jqXHR.status == 404) {
                // Student not found in EdxAdapt. Let's register them
                $.when.apply($, configureUser()).then(registerUser());
            }
            console.log("Failed to register student in EdxAdapt", jqXHR.responseText);
        });
    }
    function setStatusOk() {
        $('#status_ok').css('visibility', 'visible');
    }
    function setStatusNok() {
        $('#status_nok').css('visibility', 'visible');
    }
    $(function ($) {
        registerUserInEdxAdapt();
    });
}
