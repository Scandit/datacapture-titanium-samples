const ScanditCore = require("scandit-titanium-datacapture-core");
const view = require("/common/view_helper");
const navigation = require("/model/navigation_helper");
const settings = require("/model/settings_manager");
const aimerViewfinder = require("/settings/view/viewfinders/aimer_viewfinder_settings");
const laserlineViewfinder = require("/settings/view/viewfinders/laserline_viewfinder_settings");
const rectangularViewfinder = require("/settings/view/viewfinders/rectangular_viewfinder_settings");

let window = null;

exports.openView = () => {
  window = view.createWindow("Viewfinder");

  window.addEventListener("open", function (e) {
    window.add(setupTypeView());
    window.add(itemsContainer);
    setupViewfinderView();
  });

  navigation.openWindow(window);
};

const itemsContainer = Ti.UI.createScrollView({
  showVerticalScrollIndicator: true,
  showHorizontalScrollIndicator: true,
  height: Titanium.UI.SIZE,
  width: Titanium.UI.FILL,
  top: 65,
  scrollType: "vertical",
});

function setupTypeView() {
  var container = view.createContainerView(5, 60, 0);

  const picker = Ti.UI.createPicker({
    right: 0,
    type: Titanium.UI.PICKER_TYPE_PLAIN,
    width: 200,
  });

  const pickerData = [];

  Object.entries(settings.ViewfinderTypes).map(([key, value]) =>
    pickerData.push(view.createPickerRow(key, value))
  );
  picker.add(pickerData);

  const label = view.createLeftLabel("Type", 5);

  container.add(label);
  container.add(picker);

  const selectedIndex = pickerData.findIndex(
    (element) => element.properties.value == settings.instance.currentViewfinder
  );
  picker.setSelectedRow(0, selectedIndex, false);

  picker.addEventListener("change", (event) => {
    if (event.row && event.row.properties) {
      settings.instance.currentViewfinder = event.row.properties.value;

      setupViewfinderView();
    }
  });

  return container;
}

function setupViewfinderView() {
  itemsContainer.removeAllChildren();
  if (settings.instance.currentViewfinder == settings.ViewfinderTypes.None) {
    return;
  }
  if (settings.instance.currentViewfinder == settings.ViewfinderTypes.Aimer) {
    const view = new aimerViewfinder.AimerViewfinderSettings();
    itemsContainer.add(view);
  } else if (
    settings.instance.currentViewfinder == settings.ViewfinderTypes.Laserline
  ) {
    itemsContainer.add(
      new laserlineViewfinder.LaserlineViewfinderSettings(window)
    );
  } else if (
    settings.instance.currentViewfinder == settings.ViewfinderTypes.Rectangular
  ) {
    itemsContainer.add(
      new rectangularViewfinder.RectangularViewfinderSettings(window)
    );
  }
}
