const view = require("/common/view_helper");
const navigation = require("/model/navigation_helper");
const settings = require("/model/settings_manager");

exports.openView = () => {
  const window = view.createWindow("Gestures");

  window.addEventListener("open", function (e) {
    window.add(tapToFocusControl());
    window.add(swipeToZoomControl());
  });

  navigation.openWindow(window);
};

function tapToFocusControl() {
  const container = view.createContainerView(5, 60, 0);

  var switchControl = Ti.UI.createSwitch({
    style: Ti.UI.SWITCH_STYLE_SLIDER,
    value: settings.instance.tapToFocusEnabled,
    width: Titanium.UI.SIZE,
    right: 5,
  });

  const label = view.createLeftLabel("Tap to Focus", 5);

  container.add(label);
  container.add(switchControl);

  switchControl.addEventListener("change", function (e) {
    settings.instance.tapToFocusEnabled = switchControl.value;
  });

  return container;
}

function swipeToZoomControl() {
  const container = view.createContainerView(65, 60, 0);

  var switchControl = Ti.UI.createSwitch({
    style: Ti.UI.SWITCH_STYLE_SLIDER,
    value: settings.instance.swipeToZoomEnabled,
    width: Titanium.UI.SIZE,
    right: 5,
  });

  const label = view.createLeftLabel("Swipe to Zoom", 5);

  container.add(label);
  container.add(switchControl);

  switchControl.addEventListener("change", function (e) {
    settings.instance.swipeToZoomEnabled = switchControl.value;
  });

  return container;
}
