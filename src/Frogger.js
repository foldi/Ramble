/*require([
  'scripts/renderer/system#System',
  'scripts/renderer/utils#Utils',
  'scripts/renderer/vector#Vector',
  'scripts/scrollblock#ScrollBlock',
  'scripts/colorpalette#ColorPalette'
], function(System, Utils, Vector, ScrollBlock, ColorPalette) {*/

  /**
   * @namespace
   */
  var Frogger = {};

  /**
   * The current viewport dimensions.
   * @example
   * {width: 1024, height: 768}
   * @type {Object}
   */
  Frogger.viewportDimensions = null;

  /**
   * The scrollBlock creates available scrolling area.
   * @type {Object}
   */
  Frogger.scrollBlock = null;

  /**
   * The current scroll direction.
   * 1 = scroll up
   * -1 = scroll down
   * @type {Number}
   */
  Frogger.scrollDirection = -1;

  /**
   * The total distance scrolled in pixels.
   * @type {Number}
   */
  Frogger.scrollDistance = 0;

  /**
   * Lower numbers = slower scrolling.
   * @type {Number}
   */
  Frogger.scrollThrottle = 200;

  /**
   * Used to determine scroll direction.
   * @type {Number}
   */
  Frogger.lastPageYOffset = 0;

  /**
   * The total number of scollable columns.
   * @type {Number}
   */
  Frogger.totalColumns = 0;

  /**
   * Display properties from instances
   * before they were destroyed.
   * @type {Object}
   */
  Frogger.cache = {};

  /**
   * Should be called after a SimpleSim system
   * has been initialized.
   * @param {Object} opt_options A map of initial options.
   */
  Frogger.init = function(opt_options) {

    var options = opt_options || {};
    
    this.OBJ_WIDTH = options.objWidth || 300;
    this.OBJ_PADDING = options.objPadding || 20;
    this.MIN_SCROLL_SPEED = options.minScrollSpeed || 0.4;
    this.MAX_SCROLL_SPEED = options.maxScrollSpeed || 0.45;
    this.INITIAL_Y_OFFSET = options.initialYOffset !== undefined ? options.initialYOffset : 0;

    this.viewportDimensions = exports.Utils.getViewportSize();
    this.scrollBlock = new exports.ScrollBlock(document.getElementById('scrollBlock'));
    this.scrollBlock.el.style.height = Frogger.viewportDimensions.height + 10 + 'px';
    this.setTotalColumns();

    if (document.addEventListener) {
      document.addEventListener('scroll', Frogger.onScroll, false);
    } else if (document.attachEvent) {
      document.attachEvent('onScroll', Frogger.onScroll);
    }
    window.scrollTo(0, 0);
  };

  /**
   * Adds a new FrogNUX to the system.
   * @param {Object} opt_options A map of initial properties.
   * @return {Object} An instance of FrogNUX.
   */
  Frogger.createFrogNUX = function(opt_options) {
    
    var options = opt_options || {}, props = {};

    props.color = options.color || [255, 255, 255];
    props.width =  options.width;

    // TEMPORARY
    var innerContainer = document.createElement('div');
    innerContainer.className = 'innerContainer';
    var color = this.palette.getColor();
    innerContainer.style.backgroundColor = 'rgb(' + color[0] + ', ' + color[1] + ', ' + color[2] + ')';
    innerContainer.textContent = 'NUX';
    props.html = options.html || innerContainer;

    /**
     * Some properties are not optional.
     */
    props.name = 'FrogNUX';
    props.height = 380;
    props.opacity = 1;
    props.borderRadius = 10;
    props.zIndex = 1;

    var x = props.width / 2 + (this.viewportDimensions.width - props.width) / 2;

    props.location = new SimpleSim.Vector(x, props.height / 2 + 20);

    /**
     * Create the object.
     */
    var obj = SimpleSim.System.add('FrogNUX', props);

    // add html to container
    obj.el.innerHTML = '';
    obj.el.appendChild(props.html);

  };

  /**
   * Adds a new FroggerMenu to the system.
   * @param {Object} opt_options A map of initial properties.
   * @return {Object} An instance of FrogNUX.
   */
  Frogger.createFroggerMenu = function(opt_options) {
    
    var options = opt_options || {}, props = {};

    props.color = options.color || [255, 255, 255];
    props.width =  options.width;

    // TEMPORARY
    var innerContainer = document.createElement('div');
    innerContainer.className = 'innerContainer';
    var color = this.palette.getColor();
    innerContainer.style.backgroundColor = 'rgb(' + color[0] + ', ' + color[1] + ', ' + color[2] + ')';
    innerContainer.textContent = 'Menu';
    props.html = options.html || innerContainer;

    /**
     * Some properties are not optional.
     */
    props.name = 'FroggerMenu';
    props.height = 60;
    props.opacity = 1;
    props.zIndex = 2;

    var x = props.width / 2 + (this.viewportDimensions.width - props.width) / 2;

    props.location = new SimpleSim.Vector(x, this.viewportDimensions.height - props.height / 2);

    /**
     * Create the object.
     */
    var obj = SimpleSim.System.add('FroggerMenu', props);

    // add html to container
    obj.el.innerHTML = '';
    obj.el.appendChild(props.html);

  };

  /**
   * Adds a new Frog to the system.
   * @param {number} i An index.
   * @param {Object} opt_options A map of initial properties.
   * @return {Object} An instance of Frog.
   */
  Frogger.createFrog = function(i, opt_options) {

    var options = opt_options || {}, props = {},
        myCol = i % this.totalColumns,
        scrollSpeed = myCol % 2 ?  this.MAX_SCROLL_SPEED :  this.MIN_SCROLL_SPEED;

    /**
     * If a story has been cached (ie. in the object pool),
     * its properties will be passed via the opt_options argument.
     * Set these properties first.
     */
    props.height = options.height || this.OBJ_WIDTH;
    props.color = options.color || [255, 255, 255];
    props.text = options.text || i;

    // TEMPORARY
    var innerContainer = document.createElement('div');
    innerContainer.className = 'innerContainer';
    var color = this.palette.getColor();
    innerContainer.style.backgroundColor = 'rgb(' + color[0] + ', ' + color[1] + ', ' + color[2] + ')';
    innerContainer.style.borderRadius = '10%';
    innerContainer.textContent = props.text;
    innerContainer.addEventListener('mouseup', function(e) {
      alert(e.target.textContent);
    }, false);
    props.html = options.html || innerContainer;

    /**
     * Some properties are not optional.
     */
    props.index = i;
    props.name = 'Frog';
    props.width =  this.OBJ_WIDTH;
    props.opacity = 1;
    props.borderRadius = 10;
    props.zIndex = 0;
    
    /**
     * Calculate the object's position based on its
     * index and height.
     */
    var position = this.positionObj(props.index, props.height);
    props.initLocation = new SimpleSim.Vector(position.x, position.y + this.scrollDistance * scrollSpeed);
    props.location = new SimpleSim.Vector(position.x, position.y);
    props.scrollSpeed = scrollSpeed;
    props.myCol = myCol;

    /**
     * Create the object.
     */
    var obj = SimpleSim.System.add('Frog', props);

    // add html to container
    obj.el.innerHTML = '';
    obj.el.appendChild(props.html);

    return obj;
  };

  /**
   * Positions a frog based on an index and height.
   * @param {number} i An index.
   * @param {number} height The frog's height.
   * @return {Object} A map of x and y coordinates.
   */
  Frogger.positionObj = function(i, height) {

    var totalColumns = this.totalColumns,
        objWidth = this.OBJ_WIDTH,
        objPadding = this.OBJ_PADDING,
        scrollDirection = this.scrollDirection,
        myCol = i % this.totalColumns,
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
  Frogger.onScroll = function() {

    var scrollOffset;

    Frogger.scrollDirection = Frogger.lastPageYOffset > window.pageYOffset ? 1 : -1;
    Frogger.scrollSpeed = Frogger.lastPageYOffset - window.pageYOffset;
    Frogger.lastPageYOffset = window.pageYOffset;
    Frogger.scrollDistance = window.pageYOffset;

    scrollOffset = Frogger.viewportDimensions.height + window.pageYOffset + Frogger.scrollThrottle;

    if (Frogger.scrollBlock.height < scrollOffset && !Frogger.fetching) {
      Frogger.scrollBlock.height = scrollOffset;
      Frogger.scrollBlock.el.style.height = Frogger.scrollBlock.height + 'px';
    }

    if (!SimpleSim.System._updating) {
      SimpleSim.System._update();
    }
  };

  /**
   * Sets the total number of scrollable columns.
   */
  Frogger.setTotalColumns = function() {
    this.totalColumns = Math.floor(this.viewportDimensions.width /
        (this.OBJ_WIDTH + this.OBJ_PADDING));
  };

  /**
   * Stores display properties from instances before they
   * were destroyed.
   *
   * @param  {Object} obj A map of properties.
   */
  Frogger.updateCache = function(obj) {
    this.cache[obj.index] = {
      height: obj.height,
      html: obj.html
    };
  };

  /**
   * Resets page and recreates intial objects.
   */
  Frogger.reflowObjs = function() {

    var i, max, objs = SimpleSim.System.getAllItemsByName('Frog');

    Frogger.viewportDimensions = exports.Utils.getViewportSize();

    for (i = 0, max = objs.length; i < max; i++) {
      SimpleSim.System.destroyItem(objs[i]);
    }

    Frogger.scrollDistance = 0;
    Frogger.setTotalColumns();
    Frogger.scrollDirection = -1;
    Frogger.scrollBlock.el.style.height = Frogger.viewportDimensions.height + 10 + 'px';

    window.scrollTo(0, 0);

    for (i = 0; i <  Frogger.totalColumns; i++) {
      //Frogger.createFrog(i, Frogger.cache[i]);
    }

    Frogger.createFrogNUX();
  };

  /**
   * If passed option is true, returns the length of the
   * tallest column in pixels. If passed option is false,
   * returns the length of the shortest column in pixels.
   *
   * @param {boolean} opt_tallest True returns tallest column length.
   * @return {number} A length in pixels.
   */
  Frogger.getMinMaxColumn = function(opt_tallest) {

    var i, max, obj, objs = SimpleSim.System.getAllItemsByName('Frog');

    var columns = {
      lookup: {},
      list: []
    };

    for (i = 0, max = objs.length; i < max; i++) {
      obj = objs[i];
      if (!columns.lookup[obj.myCol]) {
        columns.lookup[obj.myCol] = 0;
      }
      columns.lookup[obj.myCol] += obj.height + exports.Frogger.OBJ_PADDING + this.INITIAL_Y_OFFSET;
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

  Frogger.getFrogAreaWidth = function() {
    return this.totalColumns * this.OBJ_WIDTH + (this.totalColumns - 1) * this.OBJ_PADDING;
  };

  //
  // Temporary
  //

  var palette = new exports.ColorPalette();
  palette.addColor({
    min: 12,
    max: 24,
    startColor: [196, 213, 86],
    endColor: [166, 183, 56]
  }).addColor({
    min: 12,
    max: 24,
    startColor: [56, 139, 126],
    endColor: [26, 109, 96]
  }).addColor({
    min: 12,
    max: 24,
    startColor: [104, 233, 212],
    endColor: [74, 203, 182]
  }).addColor({
    min: 12,
    max: 24,
    startColor: [233, 158, 104],
    endColor: [203, 128, 74]
  }).addColor({
    min: 12,
    max: 24,
    startColor: [191, 75, 49],
    endColor: [171, 55, 19]
  });
  Frogger.palette = palette;

//});
