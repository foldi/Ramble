/**
 * Creates a new Rider.
 *
 * @param {Object} [opt_options=] A map of initial properties.
 * @constructor
 */
function Rider(opt_options) {
  var options = opt_options || {};
  this.scrollVector = new SimpleSim.Vector();
  SimpleSim.Item.call(this, options);
}
SimpleSim.Utils.extend(Rider, SimpleSim.Item);

/**
 * Updates instance properties.
 */
Rider.prototype.step = function() {

  var props, before, after,
      scrollDirection =  exports.Driver.scrollDirection,
      totalColumns =  exports.Driver.totalColumns,
      cache = exports.Driver.cache,
      rect = this.el.getBoundingClientRect(),
      top = rect.top,
      height = rect.height;

  if (!this.forceDirected) {

    this.location.y = this.initLocation.y + (window.pageYOffset * -this.scrollSpeed);

  } else {
    this.scrollVector.y = 0.1 * exports.Driver.scrollDirection;
    this.applyForce(this.scrollVector);
    //this.acceleration.add(this.scrollVector);
    this.velocity.add(this.acceleration);
    this.location.add(this.velocity);
    this.acceleration.mult(0);
  }

  if (scrollDirection === -1 && // if initial load or scrolling up
      top + height < Driver.viewportDimensions.height) { // obj appears above bottom border
    after = SimpleSim.System.getAllItemsByAttribute('index', this.index + totalColumns)[0];
    if (!after) { // if an obj does NOT exist under me
      props = cache[this.index + totalColumns];
      exports.Driver.createRider(this.index + totalColumns, props);
    }
  }

  if (scrollDirection === 1 && top > 0) { // if scrolling down; obj appears just below top border
    before = SimpleSim.System.getAllItemsByAttribute('index', this.index - totalColumns)[0];
    if (!before && this.index >= totalColumns) {
      props = cache[this.index - totalColumns]; // recycling objects; use cache
      exports.Driver.createRider(this.index - totalColumns, props);
    }
  }

  if (scrollDirection === -1 && top + height < 0) { // if scrolling up; obj appears just above top border
    exports.Driver.updateCache(this);
    SimpleSim.System.destroyItem(this); // destory this obj
  }

  if (scrollDirection === 1 && top > Driver.viewportDimensions.height) { // if scrolling down; obj appears below bottom border
    exports.Driver.updateCache(this);
    SimpleSim.System.destroyItem(this); // destory this obj
  }
};