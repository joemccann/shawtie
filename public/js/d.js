$(function() {

    // http://stackoverflow.com/questions/499126/jquery-set-cursor-position-in-text-area
    $.fn.selectRange = function(start, end) {
        return this.each(function() {
                if(this.setSelectionRange) {
                        this.focus();
                        this.setSelectionRange(start, end);
                } else if(this.createTextRange) {
                        var range = this.createTextRange();
                        range.collapse(true);
                        range.moveEnd('character', end);
                        range.moveStart('character', start);
                        range.select();
                }
        });
		};

    // TODO:  Handle click or touch event
    $('form').bind('submit', function(e) {
        // Get email address value.
        var $show = $('.show');

        $show.fadeOut(400, function() {
            $show.removeClass('show').addClass('hide');

		        var url = '/s/1/invite';
		        var dataType = 'json';
		        var data = {
		            email: document.getElementById('email').value
		        }
		        var success = function(data) {
		            $('#response').fadeIn(400)
		            document.getElementById('apikey').value = data.apikey;
		            $('#response').selectRange(0, $('#response').val().length);  // let's make it copy friendly.
		        }
		        $.ajax({
		            type: 'POST',
		            url: url,
		            data: data,
		            success: success,
		            dataType: dataType
		        });
        });
        return false;
    });

});