function FrogNUX(opt_options) {
  var options = opt_options || {};
  SimpleSim.Item.call(this, options);
}
SimpleSim.Utils.extend(FrogNUX, SimpleSim.Item);

FrogNUX.prototype.step = function() {};