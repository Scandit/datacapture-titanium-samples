const ScanditBarcode = require("scandit-titanium-datacapture-barcode");
const navigation = require("/model/navigation_helper");
const settings = require("/model/settings_manager");
const symbologyDetail = require("/settings/barcode_capture/symbologies/symbology_details_settings");
const view = require("/common/view_helper");

exports.openView = () => {
  const window = view.createWindow("Symbologies");

  window.addEventListener("open", function (_e) {
    window.add(actionButtonsContainer);
    window.add(symbologiesList);
  });

  window.addEventListener("focus", function (_e) {
    loadSymbologies();
  });

  navigation.openWindow(window);
};

const symbologyListItemTemplate = {
  childTemplates: [
    {
      type: "Ti.UI.Label", // Use a label
      bindId: "rowtitle", // Bind ID for this label
      properties: {
        // Sets the Label.left property
        left: "10dp",
        color: "black",
      },
    },
    {
      type: "Ti.UI.Label", // Use a label
      bindId: "rowstatus", // Bind ID for this label
      properties: {
        // Sets the Label.right property
        right: "10dp",
        color: "black",
      },
    },
  ],
};

const sections = [];

const symbologiesList = Ti.UI.createListView({
  // Maps the plainTemplate object to the 'default' style name
  templates: { default: symbologyListItemTemplate },
  // Use the default template, that is, the _itemTemplate object defined earlier
  // for all data list items in this list view
  defaultItemTemplate: "default",

  top: 70,
});

const symbologiesSection = Ti.UI.createListSection({
  color: "#FFF",
  height: 35,
  items: [],
});

symbologiesList.addEventListener("itemclick", (event) => {
  symbologyDetail.openView(event.section.items[event.itemIndex].payload);
});

sections.push(symbologiesSection);

symbologiesList.sections = sections;

function createListItem(displayText, isEnabled, payload) {
  return {
    rowtitle: { text: displayText },
    rowstatus: { text: isEnabled ? "On" : "Off" },
    payload: { ...payload, isEnabled },
    properties: {
      title: displayText,
      subtitle: "Off",
      color: "black",
      height: 45,
      accessoryType: Ti.UI.LIST_ACCESSORY_TYPE_NONE,
    },
  };
}

const actionButtonsContainer = view.createContainerView(5, 60, 0);

var enableAllButton = Titanium.UI.createButton({
  title: "ENABLE ALL",
  width: "48%",
  backgroundColor: "blue",
  left: 5,
  color: "white"
});
enableAllButton.addEventListener("click", (_e) => {
  settings.instance.toggleAllSymbologies(true);
  loadSymbologies();
});

var disableAllButton = Titanium.UI.createButton({
  title: "DISABLE ALL",
  width: "48%",
  backgroundColor: "red",
  right: 5,
  color: "white"
});
disableAllButton.addEventListener("click", (_e) => {
  settings.instance.toggleAllSymbologies(false);
  loadSymbologies();
});

actionButtonsContainer.add(enableAllButton);
actionButtonsContainer.add(disableAllButton);

function loadSymbologies() {
  const settingsList = [];

  const symbologyDescriptions = ScanditBarcode.SymbologyDescription;

  symbologyDescriptions.all.forEach((item) => {
    let isEnabled = settings.instance.isSymbologyEnabled(item.symbology);
    settingsList.push(
      createListItem(item._readableName, isEnabled, item)
    );
  });

  symbologiesSection.setItems(settingsList);
}