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
 * Lower numbers = slower scrolling.
 * @type {Number}
 */
Driver.scrollThrottle = 0;

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

/**
 * Should be called after a SimpleSim system
 * has been initialized.
 * @param {Object} opt_options A map of initial options.
 */
Driver.init = function(opt_options) {

  var options = opt_options || {};

  //this.OBJ_WIDTH = options.objWidth || 300;
  this.OBJ_MIN_WIDTH = options.objMinWidth || 60;
  this.OBJ_MAX_WIDTH = options.objMaxWidth || 120;
  this.OBJ_PADDING = options.objPadding || 20;
  this.MIN_SCROLL_SPEED = options.minScrollSpeed || 0.4;
  this.MAX_SCROLL_SPEED = options.maxScrollSpeed || 0.45;
  this.INITIAL_Y_OFFSET = options.initialYOffset || 0;
  this.palette = options.palette || null;
  this.speedPropToMass = options.speedPropToMass || false;

  this.viewportDimensions = exports.Utils.getViewportSize();
  this.scrollBlock = new exports.ScrollBlock(document.getElementById('scrollBlock'), {
    height: options.scrollBlockHeight || 10000
  });
  this.setTotalColumns();

  if (document.addEventListener) {
    document.addEventListener('scroll', Driver.onScroll, false);
  } else if (document.attachEvent) {
    document.attachEvent('onScroll', Driver.onScroll);
  }

  window.scrollTo(0, 0);
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

  if (!this.speedPropToMass) {
    scrollSpeed = myCol % 2 ?  this.MAX_SCROLL_SPEED :  this.MIN_SCROLL_SPEED;
  } else {
    scrollSpeed = exports.Utils.map(myCol, 0, this.totalColumns - 1, this.MIN_SCROLL_SPEED, this.MAX_SCROLL_SPEED);
  }

  /**
   * If a story has been cached (ie. in the object pool),
   * its properties will be passed via the opt_options argument.
   * Set these properties first.
   */
  props.width = this.OBJ_MAX_WIDTH;
  props.height = options.height || props.width;
  props.color = options.color || 'transparent';
  props.text = options.text || i;

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
  innerContainer.style.marginTop = (this.OBJ_MAX_WIDTH - size) / 2 + 'px';
  innerContainer.style.borderWidth = '2px';
  innerContainer.style.borderStyle = 'solid';
  innerContainer.style.borderColor = 'white';
  innerContainer.textContent = props.text;
  innerContainer.addEventListener('mouseup', function(e) {
    alert(e.target.textContent);
  }, false);
  props.contents = options.contents || innerContainer;

  /**
   * Some properties are not optional.
   */
  props.index = i;
  props.name = 'Rider';
  props.mass = 10;
  props.opacity = 1;
  props.borderRadius = 10;
  props.zIndex = 1;
  props.lineHeight = props.height - 3;
  props.borderWidth = 0;
  props.borderStyle = 'solid';
  props.borderColor = 'white';

  /**
   * Calculate the object's position based on its
   * index and height.
   */
  var position = this.positionObj(props.index, props.width, props.height);
  props.initLocation = new SimpleSim.Vector(position.x, position.y + this.scrollDistance * scrollSpeed);
  props.location = new SimpleSim.Vector(position.x, position.y);
  props.scrollSpeed = scrollSpeed;
  props.myCol = myCol;

  /**
   * Create the object.
   */
  var obj = SimpleSim.System.add('Rider', props);

  // add html to container
  //obj.el.textContent = props.text;
  obj.el.innerHTML = '';
  obj.el.appendChild(props.contents);

  return obj;
};

/**
 * Positions a rider based on an index and height.
 * @param {number} i An index.
 * @param {number} height The rider's height.
 * @return {Object} A map of x and y coordinates.
 */
Driver.positionObj = function(i, width, height) {

  var totalColumns = this.totalColumns,
      myCol = i % this.totalColumns,
      objWidth = width,
      objPadding = this.OBJ_PADDING,
      scrollDirection = this.scrollDirection,
      position = {}, neighbor, neighborOffset, myOffset, paddingOffset;

  // determines offset needed to center group of stories
  var xOffset = (this.viewportDimensions.width - ((totalColumns * objWidth) + (totalColumns + 1) * objPadding)) / 2;

  position.x = objWidth * myCol + // centers story at location
      objWidth / 2 + // moves story origin to its left edge
      objPadding * (myCol + 1) + // adds padding
      xOffset; // add centering offset

  neighbor = SimpleSim.System.getAllItemsByAttribute('index', i + totalColumns * scrollDirection)[0];
  if (neighbor) { // position obj relative to its neighbor
    neighborOffset = neighbor.height / 2 * -scrollDirection; // the neighbor's position
    myOffset = height / 2 * -scrollDirection; // add this object's height
    paddingOffset = objPadding * -scrollDirection; // add padding
    position.y = neighbor.location.y + neighborOffset + myOffset + paddingOffset;
  } else {
    position.y = height / 2 + objPadding + this.INITIAL_Y_OFFSET; // the first row
  }

  return position;
};

/**
 * Handles the scroll event.
 */
Driver.onScroll = function() {

//console.log(document.getElementById('scrollBlock').getBoundingClientRect());
  var scrollOffset;

  Driver.scrollDirection = Driver.lastPageYOffset > window.pageYOffset ? 1 : -1;
  //Driver.scrollSpeed = Driver.lastPageYOffset - window.pageYOffset;
  Driver.lastPageYOffset = window.pageYOffset;
  Driver.scrollDistance = window.pageYOffset;



  if (Driver.scrollBlock.el.getBoundingClientRect().bottom < Driver.viewportDimensions.height) {
    Driver.scrollBlock.addHeight();
  }

  //scrollOffset = Driver.viewportDimensions.height + window.pageYOffset + Driver.scrollThrottle;

  /*if (Driver.scrollBlock.height < scrollOffset && !Driver.fetching) {
    Driver.scrollBlock.height = scrollOffset;
    Driver.scrollBlock.el.style.height = Driver.scrollBlock.height + 'px';
  }*/

  if (!SimpleSim.System._updating) {
    SimpleSim.System._update();
  }
};

/**
 * Sets the total number of scrollable columns.
 */
Driver.setTotalColumns = function() {

  this.totalColumns = Math.floor(this.viewportDimensions.width /
      (this.OBJ_MAX_WIDTH + this.OBJ_PADDING));

  var factor = this.OBJ_MIN_WIDTH/this.OBJ_MAX_WIDTH;



  //this.OBJ_MIN_WIDTH = options.objMinWidth || 60;
  //this.OBJ_MAX_WIDTH = options.objMaxWidth || 120;
  //exports.Utils.map(myCol, 0, this.totalColumns - 1, this.OBJ_MAX_WIDTH, this.OBJ_MIN_WIDTH);

  /*var i = 0, currentWidth = 0, varWidth = this.OBJ_MAX_WIDTH,
      viewportWidth = Driver.viewportDimensions.width;

  while(currentWidth < viewportWidth) {
    varWidth *= factor;
    currentWidth += varWidth;
    i++;
  }
  this.totalColumns = i;
  console.log(currentWidth, viewportWidth);*/

};

/**
 * Stores display properties from instances before they
 * were destroyed.
 *
 * @param  {Object} obj A map of properties.
 */
Driver.updateCache = function(obj) {
  this.cache[obj.index] = {
    height: obj.height,
    html: obj.html
  };
};

/**
 * Resets page and recreates intial objects.
 */
Driver.reflowObjs = function() {

  var i, max, objs = SimpleSim.System.getAllItemsByName('Rider');

  Driver.viewportDimensions = exports.Utils.getViewportSize();

  for (i = 0, max = objs.length; i < max; i++) {
    SimpleSim.System.destroyItem(objs[i]);
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

  var i, max, obj, objs = SimpleSim.System.getAllItemsByName('Rider');

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
