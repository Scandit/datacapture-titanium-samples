const navigation = require("/model/navigation_helper");
const view = require("/common/view_helper");
const settings = require("/model/settings_manager");

exports.openView = () => {
  const window = view.createWindow("Feedback");

  window.addEventListener("open", function (_e) {
    window.add(initSound());
    window.add(initVibration());
  });

  navigation.openWindow(window);
};

function initSound() {
  const soundContainer = view.createContainerView(5, 60, 0);

  var soundSwitch = Ti.UI.createSwitch({
    style: Ti.UI.SWITCH_STYLE_SLIDER,
    value: settings.instance.soundEnabled,
    width: Titanium.UI.SIZE,
    right: 5,
  });

  const label = view.createLeftLabel("Sound", 5);

  soundContainer.add(label);
  soundContainer.add(soundSwitch);

  soundSwitch.addEventListener("change", function (_e) {
    settings.instance.soundEnabled = soundSwitch.value;
  });

  return soundContainer;
}

function initVibration() {
  const vibrationContainer = view.createContainerView(70, 60, 0);

  var vibrationSwitch = Ti.UI.createSwitch({
    style: Ti.UI.SWITCH_STYLE_SLIDER,
    value: settings.instance.vibrationEnabled,
    width: Titanium.UI.SIZE,
    right: 5,
  });

  const label = view.createLeftLabel("Vibration", 5);

  vibrationContainer.add(label);
  vibrationContainer.add(vibrationSwitch);

  vibrationSwitch.addEventListener("change", function (_e) {
    settings.instance.vibrationEnabled = vibrationSwitch.value;
  });

  return vibrationContainer;
}
