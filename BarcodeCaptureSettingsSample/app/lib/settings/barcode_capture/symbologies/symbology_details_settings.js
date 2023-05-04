const navigation = require("/model/navigation_helper");
const settings = require("/model/settings_manager");
const view = require("/common/view_helper");

let currentSymbologySettings = null;

exports.openView = (payload = {}) => {
  currentSymbologySettings = settings.instance.getSettingsForSymbology(
    payload._identifier
  );

  const window = view.createWindow(payload._readableName);

  window.addEventListener("open", function (_e) {
    const symbologySettingsView = new SymbologySettingsView(payload);
    window.add(symbologySettingsView.enableToggleView);
    var currentTop = 65;
    if (symbologySettingsView.colorInvertibleView) {
      symbologySettingsView.colorInvertibleView.top = currentTop;
      window.add(symbologySettingsView.colorInvertibleView);
      currentTop += 65;
    }
    if (symbologySettingsView.rangesContainerView) {
      symbologySettingsView.rangesContainerView.top = currentTop;
      window.add(symbologySettingsView.rangesContainerView);
      currentTop += 135;
    }

    if (symbologySettingsView.extensionsView) {
      symbologySettingsView.extensionsView.top = currentTop;
      window.add(symbologySettingsView.extensionsView);
    }
  });

  navigation.openWindow(window);
};

class SymbologySettingsView {
  constructor(payload) {
    this._itemTemplate = {
      childTemplates: [
        {
          type: "Ti.UI.Label", // Use a label
          bindId: "rowtitle", // Bind ID for this label
          properties: {
            // Sets the Label.left property
            left: "10dp",
            color: "black",
            height: 45,
          },
        },
      ],
    };

    this._toggleView = view.createContainerView(0, 60, 0);

    const scaleContentViewLabel = view.createLeftLabel("Enable", 5);

    const enableToggle = Ti.UI.createSwitch({
      value: currentSymbologySettings.isEnabled,
      top: 15,
      right: 10,
      height: 45,
    });

    this._toggleView.add(scaleContentViewLabel);
    this._toggleView.add(enableToggle);
    enableToggle.addEventListener("change", function (_e) {
      settings.instance.enableSymbology(
        currentSymbologySettings,
        enableToggle.value
      );
    });

    if (payload._supportedExtensions.length > 0) {
      this._extensionsView = Ti.UI.createView({
        width: Ti.UI.FILL,
        height: Ti.UI.SIZE,
        backgroundColor: "white",
      });

      this._extensionsView.add(
        this._createExtensionsListView(payload._supportedExtensions)
      );
    }

    if (payload._isColorInvertible) {
      this._invertibleColorView = view.createContainerView(0, 60, 0);
      const colorInvertedLabel = view.createLeftLabel("Color Inverted", 5);
      const invertibleColorToggle = Ti.UI.createSwitch({
        value: currentSymbologySettings.isColorInvertedEnabled,
        top: 15,
        right: 10,
      });
      this._invertibleColorView.add(colorInvertedLabel);
      this._invertibleColorView.add(invertibleColorToggle);
      invertibleColorToggle.addEventListener("change", function (_e) {
        settings.instance.setColorInvertedEnabled(
          currentSymbologySettings,
          invertibleColorToggle.value
        );
      });
    }

    if (
      payload._activeSymbolCountRange._minimum !=
      payload._activeSymbolCountRange._maximum
    ) {
      this._availableMinRanges = [];
      this._availableMaxRanges = [];

      this._rangesContainerView = view.createVerticalContainerView(0, 135, 0);
      this._rangesContainerView.add(view.createLeftLabel("Range", 5));
      const minRangeContainer = view.createContainerView(0, 60, 0);
      minRangeContainer.add(view.createLeftLabel("Minimum", 5));
      this._minRangePicker = Ti.UI.createPicker({
        right: 0,
        useSpinner: false,
        type: Titanium.UI.PICKER_TYPE_PLAIN,
        width: 200,
      });

      minRangeContainer.add(this._minRangePicker);
      this._rangesContainerView.add(minRangeContainer);

      const maxRangeContainer = view.createContainerView(0, 60, 0);
      maxRangeContainer.add(view.createLeftLabel("Maximum", 5));
      this._maxRangePicker = Ti.UI.createPicker({
        right: 0,
        useSpinner: false,
        type: Titanium.UI.PICKER_TYPE_PLAIN,
        width: 200,
      });

      maxRangeContainer.add(this._maxRangePicker);
      this._rangesContainerView.add(maxRangeContainer);

      this._loadRanges(payload);

      this._minRangePicker.addEventListener("change", (event) => {
        settings.instance.setMinRange(
          currentSymbologySettings,
          parseInt(event.row.title),
          payload._defaultSymbolCountRange._step
        );
      });

      this._maxRangePicker.addEventListener("change", (event) => {
        settings.instance.setMaxRange(
          currentSymbologySettings,
          parseInt(event.row.title),
          payload._defaultSymbolCountRange._step
        );
      });

      const selectedMinIndex = this._availableMinRanges.findIndex(
        (element) =>
          parseInt(element) ==
          settings.instance.getSymbologyMinRange(currentSymbologySettings)
      );
      this._minRangePicker.setSelectedRow(0, selectedMinIndex, false);

      const selectMaxIndex = this._availableMaxRanges.findIndex(
        (element) =>
          parseInt(element) ==
          settings.instance.getSymbologyMaxRange(currentSymbologySettings)
      );
      this._maxRangePicker.setSelectedRow(0, selectMaxIndex, false);
    }
  }

  get enableToggleView() {
    return this._toggleView;
  }

  get extensionsView() {
    return this._extensionsView;
  }

  get colorInvertibleView() {
    return this._invertibleColorView;
  }

  get rangesContainerView() {
    return this._rangesContainerView;
  }

  _createListItem(displayText, isEnabled) {
    return {
      rowtitle: { text: displayText },
      rowstatus: { value: true },
      properties: {
        title: displayText,
        subtitle: "Off",
        color: "black",
        height: 45,
        accessoryType: isEnabled
          ? Ti.UI.LIST_ACCESSORY_TYPE_CHECKMARK
          : Ti.UI.LIST_ACCESSORY_TYPE_NONE,
      },
    };
  }

  _createExtensionsListView(extensionList) {
    const sections = [];

    const listView = Ti.UI.createListView({
      // Maps the plainTemplate object to the 'default' style name
      templates: { default: this._itemTemplate },
      // Use the default template, that is, the itemTemplate object defined earlier
      // for all data list items in this list view
      defaultItemTemplate: "default",
      // backgroundColor: 'red',
    });

    const modulesSection = Ti.UI.createListSection({
      color: "#FFF",
      height: 35,
      headerTitle: "Extensions",
      items: extensionList.map((item) =>
        this._createListItem(
          item,
          currentSymbologySettings.extensions.indexOf(item) > -1
        )
      ),
    });

    sections.push(modulesSection);

    listView.sections = sections;

    listView.addEventListener("itemclick", function (e) {
      const item = e.section.items[e.itemIndex];

      if (item.properties.accessoryType === Ti.UI.LIST_ACCESSORY_TYPE_NONE) {
        item.properties.accessoryType = Ti.UI.LIST_ACCESSORY_TYPE_CHECKMARK;
        settings.instance.enableSymbologyExtension(
          currentSymbologySettings,
          item.properties.title,
          true
        );
      } else {
        item.properties.accessoryType = Ti.UI.LIST_ACCESSORY_TYPE_NONE;
        settings.instance.enableSymbologyExtension(
          currentSymbologySettings,
          item.properties.title,
          false
        );
      }
      e.section.updateItemAt(e.itemIndex, item);
    });

    return listView;
  }

  _loadRanges(payload) {
    const ranges = currentSymbologySettings.activeSymbolCounts;

    var currentMin = Math.min(...ranges),
      currentMax = Math.max(...ranges);

    const step = payload._defaultSymbolCountRange._step;
    const activeMin = payload._activeSymbolCountRange._minimum;
    const activeMax = payload._activeSymbolCountRange._maximum;

    for (var minItem = activeMin; minItem <= currentMax; minItem += step) {
      this._availableMinRanges.push(minItem);
    }
    this._minRangePicker.add(
      this._availableMinRanges.map((item) => view.createPickerRow(item, item))
    );
    for (var maxItem = currentMin; maxItem <= activeMax; maxItem += step) {
      this._availableMaxRanges.push(maxItem);
    }
    this._maxRangePicker.add(
      this._availableMaxRanges.map((item) => view.createPickerRow(item, item))
    );
  }
}
