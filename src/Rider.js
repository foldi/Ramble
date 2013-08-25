/**
 * Creates a new Rider.
 *
 * @param {Object} [opt_options=] A map of initial properties.
 * @constructor
 */
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

  if (!world.adjusted && scrollDirection === -1 &&
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

  if (!world.adjusted && scrollDirection === 1 && top > 0) { // scrolling down && obj appears just below top border
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

  if (!world.adjusted && scrollDirection === -1 && top + height < 0) {  // scrolling up && obj appears just above top border
    after = Burner.System.getAllItemsByAttribute('index', this.index + totalColumns)[0];
    if (after) {
      this.firstChildHeight = firstChild.offsetHeight; // add the first child height to cached object
      Driver.updateCache(this);
      Burner.System.destroyItem(this); // destory this obj
      world.paddingTop += this.firstChildHeight + Driver.OBJ_PADDING; // add height to world top paddding
      world.adjusted = true;
      return;
    }
  }

  if (!world.adjusted && scrollDirection === 1 && top > Driver.viewportDimensions.height) { // scrolling down && obj appears below bottom border
    before = Burner.System.getAllItemsByAttribute('index', this.index - totalColumns)[0];
    if (before) {
      Driver.updateCache(this);
      Burner.System.destroyItem(this); // destory this obj
      return;
    }
  }

  this.lastLocY = top;
};
