/* Javascript for EdxAdaptXBlock. */
function EdxAdaptXBlock(runtime, element) {

    var options = $('#edx-adapt-options');
    var studentId = options.data('student-id');
    var apiBaseUrl = options.data('api-base-url');
    var courseId = options.data('course-id');
    var params = options.data('params');
    var skills = options.data('skills');

    /** Create user */
    function registerUser() {
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
            setStatusOk(data);
        })
        .fail(function(jqXHR, textStatus) {
            if (jqXHR.status == 404) {
                // Student not found in EdxAdapt. Let's register them
                $.when(configureUser()).then(registerUser());
            }
            console.log("Failed to register student in EdxAdapt", jqXHR.responseText);
        });
    }

    /**
    * Create and publish custom event with url to the problem chosen by EdxAdapt.
    * @param {object} data - response data from EdxAdapt
    */
    function createEnrollOkEvent(data) {
        var problemUrl;
        if (data.current) {
            problemUrl = data.current.tutor_url;
        } else if (data.next) {
            problemUrl = data.next.tutor_url;
        }
        if (problemUrl) {
            var event = new CustomEvent(
                "edxAdaptEnrollOk", {detail: {adaptiveProblem: problemUrl}}
            );
            document.dispatchEvent(event);
        } else {
            console.log("Failed to get tutor_url to the first adaptive problem");
        }
    }

    /**
    * Get student's status data form the EdxAdapt and use it for custom event creation.
    * @param {object} data - response data from EdxAdapt
    */
   function getFirstAdaptiveProblem(data) {
        if (data) {
            createEnrollOkEvent(data);
        } else {
            $.ajax({
                url: apiBaseUrl + '/course/' + courseId + '/user/' + studentId,
                type: 'GET',
                contentType: 'application/json',
            })
            .done(function(data, textStatus) {
                console.log("First problem successfully found", textStatus);
                createEnrollOkEvent(data);
            })
            .fail(function(jqXHR, textStatus) {
                console.log("Failed to get first adaptive problem for student from EdxAdapt", jqXHR.responseText);
            });
        }
    }

    /**
    * Set visible #statusOk div and create custom event student enrolled successful.
    * @param {object} data - response data from EdxAdapt
    */
    function setStatusOk(data) {
        $('#status_ok').css('visibility', 'visible');
        getFirstAdaptiveProblem(data);
    }

    function setStatusNok() {
        $('#status_nok').css('visibility', 'visible');
    }
    $(function ($) {
        registerUserInEdxAdapt();
    });
}
