const ScanditCore = require("scandit-titanium-datacapture-core");
const view = require("/common/view_helper");
const navigation = require("/model/navigation_helper");
const settings = require("/model/settings_manager");
const numberWithUnit = require("/common/value_with_measure_view");

exports.openView = () => {
  const window = view.createWindow("Scan Area");

  window.addEventListener("open", function (e) {
    window.add(setupScanAreaList());
    window.add(setupScanAreaGuidesSwitch());
  });

  window.addEventListener("focus", function (e) {
    loadScanAreaMargins();
  });

  navigation.openWindow(window);
};

const ScanAreaMarginType = {
  Left: "Left",
  Right: "Right",
  Top: "Top",
  Bottom: "Bottom",
};

let scanAreaMarginsList = null;

function setupScanAreaList() {
  const itemTemplate = {
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
          right: "10dp",
          color: "black",
        },
      },
    ],
  };
  scanAreaMarginsList = Ti.UI.createListView({
    templates: { default: itemTemplate },
    defaultItemTemplate: "default",
    separatorColor: "#e8e8e8",
    backgroundColor: "white",
    disableBounce: true,
    height: Titanium.UI.SIZE,
    top: 2,
  });
  scanAreaMarginsList.addEventListener("itemclick", (event) => {
    if (
      event.section.items[event.itemIndex].payload.scanAreaMarginType ==
      ScanAreaMarginType.Top
    ) {
      numberWithUnit.openView(new ScanAreaTopMarginSetter());
    } else if (
      event.section.items[event.itemIndex].payload.scanAreaMarginType ==
      ScanAreaMarginType.Bottom
    ) {
      numberWithUnit.openView(new ScanAreaBottomMarginSetter());
    } else if (
      event.section.items[event.itemIndex].payload.scanAreaMarginType ==
      ScanAreaMarginType.Right
    ) {
      numberWithUnit.openView(new ScanAreaRightMarginSetter());
    } else if (
      event.section.items[event.itemIndex].payload.scanAreaMarginType ==
      ScanAreaMarginType.Left
    ) {
      numberWithUnit.openView(new ScanAreaLeftMarginSetter());
    }
  });
  return scanAreaMarginsList;
}

function createListItem(scanAreaMarginType, displayValue) {
  return {
    rowtitle: { text: scanAreaMarginType },
    rowstatus: { text: displayValue },
    payload: { scanAreaMarginType },
    properties: {
      title: scanAreaMarginType,
      subtitle: displayValue,
      color: "black",
      height: 45,
      accessoryType: Ti.UI.LIST_ACCESSORY_TYPE_NONE,
    },
  };
}

function loadScanAreaMargins() {
  const listItems = [];

  listItems.push(
    createListItem(
      ScanAreaMarginType.Top,
      `${settings.instance.scanAreaTopMargin.value.toFixed(
        2
      )} (${settings.instance.scanAreaTopMargin.unit.toUpperCase()})`
    ),
    createListItem(
      ScanAreaMarginType.Right,
      `${settings.instance.scanAreaRightMargin.value.toFixed(
        2
      )} (${settings.instance.scanAreaRightMargin.unit.toUpperCase()})`
    ),
    createListItem(
      ScanAreaMarginType.Bottom,
      `${settings.instance.scanAreaBottomMargin.value.toFixed(
        2
      )} (${settings.instance.scanAreaBottomMargin.unit.toUpperCase()})`
    ),
    createListItem(
      ScanAreaMarginType.Left,
      `${settings.instance.scanAreaLeftMargin.value.toFixed(
        2
      )} (${settings.instance.scanAreaLeftMargin.unit.toUpperCase()})`
    )
  );
  const section = Ti.UI.createListSection({
    color: "#FFF",
    items: listItems,
    headerTitle: "Margins",
  });
  const sections = [];
  sections.push(section);

  scanAreaMarginsList.sections = sections;
}

function setupScanAreaGuidesSwitch() {
  const container = view.createContainerView(220, 60, 0);

  var guidesSwitch = Ti.UI.createSwitch({
    style: Ti.UI.SWITCH_STYLE_SLIDER,
    value: settings.instance.shouldShowScanAreaGuides,
    width: Titanium.UI.SIZE,
    right: 5,
  });

  const label = view.createLeftLabel("Should Show Scan Area Guides", 5);

  container.add(label);
  container.add(guidesSwitch);

  guidesSwitch.addEventListener("change", function (e) {
    settings.instance.shouldShowScanAreaGuides = guidesSwitch.value;
  });

  return container;
}

class ScanAreaTopMarginSetter {
  get viewTitle() {
    return "Top";
  }

  get currentValue() {
    return settings.instance.scanAreaTopMargin.value;
  }

  get currentMeasureUnit() {
    return settings.instance.scanAreaTopMargin.unit;
  }

  set value(newValue) {
    settings.instance.scanAreaTopMargin = new ScanditCore.NumberWithUnit(
      newValue,
      this.currentMeasureUnit
    );
  }

  set measureUnit(newValue) {
    settings.instance.scanAreaTopMargin = new ScanditCore.NumberWithUnit(
      this.currentValue,
      newValue
    );
  }
}

class ScanAreaRightMarginSetter {
  get viewTitle() {
    return "Right";
  }

  get currentValue() {
    return settings.instance.scanAreaRightMargin.value;
  }

  get currentMeasureUnit() {
    return settings.instance.scanAreaRightMargin.unit;
  }

  set value(newValue) {
    settings.instance.scanAreaRightMargin = new ScanditCore.NumberWithUnit(
      newValue,
      this.currentMeasureUnit
    );
  }

  set measureUnit(newValue) {
    settings.instance.scanAreaRightMargin = new ScanditCore.NumberWithUnit(
      this.currentValue,
      newValue
    );
  }
}

class ScanAreaBottomMarginSetter {
  get viewTitle() {
    return "Bottom";
  }

  get currentValue() {
    return settings.instance.scanAreaBottomMargin.value;
  }

  get currentMeasureUnit() {
    return settings.instance.scanAreaBottomMargin.unit;
  }

  set value(newValue) {
    settings.instance.scanAreaBottomMargin = new ScanditCore.NumberWithUnit(
      newValue,
      this.currentMeasureUnit
    );
  }

  set measureUnit(newValue) {
    settings.instance.scanAreaBottomMargin = new ScanditCore.NumberWithUnit(
      this.currentValue,
      newValue
    );
  }
}

class ScanAreaLeftMarginSetter {
  get viewTitle() {
    return "Left";
  }

  get currentValue() {
    return settings.instance.scanAreaLeftMargin.value;
  }

  get currentMeasureUnit() {
    return settings.instance.scanAreaLeftMargin.unit;
  }

  set value(newValue) {
    settings.instance.scanAreaLeftMargin = new ScanditCore.NumberWithUnit(
      newValue,
      this.currentMeasureUnit
    );
  }

  set measureUnit(newValue) {
    settings.instance.scanAreaLeftMargin = new ScanditCore.NumberWithUnit(
      this.currentValue,
      newValue
    );
  }
}
