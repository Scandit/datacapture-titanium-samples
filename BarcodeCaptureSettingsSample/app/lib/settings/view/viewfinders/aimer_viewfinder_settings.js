const settings = require("/model/settings_manager");
const view = require("/common/view_helper");
const ScanditCore = require("scandit-titanium-datacapture-core");

exports.AimerViewfinderSettings = function () {
  const frameColorView = setupFrameColorView();
  const dotColorView = setupDotColorView();

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
      text: "Aimer",
      textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
      width: Titanium.UI.SIZE,
      height: Titanium.UI.SIZE,
      left: 5,
    })
  );
  containerView.add(frameColorView);
  containerView.add(dotColorView);

  return containerView;
};

function setupFrameColorView() {
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
  const label = view.createLeftLabel("Frame Color", 5);

  container.add(label);
  container.add(picker);

  const selectedIndex = availableColors.findIndex(
    (element) => element.toJSON() == settings.instance.aimerFrameColor.toJSON()
  );
  picker.setSelectedRow(0, selectedIndex, false);

  picker.addEventListener("change", function (event) {
    if (event.rowIndex >= 0) {
      settings.instance.aimerFrameColor = availableColors[event.rowIndex];
    }
  });


  return container;
}

function setupDotColorView() {
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

  const label = view.createLeftLabel("Dot Color", 5);

  container.add(label);
  container.add(picker);

  const selectedIndex = availableColors.findIndex(
    (element) =>
      element.toJSON() == settings.instance.aimerDotColor.toJSON()
  );
  picker.setSelectedRow(0, selectedIndex, false);
  picker.addEventListener("change", function (event) {
    if (event.rowIndex >= 0) {
      settings.instance.aimerDotColor = availableColors[event.rowIndex];
    }
  });

  return container;
}
