
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
        className: 'vjs-transcript-container vjs-hidden'
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

  var PlayerContainerFlex = videojs.extend(Component, {

    createEl: function() {
      return videojs.createEl('div', {
        className: 'vjs-tech-flex'
      });
    }
  });

  videojs.registerComponent('TranscriptContainer', TranscriptContainer);
  videojs.registerComponent('PlayerContainerFlex', PlayerContainerFlex);

  var defaults = {
    enabled: true
  };

  videojs.plugin('transcript', function(options) {
      var _player = this,
          _transcriptButton,
          _transcriptContainer,
          _flexContainer;
          

      var _options = videojs.mergeOptions(defaults, options);
      
      if(!_player.controlBar || JSON.parse(_options.enabled) == false) {
        return;
      }

      var _trackList = new TrackList(_player);

      _transcriptButton = _player.controlBar.addChild('Button', {});
      _transcriptButton.addClass('vjs-icon-subtitles');
      _transcriptButton.addClass('vjs-hidden');
      _transcriptButton.addClass('vjs-transcript-button');

      _transcriptButton.on("click", function () {
        if(_transcriptContainer.hasClass('vjs-hidden')) {
          _transcriptContainer.show();
        } else {
          _transcriptContainer.hide();
        }
      }); 

      _player.one('ready', function () {
        var FlexContainer = videojs.getComponent('PlayerContainerFlex');
        _flexContainer = new FlexContainer(_player, {});
        var childComponents = _player.children();
        
        for(var i = 0; i < childComponents.length; i++ ) {
          _flexContainer.addChild(childComponents[i]);
          _player.removeChild(childComponents[i].id);
        }

        _player.addChild(_flexContainer);

        var TranscriptComponent = videojs.getComponent('TranscriptContainer');
        _transcriptContainer = new TranscriptComponent(_player, {});
        _player.addChild(_transcriptContainer);
      });

      _player.one('loadedmetadata', function () {
        var tracks = _trackList.get();
        if(tracks && tracks.length > 0) {
          _transcriptButton.show();
          _transcriptContainer.updateContent(_trackList.getText(_trackList.active(tracks)));
        }
      });
  });

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

}(window, window.videojs));