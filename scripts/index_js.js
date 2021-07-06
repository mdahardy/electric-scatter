document.querySelectorAll(".video-div").forEach(function(div_wrapper){
    const curr_video_div = document.getElementById(`video-${div_wrapper.id.slice(-1)}`);
    div_wrapper.addEventListener('mouseover',function(){
        curr_video_div.play();
    });
    div_wrapper.addEventListener('mouseleave',function(){
        curr_video_div.currentTime = 0;
        curr_video_div.pause();
    });
})