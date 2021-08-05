const settings = require("/model/settings_manager");
const view = require("/common/view_helper");
const ScanditCore = require("scandit-titanium-datacapture-core");
const numberWithUnit = require("/common/value_with_measure_view");

exports.LaserlineViewfinderSettings = function (window) {
  window.removeEventListener("focus", updateWidthValue);
  window.addEventListener("focus", updateWidthValue);

  const view = Ti.UI.createView({
    height: Titanium.UI.SIZE,
    horizontalWrap: false,
    layout: "vertical",
    right: 0,
    top: 10,
  });

  view.add(
    Ti.UI.createLabel({
      color: "#000",
      text: "Laserline",
      textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
      width: Titanium.UI.SIZE,
      height: Titanium.UI.SIZE,
      left: 5,
    })
  );

  view.add(setupStyle());
  view.add(setupWidthView());
  view.add(setupEnabledColor());
  view.add(setupDisabledColor());

  return view;
};

function setupStyle() {
  var container = view.createContainerView(5, 60, 0);

  const picker = Ti.UI.createPicker({
    right: 0,
    type: Titanium.UI.PICKER_TYPE_PLAIN,
    width: 200,
  });

  const pickerData = [];
  Object.entries(ScanditCore.LaserlineViewfinderStyle).map(([key, value]) =>
    pickerData.push(view.createPickerRow(key, value))
  );
  picker.add(pickerData);
  picker.addEventListener("change", function (event) {
    settings.instance.laserlineStyle = event.row.properties.value;
  });

  const label = view.createLeftLabel("Style", 5);

  container.add(label);
  container.add(picker);

  const selectedIndex = pickerData.findIndex(
    (element) =>
      JSON.stringify(element.properties.value) ===
      JSON.stringify(settings.instance.laserlineStyle)
  );
  picker.setSelectedRow(0, selectedIndex, false);

  return container;
}

let widthValue = null;

function setupWidthView() {
  const container = view.createContainerView(0, 60, 0);
  container.addEventListener("click", (event) => {
    numberWithUnit.openView(new WidthValueSetter());
  });

  const label = view.createLeftLabel("Width", 5);
  widthValue = view.createRightLabel("", 5);
  container.add(label);
  container.add(widthValue);

  updateWidthValue();

  return container;
}

const updateWidthValue = function () {
  widthValue.text = `${settings.instance.laserLineWidth_Value.toFixed(
    2
  )} ( ${settings.instance.laserLineWidth_Unit.toUpperCase()} )`;
};

class WidthValueSetter {
  get viewTitle() {
    return "Width";
  }

  get currentValue() {
    return settings.instance.laserLineWidth_Value;
  }

  get currentMeasureUnit() {
    return settings.instance.laserLineWidth_Unit;
  }

  set value(newValue) {
    settings.instance.laserLineWidth_Value = newValue;
  }

  set measureUnit(newValue) {
    settings.instance.laserLineWidth_Unit = newValue;
  }
}

function setupEnabledColor() {
  var container = view.createContainerView(5, 60, 0);

  const picker = Ti.UI.createPicker({
    right: 0,
    type: Titanium.UI.PICKER_TYPE_PLAIN,
    width: 200,
  });

  const availableColors = [];
  availableColors.push(ScanditCore.Color.fromHex("#000000"));
  availableColors.push(ScanditCore.Color.fromHex("#ff0000"));
  availableColors.push(ScanditCore.Color.fromHex("#ffffff"));

  const pickerData = [];
  pickerData.push(view.createPickerRow("Default", availableColors[0]));
  pickerData.push(view.createPickerRow("Red", availableColors[1]));
  pickerData.push(view.createPickerRow("White", availableColors[2]));
  picker.add(pickerData);

  const label = view.createLeftLabel("Enabled Color", 5);

  container.add(label);
  container.add(picker);

  const selectedIndex = availableColors.findIndex(
    (element) =>
      element.toJSON() == settings.instance.laserlineEnabledColor.toJSON()
  );
  picker.setSelectedRow(0, selectedIndex, false);
  picker.addEventListener("change", function (event) {
    if (event.rowIndex >= 0) {
      settings.instance.laserlineEnabledColor = availableColors[event.rowIndex];
    }
  });

  return container;
}

function setupDisabledColor() {
  var container = view.createContainerView(5, 60, 0);

  const picker = Ti.UI.createPicker({
    right: 0,
    type: Titanium.UI.PICKER_TYPE_PLAIN,
    width: 200,
  });
  const availableColors = [];
  availableColors.push(ScanditCore.Color.fromHex("#ffffff"));
  availableColors.push(ScanditCore.Color.fromHex("#2ec1ce"));
  availableColors.push(ScanditCore.Color.fromHex("#ff0000"));

  const pickerData = [];
  pickerData.push(view.createPickerRow("Default", availableColors[0]));
  pickerData.push(
    view.createPickerRow("Blue (Scandit Blue)", availableColors[1])
  );
  pickerData.push(view.createPickerRow("Red", availableColors[2]));
  picker.add(pickerData);


  const label = view.createLeftLabel("Disabled Color", 5);

  container.add(label);
  container.add(picker);

  const selectedIndex = availableColors.findIndex(
    (element) =>
       element.toJSON() == settings.instance.laserlineDisabledColor.toJSON()
  );
  picker.setSelectedRow(0, selectedIndex, false);
  picker.addEventListener("change", function (event) {
    if (event.rowIndex >= 0) {
      settings.instance.laserlineDisabledColor =
        availableColors[event.rowIndex];
    }
  });

  return container;
}