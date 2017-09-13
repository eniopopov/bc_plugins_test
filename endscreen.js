/**
 * @brightcove/videojs-custom-endscreen
 * @version 2.0.10
 * @copyright 2017 Brightcove, Inc.
 * @license UNLICENSED
 */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.videojsCustomEndscreen = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _globalDocument = require('global/document');

var _globalDocument2 = _interopRequireDefault(_globalDocument);

var _videoJs = (typeof window !== "undefined" ? window['videojs'] : typeof global !== "undefined" ? global['videojs'] : null);

var _videoJs2 = _interopRequireDefault(_videoJs);

// Video.js 5/6 cross-compatibility:
var dom = _videoJs2['default'].dom || _videoJs2['default'];

var Button = _videoJs2['default'].getComponent('Button');
var ModalDialog = _videoJs2['default'].getComponent('ModalDialog');

var ICON_REPLAY = 'vjs-icon-replay';
var ICON_SHARE = 'vjs-icon-share';

var CLASS_BUTTONS = 'vjs-endscreen-overlay-buttons vjs-overlay-buttons';
var CLASS_CONTENT = 'vjs-endscreen-overlay-content';
var CLASS_HIDDEN = 'vjs-hidden';

/**
 * @class CustomEndscreenModal
 * @extends {ModalDialog}
 */

var CustomEndscreenModal = (function (_ModalDialog) {
  _inherits(CustomEndscreenModal, _ModalDialog);

  /**
   * Constructor for CustomEndscreenModal
   *
   * @method constructor
   * @param  {Player} player
   * @param  {Object} options
   * @param  {String} [options.rawContent='']
   */

  function CustomEndscreenModal(player, options) {
    _classCallCheck(this, CustomEndscreenModal);

    _get(Object.getPrototypeOf(CustomEndscreenModal.prototype), 'constructor', this).call(this, player, options);

    this.on('beforemodalopen', this.toggleSocialButton);
    this.on('modalfill', this.rawContentFill);

    var restartButton = this.restartButton = new Button(player);

    restartButton.addClass(ICON_REPLAY);
    restartButton.controlText(player.localize('Restart'));
    this.on(restartButton, ['click', 'tap'], this.restartPlayer);
    this.addChild(restartButton);

    var socialButton = this.socialButton = new Button(player);

    socialButton.addClass(ICON_SHARE);
    socialButton.controlText(player.localize('Share'));
    this.on(socialButton, ['click', 'tap'], this.activateSocial);
    this.addChild(socialButton);

    var buttonsEl = this.buttonEl = _globalDocument2['default'].createElement('div');

    buttonsEl.className = CLASS_BUTTONS;

    // Move the buttons into the buttons element.
    dom.insertContent(buttonsEl, [restartButton.el(), socialButton.el()]);

    var contentEl = this.contentEl();

    dom.addClass(contentEl, CLASS_CONTENT);
    contentEl.parentNode.appendChild(buttonsEl);
  }

  /**
   * Build the modal's CSS class.
   *
   * @method buildCSSClass
   * @return {String}
   */

  _createClass(CustomEndscreenModal, [{
    key: 'buildCSSClass',
    value: function buildCSSClass() {
      return 'vjs-custom-endscreen-overlay vjs-custom-overlay ' + _get(Object.getPrototypeOf(CustomEndscreenModal.prototype), 'buildCSSClass', this).call(this);
    }

    /**
     * Whether or not the associated player currently has the social plugin
     * activated on it.
     *
     * @method playerHasSocial
     * @return {Boolean}
     */
  }, {
    key: 'playerHasSocial',
    value: function playerHasSocial() {
      return !!this.player().socialOverlay;
    }

    /**
     * Toggles the display of the social button.
     *
     * @method toggleSocialButton
     */
  }, {
    key: 'toggleSocialButton',
    value: function toggleSocialButton() {
      this.socialButton.toggleClass(CLASS_HIDDEN, !this.playerHasSocial());
    }

    /**
     * Fills the modal with the raw string content from `rawContent`.
     *
     * @method rawContentFill
     */
  }, {
    key: 'rawContentFill',
    value: function rawContentFill() {
      var content = this.options_.rawContent;

      if (typeof content !== 'string') {
        content = '';
      }

      this.contentEl().innerHTML = content;
    }

    /**
     * Restarts playback in the associated player.
     *
     * @method restartPlayer
     */
  }, {
    key: 'restartPlayer',
    value: function restartPlayer() {
      var player = this.player();

      player.currentTime(0);
      player.play();
      this.close();
    }

    /**
     * Activates the social plugin modal.
     *
     * @method activateSocial
     */
  }, {
    key: 'activateSocial',
    value: function activateSocial() {
      var _this = this;

      var player = this.player();

      this.close();

      if (this.playerHasSocial()) {
        player.socialOverlay.open();
        player.socialOverlay.one('modalclose', function () {
          return _this.open();
        });
      }
    }
  }]);

  return CustomEndscreenModal;
})(ModalDialog);

_videoJs2['default'].registerComponent('CustomEndscreenModal', CustomEndscreenModal);

exports['default'] = CustomEndscreenModal;
module.exports = exports['default'];
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"global/document":4}],2:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _videoJs = (typeof window !== "undefined" ? window['videojs'] : typeof global !== "undefined" ? global['videojs'] : null);

var _videoJs2 = _interopRequireDefault(_videoJs);

var hasAds = function hasAds(player) {
  return !!player.ads;
};

/**
 * Resets an `endscreenState_` object.
 *
 * @function resetState
 * @param    {Object} state
 */
var resetState = function resetState(state) {
  state.adStarted = false;
  state.adFinished = false;
  state.postrollAdTimeout = false;
};

/**
 * Applies endscreen-triggering behavior to a player.
 *
 * @function endscreen
 */
var endscreen = function endscreen() {
  var _this = this;

  // Do not re-activate if already active!
  if (this.endscreenState_) {
    return;
  }

  var state = this.endscreenState_ = {};

  var trigger = function trigger() {
    _this.trigger('endscreen');
    resetState(_this.endscreenState_);
  };

  resetState(state);

  // videojs-ima3 appears to be firing an `adend` event at the start of
  // the actual video when the ad is a postroll. We can account for it
  // by checking if start was called and then if end was called. If a
  // postroll is being run, it will bind displaying the modal to
  // `adend` instead of `ended`.
  this.on('adstart', function () {
    state.adStarted = true;
    state.adFinished = false;
  });

  this.on('adend', function () {
    state.adFinished = true;
  });

  this.on('adtimeout', function () {

    // Only set to 'true' if it's a postroll timeout
    state.postrollAdTimeout = _this.ended();
  });

  this.on('ended', function () {

    // If there _are_ ads on the player when it finishes, but we are in the
    // middle of ad playback, do nothing.
    if (hasAds(_this) && state.adStarted !== state.adFinished) {
      return;
    }

    // If there _are_ ads on the player, no ad has played yet, and the postroll
    // ad didn't timeout, wait until the next "adend" to trigger the endscreen.
    if (hasAds(_this) && !state.adFinished && !state.postrollAdTimeout) {
      _this.one('adend', trigger);

      // Otherwise, trigger the endscreen.
    } else {
        trigger();
      }
  });
};

var registerPlugin = _videoJs2['default'].registerPlugin || _videoJs2['default'].plugin;

registerPlugin('endscreen', endscreen);

exports['default'] = endscreen;
module.exports = exports['default'];
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],3:[function(require,module,exports){

},{}],4:[function(require,module,exports){
(function (global){
var topLevel = typeof global !== 'undefined' ? global :
    typeof window !== 'undefined' ? window : {}
var minDoc = require('min-document');

if (typeof document !== 'undefined') {
    module.exports = document;
} else {
    var doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'];

    if (!doccy) {
        doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'] = minDoc;
    }

    module.exports = doccy;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"min-document":3}],5:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _videoJs = (typeof window !== "undefined" ? window['videojs'] : typeof global !== "undefined" ? global['videojs'] : null);

var _videoJs2 = _interopRequireDefault(_videoJs);

var _brightcoveVideojsEndscreen = require('@brightcove/videojs-endscreen');

var _brightcoveVideojsEndscreen2 = _interopRequireDefault(_brightcoveVideojsEndscreen);

var _customEndscreenModal = require('./custom-endscreen-modal');

var _customEndscreenModal2 = _interopRequireDefault(_customEndscreenModal);

// Video.js 5/6 cross-compatibility:
var registerPlugin = _videoJs2['default'].registerPlugin || _videoJs2['default'].plugin;

var defaults = { enabled: true, content: '' };

/**
 * Function to invoke when the player is ready.
 *
 * @function onPlayerReady
 * @param    {Player} player
 * @param    {Object} [options={}]
 */
var onPlayerReady = function onPlayerReady(player, options) {
  player.addClass('vjs-custom-endscreen');

  var modal = new _customEndscreenModal2['default'](player, {
    fillAlways: true,
    label: player.localize('Endscreen'),
    rawContent: options.content,
    temporary: false,
    uncloseable: true
  });

  player.customEndscreenModal = modal;

  // For backward compatibility, keep the `customOverlay` property.
  player.customOverlay = modal;

  player.addChild(modal);
};

/**
 * A video.js plugin to allow custom endscreens on a player.
 *
 * Has some interaction with the videojs-social plugin, but not in a
 * dependent way.
 *
 * @function customEndscreen
 * @param    {Object} [options={}]
 * @param    {String} [options.content='']
 *           An HTML string to be included as the content of the
 *           modal dialog. Note that by default the `ModalDialog`
 *           component does not support raw string content for
 *           security reasons; so, special handling is used here.
 */
var customEndscreen = function customEndscreen(options) {
    var _this = this,
        _options = _videoJs2['default'].mergeOptions(defaults, options);

    if (JSON.parse(_options.enabled) == false) {
        return;
    }

  // Invoke the endscreen plugin in this way so that the dependency doesn't
  // trigger any linter error(s).
  _brightcoveVideojsEndscreen2['default'].call(this);

  // Deal with multiple initializations.
  if (this.customEndscreenModal) {
    if (options && options.content) {
      this.customEndscreenModal.options_.rawContent = options.content;
    }
  } else {

    // When the "endscreen" event is triggered, open the modal.
    this.on('endscreen', function () {
      return _this.customEndscreenModal && _this.customEndscreenModal.open();
    });

    this.ready(function () {
      return onPlayerReady(_this, _options);
    });
  }
};

registerPlugin('customEndscreen', customEndscreen);

exports['default'] = customEndscreen;
module.exports = exports['default'];
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./custom-endscreen-modal":1,"@brightcove/videojs-endscreen":2}]},{},[5])(5)
});