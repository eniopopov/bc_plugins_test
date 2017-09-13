/**
 * Jump To Chapter Plugin
 */

(function (window, videojs) {
  var defaults = {
    enabled: true
  };

  videojs.plugin('jumpToChapter', function(options) {
    var _player = this;

    var _options = videojs.mergeOptions(defaults, options);

    _player.on('loadeddata', function () {
        if(_player.controlBar && _player.controlBar.chaptersButton && JSON.parse(_options.enabled) == false) {
          _player.controlBar.chaptersButton.addClass('vjs-hidden');
        }
    });
  });
}(window, window.videojs));