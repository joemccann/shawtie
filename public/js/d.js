$(function() {

    // http://stackoverflow.com/questions/499126/jquery-set-cursor-position-in-text-area
    $.fn.selectRange = function(start, end) {
        return this.each(function() {
            if (this.setSelectionRange) {
                this.focus();
                this.setSelectionRange(start, end);
            } else if (this.createTextRange) {
                var range = this.createTextRange();
                range.collapse(true);
                range.moveEnd('character', end);
                range.moveStart('character', start);
                range.select();
            }
        });
    };


    var $show = $('.show'),
				$response = $('#response'),
				$error = $('#error'),
				$apikey = $('#apikey');
				

    var apikeyGeneration = {
        dataType: 'json',
        beforeSubmit: function() {
				// probably validate some shit.
        },
        success: function(data) {
	
				  $show.fadeOut(400, function() {
              $show.removeClass('show').addClass('hide');
							if (data.code == 201)
							{
								document.getElementById('apikey').value = data.apikey;
								$response.fadeIn(400, function(){});
		            $apikey.selectRange(0, $apikey.val().length); // let's make it copy friendly.
							}
							else
							{
								console.log(data)
								if( data.code == 200)
								{
									document.getElementById('error-message').value = data.message;
									$error.fadeIn(400)
								}
							}
          });
        
        }
    }

		var shawtieUrlGeneration = {
        dataType: 'json',
        beforeSubmit: function() {
				// probably validate some shit.
        },
        success: function(data) {
	
				  $show.fadeOut(400, function() {
              $show.removeClass('show').addClass('hide');
							if (data.code == 201)
							{
								document.getElementById('shawtie').value = data.shortenedUrl;
								$response.fadeIn(400, function(){});
		            $(document.getElementById('shawtie')).selectRange(0, $(document.getElementById('shawtie')).val().length); // let's make it copy friendly.
							}
							else
							{
								console.log(data)
								if( data.code == 200)
								{
									document.getElementById('error-message').value = data.message;
									$error.fadeIn(400)
								}
							}
          });
        
        }
    }

    $('#invite').bind('submit', function(e) {
        e.preventDefault();
        $(this).ajaxSubmit(apikeyGeneration);
    });

    $('#create').bind('submit', function(e) {
        e.preventDefault();
        $(this).ajaxSubmit(shawtieUrlGeneration);
    });

});