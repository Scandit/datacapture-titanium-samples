const view = require("/common/view_helper");
const ScanditCore = require("scandit-titanium-datacapture-core");
const navigation = require("/model/navigation_helper");

let valueHandler = null;

const measureUnitsList = Ti.UI.createListView({
  separatorColor: "#e8e8e8",
  backgroundColor: "white",
  disableBounce: true,
  height: Titanium.UI.SIZE,
  top: 70,
});

exports.openView = (payload) => {
  valueHandler = payload;

  const window = view.createWindow(valueHandler.viewTitle);

  window.addEventListener("open", function (e) {
    const container = setupValueFields();
    setupMeasureUnitList();

    window.add(container);
    window.add(measureUnitsList);
  });

  navigation.openWindow(window);
};

function setupValueFields() {
  const container = view.createContainerView(5, 60, 0);
  const label = view.createLeftLabel("Value", 5);
  const textField = Ti.UI.createTextField({
    width: 250,
    height: 40,
    right: 5,
    color: "black",
    textAlign: Titanium.UI.TEXT_ALIGNMENT_RIGHT,
    keyboardType: Titanium.UI.KEYBOARD_TYPE_NUMBERS_PUNCTUATION,
    inputType: Titanium.UI.INPUT_TYPE_CLASS_NUMBER,
    value: valueHandler.currentValue.toFixed(2),
  });
  textField.addEventListener("change", function (e) {
    valueHandler.value = parseFloat(e.value) || 0.0;
  });

  container.add(label);
  container.add(textField);
  return container;
}

function setupMeasureUnitList() {
  measureUnitsList.addEventListener("itemclick", (event) => {
    valueHandler.measureUnit =
      event.section.items[event.itemIndex].properties.value;
    loadMeasureUnits();
  });
  loadMeasureUnits();
}

function loadMeasureUnits() {
  const measureUnits = [
    {
      title: ScanditCore.MeasureUnit.DIP.toUpperCase(),
      value: ScanditCore.MeasureUnit.DIP,
    },
    {
      title: ScanditCore.MeasureUnit.Pixel.toUpperCase(),
      value: ScanditCore.MeasureUnit.Pixel,
    },
    {
      title: ScanditCore.MeasureUnit.Fraction.toUpperCase(),
      value: ScanditCore.MeasureUnit.Fraction,
    },
  ];

  const sections = [];

  const listItem = (title, type) => {
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
    if (value == valueHandler.currentMeasureUnit) {
      return Titanium.UI.LIST_ACCESSORY_TYPE_CHECKMARK;
    } else {
      return Titanium.UI.LIST_ACCESSORY_TYPE_NONE;
    }
  }

  const listSource = measureUnits.map((item) =>
    listItem(item.title, item.value)
  );

  const section = Ti.UI.createListSection({
    color: "#FFF",
    height: 35,
    items: listSource,
  });

  sections.push(section);

  measureUnitsList.sections = sections;
}
