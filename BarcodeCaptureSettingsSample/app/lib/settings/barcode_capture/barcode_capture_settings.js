const navigation = require("/model/navigation_helper");
const symbologiesView = require("/settings/barcode_capture/symbologies/symbologies_settings");
const locationSelectionView = require("/settings/barcode_capture/location_selection/location_selection_settings");
const view = require("/common/view_helper");
const feedbackView = require("/settings/barcode_capture/feedback/feedback_settings");
const compositeTypes = require("/settings/barcode_capture/composite_types/composite_types_settings");
const codeDuplicateFilter = require("/settings/barcode_capture/code_duplicate_filter/code_duplicate_filter_settings");

exports.openView = () => {
  const window = view.createWindow("Barcode Capture");

  window.addEventListener("open", function (e) {
    var settingsView = new BarcodeCaptureSettingsView();
    window.add(settingsView.barcodeCaptureSettingsList);
  });

  navigation.openWindow(window);
};

class BarcodeCaptureSettingsView {
  constructor() {
    const bacodeCaptureSettingsItem = [
      { title: "Symbologies", utils: symbologiesView },
      { title: "Composite Types", utils: compositeTypes },
      { title: "Location Selection", utils: locationSelectionView },
      { title: "Feedback", utils: feedbackView },
      { title: "Code Duplicate Filter", utils: codeDuplicateFilter },
    ];

    this._barcodeCaptureSettingsList = Ti.UI.createListView({
      separatorColor: "#e8e8e8",
    });
    const sections = [];

    const settingsListItem = (title) => {
      return {
        properties: { title, color: "black" },
      };
    };

    const settingsList = bacodeCaptureSettingsItem.map((item) =>
      settingsListItem(item.title)
    );

    const modulesSection = Ti.UI.createListSection({
      color: "#FFF",
      height: 35,
      items: settingsList,
    });

    sections.push(modulesSection);

    this._barcodeCaptureSettingsList.sections = sections;

    this._barcodeCaptureSettingsList.addEventListener("itemclick", (event) => {
      bacodeCaptureSettingsItem[event.itemIndex].utils.openView();
    });
  }

  get barcodeCaptureSettingsList() {
    return this._barcodeCaptureSettingsList;
  }
}
