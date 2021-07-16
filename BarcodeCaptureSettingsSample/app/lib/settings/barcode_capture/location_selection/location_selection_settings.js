const navigation = require("/model/navigation_helper");
const view = require("/common/view_helper");
const ScanditCore = require("scandit-titanium-datacapture-core");
const settings = require("/model/settings_manager");
const numberWithUnit = require("/common/value_with_measure_view");
const common = require("/common/common");

let locationSelectionListView = null;

const locationSelectionItems = [
  { title: "None", type: "none" },
  { title: "Radius", type: "radius" },
  { title: "Rectangular", type: "rectangular" },
];

const locationSelectionConfigurationView = view.createVerticalContainerView(
  190,
  100,
  0
);
locationSelectionConfigurationView.height = Titanium.UI.SIZE;

exports.openView = () => {
  const window = view.createWindow("Location Selection");

  window.addEventListener("open", function (e) {
    createView();
    window.add(locationSelectionListView);
    window.add(locationSelectionConfigurationView);
  });

  window.addEventListener("focus", function (e) {
    loadLocationSelections();
    setupConfigView(getCurrentLocationSelection());
  });

  navigation.openWindow(window);
};

function createView() {
  locationSelectionListView = Ti.UI.createListView({
    separatorColor: "#e8e8e8",
    backgroundColor: "white",
    disableBounce: true,
    height: Titanium.UI.SIZE,
    top: 2,
  });

  locationSelectionListView.addEventListener("itemclick", (event) => {
    setLocationSelection(event.section.items[event.itemIndex].properties.value);

    loadLocationSelections();
  });
}

function loadLocationSelections() {
  const locationSelectionSections = [];

  const locationSelectionListItem = (title, type) => {
    return {
      properties: {
        title,
        color: "black",
        accessoryType: getAccessoryType(type),
        value: type,
      },
    };
  };

  function getAccessoryType(value) {
    if (
      value ==
      (
        settings.instance.locationSelection || { type: "none" }
      ).type.toLowerCase()
    ) {
      return Titanium.UI.LIST_ACCESSORY_TYPE_CHECKMARK;
    } else {
      return Titanium.UI.LIST_ACCESSORY_TYPE_NONE;
    }
  }

  const listSource = locationSelectionItems.map((item) =>
    locationSelectionListItem(item.title, item.type)
  );

  const locationSelectionSection = Ti.UI.createListSection({
    color: "#FFF",
    height: 35,
    items: listSource,
    headerTitle: "Type",
  });

  locationSelectionSections.push(locationSelectionSection);

  locationSelectionListView.sections = locationSelectionSections;
}

function setLocationSelection(selectedLocation) {
  if (selectedLocation === "none") {
    settings.instance.locationSelection = null;
  } else if (selectedLocation === "radius") {
    settings.instance.locationSelection =
      new ScanditCore.RadiusLocationSelection(
        new ScanditCore.NumberWithUnit(0, ScanditCore.MeasureUnit.DIP)
      );
  } else if (selectedLocation === "rectangular") {
    settings.instance.currentRectangularLocationSizeSpecification =
      common.SizeSpecification.WidthAndHeight;

    const size = new ScanditCore.SizeWithUnit(
      settings.instance.locationSelectionRectangularWidth,
      settings.instance.locationSelectionRectangularHeight
    );
    settings.instance.locationSelection =
      ScanditCore.RectangularLocationSelection.withSize(size);
  }
  setupConfigView(selectedLocation);
}

function setupConfigView(currentSelectedLocation) {
  clearLocationConfigViews();
  if (currentSelectedLocation === "radius") {
    setupRadiusLocationConfigView();
  } else if (currentSelectedLocation === "rectangular") {
    setupRectangularLocationConfigView();
  }
}

function clearLocationConfigViews() {
  locationSelectionConfigurationView.removeAllChildren();
  locationSelectionConfigurationView.visible = false;
}

function setupRadiusLocationConfigView() {
  const label = view.createLeftLabel("Radius", 5);
  addLocationConfigView(label);
  const radiusConfigContainer = view.createContainerView(0, 60, 0);
  addLocationConfigView(radiusConfigContainer);
  const sizeLabel = view.createLeftLabel("Size", 5);
  const sizeValueLabel = view.createRightLabel(
    `${settings.instance.locationSelectionRadiusValue.toFixed(
      2
    )} ( ${settings.instance.locationSelectionRadiusMeasureUnit.toUpperCase()} )`,
    5
  );
  radiusConfigContainer.add(sizeLabel);
  radiusConfigContainer.add(sizeValueLabel);
  radiusConfigContainer.addEventListener("click", (event) => {
    numberWithUnit.openView(new RadiusSizeValueSetter());
  });
}

function setupRectangularLocationConfigView() {
  const label = view.createLeftLabel("Rectangular", 5);
  addLocationConfigView(label);

  const rectangularConfigView = Ti.UI.createView({
    backgroundColor: "#fff",
    height: Titanium.UI.SIZE,
    top: 0,
    left: 0,
    horizontalWrap: false,
    right: 0,
  });
  addLocationConfigView(rectangularConfigView);

  const sizeSpecificationLabel = view.createLeftLabel("Size Specification", 5);
  const sizeSpecificationPicker = Ti.UI.createPicker({
    right: 0,
    useSpinner: false,
    type: Titanium.UI.PICKER_TYPE_PLAIN,
    height: 60,
    top: 0,
    width: 200,
  });

  const availableSizeSpecifications = [];
  availableSizeSpecifications.push(common.SizeSpecification.WidthAndHeight);
  availableSizeSpecifications.push(common.SizeSpecification.WidthAndAspectRatio);
  availableSizeSpecifications.push(common.SizeSpecification.HeightAndAspectRatio);

  const sizeSpecificationData = [];
  sizeSpecificationData.push(
    view.createPickerRow(
      "Width and Height",
      common.SizeSpecification.WidthAndHeight
    )
  );
  sizeSpecificationData.push(
    view.createPickerRow(
      "Width and Height Aspect",
      common.SizeSpecification.WidthAndAspectRatio
    )
  );
  sizeSpecificationData.push(
    view.createPickerRow(
      "Height and Width Aspect",
      common.SizeSpecification.HeightAndAspectRatio
    )
  );
  sizeSpecificationPicker.add(sizeSpecificationData);

  rectangularConfigView.add(sizeSpecificationLabel);
  rectangularConfigView.add(sizeSpecificationPicker);

  const sizeSpecificationContainer = Ti.UI.createView({
    backgroundColor: "#fff",
    height: Titanium.UI.SIZE,
    left: 0,
    layout: "vertical",
    right: 0,
  });

  addLocationConfigView(sizeSpecificationContainer);
  const selectedIndex = availableSizeSpecifications.findIndex(
    (element) =>
      element ==
      settings.instance.currentRectangularLocationSizeSpecification
  );
  sizeSpecificationPicker.setSelectedRow(0, selectedIndex, false);

  sizeSpecificationPicker.addEventListener("change", (event) => {
    settings.instance.resetRectangularLocationSelectionValues();
    setupSizeSpecificationViews(
      sizeSpecificationContainer,
      availableSizeSpecifications[event.rowIndex]
    );
  });

  setupSizeSpecificationViews(
    sizeSpecificationContainer,
    settings.instance.currentRectangularLocationSizeSpecification
  );
}

function setupSizeSpecificationViews(containerView, newSizeSpecification) {
  containerView.removeAllChildren();

  if (newSizeSpecification == common.SizeSpecification.WidthAndHeight) {
    setupWidthAndHeightViews(containerView);
  } else if (
    newSizeSpecification == common.SizeSpecification.WidthAndAspectRatio
  ) {
    setupWidthHeightAspectViews(containerView);
  } else if (
    newSizeSpecification == common.SizeSpecification.HeightAndAspectRatio
  ) {
    setupHeightWidthAspectViews(containerView);
  }
  settings.instance.currentRectangularLocationSizeSpecification =
    newSizeSpecification;
}

function setupWidthAndHeightViews(containerView) {
  const widthContainer = Ti.UI.createView({
    backgroundColor: "#fff",
    height: 45,
    left: 0,
    horizontalWrap: false,
    right: 0,
  });
  containerView.add(widthContainer);

  const widthLabel = view.createLeftLabel("Width", 5);
  const widthValueLabel = view.createRightLabel(
    `${settings.instance.locationSelectionRectangularWidth.value.toFixed(
      2
    )} ( ${settings.instance.locationSelectionRectangularWidth.unit.toUpperCase()} )`,
    5
  );
  widthContainer.add(widthLabel);
  widthContainer.add(widthValueLabel);
  widthContainer.addEventListener("click", (event) => {
    numberWithUnit.openView(new RectangularWidthValueSetter());
  });

  const heightContainer = Ti.UI.createView({
    backgroundColor: "#fff",
    height: 45,
    left: 0,
    horizontalWrap: false,
    right: 0,
  });
  containerView.add(heightContainer);

  const heightLabel = view.createLeftLabel("Height", 5);
  const heightValueLabel = view.createRightLabel(
    `${settings.instance.locationSelectionRectangularHeight.value.toFixed(
      2
    )} ( ${settings.instance.locationSelectionRectangularHeight.unit.toUpperCase()} )`,
    5
  );
  heightContainer.add(heightLabel);
  heightContainer.add(heightValueLabel);
  heightContainer.addEventListener("click", (event) => {
    numberWithUnit.openView(new RectangularHeightValueSetter());
  });
}

function setupWidthHeightAspectViews(containerView) {
  const widthContainer = Ti.UI.createView({
    backgroundColor: "#fff",
    height: 45,
    left: 0,
    horizontalWrap: false,
    right: 0,
  });
  containerView.add(widthContainer);

  const widthLabel = view.createLeftLabel("Width", 5);
  const widthValueLabel = view.createRightLabel(
    `${settings.instance.locationSelectionRectangularWidth.value.toFixed(
      2
    )} ( ${settings.instance.locationSelectionRectangularWidth.unit.toUpperCase()} )`,
    5
  );
  widthContainer.add(widthLabel);
  widthContainer.add(widthValueLabel);
  widthContainer.addEventListener("click", (event) => {
    numberWithUnit.openView(new RectangularWidthValueSetter());
  });

  const heigthAspectContainer = Ti.UI.createView({
    backgroundColor: "#fff",
    height: 45,
    left: 0,
    horizontalWrap: false,
    right: 0,
  });
  containerView.add(heigthAspectContainer);
  const heigthAspectLabel = view.createLeftLabel("Height Aspect", 5);
  const heigthAspectValue = Ti.UI.createTextField({
    width: 120,
    height: 40,
    right: 5,
    color: "black",
    textAlign: Titanium.UI.TEXT_ALIGNMENT_RIGHT,
    keyboardType: Titanium.UI.KEYBOARD_TYPE_NUMBERS_PUNCTUATION,
    inputType: Titanium.UI.INPUT_TYPE_CLASS_NUMBER,
    value:
      settings.instance.locationSelectionRectangularHeightAspect.toFixed(2),
  });
  heigthAspectValue.addEventListener("change", function (e) {
    settings.instance.locationSelectionRectangularHeightAspect =
      parseFloat(e.value) || 0.0;
  });
  heigthAspectContainer.add(heigthAspectLabel);
  heigthAspectContainer.add(heigthAspectValue);
}

function setupHeightWidthAspectViews(containerView) {
  const heightContainer = Ti.UI.createView({
    backgroundColor: "#fff",
    height: 45,
    left: 0,
    horizontalWrap: false,
    right: 0,
  });
  containerView.add(heightContainer);

  const heightLabel = view.createLeftLabel("Height", 5);
  const heightValueLabel = view.createRightLabel(
    `${settings.instance.locationSelectionRectangularHeight.value.toFixed(
      2
    )} ( ${settings.instance.locationSelectionRectangularHeight.unit.toUpperCase()} )`,
    5
  );
  heightContainer.add(heightLabel);
  heightContainer.add(heightValueLabel);
  heightContainer.addEventListener("click", (event) => {
    numberWithUnit.openView(new RectangularHeightValueSetter());
  });

  const widthAspectContainer = Ti.UI.createView({
    backgroundColor: "#fff",
    height: 45,
    left: 0,
    horizontalWrap: false,
    right: 0,
  });
  containerView.add(widthAspectContainer);

  const widthAspectLabel = view.createLeftLabel("Width Aspect", 5);
  const widthAspectValue = Ti.UI.createTextField({
    width: 120,
    height: 40,
    right: 5,
    color: "black",
    textAlign: Titanium.UI.TEXT_ALIGNMENT_RIGHT,
    keyboardType: Titanium.UI.KEYBOARD_TYPE_NUMBERS_PUNCTUATION,
    inputType: Titanium.UI.INPUT_TYPE_CLASS_NUMBER,
    value: settings.instance.locationSelectionRectangularWidthAspect.toFixed(2),
  });
  widthAspectValue.addEventListener("change", function (e) {
    settings.instance.locationSelectionRectangularWidthAspect =
      parseFloat(e.value) || 0.0;
  });
  widthAspectContainer.add(widthAspectLabel);
  widthAspectContainer.add(widthAspectValue);
}

function addLocationConfigView(view) {
  locationSelectionConfigurationView.add(view);
  locationSelectionConfigurationView.visible = true;
}

function getCurrentLocationSelection() {
  return (settings.instance.locationSelection || { type: "None" }).type;
}

class RadiusSizeValueSetter {
  get viewTitle() {
    return "Size";
  }

  get currentValue() {
    return settings.instance.locationSelectionRadiusValue;
  }

  get currentMeasureUnit() {
    return settings.instance.locationSelectionRadiusMeasureUnit;
  }

  set value(newValue) {
    settings.instance.locationSelectionRadiusValue = newValue;
  }

  set measureUnit(newValue) {
    settings.instance.locationSelectionRadiusMeasureUnit = newValue;
  }
}

class RectangularWidthValueSetter {
  get viewTitle() {
    return "Size";
  }

  get currentValue() {
    return settings.instance.locationSelectionRectangularWidth.value;
  }

  get currentMeasureUnit() {
    return settings.instance.locationSelectionRectangularWidth.unit;
  }

  set value(newValue) {
    settings.instance.locationSelectionRectangularWidth =
      new ScanditCore.NumberWithUnit(newValue, this.currentMeasureUnit);
  }

  set measureUnit(newValue) {
    settings.instance.locationSelectionRectangularWidth =
      new ScanditCore.NumberWithUnit(this.currentValue, newValue);
  }
}

class RectangularHeightValueSetter {
  get viewTitle() {
    return "Size";
  }

  get currentValue() {
    return settings.instance.locationSelectionRectangularHeight.value;
  }

  get currentMeasureUnit() {
    return settings.instance.locationSelectionRectangularHeight.unit;
  }

  set value(newValue) {
    settings.instance.locationSelectionRectangularHeight =
      new ScanditCore.NumberWithUnit(newValue, this.currentMeasureUnit);
  }

  set measureUnit(newValue) {
    settings.instance.locationSelectionRectangularHeight =
      new ScanditCore.NumberWithUnit(this.currentValue, newValue);
  }
}
