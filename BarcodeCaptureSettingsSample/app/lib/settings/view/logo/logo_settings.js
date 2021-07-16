const ScanditCore = require("scandit-titanium-datacapture-core");
const view = require("/common/view_helper");
const navigation = require("/model/navigation_helper");
const settings = require("/model/settings_manager");
const numberWithUnit = require("/common/value_with_measure_view");

exports.openView = () => {
  const window = view.createWindow("Logo");

  window.addEventListener("open", function (e) {
    window.add(setupAnchorView());
    setupAnchorOffset();
    window.add(pointXContainer);
    window.add(pointYContainer);
  });

  window.addEventListener("focus", function (e) {
    updateValues();
  });

  navigation.openWindow(window);
};

function setupAnchorView() {
  var container = view.createContainerView(5, 60, 0);

  const picker = Ti.UI.createPicker({
    right: 0,
    type: Titanium.UI.PICKER_TYPE_PLAIN,
    width: 200,
  });

  const pickerData = [];

  Object.entries(ScanditCore.Anchor).map(([key, value]) =>
    pickerData.push(view.createPickerRow(key, value))
  );
  picker.add(pickerData);
  picker.addEventListener("change", function (event) {
    settings.instance.logoAnchor = event.row.properties.value;
  });

  const label = view.createLeftLabel("Anchor", 5);

  container.add(label);
  container.add(picker);

  const selectedIndex = pickerData.findIndex(
    (element) =>
      JSON.stringify(element.properties.value) ===
      JSON.stringify(settings.instance.logoAnchor)
  );
  picker.setSelectedRow(0, selectedIndex, false);

  return container;
}

let pointXContainer = null;
let pointYContainer = null;

let xValueLabel = null;
let yValueLabel = null;

function setupAnchorOffset() {
  pointXContainer = view.createContainerView(65, 60, 0);
  pointXContainer.addEventListener("click", (event) => {
    numberWithUnit.openView(new XValueSetter());
  });
  pointYContainer = view.createContainerView(125, 60, 0);
  pointYContainer.addEventListener("click", (event) => {
    numberWithUnit.openView(new YValueSetter());
  });

  const xlabel = view.createLeftLabel("X", 5);
  xValueLabel = view.createRightLabel("", 5);
  pointXContainer.add(xlabel);
  pointXContainer.add(xValueLabel);

  const yLabel = view.createLeftLabel("Y", 5);
  yValueLabel = view.createRightLabel("", 5);
  pointYContainer.add(yLabel);
  pointYContainer.add(yValueLabel);
}

function updateValues() {
  xValueLabel.text = `${settings.instance.logoOffsetX_Value.toFixed(
    2
  )} ( ${settings.instance.logoOffsetX_Unit.toUpperCase()} )`;

  yValueLabel.text = `${settings.instance.logoOffsetY_Value.toFixed(
    2
  )} ( ${settings.instance.logoOffsetY_Unit.toUpperCase()} )`;
}

class XValueSetter {
  get viewTitle() {
    return "X";
  }

  get currentValue() {
    return settings.instance.logoOffsetX_Value;
  }

  get currentMeasureUnit() {
    return settings.instance.logoOffsetX_Unit;
  }

  set value(newValue) {
    settings.instance.logoOffsetX_Value = newValue;
  }

  set measureUnit(newValue) {
    settings.instance.logoOffsetX_Unit = newValue;
  }
}

class YValueSetter {
  get viewTitle() {
    return "Y";
  }

  get currentValue() {
    return settings.instance.logoOffsetY_Value;
  }

  get currentMeasureUnit() {
    return settings.instance.logoOffsetY_Unit;
  }

  set value(newValue) {
    settings.instance.logoOffsetY_Value = newValue;
  }

  set measureUnit(newValue) {
    settings.instance.logoOffsetY_Unit = newValue;
  }
}
