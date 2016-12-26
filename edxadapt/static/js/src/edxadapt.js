/* Javascript for EdxAdaptXBlock. */
function EdxAdaptXBlock(runtime, element) {

    var options = $('#edx-adapt-options');
    var studentId = options.data('student-id');
    var apiBaseUrl = options.data('api-base-url');
    var courseId = options.data('course-id');
    var params = options.data('params');
    var skills = options.data('skills');

    var registerUser = function(){
        // Create user
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

    function configureUser() {
        // Configure skill for the user
        var req_list = [];
        skills.forEach(function(skill) {
            var student_config = {
                'course_id': courseId,
                'params': params,
                'user_id': studentId,
                'skill_name': skill
            };
            req_list.push(
                $.ajax({
                    url: apiBaseUrl + '/parameters',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(student_config),
                })
                .done(function() {
                    console.log("Skill " + skill + "is  configured");
                })
                .fail(function() {
                    console.log('Failed to configure skill "'+skill+'" for user "'+studentId+'"');
                    setStatusNok();
                });
            )
        });
        return req_list;
    };

    function registerUserInEdxAdapt() {
        // Check if student already registered in EdxAdapt
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
