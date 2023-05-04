const ScanditCore = require("scandit-titanium-datacapture-core");
const navigation = require("/model/navigation_helper");
const cameraUtils = require("/settings/camera/camera_settings");
const barcodeCaptureUtils = require("/settings/barcode_capture/barcode_capture_settings");
const view = require("/common/view_helper");
const resultView = require("/settings/result/result_settings");
const viewSettings = require("/settings/view/view_settings");

const settingsItems = [
  { title: "Barcode Capture", utils: barcodeCaptureUtils },
  { title: "Camera", utils: cameraUtils },
  { title: "View", utils: viewSettings },
  { title: "Result", utils: resultView },
];

const sdkVersionLabel = Ti.UI.createLabel({
  color: "#000",
  text: ScanditCore.DataCaptureVersion.sdkVersion,
  textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
  height: 45,
});

const listView = Ti.UI.createListView({
  separatorColor: "#e8e8e8",
  footerView: sdkVersionLabel,
});
const sections = [];

const settingsListItem = (title) => {
  return {
    properties: { title, color: "black" },
  };
};

const settingsList = settingsItems.map((item) => settingsListItem(item.title));

const modulesSection = Ti.UI.createListSection({
  color: "#FFF",
  height: 35,
  items: settingsList,
});

sections.push(modulesSection);

listView.sections = sections;

listView.addEventListener("itemclick", (event) => {
  settingsItems[event.itemIndex].utils.openView();
});

exports.openSettingsList = (_data = {}) => {
  const window = view.createWindow("Settings");

  window.addEventListener("open", function (_e) {
    window.add(listView);
  });

  navigation.openWindow(window);
};
