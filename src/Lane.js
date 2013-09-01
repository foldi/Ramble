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

  this.forceDirected = options.forceDirected;
	this.scrollSpeed = options.scrollSpeed || 0.5;
	this.position = 'fixed';
	this.adjusted = false;
	this.acceleration = new Burner.Vector();
	this.velocity = new Burner.Vector();
	this._force = new Burner.Vector();
	this.friction = new Burner.Vector();
	this.mass = options.mass || 3;
  this.minSpeed = options.minSpeed || 0;
	this.maxSpeed = options.maxSpeed || 15;
	Burner.World.call(this, el, options);
}
Burner.System.extend(Lane, Burner.World);

/**
 * Updates properties.
 */
Lane.prototype.step = function() {

  if (this.forceDirected) {

    // apply friction
    this.friction.x = this.velocity.x;
    this.friction.y = this.velocity.y;
    this.friction.mult(-1);
    this.friction.normalize();
    this.friction.mult(this.c);
    this.applyForce(this.friction);

    // apply forces
    this.applyForce(exports.Driver.force);
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);

    // let margin top determine location
    if (Math.abs(this.velocity.y) > 0.1) {
      this.marginTop += this.velocity.y;
    }
    if (this.marginTop > 0) {
      this.marginTop = 0;
      this.velocity.mult(0);
    }

    this.acceleration.mult(0);

  } else {
    //console.log(exports.Driver.force.y);
    this.velocity.y = exports.Driver.force.y;
    if (Math.abs(exports.Driver.force.y) > 0.1) {
      this.marginTop += exports.Driver.force.y * this.maxSpeed;
    }
    if (this.marginTop > 0) {
      this.marginTop = 0;
    }
  }

  this.adjusted = false;
};

/**
 * Adds a force to this object's acceleration.
 *
 * @param {Object} force A Vector representing a force to apply.
 * @returns {Object} A Vector representing a new acceleration.
 */
Lane.prototype.applyForce = function(force) {
  // calculated via F = m * a
  if (force) {
    this._force.x = force.x;
    this._force.y = force.y;
    this._force.div(this.mass);
    this.acceleration.add(this._force);
    return this.acceleration;
  }
};

/**
* Updates properties.
*/
Lane.prototype.step_ = function() {
	this.adjusted = false;
	//this.marginTop = window.pageYOffset * -this.scrollSpeed;
	// could update this.location.y here using:
	// this.location.y = this.initLocation.y + (window.pageYOffset * -this.scrollSpeed);
	// but updating top margin is less math.


	this.marginTop -= exports.Driver.force.y;
};
