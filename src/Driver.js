/**
 * @namespace
 */
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

  // shuffle frogs based on scroll direction
  if (Driver.scrollDirection === -1 && obj.world.el.firstChild) {
    obj.world.el.insertBefore(obj.el, null); // appends to end of node list
  } else if (Driver.scrollDirection === 1 && obj.world.el.firstChild) {
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
    contents: obj.contents
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
