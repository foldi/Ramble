/**
 * Creates a new ScrollBlock.
 *
 * A scrollBlock expands and contracts in height and
 * creates room for the page to scroll. The scrollBlock
 * height should be slightly taller than the viewport height
 * plus the total distance scrolled.
 *
 * @param {Object} [opt_options=] A map of initial properties.
 * @constructor
 */
function ScrollBlock(el, opt_options) {
  var options = opt_options || {};
  if (!el) {
    throw new Error('A DOM element is required for a new ScrollBlock.');
  }
  this.el = el;
  this.height = options.height || ScrollBlock.heightBuffer;
  this.el.style.height = this.height + 'px';
}

ScrollBlock.heightBuffer = 10000;

ScrollBlock.prototype.addHeight = function() {
	Driver.scrollBlock.height += ScrollBlock.heightBuffer;
  Driver.scrollBlock.el.style.height = Driver.scrollBlock.height + 'px';
};
