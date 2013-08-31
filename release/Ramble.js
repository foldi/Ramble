/*! Ramble v1.0.0 - 2013-08-31 01:08:24 
 *  Vince Allen 
 *  Brooklyn, NY 
 *  vince@vinceallen.com 
 *  @vinceallenvince 
 *  License: MIT */

var Ramble = {}, exports = Ramble;

(function(exports) {

"use strict";

/**
 * Creates a new ColorPalette object.
 *
 * Use this class to create a palette of colors randomly selected
 * from a range created with initial start and end colors. You
 * can also generate gradients that smoothly interpolate from
 * start and end colors.
 *
 * @param {string|number} [opt_id=] An optional id. If an id is not passed, a default id is created.
 * @constructor
 */
function ColorPalette(opt_id) {

  /**
   * Holds a list of arrays representing 3-digit color values
   * smoothly interpolated between start and end colors.
   * @private
   */
  this._gradients = [];

  /**
   * Holds a list of arrays representing 3-digit color values
   * randomly selected from start and end colors.
   * @private
   */
  this._colors = [];

  this.id = opt_id || ColorPalette._idCount;
  ColorPalette._idCount++; // increment id
}

/**
 * Increments as each ColorPalette is created.
 * @type number
 * @default 0
 * @private
 */
ColorPalette._idCount = 0;

ColorPalette.prototype.name = 'ColorPalette';

/**
 * Creates a color range of 255 colors from the passed start and end colors.
 * Adds a random selection of these colors to the color property of
 * the color palette.
 *
 * @param {Object} options A set of required options
 *    that includes:
 *    options.min {number} The minimum number of colors to add.
 *    options.max {number} The maximum number of color to add.
 *    options.startColor {Array} The beginning color of the color range.
 *    options.endColor {Array} The end color of the color range.
 */
ColorPalette.prototype.addColor = function(options) {

  var i, ln, colors;

  ln = ColorPalette._getRandomNumber(options.min, options.max);
  colors = ColorPalette._createColorRange(options.startColor, options.endColor, 255);

  for (i = 0; i < ln; i++) {
    this._colors.push(colors[ColorPalette._getRandomNumber(0, colors.length - 1)]);
  }
  
  return this;
};

/**
 * Adds color arrays representing a color range to the gradients property.
 *
 * @param {Object} options A set of required options
 *    that includes:
 *    options.startColor {Array} The beginning color of the color range.
 *    options.endColor {Array} The end color of the color range.
 *    options.totalColors {number} The total number of colors in the gradient.
 * @private
 */
ColorPalette.prototype.createGradient = function(options) {

  this.startColor = options.startColor;
  this.endColor = options.endColor;
  this.totalColors = options.totalColors || 255;
  if (this.totalColors > 0) {
    this._gradients.push(ColorPalette._createColorRange(this.startColor, this.endColor, this.totalColors));
  } else {
    throw new Error('ColorPalette: total colors must be greater than zero.');
  }

};

/**
 * @returns An array representing a randomly selected color
 *    from the colors property.
 * @throws {Error} If the colors property is empty.
 */
ColorPalette.prototype.getColor = function() {

  if (this._colors.length > 0) {
    return this._colors[ColorPalette._getRandomNumber(0, this._colors.length - 1)];
  } else {
    throw new Error('ColorPalette.getColor: You must add colors via addColor() before using getColor().');
  }
};

/**
 * Renders a strip of colors representing the color range
 * in the colors property.
 *
 * @param {Object} parent A DOM object to contain the color strip.
 */
ColorPalette.prototype.createSampleStrip = function(parent) {

  var i, max, div;

  for (i = 0, max = this._colors.length; i < max; i++) {
    div = document.createElement('div');
    div.className = 'color-sample-strip';
    div.style.background = 'rgb(' + this._colors[i].toString() + ')';
    parent.appendChild(div);
  }
};

/**
 * Creates an array of RGB color values interpolated between
 * a passed startColor and endColor.
 *
 * @param {Array} startColor The beginning of the color array.
 * @param {Array} startColor The end of the color array.
 * @param {number} totalColors The total numnber of colors to create.
 * @returns {Array} An array of color values.
 */
ColorPalette._createColorRange = function(startColor, endColor, totalColors) {

  var i, colors = [],
      startRed = startColor[0],
      startGreen = startColor[1],
      startBlue = startColor[2],
      endRed = endColor[0],
      endGreen = endColor[1],
      endBlue = endColor[2],
      diffRed, diffGreen, diffBlue,
      newRed, newGreen, newBlue;

  diffRed = endRed - startRed;
  diffGreen = endGreen - startGreen;
  diffBlue = endBlue - startBlue;

  for (i = 0; i < totalColors; i++) {
    newRed = parseInt(diffRed * i/totalColors, 10) + startRed;
    newGreen = parseInt(diffGreen * i/totalColors, 10) + startGreen;
    newBlue = parseInt(diffBlue * i/totalColors, 10) + startBlue;
    colors.push([newRed, newGreen, newBlue]);
  }
  return colors;
};

ColorPalette._getRandomNumber = function(low, high, flt) {
  if (flt) {
    return Math.random()*(high-(low-1)) + low;
  }
  return Math.floor(Math.random()*(high-(low-1))) + low;
};

exports.ColorPalette = ColorPalette;

var Driver = {};

/**
 * The current viewport dimensions.
 * @example
 * {width: 1024, height: 768}
 * @type {Object}
 */
Driver.viewportDimensions = null;

/**
 * The scrollBlock creates available scrolling area.
 * @type {Object}
 */
Driver.scrollBlock = null;

/**
 * The current scroll direction.
 * 1 = scroll up
 * -1 = scroll down
 * @type {Number}
 */
Driver.scrollDirection = -1;

/**
 * The total distance scrolled in pixels.
 * @type {Number}
 */
Driver.scrollDistance = 0;

/**
 * Used to determine scroll direction.
 * @type {Number}
 */
Driver.lastPageYOffset = 0;

/**
 * The total number of scollable columns.
 * @type {Number}
 */
Driver.totalColumns = 0;

/**
 * Display properties from instances
 * before they were destroyed.
 * @type {Object}
 */
Driver.cache = {};

Driver.MAX_LANES = 1;

Driver.INITIAL_Y_OFFSET = 0;

Driver.force = new Burner.Vector();

Driver.init = function(opt_options) {

  var i, max, options = opt_options || {},
      worlds;

  this.OBJ_MIN_WIDTH = options.objMinWidth || 60;
  this.OBJ_MAX_WIDTH = options.objMaxWidth || 120;
  this.OBJ_PADDING = options.objPadding || 20;
  this.MIN_SCROLL_SPEED = options.minScrollSpeed || 0.4;
  this.MAX_SCROLL_SPEED = options.maxScrollSpeed || 0.45;
  this.CONTENT_CONTAINER = options.CONTENT_CONTAINER || document.body;

  if (!Driver.INITIAL_Y_OFFSET) {
    Driver.INITIAL_Y_OFFSET = options.initYOffset || this.OBJ_PADDING;
  }

  this.viewportDimensions = Utils.getViewportSize();
  /*this.scrollBlock = new exports.ScrollBlock(document.getElementById('scrollBlock'), {
    height: options.scrollBlockHeight || this.viewportDimensions.height * 2,
    heightBuffer: options.scrollBlockBuffer || this.viewportDimensions.height * 2
  });*/
  this.totalColumns = this.getTotalColumns();
  this.palette = options.palette || null;
  this.system = options.system;

  // create worlds
  //
  //this.totalColumns = 1;
  var totalWidth = ((this.totalColumns - 1) * this.OBJ_MAX_WIDTH) + ((this.totalColumns - 1) * this.OBJ_PADDING);
  var xOffset = this.viewportDimensions.width / 2 - totalWidth / 2;

  worlds = [];
  for (i = 0, max = this.totalColumns; i < max; i++) {
    var worldDiv = document.createElement('div');
    worldDiv.id = 'world' + i;
    this.CONTENT_CONTAINER.appendChild(worldDiv);
    worlds.push(new exports.Lane(document.getElementById('world' + i), {
      width: this.OBJ_MAX_WIDTH,
      height: this.viewportDimensions.height,
      autoHeight: true,
      location: new Burner.Vector((i + 0) * (this.OBJ_MAX_WIDTH + this.OBJ_PADDING) + xOffset,
          (this.viewportDimensions.height / 2) + this.INITIAL_Y_OFFSET),
      scrollSpeed: i % 2 === 0 ? this.MIN_SCROLL_SPEED : this.MAX_SCROLL_SPEED,
      paddingTop: 0,
      boundToWindow: false,
      position: 'fixed',
      c: 0.1,
      index: i,
      totalColumns: this.totalColumns
    }));
    if (!i) { // assign the resize callback to the first world
      worlds[worlds.length - 1].afterResize = this.resize;
    }
  }

  // initialize the system
  //
  this.system.init(null, worlds);

  for (i = 0; i < Ramble.Driver.totalColumns; i++) { // create first row
    Ramble.Driver.createRider(i);
  }

  this.system.start();

  //

  this.defaultPosition = this.viewportDimensions.height * 0.5;
  this.scrollBlockHeight = this.viewportDimensions.height * 3;
  this.lastScrollY = 0;
  document.getElementById('scrollBlock').style.height = this.scrollBlockHeight + 'px';
  window.scrollTo(0, this.defaultPosition);

  exports.Utils._addEvent(document, 'mousedown', this.onMouseDown);

  exports.Utils._addEvent(document, 'mouseup', this.onMouseUp);

  exports.Utils._addEvent(window, 'mouseout', this.resetScrollBar);

  exports.Utils._addEvent(document, 'scroll', this.onScroll);

};

Driver.resetScrollBar = function(e) {
  Driver.isMouseDown = false;
  window.scrollTo(0, Driver.defaultPosition);
  Driver.lastPageYOffset = null;
};

Driver.onMouseDown = function() {
  Driver.isMouseDown = true;
  exports.Utils._addEvent(window, 'mousemove', Driver.onMouseMove);
};

Driver.onMouseMove = function(e) {
  exports.Utils._removeEvent(window, 'mousemove', Driver.onMouseMove);
  window.scrollTo(0, Driver.defaultPosition); // IE fires a onmousemove event on scroll bar mouseup
  Driver.lastPageYOffset = null;
};

Driver.onMouseUp = function() {
  Driver.isMouseDown = false;
  Driver.resetScrollBar();
};

Driver.onScroll = function(e) {

  var scrollBlock = document.getElementById('scrollBlock'),
      rect = scrollBlock.getBoundingClientRect();

  if (Driver.lastPageYOffset) {
    Driver.scrollDirection = Driver.lastPageYOffset > window.pageYOffset ? 1 : -1;
  }

  if (Driver.scrollDirection === -1) {
    Driver.force.y = exports.Utils.map(-rect.top, Driver.defaultPosition,
        Driver.scrollBlockHeight - Driver.viewportDimensions.height, 0, -1);
  } else {
    Driver.force.y = exports.Utils.map(-rect.top, 0, Driver.defaultPosition, 2, 0);
  }

  clearTimeout(Driver.scrollTimeout);

  Driver.scrollTimeout = setTimeout(function() {
    if (!Driver.isMouseDown) { // if user is not holding the scrollbar
      window.scrollTo(0, Driver.defaultPosition);
      Driver.lastPageYOffset = null;
    }
  }, 100);

  Driver.lastPageYOffset = window.pageYOffset;
};

/**
 * Sets the total number of scrollable columns.
 */
Driver.getTotalColumns = function() {
  var totalColumns = Math.floor(this.viewportDimensions.width /
      (this.OBJ_MAX_WIDTH + this.OBJ_PADDING));
  return totalColumns;
};



/**
 * Adds a new Rider to the system.
 * @param {number} i An index.
 * @param {Object} opt_options A map of initial properties.
 * @return {Object} An instance of Rider.
 */
Driver.createRider = function(i, opt_options) {

  var options = opt_options || {}, props = {},
      myCol = i % this.totalColumns,
      scrollSpeed;

  /*if (!this.speedPropToMass) {
    scrollSpeed = myCol % 2 ?  this.MAX_SCROLL_SPEED :  this.MIN_SCROLL_SPEED;
  } else {
    scrollSpeed = exports.Utils.map(myCol, 0, this.totalColumns - 1, this.MIN_SCROLL_SPEED, this.MAX_SCROLL_SPEED);
  }*/

  /**
   * If a story has been cached (ie. in the object pool),
   * its properties will be passed via the opt_options argument.
   * Set these properties first.
   */

  if (!options.contents) { // if this is a new rider

    // CONTENT
    var innerContainer = document.createElement('div');
    innerContainer.className = 'innerContainer';
    var color = this.palette !== null ? this.palette.getColor() : [150, 150, 150];
    innerContainer.style.backgroundColor = 'rgb(' + color[0] + ', ' + color[1] + ', ' + color[2] + ')';
    innerContainer.style.borderRadius = '10%';
    innerContainer.style.width = exports.Utils.map(myCol, 0, this.totalColumns - 0, this.OBJ_MAX_WIDTH, this.OBJ_MIN_WIDTH) + 'px';
    var size = exports.Utils.map(myCol, 0, this.totalColumns - 0, this.OBJ_MAX_WIDTH, this.OBJ_MIN_WIDTH);
    innerContainer.style.height = size + 'px';
    innerContainer.style.lineHeight = size + 'px';
    innerContainer.style.fontSize = exports.Utils.map(size, this.OBJ_MIN_WIDTH, this.OBJ_MAX_WIDTH, 0.5, 1) + 'em';
    innerContainer.style.marginTop = '0px';
    innerContainer.style.borderWidth = '2px';
    innerContainer.style.borderStyle = 'solid';
    innerContainer.style.borderColor = 'white';
    innerContainer.textContent = i;
    innerContainer.addEventListener('mouseup', function(e) {
      alert(e.target.textContent);
    }, false);
    options.contents = innerContainer;
  }

  props.contents = options.contents;

  props.index = i;
  props.name = 'Rider';
  props.zIndex = 1;

  props.autoWidth = true;
  props.width = this.OBJ_MAX_WIDTH;
  props.autoHeight = true;
  props.height = this.OBJ_MAX_WIDTH;
  props.color = 'transparent';
  props.location = 'none';
  props.position = 'relative';
  props.opacity = 1;
  props.borderWidth = 1;
    props.borderStyle = 'none';
    props.borderColor = [255, 255, 0];

  /**
   * Create the object.
   */
  var obj = this.system.add('Rider', props, Burner.System._worlds.lookup['world' + myCol]);

  // add html to container
  obj.el.innerHTML = '';
  obj.el.appendChild(props.contents);

  // check world velocity to determine scroll direction
  var scrollVel = 1;
  if (obj.world.velocity.y <= 0 || Math.abs(obj.world.velocity.y) < 0.1) {
    scrollVel = -1;
  }

  // shuffle frogs based on scroll direction
  if (scrollVel === -1 && obj.world.el.firstChild) {
    obj.world.el.insertBefore(obj.el, null); // appends to end of node list
  } else if (scrollVel === 1 && obj.world.el.firstChild) {
    obj.world.el.insertBefore(obj.el, obj.world.el.firstChild); // appends to beginning of node list
  }

  return obj;
};

/**
 * Sets the total number of scrollable columns.
 */
Driver.setTotalColumns = function() {
  this.totalColumns = Math.floor(this.viewportDimensions.width /
      (this.OBJ_MAX_WIDTH + this.OBJ_PADDING));
};

/**
 * Stores display properties from instances before they
 * were destroyed.
 *
 * @param {Object} obj A map of properties.
 */
Driver.updateCache = function(obj) {
  this.cache[obj.index] = {
    height: obj.height,
    firstChildHeight: obj.firstChildHeight,
    contents: obj.contents,
    scrollDirection: obj.scrollDirection
  };
};

/**
 * Resets page and recreates intial objects.
 */
Driver.reflowObjs = function() {

  var i, max, objs = Burner.System.getAllItemsByName('Rider');

  Driver.viewportDimensions = exports.Utils.getViewportSize();

  for (i = 0, max = objs.length; i < max; i++) {
    Burner.System.destroyItem(objs[i]);
  }

  Driver.scrollDistance = 0;
  Driver.setTotalColumns();
  Driver.scrollDirection = -1;

  window.scrollTo(0, 0);

  Driver.scrollBlock.height = Driver.viewportDimensions.height + 10;

  for (i = 0; i <  Driver.totalColumns; i++) {
    Driver.createRider(i, Driver.cache[i]);
  }

};

/**
 * If passed option is true, returns the length of the
 * tallest column in pixels. If passed option is false,
 * returns the length of the shortest column in pixels.
 *
 * @param {boolean} opt_tallest True returns tallest column length.
 * @return {number} A length in pixels.
 */
Driver.getMinMaxColumn = function(opt_tallest) {

  var i, max, obj, objs = Burner.System.getAllItemsByName('Rider');

  var columns = {
    lookup: {},
    list: []
  };

  for (i = 0, max = objs.length; i < max; i++) {
    obj = objs[i];
    if (!columns.lookup[obj.myCol]) {
      columns.lookup[obj.myCol] = 0;
    }
    columns.lookup[obj.myCol] += obj.height + exports.Driver.OBJ_PADDING + this.INITIAL_Y_OFFSET;
  }

  for (i in columns.lookup) {
    if (columns.lookup.hasOwnProperty(i)) {
      columns.list.push(columns.lookup[i]);
    }
  }
  if (!opt_tallest) {
    columns.list.sort(function(a,b){return a-b;});
  } else {
    columns.list.sort(function(a,b){return b-a;});
  }
  return columns.list[0];
};

exports.Driver = Driver;

function Lane(el, opt_options) {

	var options = opt_options || {};

	if (!el || typeof el !== 'object') {
    throw new Error('World: A valid DOM object is required for a new FroggerLane.');
	}

	this.scrollSpeed = options.scrollSpeed || 0.5;
	this.position = 'fixed';
	this.adjusted = false;
	this.acceleration = new Burner.Vector();
	this.velocity = new Burner.Vector();
	this._force = new Burner.Vector();
	this.friction = new Burner.Vector();
	this.mass = exports.Utils.map(options.index, 0, options.totalColumns, 3, 1);
	this.maxSpeed = 15;
	this.minSpeed = 0;
	Burner.World.call(this, el, options);
}
Burner.System.extend(Lane, Burner.World);

/**
 * Updates properties.
 */
Lane.prototype.step = function() {

	// apply friction
  this.friction.x = this.velocity.x;
  this.friction.y = this.velocity.y;
  this.friction.mult(-1);
  this.friction.normalize();
  this.friction.mult(this.c);
  this.applyForce(this.friction);

  // apply forces
  this.applyForce(exports.Driver.force);
  this.velocity.add(this.acceleration);
  this.velocity.limit(this.maxSpeed);

  // let margin top determine location
  if (Math.abs(this.velocity.y) > 0.1) {
    this.marginTop += this.velocity.y;
  }
  if (this.marginTop > 0) {
    this.marginTop = 0;
    this.velocity.mult(0);
  }
  
  this.acceleration.mult(0);

  this.adjusted = false;
};

/**
 * Adds a force to this object's acceleration.
 *
 * @param {Object} force A Vector representing a force to apply.
 * @returns {Object} A Vector representing a new acceleration.
 */
Lane.prototype.applyForce = function(force) {
  // calculated via F = m * a
  if (force) {
    this._force.x = force.x;
    this._force.y = force.y;
    this._force.div(this.mass);
    this.acceleration.add(this._force);
    return this.acceleration;
  }
};

/**
* Updates properties.
*/
Lane.prototype.step_ = function() {
	this.adjusted = false;
	//this.marginTop = window.pageYOffset * -this.scrollSpeed;
	// could update this.location.y here using:
	// this.location.y = this.initLocation.y + (window.pageYOffset * -this.scrollSpeed);
	// but updating top margin is less math.


	this.marginTop -= exports.Driver.force.y;
};

exports.Lane = Lane;

function Rider(opt_options) {
  var options = opt_options || {};
  this.scrollVector = new Burner.Vector();
  Burner.Item.call(this, options);
}
Burner.System.extend(Rider, Burner.Item);

Rider.prototype.init = function() {};

/**
 * Updates instance properties.
 */
Rider.prototype.step = function() {

  var props, before, after,
      scrollDirection = Driver.scrollDirection,
      totalColumns = Driver.totalColumns,
      cache = Driver.cache,
      world = this.world,
      firstChild = this.el.firstChild,
      rect = this.el.getBoundingClientRect(),
      top = rect.top,
      height = rect.height;

  // don't check for Driver.scrollDirection; use this obj's
  /*if (this.lastLocY >= top || !this.lastLocY) {
    scrollDirection = -1;
  } else {
    scrollDirection = 1;
  }

  if (top - this.lastLocY > Driver.viewportDimensions.height) {
    scrollDirection = -1;
  } else if (this.lastLocY - top > Driver.viewportDimensions.height) {
    //scrollDirection = 1;
  }

  if (scrollDirection === 1) {
    console.log(scrollDirection);
  }*/

  // use this.world.velocity.y?
 


  if (Math.abs(this.world.velocity.y) < 0.1) {
    this.scrollDirection = -1;
  } else if (this.world.velocity.y <= 0) {
    this.scrollDirection = -1;
  } else {
    this.scrollDirection = 1;
  }


  // destroyed rider should save its scrollDirection

  if (!world.adjusted && this.scrollDirection === -1 &&
      top + height < Driver.viewportDimensions.height) { // scrolling up && obj appears just above bottom border
    after = Burner.System.getAllItemsByAttribute('index', this.index + totalColumns)[0];
    if (!after) { // if an obj does NOT exist under me
      if (top + height < 0) { // if obj also appears just above top border
        Burner.System.systemError = true; // we've scrolled too fast; reset
      }
      props = cache[this.index + totalColumns];
      Driver.createRider(this.index + totalColumns, props);
      return;
    }
  }

  if (!world.adjusted && this.scrollDirection === 1 && top > 0) { // scrolling down && obj appears just below top border
    before = Burner.System.getAllItemsByAttribute('index', this.index - totalColumns)[0];
    if (!before && this.index >= totalColumns) {
      if (top > Driver.viewportDimensions.height) { // if obj also appears below bottom border
        Burner.System.systemError = true; // we've scrolled too fast; reset
      }
      props = cache[this.index - totalColumns]; // recycling objects; use cache
      Driver.createRider(this.index - totalColumns, props);
      if (props) {
        world.paddingTop -= props.firstChildHeight + Driver.OBJ_PADDING; // subtract height from world top paddding
      }
      world.adjusted = true;
      return;
    }
  }

  if (!world.adjusted && this.scrollDirection === -1 && top + height < 0) {  // scrolling up && obj appears just above top border
    after = Burner.System.getAllItemsByAttribute('index', this.index + totalColumns)[0];
    if (after) {
      this.firstChildHeight = firstChild.offsetHeight; // add the first child height to cached object
      //this.scrollDirection = myDirection;
      Driver.updateCache(this);
      Burner.System.destroyItem(this); // destory this obj
      world.paddingTop += this.firstChildHeight + Driver.OBJ_PADDING; // add height to world top paddding
      world.adjusted = true;
      return;
    }
  }

  if (!world.adjusted && this.scrollDirection === 1 && top > Driver.viewportDimensions.height) { // scrolling down && obj appears below bottom border
    before = Burner.System.getAllItemsByAttribute('index', this.index - totalColumns)[0];
    if (before) {
      //this.scrollDirection = myDirection;
      Driver.updateCache(this);
      Burner.System.destroyItem(this); // destory this obj
      return;
    }
  }

  this.lastLocY = top;
};

exports.Rider = Rider;

function ScrollBlock(el, opt_options) {
  var options = opt_options || {};
  if (!el) {
    throw new Error('A DOM element is required for a new ScrollBlock.');
  }
  this.el = el;
  this.heightBuffer = options.heightBuffer;
  this.height = options.height;
  this.el.style.height = this.height + 'px';
}

//ScrollBlock.heightBuffer = 10;

ScrollBlock.prototype.addHeight = function(opt_val) {
	var val = opt_val || this.heightBuffer;
	this.height += val;
  this.el.style.height = this.height + 'px';
};

exports.ScrollBlock = ScrollBlock;

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

exports.StatsDisplay = StatsDisplay;

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


exports.Utils = Utils;

}(exports));