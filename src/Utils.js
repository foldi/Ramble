var Utils = {};

/**
 * Determines the size of the browser viewport.
 *
 * @returns {Object} The current browser viewport width and height.
 * @private
 */
Utils.getViewportSize = function() {

  var d = {};

  if (typeof(window.innerWidth) !== 'undefined') {
    d.width = window.innerWidth;
    d.height = window.innerHeight;
  } else if (typeof(document.documentElement) !== 'undefined' &&
      typeof(document.documentElement.clientWidth) !== 'undefined') {
    d.width = document.documentElement.clientWidth;
    d.height = document.documentElement.clientHeight;
  } else if (typeof(document.body) !== 'undefined') {
    d.width = document.body.clientWidth;
    d.height = document.body.clientHeight;
  } else {
    d.width = undefined;
    d.height = undefined;
  }
  return d;
};

/**
 * Adds an event listener.
 *
 * @param {Object} target The element to receive the event listener.
 * @param {string} eventType The event type.
 * @param {function} The function to run when the event is triggered.
 * @private
 */
Utils._addEvent = function(target, eventType, handler) {
  if (target.addEventListener) { // W3C
    target.addEventListener(eventType, handler, false);
  } else if (target.attachEvent) { // IE
    target.attachEvent("on" + eventType, handler);
  }
};

/**
 * Removes an event listener.
 *
 * @param {Object} target The element to receive the event listener.
 * @param {string} eventType The event type.
 * @param {function} The function to run when the event is triggered.
 * @private
 */
Utils._removeEvent = function(target, eventType, handler) {
  if (target.removeEventListener) { // W3C
    target.removeEventListener(eventType, handler, false);
  } else if (target.detachEvent) { // IE
    target.detachEvent('on' + eventType, handler);
  }
};

/**
 * Extends the properties and methods of a superClass onto a subClass.
 *
 * @param {Object} subClass The subClass.
 * @param {Object} superClass The superClass.
 */
Utils.extend = function(subClass, superClass) {
  function F() {}
  F.prototype = superClass.prototype;
  subClass.prototype = new F;
  subClass.prototype.constructor = subClass;
};


/**
 * Generates a psuedo-random number within a range.
 *
 * @param {number} low The low end of the range.
 * @param {number} high The high end of the range.
 * @param {boolean} [flt] Set to true to return a float.
 * @returns {number} A number.
 */
Utils.getRandomNumber = function(low, high, flt) {
  if (flt) {
    return Math.random()*(high-(low-1)) + low;
  }
  return Math.floor(Math.random()*(high-(low-1))) + low;
};

/**
 * Re-maps a number from one range to another.
 *
 * @param {number} value The value to be converted.
 * @param {number} min1 Lower bound of the value's current range.
 * @param {number} max1 Upper bound of the value's current range.
 * @param {number} min2 Lower bound of the value's target range.
 * @param {number} max2 Upper bound of the value's target range.
 * @returns {number} A number.
 */
Utils.map = function(value, min1, max1, min2, max2) { // returns a new value relative to a new range
  var unitratio = (value - min1) / (max1 - min1);
  return (unitratio * (max2 - min2)) + min2;
};

