const view = require("/common/view_helper");
const navigation = require("/model/navigation_helper");
const settings = require("/model/settings_manager");

exports.openView = () => {
  const window = view.createWindow("Code Duplicate Filter");

  window.addEventListener("open", function (_e) {
    window.add(setupView());
  });

  navigation.openWindow(window);
};

function setupView() {
  const container = view.createContainerView(5, 60, 0);
  const label = view.createLeftLabel("Code Duplicate Filter (s)", 5);
  const textField = Ti.UI.createTextField({
    width: 150,
    height: 40,
    right: 10,
    color: "black",
    textAlign: Titanium.UI.TEXT_ALIGNMENT_RIGHT,
    keyboardType: Titanium.UI.KEYBOARD_TYPE_NUMBER_PAD,
    inputType: Titanium.UI.INPUT_TYPE_CLASS_NUMBER,
    value: (settings.instance.codeDuplicateFilter || 0) / 1000,
  });
  textField.addEventListener("change", function (e) {
    settings.instance.codeDuplicateFilter = (parseInt(e.value) || 0) * 1000;
  });

  container.add(label);
  container.add(textField);
  return container;
}
