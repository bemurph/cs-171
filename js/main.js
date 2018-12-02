//SCROLL LIBRARY
$('.mainbag').viewScroller({
    useScrollbar: false,
    changeWhenAnim: false,
    afterChange: function() {
        $('.navigation-dot').removeClass('active');
        $('a[href="'+window.location.hash+'"] .navigation-dot').addClass('active');
    }
});

//NAVIGATION DOTS
var windowWidth = $( window ).width() - 200;
    $(".navigation-dot").mousemove(function(event) {
        let text = $(event.target).data('title');
        $(".navigation-tooltip").css({
            top: event.pageY - 40,
            left: windowWidth - 10,
            display: "block",
            width: 175,
        }).html(text)
    }).mouseout(function(){
        $(".navigation-tooltip").css("display","none");
    });

$(".count-1").animateNumber({ number: 17.9},1500);
$(".count-2").animateNumber({ number: 85},1500);

$(document).ready(function() {
    $('#risk-factor-list a').click(function(event) {
        let element = $(event.target);
        $('#risk-factor-list a').removeClass('active');
        element.addClass('active');
        let recommendation = $(element.data('target'));
        $('.recommendation').hide();
        recommendation.fadeIn('slow');
    });
    let activeView = window.location.hash ? window.location.hash : '#view-1';
    $('a[href="'+activeView+'"] .navigation-dot').addClass('active');
    $('.next-content').on('click', function() {
        $.fn.viewScroller.showMainView('next');
    });
});