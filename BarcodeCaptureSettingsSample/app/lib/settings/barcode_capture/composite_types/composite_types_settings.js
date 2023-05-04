const ScanditBarcode = require("scandit-titanium-datacapture-barcode");
const view = require("/common/view_helper");
const navigation = require("/model/navigation_helper");
const settings = require("/model/settings_manager");

exports.openView = () => {
  const window = view.createWindow("Composite Types");

  window.addEventListener("open", function (_e) {
    window.add(setupList());
  });

  navigation.openWindow(window);
};

function setupList() {
  const listView = Ti.UI.createListView({
    separatorColor: "#e8e8e8",
    backgroundColor: "white",
    disableBounce: true,
    height: Titanium.UI.SIZE,
    top: 2,
  });

  listView.addEventListener("itemclick", (e) => {
    const item = e.section.items[e.itemIndex];

    if (item.properties.accessoryType === Ti.UI.LIST_ACCESSORY_TYPE_NONE) {
      item.properties.accessoryType = Ti.UI.LIST_ACCESSORY_TYPE_CHECKMARK;
      settings.instance.enableCompositeType(item.properties.value);
    } else {
      item.properties.accessoryType = Ti.UI.LIST_ACCESSORY_TYPE_NONE;
      settings.instance.disableCompositeType(item.properties.value);
    }
    e.section.updateItemAt(e.itemIndex, item);
  });

  const sections = [];
  const compositeTypes = Object.entries(ScanditBarcode.CompositeType).map(
    ([key, value]) => ({ title: key, value })
  );
  const listItems = compositeTypes.map((item) =>
    getListItem(item.title, item.value)
  );

  const section = Ti.UI.createListSection({
    color: "#FFF",
    height: 35,
    items: listItems,
    headerTitle: "Types",
  });

  sections.push(section);

  listView.sections = sections;
  return listView;
}

function getListItem(title, value) {
  return {
    properties: {
      title,
      color: "black",
      accessoryType: getAccessoryType(value),
      value: value,
    },
  };
}

function getAccessoryType(value) {
  const index = settings.instance.enabledCompositeTypes.indexOf(value);
  if (index > -1) {
    return Titanium.UI.LIST_ACCESSORY_TYPE_CHECKMARK;
  } else {
    return Titanium.UI.LIST_ACCESSORY_TYPE_NONE;
  }
}
