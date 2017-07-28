/**
 * Bumpers Plugin
 */

videojs.plugin('bumpers', function(options) {

    var myPlayer = this,
        startPlayed = false,
        endPlayed = false;
        mainPlayed = false;
        
    var currentVideoId = myPlayer.options()['data-video-id'];

    myPlayer.on("play", function () {
        if(!startPlayed) {
            var startOptions = options.filter(function (value) {
                return value.type === 'start';
            });

            if(startOptions && startOptions.length > 0) {
                playVideo(startOptions[0].videoId, false);
                startPlayed = true;
            }
        }
    });

    // listen for the "ended" event and play the next video or bumper
    myPlayer.on('ended', function () {
        if(startPlayed && !mainPlayed) {
            playVideo(currentVideoId, true);
            mainPlayed = true;

        } else if (mainPlayed && !endPlayed){
            var endOptions = options.filter(function (value) {
                return value.type === 'end';
            });

            if(endOptions && endOptions.length > 0) {
                playVideo(endOptions[0].videoId, false);
                endPlayed = true;
            }
        }
    });

    function playVideo (videoId, showPoster) {
         myPlayer.catalog.getVideo(videoId, function(error, video) {
            //deal with errorB

            myPlayer.catalog.load(video);
            
            if(showPoster) {
                myPlayer.posterImage.show();
            } else {
                myPlayer.posterImage.hide();
            }
            
            myPlayer.play();
        }); 
    };


});