const ScanditCore = require("scandit-titanium-datacapture-core");
const navigation = require("/model/navigation_helper");
const settings = require("/model/settings_manager");
const view = require("/common/view_helper");

exports.openView = () => {
  const window = view.createWindow("Camera Settings");

  window.addEventListener("open", function (e) {
    var cameraSettingsView = new CameraSettingsView();
    window.add(cameraSettingsView.cameraPositionListView);
    window.add(cameraSettingsView.torchStateContainer);
    window.add(cameraSettingsView.cameraSettingsContainer);
  });

  navigation.openWindow(window);
};

class CameraSettingsView {
  constructor() {
    this._cameraSettingsContainer = view.createVerticalContainerView(
      190,
      Titanium.UI.FILL,
      0
    );

    this._cameraSettingsContainer.add(
      view.createLeftLabel("Camera Settings", 5)
    );

    this._initPreferredResolution();
    this._initZoomFactor();
    this._initZoomGestureZoomFactor();
    this._initTorchState();
    this._initCameraPosition();
    this._initFocusGestureStrategy();
  }

  get cameraPositionListView() {
    return this._cameraPositionListView;
  }

  get cameraSettingsContainer() {
    return this._cameraSettingsContainer;
  }

  get torchStateContainer() {
    return this._torchStateContainer;
  }

  loadCameraPositions() {
    const cameraPositionSections = [];

    const cameraPositions = Object.entries(ScanditCore.CameraPosition)
      .filter(
        ([key, value]) => value !== ScanditCore.CameraPosition.Unspecified
      )
      .map(([key, value]) => ({ title: key, value }));

    const cameraPositionListItem = (title, value) => {
      return {
        properties: {
          title,
          color: "black",
          accessoryType: getAccessoryType(value),
          value: value,
        },
      };
    };

    function getAccessoryType(value) {
      if (value == settings.instance.camera.position) {
        return Titanium.UI.LIST_ACCESSORY_TYPE_CHECKMARK;
      } else {
        return Titanium.UI.LIST_ACCESSORY_TYPE_NONE;
      }
    }

    const cameraPositionsList = cameraPositions.map((item) =>
      cameraPositionListItem(item.title, item.value)
    );

    const cameraPositionsSection = Ti.UI.createListSection({
      color: "#FFF",
      height: 35,
      items: cameraPositionsList,
      headerTitle: "Camera Position",
    });

    cameraPositionSections.push(cameraPositionsSection);

    this._cameraPositionListView.sections = cameraPositionSections;
  }

  _initPreferredResolution() {
    var preferredResolutionContainer = view.createContainerView(5, 60, 0);

    const preferredResolutionPicker = Ti.UI.createPicker({
      right: 0,
      useSpinner: false,
      type: Titanium.UI.PICKER_TYPE_PLAIN,
      width: 200,
    });

    const videoPickerData = [];
    videoPickerData.push(
      view.createPickerRow("AUTO", ScanditCore.VideoResolution.Auto)
    );
    videoPickerData.push(
      view.createPickerRow("HD", ScanditCore.VideoResolution.HD)
    );
    videoPickerData.push(
      view.createPickerRow("FULLHD", ScanditCore.VideoResolution.FullHD)
    );
    if (OS_IOS) {
      videoPickerData.push(
        view.createPickerRow("UHD4K", ScanditCore.VideoResolution.UHD4K)
      );
    }
    preferredResolutionPicker.add(videoPickerData);
    preferredResolutionPicker.addEventListener("change", function (event) {
      settings.instance.videoResolution = event.row.properties.value;
    });

    const preferredResolutionLabel = view.createLeftLabel(
      "Preferred Resolution",
      5
    );

    preferredResolutionContainer.add(preferredResolutionLabel);
    preferredResolutionContainer.add(preferredResolutionPicker);
    this._cameraSettingsContainer.add(preferredResolutionContainer);

    const selectedIndex = videoPickerData.findIndex(
      (element) => element.properties.value == settings.instance.videoResolution
    );
    preferredResolutionPicker.setSelectedRow(0, selectedIndex, false);
  }

  _initZoomFactor() {
    var zoomFactorContainer = view.createContainerView(5, 60, 0);
    this._cameraSettingsContainer.add(zoomFactorContainer);

    zoomFactorContainer.add(view.createLeftLabel("Zoom Factor", 5));
    const zoomFactorLabel = view.createRightLabel(
      settings.instance.zoomFactor,
      5
    );
    zoomFactorContainer.add(zoomFactorLabel);

    const zoomFactorSlider = view.createSlider(
      1,
      20,
      settings.instance.zoomFactor
    );
    this._cameraSettingsContainer.add(zoomFactorSlider);

    zoomFactorSlider.addEventListener("change", function (e) {
      settings.instance.zoomFactor = Math.round(e.value * 10) / 10;
      zoomFactorLabel.text = settings.instance.zoomFactor;
    });
  }

  _initZoomGestureZoomFactor() {
    var zoomGestureZoomFactorContainer = view.createContainerView(5, 60, 0);
    this._cameraSettingsContainer.add(zoomGestureZoomFactorContainer);

    zoomGestureZoomFactorContainer.add(
      view.createLeftLabel("Zoom Gesture Zoom Factor", 5)
    );
    const zoomGestureZoomFactorValueLabel = view.createRightLabel(
      settings.instance.zoomGestureZoomFactor,
      5
    );
    zoomGestureZoomFactorContainer.add(zoomGestureZoomFactorValueLabel);

    const zoomGestureZoomFactorSlider = view.createSlider(
      1,
      20,
      settings.instance.zoomGestureZoomFactor
    );
    this._cameraSettingsContainer.add(zoomGestureZoomFactorSlider);

    zoomGestureZoomFactorSlider.addEventListener("change", function (e) {
      settings.instance.zoomGestureZoomFactor = Math.round(e.value * 10) / 10;
      zoomGestureZoomFactorValueLabel.text =
        settings.instance.zoomGestureZoomFactor;
    });
  }

  _initTorchState() {
    this._torchStateContainer = view.createContainerView(125, 60, 0);

    var desiredTorchStateSwitch = Ti.UI.createSwitch({
      style: Ti.UI.SWITCH_STYLE_SLIDER,
      value:
        settings.instance.camera.desiredTorchState == ScanditCore.TorchState.On,
      width: Titanium.UI.SIZE,
      right: 5,
    });

    const torchStateLabel = view.createLeftLabel("Desired Torch State", 5);

    this._torchStateContainer.add(torchStateLabel);
    this._torchStateContainer.add(desiredTorchStateSwitch);

    desiredTorchStateSwitch.addEventListener("change", function (e) {
      if (desiredTorchStateSwitch.value) {
        settings.instance.camera.desiredTorchState = ScanditCore.TorchState.On;
      } else {
        settings.instance.camera.desiredTorchState = ScanditCore.TorchState.Off;
      }
    });
  }

  _initCameraPosition() {
    this._cameraPositionListView = Ti.UI.createListView({
      separatorColor: "#e8e8e8",
      backgroundColor: "white",
      disableBounce: true,
      height: Titanium.UI.SIZE,
      top: 2,
    });

    this.loadCameraPositions();

    this._cameraPositionListView.addEventListener("itemclick", (e) => {
      const newPosition = e.section.getItemAt(e.itemIndex).properties.value;
      settings.instance.cameraByPosition = newPosition;
      this.loadCameraPositions();
    });
  }

  _initFocusGestureStrategy() {
    const focusGestureStrategyContainer = view.createContainerView(5, 60, 0);
    focusGestureStrategyContainer.add(
      view.createLeftLabel("Focus Gesture Strategy", 5)
    );

    const focusGestureStrategyPicker = Ti.UI.createPicker({
      right: 0,
      useSpinner: false,
      type: Titanium.UI.PICKER_TYPE_PLAIN,
      width: 200,
    });

    const focusGestureStrategyData = [];
    focusGestureStrategyData.push(
      view.createPickerRow("None", ScanditCore.FocusGestureStrategy.None)
    );
    focusGestureStrategyData.push(
      view.createPickerRow("Manual", ScanditCore.FocusGestureStrategy.Manual)
    );
    focusGestureStrategyData.push(
      view.createPickerRow(
        "ManualUntilCapture",
        ScanditCore.FocusGestureStrategy.ManualUntilCapture
      )
    );
    focusGestureStrategyData.push(
      view.createPickerRow(
        "AutoOnLocation",
        ScanditCore.FocusGestureStrategy.AutoOnLocation
      )
    );
    focusGestureStrategyPicker.add(focusGestureStrategyData);
    focusGestureStrategyPicker.addEventListener("change", function (event) {
      settings.instance.focusGestureStrategy = event.row.properties.value;
    });
    focusGestureStrategyContainer.add(focusGestureStrategyPicker);
    this._cameraSettingsContainer.add(focusGestureStrategyContainer);

    const selectedIndex = focusGestureStrategyData.findIndex(
      (element) =>
        element.properties.value == settings.instance.focusGestureStrategy
    );
    focusGestureStrategyPicker.setSelectedRow(0, selectedIndex, false);
  }
}
