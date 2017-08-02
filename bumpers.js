/**
 * Bumpers Plugin
 */

videojs.plugin('bumpers', function(params) {
    var bumpers = params.bumpers || [];

    var myPlayer = this,
        startPlayed = false,
        endPlayed = false;
        mainPlayed = false;

    myPlayer.one("loadedmetadata", function () {
            bumpers.push({
            type: 'main',
            sources: myPlayer.mediainfo.sources
        });

        preload();
    });

    myPlayer.on("play", function () {
        if(!startPlayed) {
            var startOption = getVideoOption('start');

            if(startOption) {
                loadVideo(startOption, true, false);
                startPlayed = true;
            }
        }
    });

    // listen for the "ended" event and play the next video or bumper
    myPlayer.on('ended', function () {
        if(startPlayed && !mainPlayed) {
            var mainOption = getVideoOption('main');

            if(mainOption) {
                loadVideo(mainOption, true, true);
                mainPlayed = true;
            }

        } else if (mainPlayed && !endPlayed){
            var endOption = getVideoOption('end');

            if(endOption) {
                loadVideo(endOption, true, false);
                endPlayed = true;
            }
        } else if (endPlayed) {
            var mainOption = getVideoOption('main');

            startPlayed = mainPlayed = endPlayed = false;

            loadVideo(mainOption, false, false);
        }
    });

    function loadVideo (option, autoPlay, showPoster) {

        if(option.video) {
            myPlayer.catalog.load(option.video);
        } else if (option.sources && option.sources.length > 0) {
            myPlayer.src(option.sources);
        }
        
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
        for(var i = 0; i < bumpers.length; i++ ) {
            if(bumpers[i].videoId) {
                myPlayer.catalog.getVideo(bumpers[i].videoId, function(error, video) {
                    for(var j = 0; j < bumpers.length; j++) {
                        if(video && bumpers[j].videoId == video.id) {
                            if(!error) {
                                bumpers[j].video = video;
                            } else {
                                bumpers[j].playable = false;
                            }
                        }
                    }
                });
            }
        }
    }

    function getVideoOption(type) {
        var opts = bumpers.filter(function (value) {
                return value.type === type;
            });

        if(opts && opts.length > 0) {
            return opts[0];
        }

        return null;
    }

});