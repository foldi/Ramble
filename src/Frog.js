/*require([
  'scripts/frogger#Frogger',
  'scripts/renderer/system#System',
  'scripts/renderer/item#Item',
  'scripts/renderer/utils#Utils'
], function(Frogger, System, Item, Utils) {*/

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

  /**
   * Updates instance properties.
   */
  Frog.prototype.step = function() {

    var props, before, after,
        scrollDirection =  exports.Frogger.scrollDirection,
        totalColumns =  exports.Frogger.totalColumns,
        cache = exports.Frogger.cache;

    this.location.y = this.initLocation.y + (window.pageYOffset * -this.scrollSpeed);

    if ((scrollDirection === -1) && // if initial load or scrolling up
        this.location.y < this.world.height + (this.height / 2)) { // obj appears above bottom border

      after = SimpleSim.System.getAllItemsByAttribute('index', this.index + totalColumns)[0];

      if (!after) { // if an obj does NOT exist under me
        props = cache[this.index + totalColumns];
        exports.Frogger.createFrog(this.index + totalColumns, props);
      }
    }

    if (scrollDirection === 1 && // if scrolling down
        this.location.y > this.height / 2) { // obj appears just below top border

      before = SimpleSim.System.getAllItemsByAttribute('index', this.index - totalColumns)[0];

      if (!before && this.index >= totalColumns) {
        props = cache[this.index - totalColumns]; // recycling objects; use cache
        exports.Frogger.createFrog(this.index - totalColumns, props);
      }
    }

    if (scrollDirection === -1 && // if scrolling up
        this.location.y < -this.height / 2) { // obj appears just above top border
      exports.Frogger.updateCache(this);
      SimpleSim.System.destroyItem(this); // destory this obj
    }

    if (scrollDirection === 1 && // if scrolling down
        this.location.y > this.world.height + this.height / 2) { // obj appears below bottom border
      exports.Frogger.updateCache(this);
      SimpleSim.System.destroyItem(this); // destory this obj
    }
  };

//});