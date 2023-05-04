const navigation = require("/model/navigation_helper");
const settings = require("/model/settings_manager");
const view = require("/common/view_helper");

exports.openView = () => {
  const window = view.createWindow("Result");

  window.addEventListener("open", function (_e) {
    window.add(continousScanSwitch());
  });

  navigation.openWindow(window);
};

function continousScanSwitch() {
  const container = view.createContainerView(5, 60, 0);

  var switchControl = Ti.UI.createSwitch({
    style: Ti.UI.SWITCH_STYLE_SLIDER,
    value: settings.instance.continuousScanningEnabled,
    width: Titanium.UI.SIZE,
    right: 5,
  });

  const label = view.createLeftLabel("Continuous Scanning", 5);

  container.add(label);
  container.add(switchControl);

  switchControl.addEventListener("change", function (_e) {
    settings.instance.continuousScanningEnabled = switchControl.value;
  });

  return container;
}
