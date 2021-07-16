const view = require("/common/view_helper");
const navigation = require("/model/navigation_helper");
const settings = require("/model/settings_manager");
const numberWithUnit = require("/common/value_with_measure_view");

exports.openView = () => {
  const window = view.createWindow("Point of Interest");

  window.addEventListener("open", function (e) {
    setupViewContainers();
    window.add(pointXContainer);
    window.add(pointYContainer);
  });

  window.addEventListener("focus", function (e) {
    updateValues();
  });

  navigation.openWindow(window);
};

let pointXContainer = null;
let pointYContainer = null;

let xValueLabel = null;
let yValueLabel = null;

function setupViewContainers() {
  pointXContainer = view.createContainerView(0, 60, 0);
  pointXContainer.addEventListener("click", (event) => {
    numberWithUnit.openView(new XValueSetter());
  });
  pointYContainer = view.createContainerView(65, 60, 0);
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
  xValueLabel.text = `${settings.instance.pointOfInterestX_Value.toFixed(
    2
  )} ( ${settings.instance.pointOfInterestX_Unit.toUpperCase()} )`;

  yValueLabel.text = `${settings.instance.pointOfInterestY_Value.toFixed(
    2
  )} ( ${settings.instance.pointOfInterestY_Unit.toUpperCase()} )`;
}

class XValueSetter {
  get viewTitle() {
    return "X";
  }

  get currentValue() {
    return settings.instance.pointOfInterestX_Value;
  }

  get currentMeasureUnit() {
    return settings.instance.pointOfInterestX_Unit;
  }

  set value(newValue) {
    settings.instance.pointOfInterestX_Value = newValue;
  }

  set measureUnit(newValue) {
    settings.instance.pointOfInterestX_Unit = newValue;
  }
}

class YValueSetter {
  get viewTitle() {
    return "Y";
  }

  get currentValue() {
    return settings.instance.pointOfInterestY_Value;
  }

  get currentMeasureUnit() {
    return settings.instance.pointOfInterestY_Unit;
  }

  set value(newValue) {
    settings.instance.pointOfInterestY_Value = newValue;
  }

  set measureUnit(newValue) {
    settings.instance.pointOfInterestY_Unit = newValue;
  }
}
