//SCROLL LIBRARY
$('.mainbag').viewScroller({
                useScrollbar: false,
                changeWhenAnim: false
            });

//LEFT NAVIGATION DOTS 
var windowWidth = $( window ).width() - 100;

            $(".navigation-dot").mousemove(function(event){
              var text = event.target.id;
              $(".navigation-tooltip").css("top",event.pageY-40);	
              $(".navigation-tooltip").css("left",windowWidth);	
              $(".navigation-tooltip").css("display","block");
              $(".navigation-tooltip").html(text);
            });
            
            $(".navigation-dot").mouseout(function(){
              $(".navigation-tooltip").css("display","none");
            });

$(".count-1").animateNumber({ number: 17.9});
$(".count-2").animateNumber({ number: 85});

