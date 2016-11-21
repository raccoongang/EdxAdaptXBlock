/* Javascript for EdxAdaptXBlock. */
function EdxAdaptXBlock(runtime, element) {

    var studentId = '{{anonymous_student_id}}';
    var apiBaseUrl = '{{edx_adapt_api_url}}';
    var courseId = '{{course_id}}';
    var params = {{params}};
    var skills = {{skills}};

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
            configureUser();
        })
        .fail(function() {
            console.log("Failed to create user");
            setStatusNok();
        })
    };

    var configureUser = function() {
        // Configure skill for the user
        skills.forEach(function(skill) {
            var student_config = {
                'course_id': courseId,
                'params': params,
                'user_id': studentId,
                'skill_name': skill
            };
            $.ajax({
                url: apiBaseUrl + '/course/' + courseId + '/user/' + studentId,
                type: 'GET',
                contentType: 'application/json',
                data: JSON.stringify(student_config),
            })
            .done(function(data, textStatus) {
                setStatusOk();
            })
            .fail(function() {
                console.log('Failed to configure skill "'+skill+'" for user "'+studentId+'"');
                setStatusNok();
            });
        })
    };

    var registerUserInEdxAdapt = function() {
        // Check if student already registered in EdxAdapt
        $.ajax({
            url: apiBaseUrl + '/course/' + courseId + '/user/' + studentId,
            type: 'GET',
            contentType: 'application/json',
        })
        .done(function(data, textStatus) {
            console.log("success", data, textStatus);
            // conokfigureUser();
        })
        .fail(function(jqXHR, textStatus) {
            if (jqXHR.status == 404) {
                // Student not found in EdxAdapt. Let's register them
                registerUser();
            }
            console.log("Failed to register student in EdxAdapt", jqXHR.responseText);
        });
    }
    var setStatusOk = function() {
        $('#status_ok').css('visibility', 'visible');
    }
    var setStatusNok = function() {
        $('#status_nok').css('visibility', 'visible');
    }
    $(function ($) {
        registerUserInEdxAdapt();
    });
}