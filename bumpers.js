/**
 * Bumpers Plugin
 */

videojs.plugin('bumpers', function(opts) {

    var options = opts;

    var myPlayer = this,
        startPlayed = false,
        endPlayed = false;
        mainPlayed = false;

    options.push({
        type: 'main',
        videoId: myPlayer.options()['data-video-id']
    });

    preload();

    myPlayer.on("play", function () {
        if(!startPlayed) {
            var startOption = getVideoOption('start');

            if(startOption) {
                loadVideo(startOption.video, true, false);
                startPlayed = true;
            }
        }
    });

    // listen for the "ended" event and play the next video or bumper
    myPlayer.on('ended', function () {
        if(startPlayed && !mainPlayed) {
            var mainOption = getVideoOption('main');

            if(mainOption) {
                loadVideo(mainOption.video, true, true);
                mainPlayed = true;
            }

        } else if (mainPlayed && !endPlayed){
            var endOption = getVideoOption('end');

            if(endOption) {
                loadVideo(endOption.video, true, false);
                endPlayed = true;
            }
        } else if (endPlayed) {
            var mainOption = getVideoOption('main');

            startPlayed = mainPlayed = endPlayed = false;

            loadVideo(mainOption.video, false, false);
        }
    });

    function loadVideo (video, autoPlay, showPoster) { 
        myPlayer.catalog.load(video);
        
        if(showPoster) {
            myPlayer.posterImage.show();
        } else {
            myPlayer.posterImage.hide();
        }
        
        if(autoPlay) {
            myPlayer.play();
        }
    };

    function preload() {
        for(var i = 0; i < options.length; i++ ) {
            myPlayer.catalog.getVideo(options[i].videoId, function(error, video) {
                for(var j = 0; j < options.length; j++) {
                    if(options[j].videoId == video.id) {
                        if(!error) {
                            options[j].video = video;
                        } else {
                            options[j].playable = false;
                        }
                    }
                }
            });
        }
    }

    function getVideoOption(type) {
        var opts = options.filter(function (value) {
                return value.type === type;
            });

        if(opts && opts.length > 0) {
            return opts[0];
        }

        return null;
    }

});