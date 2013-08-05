/**
 * Creates a new Frog.
 *
 * @param {Object} [opt_options=] A map of initial properties.
 * @constructor
 */
function Frog(opt_options) {
	var options = opt_options || {};
	SimpleSim.Item.call(this, options);
}
SimpleSim.Utils.extend(Frog, SimpleSim.Item);

Frog.OBJ_WIDTH = 300;
Frog.OBJ_PADDING = 20;
Frog.MIN_SCROLL_SPEED = 0.45;
Frog.MAX_SCROLL_SPEED = 0.6;

Frog.scrollDirection = 0;
Frog.scrollDistance = 0;
Frog.lastScrollYOffset = 0;
Frog.totalColumns = 0;
Frog.controlBlock = null;
Frog.columns = null;
Frog.viewportDimensions = null;

Frog.cache = {
  lookup: {}
};

Frog.createStory = function(i, opt_options) {

  var options = opt_options || {},
      myCol = i % Frog.totalColumns,
      scrollSpeed = myCol % 2 ? Frog.MAX_SCROLL_SPEED : Frog.MIN_SCROLL_SPEED;

  options.text = i;

  options.index = i;

  options.name = 'Frog';
  options.width = Frog.OBJ_WIDTH;
  options.height = options.height || SimpleSim.Utils.getRandomNumber(300, 500);
  options.opacity = 1;

  var position = Frog.positionObj(options.index, options.height);

  // need to calculate initLocation
  options.initLocation = new SimpleSim.Vector(position.x, position.y + Frog.scrollDistance * scrollSpeed);
  options.location = new SimpleSim.Vector(position.x, position.y);
  options.scrollSpeed = scrollSpeed;
  options.myCol = i % Frog.totalColumns;

  var obj = SimpleSim.System.add('Frog', options);

  obj.el.textContent = obj.text;

};

Frog.positionObj = function(i, height) {

  var viewportDimensions = SimpleSim.Utils.getViewportSize(),
      totalColumns = Frog.totalColumns,
      myCol = i % totalColumns,
      myRow = Math.floor(i / totalColumns),
      position = {};

  // determines offset needed to center group of stories
  var xOffset = (viewportDimensions.width - ((totalColumns * Frog.OBJ_WIDTH) + (totalColumns + 1) * Frog.OBJ_PADDING)) / 2;

  position.x = Frog.OBJ_WIDTH * myCol + // centers story at location
      Frog.OBJ_WIDTH / 2 + // moves story origin to its left edge
      Frog.OBJ_PADDING * (myCol + 1) + // adds padding
      xOffset; // add centering offset

  position.y = height / 2 + Frog.OBJ_PADDING;

  if (Frog.scrollDirection === -1 || Frog.scrollDirection === 0) {
    var objBefore = SimpleSim.System.getAllItemsByAttribute('index', i - totalColumns)[0];
    if (objBefore) {
      position.y = objBefore.location.y + (objBefore.height / 2) + (height / 2) + Frog.OBJ_PADDING;
    }
  }

  if (Frog.scrollDirection === 1) {
    var objAfter = SimpleSim.System.getAllItemsByAttribute('index', i + totalColumns)[0];
    if (objAfter) {
      position.y = objAfter.location.y - (objAfter.height / 2) - (height / 2) - Frog.OBJ_PADDING;
    }
  }

  return position;
};

/**
 * Resets page and recreates intial objects.
 */
Frog.reflowObjs = function() {

	var i, max, objs = SimpleSim.System.getAllItemsByName('Frog');

	for (i = 0, max = objs.length; i < max; i++) {
		SimpleSim.System.destroyItem(objs[i]);
	}

	Frog.setTotalColumns();
  Frog.scrollDistance = 0;
  Frog.scrollDirection = 0;
  Frog.lastScrollYOffset = 0;

	window.scrollTo(0, 0);

  for (i = 0; i < Frog.totalColumns; i++) {
    Frog.createStory(i);
  }
};

Frog.setTotalColumns = function() {
  var viewportDimensions = SimpleSim.Utils.getViewportSize();
  Frog.totalColumns = Math.floor(viewportDimensions.width / (Frog.OBJ_WIDTH + Frog.OBJ_PADDING));
};

Frog.setViewportDimensions = function() {
  Frog.viewportDimensions = SimpleSim.Utils.getViewportSize();
};

Frog.setControlBlock = function(obj) {
  Frog.controlBlock = obj;
  Frog.controlBlock.style.height = (Frog.viewportDimensions.height * 4) + 'px';
};

Frog.updateCache = function(obj) {
  var props = {
    height: obj.height
  };
  Frog.cache.lookup[obj.index] = props;
};

Frog.getLongestColumn = function() {

  var viewportDimensions = SimpleSim.Utils.getViewportSize();

  var i, max, objs = SimpleSim.System.getAllItemsByName('Frog');

  Frog.columns = {
    lookup: {},
    list: []
  };

  for (i = 0, max = objs.length; i < max; i++) {
    var obj = objs[i];
    if (!Frog.columns.lookup[obj.myCol]) {
      Frog.columns.lookup[obj.myCol] = viewportDimensions.height;
    }
    Frog.columns.lookup[obj.myCol] += obj.height + Frog.OBJ_PADDING;
  }

  for (i in Frog.columns.lookup) {
    if (Frog.columns.lookup.hasOwnProperty(i)) {
      Frog.columns.list.push(Frog.columns.lookup[i]);
    }
  }
  Frog.columns.list.sort(function(a,b){return b-a;});
  return Frog.columns.list[0];
};

Frog.prototype.step = function() {

  var props, objBefore, objAfter;

  if (this.opacity < 1) {
    this.opacity += 0.1;
  } else {
    this.opacity = 1;
  }

  if ((Frog.scrollDirection === -1 || Frog.scrollDirection === 0) && // if initial load or scrolling up
      this.location.y < this.world.height + (this.height / 2)) { // obj appears above bottom border

    objAfter = SimpleSim.System.getAllItemsByAttribute('index', this.index + Frog.totalColumns)[0];

    if (!objAfter) { // if an obj does NOT exist under me
      props = Frog.cache.lookup[this.index + Frog.totalColumns];
      Frog.createStory(this.index + Frog.totalColumns, props);
    }
  }

  if (Frog.scrollDirection === 1 && // if scrolling down
      this.location.y > this.height / 2) { // obj appears just below top border

    objBefore = SimpleSim.System.getAllItemsByAttribute('index', this.index - Frog.totalColumns)[0];

    if (!objBefore && this.index >= Frog.totalColumns) {
      props = Frog.cache.lookup[this.index - Frog.totalColumns]; // recycling objects; use cache
      Frog.createStory(this.index - Frog.totalColumns, props);
    }
  }

  if (Frog.scrollDirection === -1 && // if scrolling up
      this.location.y < -this.height / 2) { // obj appears just above top border
    Frog.updateCache(this);
    SimpleSim.System.destroyItem(this); // destory this obj
  }

  if (Frog.scrollDirection === 1 && // if scrolling down
      this.location.y > this.world.height + this.height / 2) { // obj appears below bottom border
    Frog.updateCache(this);
    SimpleSim.System.destroyItem(this); // destory this obj
  }

};
