/**
 * Transcript Plugin
 */

(function (window, videojs) {
  var Component = videojs.getComponent('Component');

  var TranscriptContainer = videojs.extend(Component, {

    constructor: function(player, options) {
      Component.apply(this, arguments);

      if (options.text) {
        this.updateContent(options.text);
      }
    },
    createEl: function() {
      return videojs.createEl('div', {
        className: 'video-js vjs-transcript-container vjs-hidden'
      });
    },

    updateContent: function(text) {
      if (typeof text !== 'string') {
        text = '';
      }

      text = text.replace('\\n', '&#13;&#10;');
      text = text.replace('\\rn', '&#13;&#10;');

      videojs.emptyEl(this.el());
      videojs.appendContent(this.el(), text);
    }
  });

  videojs.registerComponent('TranscriptContainer', TranscriptContainer);

  var TrackList = function (player) {
    var activeTrack,
        tracks = [];

    return {
      get: function () {
        var validTracks = [];
        var i, track;
        tracks = player.textTracks();
        for (i = 0; i < tracks.length; i++) {
          track = tracks[i];
          if (track.kind === 'captions') {
            validTracks.push(track);
          }
        }
        return validTracks;
      },
      active: function (tracks) {
        var i, track;
        for (i = 0; i < tracks.length; i++) {
          track = tracks[i];
          if (track.mode === 'showing') {
            activeTrack = track;
            return track;
          }
        }
        return activeTrack || tracks[0];
      },
      getText: function (track) {
        if(!track || !track.cues) 
          return '';

        var text= '';
        for(var i = 0; i < track.cues.length; i++) {
          if(track.cues[i].text) {
            text = text + ' ' + track.cues[i].text;
          }
        }

        return text;
      },
    };
  };

  var defaults = {
    enabled: true
  };

  videojs.plugin('transcript', function(options) {
      var _player = this,
          _playerHeight,    
          _playerWidth,
          _transcriptButton,
          _transcriptContainer,
          _constants = {
              TranscriptContainerHeight: 0.25
          };

      var _options = videojs.mergeOptions(defaults, options);
      
      if(!_player.controlBar || JSON.parse(_options.enabled) == false) {
        return;
      }

      var _trackList = new TrackList(_player);
      
      _playerHeight = _player.el().clientHeight;
      _playerWidth = _player.el().clientWidth;
      
      var TranscriptComponent = videojs.getComponent('TranscriptContainer');
      _transcriptContainer = new TranscriptComponent(_player, {});

      var parent = _player.el().parentNode;
      parent.insertBefore(_transcriptContainer.el(), _player.el().nextSibling);

      _transcriptButton = _player.controlBar.addChild('Button', {});
      _transcriptButton.addClass('vjs-icon-subtitles');
      _transcriptButton.addClass('vjs-hidden');
      _transcriptContainer.el().style.width = _playerWidth + 'px';

      _transcriptButton.on("click", function () {
        if(_transcriptContainer.hasClass('vjs-hidden')) {   
          if(_player.isFullscreen()) {
            _transcriptContainer.addClass('vjs-transcript-container-fullscreen');
            _player.addClass('vjs-transcript-player-fullscreen');
            _transcriptContainer.el().style.height = (_constants.TranscriptContainerHeight * 100) + '%';
          } else {
            _player.el().style.height = (_playerHeight * (1 - _constants.TranscriptContainerHeight)) + 'px';
            _transcriptContainer.el().style.height = (_playerHeight * _constants.TranscriptContainerHeight) + 'px';
          } 
          _transcriptContainer.show();
        } else {
          _transcriptContainer.hide();
          if(_player.isFullscreen()) {
            _player.removeClass('vjs-transcript-player-fullscreen');
            _transcriptContainer.removeClass('vjs-transcript-container-fullscreen');
          } else {
            _player.el().style.height = (_playerHeight) + 'px';
          }
        }
      }); 
      
      _player.on('fullscreenchange', function () {
        if(_player.isFullscreen()) {
          if(!_transcriptContainer.hasClass('vjs-hidden')) {   
            _transcriptContainer.addClass('vjs-transcript-container-fullscreen');
            _player.addClass('vjs-transcript-player-fullscreen');

            _transcriptContainer.el().style.height = (_constants.TranscriptContainerHeight * 100) + '%';
          }
        } else {
          if(_transcriptContainer.hasClass('vjs-hidden')) {   
            _player.el().style.height = (_playerHeight) + 'px';
          } else {
            _player.el().style.height = (_playerHeight * (1 - _constants.TranscriptContainerHeight)) + 'px';
            _transcriptContainer.el().style.height = (_playerHeight * _constants.TranscriptContainerHeight) + 'px';
          }
          _player.removeClass('vjs-transcript-player-fullscreen');
          _transcriptContainer.removeClass('vjs-transcript-container-fullscreen');
        }
      });

      _player.on('loadedmetadata', function () {
        var tracks = _trackList.get();
        if(tracks && tracks.length > 0) {
          _transcriptButton.show();
          _transcriptContainer.updateContent(_trackList.getText(_trackList.active(tracks)));
        }
      });
  });
}(window, window.videojs));