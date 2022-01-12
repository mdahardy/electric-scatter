if (!(window.matchMedia("(any-pointer:coarse)").matches)){
    document.querySelectorAll('.project-video source').forEach(source_i => {source_i.setAttribute('src', source_i.getAttribute('data-src'))});
    document.querySelectorAll('.project-video').forEach(vid => {vid.load()});
    document.querySelectorAll(".video-div").forEach(function(div_wrapper){
        const curr_video_div = document.getElementById(`video-${div_wrapper.id.slice(-1)}`);
        div_wrapper.addEventListener('mouseover',()=>{curr_video_div.play()});
        div_wrapper.addEventListener('mouseleave',()=>{
            curr_video_div.currentTime = 0;
            curr_video_div.pause();
        });
    });
};