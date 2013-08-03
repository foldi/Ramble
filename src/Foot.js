/**
 * Creates a new Foot.
 *
 * @param {Object} options A map of initial properties.
 * @constructor
 */
function Foot(opt_options) {
  var options = opt_options || {};
  this.message = options.message || 'You found a foothold.';
  this.name = 'Foot';
}

/**
 * Prints message to the body.
 */
Foot.prototype.slip = function() {
  document.body.innerText = this.message;
};

