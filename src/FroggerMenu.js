function FroggerMenu(opt_options) {
  var options = opt_options || {};
  SimpleSim.Item.call(this, options);
}
SimpleSim.Utils.extend(FroggerMenu, SimpleSim.Item);

FroggerMenu.prototype.step = function() {

  if (exports.Frogger.scrollSpeed) {
    this.location.y = this.initLocation.y + (window.pageYOffset) * 0.1;
  } else {
    this.location.y = this.initLocation.y;
  }
    
};