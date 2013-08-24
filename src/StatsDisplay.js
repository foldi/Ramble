/*global exports, document, window */
/**
 * Creates a new StatsDisplay object.
 *
 * Use this class to create a field in the
 * top-left corner that displays the current
 * frames per second and total number of elements
 * processed in the System.animLoop.
 *
 * Note: StatsDisplay will not function in browsers
 * whose Date object does not support Date.now().
 * These include IE6, IE7, and IE8.
 *
 * @constructor
 */
function StatsDisplay() {

  var labelContainer, label;

  this.name = 'StatsDisplay';

  /**
   * Set to false to stop requesting animation frames.
   * @private
   */
  this._active = true;

  /**
   * Frames per second.
   * @private
   */
  this._fps = 0;

  /**
   * The current time.
   * @private
   */
  if (Date.now) {
    this._time = Date.now();
  } else {
    this._time = 0;
  }

  /**
   * The time at the last frame.
   * @private
   */
  this._timeLastFrame = this._time;

  /**
   * The time the last second was sampled.
   * @private
   */
  this._timeLastSecond = this._time;

  /**
   * Holds the total number of frames
   * between seconds.
   * @private
   */
  this._frameCount = 0;

  /**
   * A reference to the DOM element containing the display.
   * @private
   */
  this.el = document.createElement('div');
  this.el.id = 'statsDisplay';
  this.el.className = 'statsDisplay';
  this.el.style.backgroundColor = 'black';
  this.el.style.color = 'white';
  this.el.style.fontFamily = 'Helvetica';
  this.el.style.padding = '0.5em';
  this.el.style.opacity = '0.5';
  this.el.style.position = 'fixed';
  this.el.style.top = 0;
  this.el.style.left = 0;

  /**
   * A reference to the textNode displaying the total number of elements.
   * @private
   */
  this._totalElementsValue = null;

  /**
   * A reference to the textNode displaying the frame per second.
   * @private
   */
  this._fpsValue = null;

  // create totol elements label
  labelContainer = document.createElement('span');
  labelContainer.className = 'statsDisplayLabel';
  labelContainer.style.marginLeft = '0.5em';
  label = document.createTextNode('total elements: ');
  labelContainer.appendChild(label);
  this.el.appendChild(labelContainer);

  // create textNode for totalElements
  this._totalElementsValue = document.createTextNode('0');
  this.el.appendChild(this._totalElementsValue);

  // create fps label
  labelContainer = document.createElement('span');
  labelContainer.className = 'statsDisplayLabel';
  labelContainer.style.marginLeft = '0.5em';
  label = document.createTextNode('fps: ');
  labelContainer.appendChild(label);
  this.el.appendChild(labelContainer);

  // create textNode for fps
  this._fpsValue = document.createTextNode('0');
  this.el.appendChild(this._fpsValue);

  document.body.appendChild(this.el);

  /**
   * Initiates the requestAnimFrame() loop.
   */
  this._update(this);
}

/**
 * Returns the current frames per second value.
 * @returns {number} Frame per second.
 */
StatsDisplay.prototype.getFPS = function() {
  return this._fps;
};

/**
 * If 1000ms have elapsed since the last evaluated second,
 * _fps is assigned the total number of frames rendered and
 * its corresponding textNode is updated. The total number of
 * elements is also updated.
 *
 * This function is called again via requestAnimFrame().
 *
 * @private
 */
StatsDisplay.prototype._update = function(me) {

  var elementCount = Burner.System._records.list.length;

  if (Date.now) {
    me._time = Date.now();
  } else {
    me._time = 0;
  }
  me._frameCount++;

  // at least a second has passed
  if (me._time > me._timeLastSecond + 1000) {

    me._fps = me._frameCount;
    me._timeLastSecond = me._time;
    me._frameCount = 0;

    me._fpsValue.nodeValue = me._fps;
    me._totalElementsValue.nodeValue = elementCount;
  }

  var reqAnimFrame = (function (me) {
    return (function() {
      me._update(me);
    });
  })(this);

  if (this._active) {
    window.requestAnimFrame(reqAnimFrame);
  }
};

/**
 * Removes statsDisplay from DOM.
 */
StatsDisplay.prototype.destroy = function() {
  this._active = false;
  if (document.getElementById(this.el.id)) {
    document.body.removeChild(this.el);
  }
};
