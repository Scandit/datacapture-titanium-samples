const settings = require("/model/settings_manager");
const view = require("/common/view_helper");
const ScanditCore = require("scandit-titanium-datacapture-core");
const numberWithUnit = require("/common/value_with_measure_view");

let currentWindow = null;

exports.RectangularViewfinderSettings = function (window) {
  currentWindow = window;
  window.addEventListener("focus", onResume);
  window.addEventListener("close", onClose);

  const containerView = Ti.UI.createView({
    height: Titanium.UI.SIZE,
    horizontalWrap: false,
    layout: "vertical",
    right: 0,
    top: 10,
  });

  containerView.add(
    Ti.UI.createLabel({
      color: "#000",
      text: "Rectangular",
      textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
      width: Titanium.UI.SIZE,
      height: Titanium.UI.SIZE,
      left: 5,
    })
  );

  // Add all the required elements
  containerView.add(setupStyle());
  containerView.add(setupLineStyle());
  containerView.add(setupDimmingView());
  containerView.add(setupColor());
  containerView.add(setupAnimationView());

  const sizeSpecificationContainer = Ti.UI.createView({
    height: Titanium.UI.SIZE,
    horizontalWrap: false,
    layout: "vertical",
    right: 0,
    top: 5,
  });

  containerView.add(setupSizeSpecificationView(sizeSpecificationContainer));
  containerView.add(sizeSpecificationContainer);

  return containerView;
};

const onResume = function () {
  // Update vealues on window focus

  if (widthValueLabel != null) {
    widthValueLabel.text = `${settings.instance.rectangularViewfinderWidth.value.toFixed(
      2
    )} ( ${settings.instance.rectangularViewfinderWidth.unit.toUpperCase()} )`;
  }

  if (heightValueLabel != null) {
    heightValueLabel.text = `${settings.instance.rectangularViewfinderHeight.value.toFixed(
      2
    )} ( ${settings.instance.rectangularViewfinderHeight.unit.toUpperCase()} )`;
  }
};
const onClose = function () {
  currentWindow.removeEventListener("focus", onResume);
  currentWindow.removeEventListener("close", onClose);
};

function setupStyle() {
  var container = view.createContainerView(5, 60, 0);

  const picker = Ti.UI.createPicker({
    right: 0,
    type: Titanium.UI.PICKER_TYPE_PLAIN,
    width: 200,
  });

  const pickerData = [];
  Object.entries(ScanditCore.RectangularViewfinderStyle).map(([key, value]) =>
    pickerData.push(view.createPickerRow(key, value))
  );
  picker.add(pickerData);

  const label = view.createLeftLabel("Style", 5);

  container.add(label);
  container.add(picker);

  const selectedIndex = pickerData.findIndex(
    (element) =>
      element.properties.value == settings.instance.rectangularViewfinderStyle
  );
  picker.setSelectedRow(0, selectedIndex, false);

  picker.addEventListener("change", function (event) {
    if (event.row && event.row.properties) {
      settings.instance.rectangularViewfinderStyle = event.row.properties.value;
    }
  });

  return container;
}

function setupLineStyle() {
  var container = view.createContainerView(0, 60, 0);

  const picker = Ti.UI.createPicker({
    right: 0,
    type: Titanium.UI.PICKER_TYPE_PLAIN,
    width: 200,
  });

  const pickerData = [];
  Object.entries(ScanditCore.RectangularViewfinderLineStyle).map(
    ([key, value]) => pickerData.push(view.createPickerRow(key, value))
  );
  picker.add(pickerData);

  const label = view.createLeftLabel("Line Style", 5);

  container.add(label);
  container.add(picker);

  const selectedIndex = pickerData.findIndex(
    (element) =>
      JSON.stringify(element.properties.value) ==
      JSON.stringify(settings.instance.rectangularViewfinderLineStyle)
  );
  picker.setSelectedRow(0, selectedIndex, false);
  picker.addEventListener("change", function (event) {
    if (event.row && event.row.properties) {
      settings.instance.rectangularViewfinderLineStyle =
        event.row.properties.value;
    }
  });

  return container;
}

function setupDimmingView() {
  const container = view.createContainerView(0, 60, 0);
  const label = view.createLeftLabel("Dimming (0.0 - 1.0)", 5);
  const textField = Ti.UI.createTextField({
    width: 150,
    height: 40,
    right: 5,
    color: "black",
    textAlign: Titanium.UI.TEXT_ALIGNMENT_RIGHT,
    keyboardType: Titanium.UI.KEYBOARD_TYPE_NUMBERS_PUNCTUATION,
    inputType: Titanium.UI.INPUT_TYPE_CLASS_NUMBER,
    value: settings.instance.dimming,
    padding: { right: 10 },
  });
  textField.addEventListener("change", function (e) {
    const input = parseFloat(e.value) || 0.0;
    if (input > 1.0 || input < 0.0) {
      return;
    }

    settings.instance.dimming = input.toFixed(1);
  });

  container.add(label);
  container.add(textField);
  return container;
}

function setupColor() {
  var container = view.createContainerView(0, 60, 0);

  const picker = Ti.UI.createPicker({
    right: 0,
    type: Titanium.UI.PICKER_TYPE_PLAIN,
    width: 200,
  });

  const availableColors = [];
  availableColors.push(ScanditCore.Color.fromHex("#ffffff"));
  availableColors.push(ScanditCore.Color.fromHex("#2ec1ce"));
  availableColors.push(ScanditCore.Color.fromHex("#000000"));

  const pickerData = [];
  pickerData.push(view.createPickerRow("Default", availableColors[0]));
  pickerData.push(
    view.createPickerRow("Blue (Scandit Blue)", availableColors[1])
  );
  pickerData.push(view.createPickerRow("Black", availableColors[2]));
  picker.add(pickerData);

  const label = view.createLeftLabel("Color", 5);

  container.add(label);
  container.add(picker);

  const selectedIndex = availableColors.findIndex(
    (element) =>
      element.toJSON() == settings.instance.rectangularColor.toJSON()
  );
  picker.setSelectedRow(0, selectedIndex, false);
  picker.addEventListener("change", function (event) {
    if (event.rowIndex >= 0) {
      settings.instance.rectangularColor = availableColors[event.rowIndex];
    }
  });

  return container;
}

function setupAnimationView() {
  const container = Ti.UI.createView({
    backgroundColor: "#fff",
    height: Titanium.UI.SIZE,
    horizontalWrap: false,
    layout: "vertical",
    width: Titanium.UI.FILL,
  });

  const animationContainer = view.createContainerView(0, 60, 0);
  const loopingContainer = view.createContainerView(0, 60, 0);
  container.add(animationContainer);

  // Animation
  var animationSwitch = Ti.UI.createSwitch({
    style: Ti.UI.SWITCH_STYLE_SLIDER,
    value: settings.instance.isAnimationEnabled,
    width: Titanium.UI.SIZE,
    right: 5,
  });

  const label = view.createLeftLabel("Animation", 5);

  animationContainer.add(label);
  animationContainer.add(animationSwitch);

  animationSwitch.addEventListener("change", (_e) => {
    settings.instance.isAnimationEnabled = animationSwitch.value;
    loopingSwith.value = settings.instance.isLooping;
    if (animationSwitch.value) {
      container.add(loopingContainer);
    } else {
      container.remove(loopingContainer);
    }
  });

  // Looping
  const loopingSwith = Ti.UI.createSwitch({
    style: Ti.UI.SWITCH_STYLE_SLIDER,
    value: settings.instance.isLooping,
    width: Titanium.UI.SIZE,
    right: 5,
  });

  const loopingLabel = view.createLeftLabel("Looping", 5);

  loopingContainer.add(loopingLabel);
  loopingContainer.add(loopingSwith);

  loopingSwith.addEventListener("change", (_e) => {
    settings.instance.isLooping = loopingSwith.value;
  });

  if (animationSwitch.value) {
    container.add(loopingContainer);
  }

  return container;
}

function setupSizeSpecificationView(sizeSpecificationContainer) {
  var container = view.createContainerView(5, 60, 0);

  const picker = Ti.UI.createPicker({
    right: 0,
    type: Titanium.UI.PICKER_TYPE_PLAIN,
    width: 200,
  });

  updateSizeSpecificationSettingsView(sizeSpecificationContainer);

  const pickerData = [];
  Object.entries(settings.SizeSpecification).map(([key, value]) =>
    pickerData.push(view.createPickerRow(key, value))
  );
  picker.add(pickerData);

  const label = view.createLeftLabel("Size Specification", 5);

  container.add(label);
  container.add(picker);

  const selectedIndex = pickerData.findIndex(
    (element) =>
      JSON.stringify(element.properties.value) ==
      JSON.stringify(
        settings.instance.currentRectangularViewFinderSizeSpecification
      )
  );
  picker.setSelectedRow(0, selectedIndex, false);
  picker.addEventListener("change", function (event) {
    if (event.row && event.row.properties) {
      settings.instance.currentRectangularViewFinderSizeSpecification =
        event.row.properties.value;
      updateSizeSpecificationSettingsView(sizeSpecificationContainer);
    }
  });

  return container;
}

function updateSizeSpecificationSettingsView(sizeSpecificationContainer) {
  sizeSpecificationContainer.removeAllChildren();
  if (
    settings.instance.currentRectangularViewFinderSizeSpecification ==
    settings.SizeSpecification.WidthAndHeight
  ) {
    setupWidthAndHeightViews(sizeSpecificationContainer);
  } else if (
    settings.instance.currentRectangularViewFinderSizeSpecification ==
    settings.SizeSpecification.WidthAndHeightAspect
  ) {
    setupWidthAndHeightAspectViews(sizeSpecificationContainer);
  } else if (
    settings.instance.currentRectangularViewFinderSizeSpecification ==
    settings.SizeSpecification.HeightAndWithAspect
  ) {
    setupHeightAndWithAspectViews(sizeSpecificationContainer);
  } else if (
    settings.instance.currentRectangularViewFinderSizeSpecification ==
    settings.SizeSpecification.ShorterDimensionAndAspectRatio
  ) {
    setupShorterDimensionAndAspectRatioViews(sizeSpecificationContainer);
  }
}

let widthValueLabel = null;
let heightValueLabel = null;

function setupWidthAndHeightViews(sizeSpecificationContainer) {
  const widthContainer = view.createContainerView(0, 60, 0);
  widthContainer.addEventListener("click", (_event) => {
    numberWithUnit.openView(new WidthValueSetter());
  });
  const heightContainer = view.createContainerView(0, 60, 0);
  heightContainer.addEventListener("click", (_event) => {
    numberWithUnit.openView(new HeightValueSetter());
  });

  const widthLabel = view.createLeftLabel("Width", 5);
  widthValueLabel = view.createRightLabel("", 5);
  widthContainer.add(widthLabel);
  widthContainer.add(widthValueLabel);

  const heightLabel = view.createLeftLabel("Height", 5);
  heightValueLabel = view.createRightLabel("", 5);
  heightContainer.add(heightLabel);
  heightContainer.add(heightValueLabel);

  sizeSpecificationContainer.add(widthContainer);
  sizeSpecificationContainer.add(heightContainer);
  onResume();
}

class WidthValueSetter {
  get viewTitle() {
    return "Width";
  }

  get currentValue() {
    return settings.instance.rectangularViewfinderWidth.value;
  }

  get currentMeasureUnit() {
    return settings.instance.rectangularViewfinderWidth.unit;
  }

  set value(newValue) {
    settings.instance.rectangularViewfinderWidth =
      new ScanditCore.NumberWithUnit(newValue, this.currentMeasureUnit);
  }

  set measureUnit(newValue) {
    settings.instance.rectangularViewfinderWidth =
      new ScanditCore.NumberWithUnit(this.currentValue, newValue);
  }
}

class HeightValueSetter {
  get viewTitle() {
    return "Height";
  }

  get currentValue() {
    return settings.instance.rectangularViewfinderHeight.value;
  }

  get currentMeasureUnit() {
    return settings.instance.rectangularViewfinderHeight.unit;
  }

  set value(newValue) {
    settings.instance.rectangularViewfinderHeight =
      new ScanditCore.NumberWithUnit(newValue, this.currentMeasureUnit);
  }

  set measureUnit(newValue) {
    settings.instance.rectangularViewfinderHeight =
      new ScanditCore.NumberWithUnit(this.currentValue, newValue);
  }
}

function setupWidthAndHeightAspectViews(sizeSpecificationContainer) {
  heightValueLabel = null;
  const widthContainer = view.createContainerView(0, 60, 0);
  widthContainer.addEventListener("click", (_event) => {
    numberWithUnit.openView(new WidthValueSetter());
  });

  const widthLabel = view.createLeftLabel("Width", 5);
  widthValueLabel = view.createRightLabel("", 5);
  widthContainer.add(widthLabel);
  widthContainer.add(widthValueLabel);

  onResume();

  const heightAspectContainer = view.createContainerView(0, 60, 0);
  const heightAspect = view.createLeftLabel("Height Aspect", 5);
  const heightAspectText = Ti.UI.createTextField({
    width: 250,
    height: 40,
    right: 5,
    color: "black",
    textAlign: Titanium.UI.TEXT_ALIGNMENT_RIGHT,
    keyboardType: Titanium.UI.KEYBOARD_TYPE_NUMBERS_PUNCTUATION,
    inputType: Titanium.UI.INPUT_TYPE_CLASS_NUMBER,
    value: settings.instance.rectangularViewfinderHeightAspect.toFixed(2),
  });
  heightAspectText.addEventListener("change", function (e) {
    settings.instance.rectangularViewfinderHeightAspect =
      parseFloat(e.value) || 0.0;
  });

  heightAspectContainer.add(heightAspect);
  heightAspectContainer.add(heightAspectText);

  sizeSpecificationContainer.add(widthContainer);
  sizeSpecificationContainer.add(heightAspectContainer);
}

function setupHeightAndWithAspectViews(sizeSpecificationContainer) {
  widthValueLabel = null;
  const heightContainer = view.createContainerView(0, 60, 0);
  heightContainer.addEventListener("click", (_event) => {
    numberWithUnit.openView(new HeightValueSetter());
  });

  const heightLabel = view.createLeftLabel("Height", 5);
  heightValueLabel = view.createRightLabel("", 5);
  heightContainer.add(heightLabel);
  heightContainer.add(heightValueLabel);

  onResume();

  const widthAspectContainer = view.createContainerView(0, 60, 0);
  const widthAspect = view.createLeftLabel("Width Aspect", 5);
  const widthAspectText = Ti.UI.createTextField({
    width: 250,
    height: 40,
    right: 5,
    color: "black",
    textAlign: Titanium.UI.TEXT_ALIGNMENT_RIGHT,
    keyboardType: Titanium.UI.KEYBOARD_TYPE_NUMBERS_PUNCTUATION,
    inputType: Titanium.UI.INPUT_TYPE_CLASS_NUMBER,
    value: settings.instance.rectangularViewfinderWidthAspect.toFixed(2),
  });
  widthAspectText.addEventListener("change", function (e) {
    settings.instance.rectangularViewfinderWidthAspect =
      parseFloat(e.value) || 0.0;
  });

  widthAspectContainer.add(widthAspect);
  widthAspectContainer.add(widthAspectText);

  sizeSpecificationContainer.add(heightContainer);
  sizeSpecificationContainer.add(widthAspectContainer);
}

function setupShorterDimensionAndAspectRatioViews(sizeSpecificationContainer) {
  widthValueLabel = null;
  heightValueLabel = null;

  const shoredDimensionContainer = view.createContainerView(0, 60, 0);

  const shorterDimensionLabel = view.createLeftLabel(
    "Shorter Dimension (Fraction)",
    5
  );
  const shorterDimensionText = Ti.UI.createTextField({
    width: 250,
    height: 40,
    right: 5,
    color: "black",
    textAlign: Titanium.UI.TEXT_ALIGNMENT_RIGHT,
    keyboardType: Titanium.UI.KEYBOARD_TYPE_NUMBERS_PUNCTUATION,
    inputType: Titanium.UI.INPUT_TYPE_CLASS_NUMBER,
    value: settings.instance.rectangularViewfinderShorterDimension.toFixed(2),
  });
  shorterDimensionText.addEventListener("change", function (e) {
    settings.instance.rectangularViewfinderShorterDimension =
      parseFloat(e.value) || 0.0;
  });

  shoredDimensionContainer.add(shorterDimensionLabel);
  shoredDimensionContainer.add(shorterDimensionText);

  const shoredDimensionAspectContainer = view.createContainerView(0, 60, 0);
  const shorterDimesionAspectLabel = view.createLeftLabel(
    "Longer Dimension Aspect",
    5
  );
  const shorterDimensionAspectText = Ti.UI.createTextField({
    width: 250,
    height: 40,
    right: 5,
    color: "black",
    textAlign: Titanium.UI.TEXT_ALIGNMENT_RIGHT,
    keyboardType: Titanium.UI.KEYBOARD_TYPE_NUMBERS_PUNCTUATION,
    inputType: Titanium.UI.INPUT_TYPE_CLASS_NUMBER,
    value:
      settings.instance.rectangularViewfinderShorterDimension_Aspect.toFixed(2),
  });
  shorterDimensionAspectText.addEventListener("change", function (e) {
    settings.instance.rectangularViewfinderShorterDimension_Aspect =
      parseFloat(e.value) || 0.0;
  });

  shoredDimensionAspectContainer.add(shorterDimesionAspectLabel);
  shoredDimensionAspectContainer.add(shorterDimensionAspectText);

  sizeSpecificationContainer.add(shoredDimensionContainer);
  sizeSpecificationContainer.add(shoredDimensionAspectContainer);
}
