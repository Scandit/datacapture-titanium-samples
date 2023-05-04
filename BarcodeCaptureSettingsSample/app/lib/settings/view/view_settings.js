const view = require("/common/view_helper");
const navigation = require("/model/navigation_helper");
const scan_area = require("/settings/view/scan_area/scan_area_settings");
const point_of_interest = require("/settings/view/point_of_interest/point_of_interest_settings");
const overlay = require("/settings/view/overlay/overlay_settings");
const logo = require("/settings/view/logo/logo_settings");
const gestures = require("/settings/view/gestures/gestures_settings");
const controls = require("/settings/view/controls/controls_settings");
const viewfinders = require("/settings/view/viewfinders/viewfinders_settings");

exports.openView = () => {
  const window = view.createWindow("View");

  window.addEventListener("open", function (_e) {
    window.add(setupList());
  });

  navigation.openWindow(window);
};

function setupList() {
  const settingsItems = [
    { title: "Scan Area", utils: scan_area },
    { title: "Point of Interest", utils: point_of_interest },
    { title: "Overlay", utils: overlay },
    { title: "Viewfinder", utils: viewfinders },
    { title: "Logo", utils: logo },
    { title: "Gestures", utils: gestures },
    { title: "Controls", utils: controls },
  ];

  var listView = Ti.UI.createListView({
    separatorColor: "#e8e8e8",
  });
  const sections = [];

  const settingsListItem = (title) => {
    return {
      properties: { title, color: "black" },
    };
  };

  const settingsList = settingsItems.map((item) =>
    settingsListItem(item.title)
  );

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

  return listView;
}
