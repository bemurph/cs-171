$('.mainbag').viewScroller({
                useScrollbar: false,
                changeWhenAnim: false
            });

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

