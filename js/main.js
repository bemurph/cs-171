//SCROLL LIBRARY
$('.mainbag').viewScroller({
                useScrollbar: false,
                changeWhenAnim: false,
            });

//NAVIGATION DOTS
var windowWidth = $( window ).width() - 200;
    $(".navigation-dot").mousemove(function(event) {
        let text = $(event.target).data('title');
        $(".navigation-tooltip").css({
            top: event.pageY - 40,
            left: windowWidth,
            display: "block",
            width: 175,
        }).html(text)
    }).mouseout(function(){
        $(".navigation-tooltip").css("display","none");
    });

$(".count-1").animateNumber({ number: 17.9});
$(".count-2").animateNumber({ number: 85});
