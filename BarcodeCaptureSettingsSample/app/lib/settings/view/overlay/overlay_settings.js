const ScanditCore = require("scandit-titanium-datacapture-core");
const ScanditBarcode = require("scandit-titanium-datacapture-barcode");
const view = require("/common/view_helper");
const navigation = require("/model/navigation_helper");
const settings = require("/model/settings_manager");

let brushContainer = view.createContainerView(5, 60, 0);

exports.openView = () => {
  const window = view.createWindow("Overlay");

  window.addEventListener("open", function (e) {
    window.add(brushContainer);
    setupBrushView();
    window.add(setupOverlayStyle());
  });

  navigation.openWindow(window);
};

function setupBrushView() {
  brushContainer.removeAllChildren();

  const picker = Ti.UI.createPicker({
    right: 0,
    useSpinner: false,
    type: Titanium.UI.PICKER_TYPE_PLAIN,
    width: 200,
  });

  let defaultBrush = settings.instance.defaultBrush;

  const availableBrushes = [];
  availableBrushes.push(defaultBrush);

  const redBrush = new ScanditCore.Brush(
    ScanditCore.Color.fromHex("#FF000033"),
    ScanditCore.Color.fromHex("#FF0000FF"),
    defaultBrush.strokeWidth
  );
  availableBrushes.push(redBrush);

  const greenBrush = new ScanditCore.Brush(
    ScanditCore.Color.fromHex("#00FF0033"),
    ScanditCore.Color.fromHex("#00FF00FF"),
    defaultBrush.strokeWidth
  );
  availableBrushes.push(greenBrush);

  const pickerData = [];
  pickerData.push(
    view.createPickerRow("Default", defaultBrush)
  );
  pickerData.push(view.createPickerRow("Red", redBrush));
  pickerData.push(view.createPickerRow("Green", greenBrush));

  picker.add(pickerData);
  const label = view.createLeftLabel("Brush", 5);

  brushContainer.add(label);
  brushContainer.add(picker);

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
}

function setupOverlayStyle() {
  var container = view.createContainerView(65, 60, 0);

  const picker = Ti.UI.createPicker({
    right: 0,
    useSpinner: false,
    type: Titanium.UI.PICKER_TYPE_PLAIN,
    width: 200,
  });

  const pickerData = [];
  Object.entries(ScanditBarcode.BarcodeCaptureOverlayStyle).map(([key, value]) =>
    pickerData.push(view.createPickerRow(key, value))
  );
  picker.add(pickerData);

  const label = view.createLeftLabel("Style", 5);

  container.add(label);
  container.add(picker);

  const selectedIndex = pickerData.findIndex(
    (element) =>
      element.properties.value == settings.instance.currentOverlayStyle
  );
  picker.setSelectedRow(0, selectedIndex, false);

  picker.addEventListener("change", function (event) {
    if (event.row && event.row.properties) {
      settings.instance.currentOverlayStyle = event.row.properties.value;
      setupBrushView();
    }
  });

  return container;
}