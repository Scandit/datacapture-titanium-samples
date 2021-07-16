const view = require("/common/view_helper");
const navigation = require("/model/navigation_helper");
const settings = require("/model/settings_manager");

exports.openView = () => {
  const window = view.createWindow("Controls");

  window.addEventListener("open", function (e) {
    window.add(torchControl());
  });

  navigation.openWindow(window);
};

function torchControl() {
  const container = view.createContainerView(5, 60, 0);

  var switchControl = Ti.UI.createSwitch({
    style: Ti.UI.SWITCH_STYLE_SLIDER,
    value: settings.instance.isTorchControlEnabled,
    width: Titanium.UI.SIZE,
    right: 5,
  });

  const label = view.createLeftLabel("Torch Button", 5);

  container.add(label);
  container.add(switchControl);

  switchControl.addEventListener("change", function (e) {
    settings.instance.isTorchControlEnabled = switchControl.value;
  });

  return container;
}
