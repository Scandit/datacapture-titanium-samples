const ScanditCore = require("scandit-titanium-datacapture-core");
const view = require("/common/view_helper");
const navigation = require("/model/navigation_helper");
const settings = require("/model/settings_manager");

exports.openView = () => {
  const window = view.createWindow("Overlay");

  window.addEventListener("open", function (e) {
    window.add(setupView());
  });

  navigation.openWindow(window);
};

function setupView() {
  var container = view.createContainerView(5, 60, 0);

  const picker = Ti.UI.createPicker({
    right: 0,
    useSpinner: false,
    type: Titanium.UI.PICKER_TYPE_PLAIN,
    width: 200,
  });

  const availableBrushes = [];
  availableBrushes.push(settings.instance.defaultBrush);
  
  const redBrush = new ScanditCore.Brush(
    ScanditCore.Color.fromHex("#FF000033"),
    ScanditCore.Color.fromHex("#FF0000FF"),
    settings.instance.defaultBrush.strokeWidth
  );
  availableBrushes.push(redBrush);

  const greenBrush = new ScanditCore.Brush(
    ScanditCore.Color.fromHex("#00FF0033"),
    ScanditCore.Color.fromHex("#00FF00FF"),
    settings.instance.defaultBrush.strokeWidth
  );
  availableBrushes.push(greenBrush);

  const pickerData = [];
  pickerData.push(
    view.createPickerRow("Default", settings.instance.defaultBrush)
  );
  pickerData.push(view.createPickerRow("Red", redBrush));
  pickerData.push(view.createPickerRow("Green", greenBrush));

  picker.add(pickerData);
  const label = view.createLeftLabel("Brush", 5);

  container.add(label);
  container.add(picker);

  const selectedIndex = availableBrushes.findIndex(
    (element) =>
      JSON.stringify(element) ===
      JSON.stringify(settings.instance.currentBrush)
  );
  picker.setSelectedRow(0, selectedIndex, false);

  picker.addEventListener("change", function (event) {
    if (event.row && event.row.properties) {
      settings.instance.currentBrush = availableBrushes[event.rowIndex];
    }
  });

  return container;
}
