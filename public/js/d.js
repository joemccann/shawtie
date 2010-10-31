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
				$apikey = $('#apikey');
				

    var formSubmission = {
        dataType: 'json',
        beforeSubmit: function() {
				// probably validate some shit.
        },
        success: function(data) {
	
				  $show.fadeOut(400, function() {
              $show.removeClass('show').addClass('hide');
	            document.getElementById('apikey').value = data.apikey;
							$response.fadeIn(400, function(){
		            $apikey.selectRange(0, $apikey.val().length); // let's make it copy friendly.
							});
          });
        
        }
    }

    $('#invite').bind('submit', function(e) {
        e.preventDefault();
        $(this).ajaxSubmit(formSubmission);
    });

});