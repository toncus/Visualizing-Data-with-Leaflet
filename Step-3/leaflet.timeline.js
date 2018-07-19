/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	/* global require, L */
	
	L.TimelineVersion = '1.0.0-beta';
	
	__webpack_require__(1);
	__webpack_require__(3);
	
	// webpack requires
	__webpack_require__(4);

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }(); /* global L */
	
	var _IntervalTree = __webpack_require__(2);
	
	var _IntervalTree2 = _interopRequireDefault(_IntervalTree);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	L.Timeline = L.GeoJSON.extend({
	  times: [],
	  ranges: null,
	
	  /**
	   * @constructor
	   * @param {Object} geojson The GeoJSON data for this layer
	   * @param {Object} options Hash of options
	   * @param {Function} [options.getInterval] A function which returns an object
	   * with `start` and `end` properties, called for each feature in the GeoJSON
	   * data.
	   * @param {Boolean} [options.drawOnSetTime=true] Make the layer draw as soon
	   * as `setTime` is called. If this is set to false, you will need to call
	   * `updateDisplayedLayers()` manually.
	   */
	  initialize: function initialize(geojson) {
	    var _this = this;
	
	    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
	
	    // Some functionality was changed after Leaflet 0.7; some people use the
	    // latest stable, some use the beta. This should work either way, so we need
	    // a version check.
	    this.ranges = new _IntervalTree2.default();
	    var semver = /^(\d+)(\.(\d+))?(\.(\d+))?(-(.*))?(\+(.*))?$/;
	
	    var _semver$exec = semver.exec(L.version);
	
	    var _semver$exec2 = _slicedToArray(_semver$exec, 4);
	
	    var major = _semver$exec2[1];
	    var minor = _semver$exec2[3];
	
	    this.isOldVersion = parseInt(major, 10) === 0 && parseInt(minor, 10) <= 7;
	    var defaultOptions = {
	      drawOnSetTime: true
	    };
	    L.GeoJSON.prototype.initialize.call(this, null, options);
	    L.Util.setOptions(this, defaultOptions);
	    L.Util.setOptions(this, options);
	    if (this.options.getInterval) {
	      this._getInterval = function () {
	        var _options;
	
	        return (_options = _this.options).getInterval.apply(_options, arguments);
	      };
	    }
	    if (geojson) {
	      this._process(geojson);
	    }
	  },
	  _getInterval: function _getInterval(feature) {
	    return {
	      start: new Date(feature.properties.start).getTime(),
	      end: new Date(feature.properties.end).getTime()
	    };
	  },
	
	
	  /**
	   * Finds the first and last times in the dataset, adds all times into an
	   * array, and puts everything into an IntervalTree for quick lookup.
	   *
	   * @param {Object} data GeoJSON to process
	   */
	  _process: function _process(data) {
	    var _this2 = this;
	
	    // In case we don't have a manually set start or end time, we need to find
	    // the extremes in the data. We can do that while we're inserting everything
	    // into the interval tree.
	    var start = Infinity;
	    var end = -Infinity;
	    data.features.forEach(function (feature) {
	      var interval = _this2._getInterval(feature);
	      _this2.ranges.insert(interval.start, interval.end, feature);
	      _this2.times.push(interval.start);
	      _this2.times.push(interval.end);
	      start = Math.min(start, interval.start);
	      end = Math.max(end, interval.end);
	    });
	    this.start = this.options.start || start;
	    this.end = this.options.end || end;
	    this.time = this.start;
	    if (this.times.length === 0) {
	      return;
	    }
	    // default sort is lexicographic, even for number types. so need to
	    // specify sorting function.
	    this.times.sort(function (a, b) {
	      return a - b;
	    });
	    // de-duplicate the times
	    this.times = this.times.reduce(function (newList, x, i) {
	      if (i === 0) {
	        return newList;
	      }
	      var lastTime = newList[newList.length - 1];
	      if (lastTime !== x) {
	        newList.push(x);
	      }
	      return newList;
	    }, [this.times[0]]);
	  },
	
	
	  /**
	   * Sets the time for this layer.
	   *
	   * @param {Number|String} time The time to set. Usually a number, but if your
	   * data is really time-based then you can pass a string (e.g. '2015-01-01')
	   * and it will be processed into a number automatically.
	   */
	  setTime: function setTime(time) {
	    this.time = typeof time === 'number' ? time : new Date(time).getTime();
	    if (this.options.drawOnSetTime) {
	      this.updateDisplayedLayers();
	    }
	    this.fire('change');
	  },
	
	
	  /**
	   * Update the layer to show only the features that are relevant at the current
	   * time. Usually shouldn't need to be called manually, unless you set
	   * `drawOnSetTime` to `false`.
	   */
	  updateDisplayedLayers: function updateDisplayedLayers() {
	    var _this3 = this;
	
	    // This loop is intended to help optimize things a bit. First, we find all
	    // the features that should be displayed at the current time.
	    var features = this.ranges.lookup(this.time);
	    // Then we try to match each currently displayed layer up to a feature. If
	    // we find a match, then we remove it from the feature list. If we don't
	    // find a match, then the displayed layer is no longer valid at this time.
	    // We should remove it.
	    for (var i = 0; i < this.getLayers().length; i++) {
	      var found = false;
	      var layer = this.getLayers()[i];
	      for (var j = 0; j < features.length; j++) {
	        if (layer.feature === features[j]) {
	          found = true;
	          features.splice(j, 1);
	          break;
	        }
	      }
	      if (!found) {
	        var toRemove = this.getLayers()[i--];
	        this.removeLayer(toRemove);
	      }
	    }
	    // Finally, with any features left, they must be new data! We can add them.
	    features.forEach(function (feature) {
	      return _this3.addData(feature);
	    });
	  }
	});
	
	L.timeline = function (geojson, options) {
	  return new L.Timeline(geojson, options);
	};

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	/**
	 * A node in the interval tree.
	 *
	 * @property {Number} low Start of the interval
	 * @property {Number} high End of the interval
	 * @property {Number} max The greatest endpoint of this node's interval or any
	 * of its children.
	 * @property {*} data The value of the interval
	 * @property {IntervalTreeNode?} left Left child (lower intervals)
	 * @property {IntervalTreeNode?} right Right child (higher intervals)
	 * @property {IntervalTreeNode?} parent The parent of this node
	 * @private
	 */
	
	var IntervalTreeNode = function IntervalTreeNode(low, high, data, parent) {
	  _classCallCheck(this, IntervalTreeNode);
	
	  this.low = low;
	  this.high = high;
	  this.max = high;
	  this.data = data;
	  this.left = null;
	  this.right = null;
	  this.parent = parent;
	};
	
	var IntervalTree = function () {
	  function IntervalTree() {
	    _classCallCheck(this, IntervalTree);
	
	    this._root = null;
	    this.size = 0;
	  }
	
	  /**
	   * Actually insert a new interval into the tree. This has a few extra
	   * arguments that don't really need to be exposed in the public API, hence the
	   * separation.
	   *
	   * @private
	   * @param {Number} begin Start of the interval
	   * @param {Number} end End of the interval
	   * @param {*} value The value of the interval
	   * @param {IntervalTreeNode?} node The current place we are looking at to add
	   * the interval
	   * @param {IntervalTreeNode?} parent The parent of the place we are looking to
	   * add the interval
	   * @param {String} parentSide The side of the parent we're looking at
	   * @returns {IntervalTreeNode} The newly added node
	   */
	
	
	  _createClass(IntervalTree, [{
	    key: '_insert',
	    value: function _insert(begin, end, value, node, parent, parentSide) {
	      var newNode = void 0;
	      if (node === null) {
	        // The place we're looking at is available; let's put our node here.
	        newNode = new IntervalTreeNode(begin, end, value, parent);
	        if (parent === null) {
	          // No parent? Must be root.
	          this._root = newNode;
	        } else {
	          // Let the parent know about its new child
	          parent[parentSide] = newNode;
	        }
	      } else {
	        // No vacancies. Figure out which side we should be putting our interval,
	        // and then recurse.
	        var side = begin < node.low || begin === node.low && end < node.high ? 'left' : 'right';
	        newNode = this._insert(begin, end, value, node[side], node, side);
	        node.max = Math.max(node.max, newNode.max);
	      }
	      return newNode;
	    }
	
	    /**
	     * Insert a new value into the tree, for the given interval.
	     *
	     * @param {Number} begin The start of the valid interval
	     * @param {Number} end The end of the valid interval
	     * @param {*} value The value for the interval
	     */
	
	  }, {
	    key: 'insert',
	    value: function insert(begin, end, value) {
	      this._insert(begin, end, value, this._root, this._root);
	      this.size++;
	    }
	
	    /**
	     * Find all intervals that cover a certain point.
	     *
	     * @param {Number} point The sought point
	     * @returns {*[]} An array of all values that are valid at the given point.
	     */
	
	  }, {
	    key: 'lookup',
	    value: function lookup(point) {
	      var overlaps = [];
	      var node = this._root;
	      if (arguments.length === 2) {
	        node = arguments[1];
	      }
	      if (node === null || node.max < point) {
	        return overlaps;
	      }
	      overlaps.push.apply(overlaps, _toConsumableArray(this.lookup(point, node.left)));
	      if (node.low <= point) {
	        if (node.high >= point) {
	          overlaps.push(node.data);
	        }
	        overlaps.push.apply(overlaps, _toConsumableArray(this.lookup(point, node.right)));
	      }
	      return overlaps;
	    }
	  }]);
	
	  return IntervalTree;
	}();

	exports.default = IntervalTree;

/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };
	
	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
	
	/* global L */
	
	/*
	 * @class
	 * @extends L.Control
	 */
	L.TimelineSliderControl = L.Control.extend({
	  /**
	   * @constructor
	   * @param {Number} [options.duration=600000] The amount of time a complete
	   * playback should take. Not guaranteed; if there's a lot of data or
	   * complicated rendering, it will likely wind up taking longer.
	   * @param {Boolean} [options.enableKeyboardControls=false] Allow playback to
	   * be controlled using the spacebar (play/pause) and right/left arrow keys
	   * (next/previous).
	   * @param {Boolean} [options.enablePlayback=true] Show playback controls (i.e.
	   * prev/play/pause/next).
	   * @param {Function} [options.formatOutput] A function which takes the current
	   * time value (usually a Unix timestamp) and outputs a string that is
	   * displayed beneath the control buttons.
	   * @param {Boolean} [options.showTicks=true] Show ticks on the timeline (if
	   * the browser supports it).
	   * @param {Boolean} [options.waitToUpdateMap=false] Wait until the user is
	   * finished changing the date to update the map. By default, both the map and
	   * the date update for every change. With complex data, this can slow things
	   * down, so set this to true to only update the displayed date.
	   * @param {Number} [options.start] The start time of the timeline. If unset,
	   * this will be calculated automatically based on the timelines registered to
	   * this control.
	   * @param {Number} [options.end] The end time of the timeline. If unset, this
	   * will be calculated automatically based on the timelines registered to this
	   * control.
	   */
	
	  initialize: function initialize() {
	    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
	
	    var defaultOptions = {
	      duration: 10000,
	      enableKeyboardControls: false,
	      enablePlayback: true,
	      formatOutput: function formatOutput(output) {
	        return '' + (output || '');
	      },
	      showTicks: true,
	      waitToUpdateMap: false,
	      position: 'bottomleft',
	      steps: 1000
	    };
	    this.timelines = [];
	    L.Util.setOptions(this, defaultOptions);
	    L.Util.setOptions(this, options);
	    if (typeof options.start !== 'undefined') {
	      this.start = options.start;
	    }
	    if (typeof options.end !== 'undefined') {
	      this.end = options.end;
	    }
	  },
	
	
	  /* INTERNAL API *************************************************************/
	
	  /**
	   * @private
	   * @returns {Number[]} A flat, sorted list of all the times of all layers
	   */
	  _getTimes: function _getTimes() {
	    var _this = this;
	
	    var times = [];
	    this.timelines.forEach(function (timeline) {
	      var timesInRange = timeline.times.filter(function (time) {
	        return time >= _this.start && time <= _this.end;
	      });
	      times.push.apply(times, _toConsumableArray(timesInRange));
	    });
	    if (times.length) {
	      var _ret = function () {
	        times.sort(function (a, b) {
	          return a - b;
	        });
	        var dedupedTimes = [times[0]];
	        times.reduce(function (a, b) {
	          if (a !== b) {
	            dedupedTimes.push(b);
	          }
	          return b;
	        });
	        return {
	          v: dedupedTimes
	        };
	      }();
	
	      if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
	    }
	    return times;
	  },
	
	
	  /**
	   * Adjusts start/end/step size/etc. Should be called if any of those might
	   * change (e.g. when adding a new layer).
	   *
	   * @private
	   */
	  _recalculate: function _recalculate() {
	    var manualStart = typeof this.options.start !== 'undefined';
	    var manualEnd = typeof this.options.end !== 'undefined';
	    var duration = this.options.duration;
	    var min = Infinity;
	    var max = -Infinity;
	    this.timelines.forEach(function (timeline) {
	      if (timeline.start < min) {
	        min = timeline.start;
	      }
	      if (timeline.end > max) {
	        max = timeline.end;
	      }
	    });
	    if (!manualStart) {
	      this.start = min;
	      this._timeSlider.min = min === Infinity ? 0 : min;
	      this._timeSlider.value = this._timeSlider.min;
	    }
	    if (!manualEnd) {
	      this.end = max;
	      this._timeSlider.max = max === -Infinity ? 0 : max;
	    }
	    this._stepSize = Math.max(1, (this.end - this.start) / this.options.steps);
	    this._stepDuration = Math.max(1, duration / this.options.steps);
	  },
	
	
	  /**
	   * If `mode` is 0, finds the event nearest to `findTime`.
	   *
	   * If `mode` is 1, finds the event immediately after `findTime`.
	   *
	   * If `mode` is -1, finds the event immediately before `findTime`.
	   *
	   * @private
	   * @param {Number} findTime The time to find events around
	   * @param {Number} mode The operating mode. See main function description.
	   * @returns {Number} The time of the nearest event.
	   */
	  _nearestEventTime: function _nearestEventTime(findTime) {
	    var mode = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
	
	    var times = this._getTimes();
	    var retNext = false;
	    var lastTime = times[0];
	    for (var i = 1; i < times.length; i++) {
	      var time = times[i];
	      if (retNext) {
	        return time;
	      }
	      if (time >= findTime) {
	        if (mode === -1) {
	          return lastTime;
	        } else if (mode === 1) {
	          if (time === findTime) {
	            retNext = true;
	          } else {
	            return time;
	          }
	        } else {
	          var prevDiff = Math.abs(findTime - lastTime);
	          var nextDiff = Math.abs(findTime - time);
	          return prevDiff < nextDiff ? lastTime : time;
	        }
	      }
	      lastTime = time;
	    }
	    return lastTime;
	  },
	
	
	  /* DOM CREATION & INTERACTION ***********************************************/
	
	  /**
	   * Create all of the DOM for the control.
	   *
	   * @private
	   */
	  _createDOM: function _createDOM() {
	    var classes = ['leaflet-control-layers', 'leaflet-control-layers-expanded', 'leaflet-timeline-control'];
	    var container = L.DomUtil.create('div', classes.join(' '));
	    this.container = container;
	    if (this.options.enablePlayback) {
	      var sliderCtrlC = L.DomUtil.create('div', 'sldr-ctrl-container', container);
	      var buttonContainer = L.DomUtil.create('div', 'button-container', sliderCtrlC);
	      this._makeButtons(buttonContainer);
	      if (this.options.enableKeyboardControls) {
	        this._addKeyListeners();
	      }
	      this._makeOutput(sliderCtrlC);
	    }
	    this._makeSlider(container);
	    if (this.options.showTicks) {
	      this._buildDataList(container);
	    }
	  },
	
	
	  /**
	   * Add keyboard listeners for keyboard control
	   *
	   * @private
	   */
	  _addKeyListeners: function _addKeyListeners() {
	    var _this2 = this;
	
	    this._listener = function () {
	      return _this2._onKeydown.apply(_this2, arguments);
	    };
	    document.addEventListener('keydown', this._listener);
	  },
	
	
	  /**
	   * Remove keyboard listeners
	   *
	   * @private
	   */
	  _removeKeyListeners: function _removeKeyListeners() {
	    document.removeEventListener('keydown', this._listener);
	  },
	
	
	  /**
	   * Constructs a <datalist>, for showing ticks on the range input.
	   *
	   * @private
	   * @param {HTMLElement} container The container to which to add the datalist
	   */
	  _buildDataList: function _buildDataList(container) {
	    this._datalist = L.DomUtil.create('datalist', '', container);
	    var idNum = Math.floor(Math.random() * 1000000);
	    this._datalist.id = 'timeline-datalist-' + idNum;
	    this._timeSlider.setAttribute('list', this._datalist.id);
	    this._rebuildDataList();
	  },
	
	
	  /**
	   * Reconstructs the <datalist>. Should be called when new data comes in.
	   */
	  _rebuildDataList: function _rebuildDataList() {
	    var datalist = this._datalist;
	    while (datalist.firstChild) {
	      datalist.removeChild(datalist.firstChild);
	    }
	    var datalistSelect = L.DomUtil.create('select', '', this._datalist);
	    this._getTimes().forEach(function (time) {
	      L.DomUtil.create('option', '', datalistSelect).value = time;
	    });
	  },
	
	
	  /**
	   * Makes a button with the passed name as a class, which calls the
	   * corresponding function when clicked. Attaches the button to container.
	   *
	   * @private
	   * @param {HTMLElement} container The container to which to add the button
	   * @param {String} name The class to give the button and the function to call
	   */
	  _makeButton: function _makeButton(container, name) {
	    var _this3 = this;
	
	    var button = L.DomUtil.create('button', name, container);
	    button.addEventListener('click', function () {
	      return _this3[name]();
	    });
	    L.DomEvent.disableClickPropagation(button);
	  },
	
	
	  /**
	   * Makes the prev, play, pause, and next buttons
	   *
	   * @private
	   * @param {HTMLElement} container The container to which to add the buttons
	   */
	  _makeButtons: function _makeButtons(container) {
	    this._makeButton(container, 'prev');
	    this._makeButton(container, 'play');
	    this._makeButton(container, 'pause');
	    this._makeButton(container, 'next');
	  },
	
	
	  /**
	   * Creates the range input
	   *
	   * @private
	   * @param {HTMLElement} container The container to which to add the input
	   */
	  _makeSlider: function _makeSlider(container) {
	    var _this4 = this;
	
	    var slider = L.DomUtil.create('input', 'time-slider', container);
	    slider.type = 'range';
	    slider.min = this.start || 0;
	    slider.max = this.end || 0;
	    slider.value = this.start || 0;
	    slider.addEventListener('change', function (e) {
	      return _this4._sliderChanged(e);
	    });
	    slider.addEventListener('input', function (e) {
	      return _this4._sliderChanged(e);
	    });
	    slider.addEventListener('mousedown', function () {
	      return _this4.map.dragging.disable();
	    });
	    document.addEventListener('mouseup', function () {
	      return _this4.map.dragging.enable();
	    });
	    this._timeSlider = slider;
	  },
	  _makeOutput: function _makeOutput(container) {
	    this._output = L.DomUtil.create('output', 'time-text', container);
	    this._output.innerHTML = this.options.formatOutput(this.start);
	  },
	  _onKeydown: function _onKeydown(e) {
	    switch (e.keyCode || e.which) {
	      case 37:
	        this.prev();break;
	      case 39:
	        this.next();break;
	      case 32:
	        this.toggle();break;
	      default:
	        return;
	    }
	    e.preventDefault();
	  },
	  _sliderChanged: function _sliderChanged(e) {
	    var time = parseFloat(e.target.value, 10);
	    this.time = time;
	    if (!this.options.waitToUpdateMap || e.type === 'change') {
	      this.timelines.forEach(function (timeline) {
	        return timeline.setTime(time);
	      });
	    }
	    if (this._output) {
	      this._output.innerHTML = this.options.formatOutput(time);
	    }
	  },
	
	
	  /* EXTERNAL API *************************************************************/
	
	  /**
	   * Register timeline layers with this control. This could change the start and
	   * end points of the timeline (unless manually set). It will also reset the
	   * playback.
	   *
	   * @param {...L.Timeline} timelines The `L.Timeline`s to register
	   */
	  addTimelines: function addTimelines() {
	    var _this5 = this;
	
	    this.pause();
	    var timelineCount = this.timelines.length;
	
	    for (var _len = arguments.length, timelines = Array(_len), _key = 0; _key < _len; _key++) {
	      timelines[_key] = arguments[_key];
	    }
	
	    timelines.forEach(function (timeline) {
	      if (_this5.timelines.indexOf(timeline) === -1) {
	        _this5.timelines.push(timeline);
	      }
	    });
	    if (this.timelines.length !== timelineCount) {
	      this._recalculate();
	      if (this.options.showTicks) {
	        this._rebuildDataList();
	      }
	      this.setTime(this.start);
	    }
	  },
	
	
	  /**
	   * Unregister timeline layers with this control. This could change the start
	   * and end points of the timeline unless manually set. It will also reset the
	   * playback.
	   *
	   * @param {...L.Timeline} timelines The `L.Timeline`s to unregister
	   */
	  removeTimelines: function removeTimelines() {
	    var _this6 = this;
	
	    this.pause();
	    var timelineCount = this.timelines.length;
	
	    for (var _len2 = arguments.length, timelines = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	      timelines[_key2] = arguments[_key2];
	    }
	
	    timelines.forEach(function (timeline) {
	      var index = _this6.timelines.indexOf(timeline);
	      if (index !== -1) {
	        _this6.timelines.splice(index, 1);
	      }
	    });
	    if (this.timelines.length !== timelineCount) {
	      this._recalculate();
	      if (this.options.showTicks) {
	        this._rebuildDataList();
	      }
	      this.setTime(this.start);
	    }
	  },
	
	
	  /**
	   * Toggles play/pause state.
	   */
	  toggle: function toggle() {
	    if (this._playing) {
	      this.pause();
	    } else {
	      this.play();
	    }
	  },
	
	
	  /**
	   * Pauses playback and goes to the previous event.
	   */
	  prev: function prev() {
	    this.pause();
	    var prevTime = this._nearestEventTime(this.time, -1);
	    this._timeSlider.value = prevTime;
	    this.setTime(prevTime);
	  },
	
	
	  /**
	   * Pauses playback.
	   */
	  pause: function pause() {
	    clearTimeout(this._timer);
	    this._playing = false;
	    this.container.classList.remove('playing');
	  },
	
	
	  /**
	   * Starts playback.
	   */
	  play: function play() {
	    var _this7 = this;
	
	    clearTimeout(this._timer);
	    if (parseFloat(this._timeSlider.value, 10) === this.end) {
	      this._timeSlider.value = this.start;
	    }
	    this._timeSlider.value = parseFloat(this._timeSlider.value, 10) + this._stepSize;
	    this.setTime(this._timeSlider.value);
	    if (parseFloat(this._timeSlider.value, 10) === this.end) {
	      this._playing = false;
	      this.container.classList.remove('playing');
	    } else {
	      this._playing = true;
	      this.container.classList.add('playing');
	      this._timer = setTimeout(function () {
	        return _this7.play();
	      }, this._stepDuration);
	    }
	  },
	
	
	  /**
	   * Pauses playback and goes to the next event.
	   */
	  next: function next() {
	    this.pause();
	    var nextTime = this._nearestEventTime(this.time, 1);
	    this._timeSlider.value = nextTime;
	    this.setTime(nextTime);
	  },
	
	
	  /**
	   * Set the time displayed.
	   *
	   * @param {Number} time The time to set
	   */
	  setTime: function setTime(time) {
	    this._sliderChanged({
	      type: 'change',
	      target: { value: time }
	    });
	  },
	  onAdd: function onAdd(map) {
	    this.map = map;
	    this._createDOM();
	    this.setTime(this.start);
	    return this.container;
	  },
	  onRemove: function onRemove() {
	    if (this.options.enableKeyboardControls) {
	      this._removeKeyListeners();
	    }
	  }
	});
	
	L.timelineSliderControl = function (timeline, start, end, timelist) {
	  return new L.TimelineSliderControl(timeline, start, end, timelist);
	};

/***/ },
/* 4 */
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ }
/******/ ]);