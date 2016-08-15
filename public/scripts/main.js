$(document).ready(function() {

    /*global $*/
    var $signup = $('#signup');
    $signup.click(function(e) {
        e.preventDefault();

        $('#overlay').toggleClass('show');
        $('#modal2').toggleClass('show');
    });

    ///////
    //This is all the jquery stuff for the LOGIN functionality
    var $login = $('#login');
    $login.click(function(e) { //this console.logs the event to the browser
        e.preventDefault(); //this is a built in css function that prevent the form from continuin the execution
        e.stopPropagation(); //this is a built in css function that prevent the event from being propagated outside the scope of the event. Limited to the element. 
        $('#modal').toggleClass('show'); //jquery here, this looks for the element with id modal and applies the toggleClass, which will add the show class to the modal element
    });
    var $body = $('body');
    $body.on('click', function(e) {
        console.log(e)
        if ($(e.target).closest('#modal').is('#modal')) {
            return;
        }
        $('#modal').removeClass('show');
        $('#modal').addClass('hide');

    })
    var $loginSubmit = $('#loginSubmit');
    $loginSubmit.on('submit', function(e) {
        e.preventDefault();
        var values = {};
        $.each($loginSubmit.serializeArray(), function(i, field) { // Creating an array of objects containing form data
            values[field.name] = field.value;
        });
        $.ajax({
                method: "POST",
                url: "/login",
                data: values
            })
            .done(function(msg) {
                console.log(msg);
                if (msg === 'success') {
                    window.location.href = '/';
                }
                else {
                    $('#modal').append('<div>Your username or password was incorrect</div>')
                }
            });

    })


    ///////  singupSubmit
    //This is all the jquery stuff for the SIGNUP functionality
    var $overlay = $('#overlay');
    $overlay.on('click', function(e) {
        console.log(e);
        //alert('Hello');
        $('#modal2').removeClass('show');
        $('#modal2').addClass('hide');
        $('#overlay').removeClass('show');
        $('#overlay').addClass('hide');
    })

    var $signupSubmit = $('#signupSubmit');
    $signupSubmit.on('submit', function(e) {
            //console.log(e); this contains https://reddit-nodejs-api-cbroomhead.c9users.io/?username=qwerty&password=qwerty
            //alert('Hello');
            e.preventDefault();
            var values = {};
            $.each($signupSubmit.serializeArray(), function(i, field) {
                values[field.name] = field.value;
            });
            //console.log(values); this is an object that looks like this Object {username: "qwerty", password: "qwerty"}
            $.ajax({
                    method: "POST",
                    url: "/signup",
                    data: values
                })
                .done(function(msg) {
                    if (msg === 'success') {
                        window.location.href = '/';
                    }
                    else {
                        $('#modal2').append('<div>Your username or password was incorrect</div>')

                    }
                    console.log(msg);
                })
        })
        ///////
        //This is all the stuff for the CREATE POST functionality
    var $suggestTitle = $('#createPost');
    $('#suggestTitle').click(function(e) {
        e.preventDefault();
        e.stopPropagation();
        var urlinput = $('#urlinput').val();
        $.post('/suggestTitle', {
            url: urlinput
        }, function(data) {
            $('#titleinput').val(data)
        })
    });


    ///////
    //This is all the stuff for the POST VOTE functionality
    $('.postVote').on('submit', function(e) {
        e.preventDefault();
        var currentform = $(this);
        var forminfo = {};

        var serializedarray = currentform.serializeArray();
        serializedarray.forEach(function(input) {
            forminfo[input.name] = input.value;
        })
        $.post('/vote', forminfo, function(data) {
            $(`#votescore${forminfo.postId}`).text(`score: ${data.votescore}`);
            $(".upVote").click(function(e) {
                $(this).closest('.flex-smallbox').find(".postVote:eq(1)").find('.down').find('.downVote').removeClass("em-hankey").addClass('em--1');
                $(this).removeClass("em---1");
                $(this).addClass("em-kiss");
            })


            $('.downVote').click(function(e) {
                $(this).closest('.flex-smallbox').find(".postVote:eq(0)").find('.up').find('.upVote').removeClass("em-kiss").addClass('em---1');;
                $(this).removeClass("em--1");
                $(this).addClass("em-hankey");
            })
        })
    })

//secret stuff

var $keydown = $('#secretbody');
$keydown.on('keydown', function(e) {
    console.log(e);
    e.stopPropagation()
    e.preventDefault();
    alert("keydown...");
    
});


//do not delete this belongs to document ready at the top    
})

