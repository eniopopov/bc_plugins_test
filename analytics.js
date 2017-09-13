/*
 * videojs-ga-videocloud - v0.4.2 - 2016-08-24
 * Based on videojs-ga 0.4.2
 * Copyright (c) 2016 Michael Bensoussan
 * Licensed MIT
 */
(function () {
  var __indexOf = [].indexOf || function (item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };
  var __isArray = function (arg) { return Object.prototype.toString.call(arg) === '[object Array]'; };
  var __extend = function (obj, src) { for (var key in src) { if (src.hasOwnProperty(key)) obj[key] = src[key]; } return obj; }

  var _defaultsEventsToTrack = ['player_load', 'video_load', 'percent_played', 'start', 'end', 'seek', 'play', 'pause', 'resize', 'volume_change', 'error', 'fullscreen'];
  var _eventNames = {
    "video_load": "Video Load",
    "percent_played": "Percent played",
    "start": "Media Begin",
    "seek_start": "Seek start",
    "seek_end": "Seek end",
    "play": "Media Play",
    "pause": "Media Pause",
    "error": "Error",
    "fullscreen_exit": "Fullscreen Exited",
    "fullscreen_enter": "Fullscreen Entered",
    "resize": "Resize",
    "volume_change": "Volume Change",
    "player_load": "Player Load",
    "end": "Media Complete"
  };

  function TrackerCollection(options, globals) {
    var _self = this,
      _options;

    init();

    function init() {
      if (options) {
        _options = options || {};

        if (_options.trackers && __isArray(_options.trackers)) {
          for (var i = 0; i < _options.trackers.length; i++) {
            var tracker = new Tracker(_options.trackers[i], globals);
            if (tracker.isValid) {
              _self.push(tracker);
            }
          }
        }
      }
    }

    _self.each = function (callback) {
      if (callback && typeof callback == 'function') {
        for (var i = 0; i < _self.length; i++) {
          callback(i, _self[i]);
        }
      }
    }

    _self.hasValid = function () {
      //TODO: Implement
      // for (var i = 0; i < _self.length; i++) {
      //   if (!_self[i].isValid) {
      //     return false;
      //   }
      // }

      return true;
    }

    _self.setEventLabel = function (label) {
      for (var i = 0; i < _self.length; i++) {
        if (!_self[i].eventLabel) {
          _self[i].eventLabel = label;
        }
      }
    }

    _self.sendBeacon = function (action, nonInteraction, value) {
      for (var i = 0; i < _self.length; i++) {
        _self[i].sendBeacon(action, nonInteraction, value);
      }
    }

    _self.gaCreate = function () {
      _self.each(function (index, tracker) {
        //TODO: Add cookie config
        ga('create', tracker.trackingId, 'none', tracker.trackerName);
        ga(tracker.trackerName + 'require', 'displayfeatures');
      });
    }

    function Tracker(trackerOptions, globals) {
      var _self = __extend({}, trackerOptions);

      _self.trackingId = _self.tracker || globals.tracker;
      _self.trackerName = _self.trackerName || null;
      _self.eventsToTrack = _self.eventsToTrack || globals.eventsToTrack || _defaultsEventsToTrack;
      _self.eventLabel = _self.eventLabel || globals.eventLabel;
      _self.eventCategory = _self.eventCategory || globals.eventCategory || 'Brightcove Player';
      _self.isValid = true;
      _self.getEventName = getEventName;
      _self.sendBeacon = sendBeacon;
      _self.isTracking = isTracking;

      if (typeof _self.trackerName === 'string') {
        _self.trackerName = _self.trackerName + '.';
      } else {
        _self.trackerName = '';
      }

      function getEventName(name) {
        if (_self.eventNames && options.eventNames[name]) {
          return _self.eventNames[name];
        }
        if (globals.eventNames && globals.eventNames[name]) {
          return globals.eventNames[name];
        }
        if (_eventNames[name]) {
          return _eventNames[name];
        }

        return name;
      };

      function sendBeacon(event, nonInteraction, value) {
        if (__indexOf.call(_self.eventsToTrack, event) >= 0) {
          var action = _self.getEventName(event);

          if (_self.sendbeaconOverride) {
            sendbeaconOverride(_self.eventCategory, action, _self.eventLabel, value, nonInteraction);
          } else if (window.ga) {
            ga(_self.trackerName + 'send', 'event', _self.eventCategory, action, _self.eventLabel, value, nonInteraction);
          } else if (window._gaq) {
            _gaq.push(['_trackEvent', _self.eventCategory, action, _self.eventLabel, value, nonInteraction]);
          } else if (options.debug) {
            videojs.log("Google Analytics not detected");
          }
        }
      };

      function isTracking(event) {
        return __indexOf.call(_self.eventsToTrack, event) >= 0;
      };

      return _self;
    }

    return _self;
  }

  TrackerCollection.prototype = new Array();
  TrackerCollection.constructor = TrackerCollection;

  videojs.plugin('ga', function (options) {
    var adStateRegex, currentVideo, dataSetupOptions, end, endTracked, error, fullscreen, getEventName, isInAdState, loaded, parsedOptions, pause, percentsAlreadyTracked, play, player, referrer, resize, seekEnd, seekStart, seeking, start, startTracked, timeupdate, volumeChange, percentsPlayedInterval,
      _trackers, _this = this;

    if (options == null) {
      options = {};
    }

    referrer = document.createElement('a');
    referrer.href = document.referrer;
    if (self !== top && window.location.host === 'preview-players.brightcove.net' && referrer.hostname === 'studio.brightcove.com') {
      videojs.log('Google analytics plugin will not track events in Video Cloud Studio');
      return;
    }

    player = this;
    dataSetupOptions = {};
    if (this.options()["data-setup"]) {
      parsedOptions = JSON.parse(this.options()["data-setup"]);
      if (parsedOptions.ga) {
        dataSetupOptions = parsedOptions.ga;
      }
    }

    options.debug = options.debug || false;

    _trackers = new TrackerCollection(options, dataSetupOptions);

    percentsPlayedInterval = options.percentsPlayedInterval || dataSetupOptions.percentsPlayedInterval || 10;
    percentsAlreadyTracked = [];
    startTracked = false;
    endTracked = false;
    seekStart = seekEnd = 0;
    seeking = false;
    eventLabel = '';
    currentVideo = '';

    if (window.location.host === 'players.brightcove.net' || window.location.host === 'preview-players.brightcove.net') {
      //TODO: || trackerName !== ''

      if (trackers && trackers.hasValid()) {
        (function (i, s, o, g, r, a, m) { i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function () { (i[r].q = i[r].q || []).push(arguments) }, i[r].l = 1 * new Date(); a = s.createElement(o), m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m) })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga')

        _trackers.gaCreate();
      }
    }
    adStateRegex = /(\s|^)vjs-ad-(playing|loading)(\s|$)/;
    isInAdState = function (player) {
      return adStateRegex.test(player.el().className);
    };
    loaded = function () {
      if (!isInAdState(player)) {
        if (player.mediainfo && player.mediainfo.id) {
          _trackers.setEventLabel(player.mediainfo.id + ' | ' + player.mediainfo.name);
        } else {
          _trackers.setEventLabel(this.currentSrc().split("/").slice(-1)[0].replace(/\.(\w{3,4})(\?.*)?$/i, ''));
        }

        if (player.mediainfo && player.mediainfo.id && player.mediainfo.id !== currentVideo) {
          currentVideo = player.mediainfo.id;
          percentsAlreadyTracked = [];
          startTracked = false;
          endTracked = false;
          seekStart = seekEnd = 0;
          seeking = false;

          _trackers.sendBeacon("video_load", true);
        }
      }
    };
    timeupdate = function () {
      var currentTime, duration, percent, percentPlayed, _i;
      if (!isInAdState(player)) {
        currentTime = Math.round(this.currentTime());
        duration = Math.round(this.duration());
        percentPlayed = Math.round(currentTime / duration * 100);
        for (percent = _i = 0; _i <= 99; percent = _i += percentsPlayedInterval) {
          if (percentPlayed >= percent && __indexOf.call(percentsAlreadyTracked, percent) < 0) {
            if (percentPlayed !== 0) {
              _trackers.sendBeacon('percent_played', true, percent);
            }
            if (percentPlayed > 0) {
              percentsAlreadyTracked.push(percent);
            }
          }
        }

        seekStart = seekEnd;
        seekEnd = currentTime;
        if (Math.abs(seekStart - seekEnd) > 1) {
          seeking = true;
          _trackers.sendBeacon('seek_start', false, seekStart);
          _trackers.sendBeacon('seek_end', false, seekEnd);
        }
      }
    };

    end = function () {
      if (!isInAdState(player) && !endTracked) {
        _trackers.sendBeacon('end', true);
        endTracked = true;
      }
    };

    play = function () {
      var currentTime;
      if (!isInAdState(player)) {
        currentTime = Math.round(this.currentTime());
        _trackers.sendBeacon('play', true, currentTime);
        seeking = false;
      }
    };

    start = function () {
      if (!isInAdState(player)) {
        if (!startTracked) {
          _trackers.sendBeacon('start', true);
          return startTracked = true;
        }
      }
    };

    pause = function () {
      var currentTime, duration;
      if (!isInAdState(player)) {
        currentTime = Math.round(this.currentTime());
        duration = Math.round(this.duration());
        if (currentTime !== duration && !seeking) {
          _trackers.sendBeacon('pause', true, currentTime);
        }
      }
    };

    volumeChange = function () {
      var volume;
      volume = this.muted() === true ? 0 : this.volume();
      _trackers.sendBeacon('volume_change', false, volume);
    };
    resize = function () {
      //TODO:
      //_trackers.sendBeacon(getEventName('resize') + ' - ' + this.width() + "*" + this.height(), true);
    };
    error = function () {
      var currentTime;
      currentTime = Math.round(this.currentTime());
      _trackers.sendBeacon('error', true, currentTime);
    };
    fullscreen = function () {
      var currentTime;
      currentTime = Math.round(this.currentTime());
      if (this.isFullscreen()) {
        _trackers.sendBeacon('fullscreen_enter', false, currentTime);
      } else {
        _trackers.sendBeacon('fullscreen_exit', false, currentTime);
      }
    };

    this.ready(function () {
      var href, iframe;

      this.on("loadedmetadata", loaded);
      this.on("timeupdate", timeupdate);
      this.on("ended", end);
      this.on("play", play);
      this.on("playing", start);
      this.on("pause", pause);
      this.on("volumechange", volumeChange);
      this.on("resize", resize);
      this.on("error", error);
      this.on("fullscreenchange", fullscreen);

      if (self !== top) {
        href = document.referrer;
        iframe = 1;
      } else {
        href = window.location.href;
        iframe = 0;
      }
    });
  });

}).call(this);