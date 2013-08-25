/**
* Creates a new Lane.
*
* @param {Object} el A DOM element representing a new instance.
* @param {Object=} opt_options A map of initial properties.
* @constructor
* @extends {World}
*/
function Lane(el, opt_options) {

	var options = opt_options || {};

	if (!el || typeof el !== 'object') {
    throw new Error('World: A valid DOM object is required for a new FroggerLane.');
	}

	this.scrollSpeed = options.scrollSpeed || 0.5;
	this.position = 'fixed';
	this.adjusted = false;
	Burner.World.call(this, el, options);
}
Burner.System.extend(Lane, Burner.World);

/**
* Updates properties.
*/
Lane.prototype.step = function() {
	this.adjusted = false;
	this.marginTop = window.pageYOffset * -this.scrollSpeed;
	// could update this.location.y here using:
	// this.location.y = this.initLocation.y + (window.pageYOffset * -this.scrollSpeed);
	// but updating top margin is less math.
};

