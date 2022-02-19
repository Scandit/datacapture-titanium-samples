const ScanditCore = require("scandit-titanium-datacapture-core");
const ScanditBarcode = require("scandit-titanium-datacapture-barcode");
const common = require("/common/common");

const licenseKey = "-- ENTER YOUR SCANDIT LICENSE KEY HERE --";

class SettingsManager {
  constructor() {
    this.radiusLocationSelection = "radius";
    this._rectangularLocationSelection = "rectangular";
    this._currentRectangularLocationSizeSpecification =
      common.SizeSpecification.WidthAndHeight;
    this.resetRectangularLocationSelectionValues();
    this._continuousScanningEnabled = false;
    this._pointOfInterest = new ScanditCore.PointWithUnit(
      new ScanditCore.NumberWithUnit(0.5, ScanditCore.MeasureUnit.Fraction),
      new ScanditCore.NumberWithUnit(0.5, ScanditCore.MeasureUnit.Fraction)
    );
    this._torchControl = null;
    this._currentViewFinder = ViewfinderTypes.None;
    this._currentRectangularViewFinderSizeSpecification =
      SizeSpecification.WidthAndHeight;

    const rectangularViewfinder = new ScanditCore.RectangularViewfinder();

    this._rectangularViewfinderWidth =
      rectangularViewfinder.sizeWithUnitAndAspect.widthAndHeight.width;
    this._rectangularViewfinderHeight =
      rectangularViewfinder.sizeWithUnitAndAspect.widthAndHeight.height;
    this._rectangularViewfinderHeightAspect = 0.0;
    this._rectangularViewfinderWidthAspect = 0.0;
    this._rectangularViewfinderShorterDimension = 1.0;
    this.rectangularViewfinderShorterDimension_Aspect = 0.0;

    // The barcode capturing process is configured through barcode capture settings
    // which are then applied to the barcode capture instance that manages barcode recognition.
    this._settings = new ScanditBarcode.BarcodeCaptureSettings();

    // Create data capture context using your license key and set the camera as the frame source.
    this._dataCaptureContext =
      ScanditCore.DataCaptureContext.forLicenseKey(licenseKey);

    // To visualize the on-going barcode capturing process on screen, setup a data capture view that renders the
    // camera preview. The view must be connected to the data capture context.
    this._dataCaptureView = new ScanditCore.DataCaptureView(
      this._dataCaptureContext
    );

    this._dataCaptureView.scanAreaMargins = new ScanditCore.MarginsWithUnit(
      new ScanditCore.NumberWithUnit(0, ScanditCore.MeasureUnit.DIP),
      new ScanditCore.NumberWithUnit(0, ScanditCore.MeasureUnit.DIP),
      new ScanditCore.NumberWithUnit(0, ScanditCore.MeasureUnit.DIP),
      new ScanditCore.NumberWithUnit(0, ScanditCore.MeasureUnit.DIP)
    );

    // Get default camera
    this._currentCamera = ScanditCore.Camera.default;

    // Get recommended camera settings for Barcode Capture
    this._cameraSettings =
      ScanditBarcode.BarcodeCapture.recommendedCameraSettings;

    // Apply camera settings
    this._currentCamera.applySettings(this._cameraSettings);

    // Set data capture context frame source
    this._dataCaptureContext.setFrameSource(this._currentCamera);

    // Create new barcode capture mode with the settings from above.
    this._barcodeCapture = ScanditBarcode.BarcodeCapture.forContext(
      this._dataCaptureContext,
      this._settings
    );

    this._overlay =
      ScanditBarcode.BarcodeCaptureOverlay.withBarcodeCaptureForViewWithStyle(
        this._barcodeCapture,
        this._dataCaptureView,
        ScanditBarcode.BarcodeCaptureOverlayStyle.Frame
      );
  }

  get context() {
    return this._dataCaptureContext;
  }

  get barcodeCapture() {
    return this._barcodeCapture;
  }

  get dataCaptureContext() {
    return this._dataCaptureContext;
  }

  get dataCaptureView() {
    return this._dataCaptureView;
  }

  get camera() {
    return this._currentCamera;
  }

  set cameraByPosition(newCameraPosition) {
    if (this._currentCamera.position == newCameraPosition) {
      return;
    }
    const newCamera = ScanditCore.Camera.atPosition(newCameraPosition);
    if (newCamera) {
      newCamera.applySettings(this._cameraSettings);
      this._dataCaptureContext.setFrameSource(newCamera);
      this._currentCamera = newCamera;
    }
  }

  set videoResolution(newVideoResolution) {
    if (this._cameraSettings.preferredResolution == newVideoResolution) {
      return;
    }
    this._cameraSettings.preferredResolution = newVideoResolution;
    this._currentCamera.applySettings(this._cameraSettings);
  }

  get videoResolution() {
    return this._cameraSettings.preferredResolution;
  }

  get zoomFactor() {
    return parseFloat(this._cameraSettings.zoomFactor);
  }

  set zoomFactor(newZoomFactor) {
    if (this.zoomFactor == newZoomFactor) {
      return;
    }
    this._cameraSettings.zoomFactor = newZoomFactor;
    this._currentCamera.applySettings(this._cameraSettings);
  }

  get zoomGestureZoomFactor() {
    return parseFloat(this._cameraSettings.zoomGestureZoomFactor);
  }

  set zoomGestureZoomFactor(newZoomGestureZoomFactor) {
    if (this.zoomGestureZoomFactor == newZoomGestureZoomFactor) {
      return;
    }
    this._cameraSettings.zoomGestureZoomFactor =
      newZoomGestureZoomFactor;
    this._currentCamera.applySettings(this._cameraSettings);
  }

  get focusGestureStrategy() {
    return this._cameraSettings.focusGestureStrategy;
  }

  set focusGestureStrategy(newStrategy) {
    if (this._cameraSettings.focusGestureStrategy == newStrategy) {
      return;
    }

    this._cameraSettings.focusGestureStrategy = newStrategy;
    this._currentCamera.applySettings(this._cameraSettings);
  }

  get enabledSimbologies() {
    return this._settings.enabledSymbologies();
  }

  getSettingsForSymbology(symbology) {
    return this._settings.settingsForSymbology(symbology);
  }

  isSymbologyEnabled(symbology) {
    return this.getSettingsForSymbology(symbology).isEnabled;
  }

  enableSymbology(symbologySettings, enable) {
    symbologySettings.isEnabled = enable;
    this._barcodeCapture.applySettings(this._settings);
  }

  toggleAllSymbologies(enable) {
    ScanditBarcode.SymbologyDescription.all.forEach((item) => {
      this._settings.enableSymbology(item.symbology, enable);
    });
    this._barcodeCapture.applySettings(this._settings);
  }

  enableSymbologyExtension(symbologySettings, extension, enable) {
    symbologySettings.setExtensionEnabled(extension, enable);
    this._barcodeCapture.applySettings(this._settings);
  }

  setColorInvertedEnabled(symbologySettings, enable) {
    symbologySettings.isColorInvertedEnabled = enable;
    this._barcodeCapture.applySettings(this._settings);
  }

  getSymbologyMinRange(symbologySettings) {
    return Math.min(...symbologySettings.activeSymbolCounts);
  }

  getSymbologyMaxRange(symbologySettings) {
    return Math.max(...symbologySettings.activeSymbolCounts);
  }

  setMinRange(symbologySettings, newMinRange, step) {
    const currentMax = this.getSymbologyMaxRange(symbologySettings);
    const newRanges = [];
    for (var minItem = newMinRange; minItem <= currentMax; minItem += step) {
      newRanges.push(minItem);
    }
    symbologySettings.activeSymbolCounts = newRanges;
    this._barcodeCapture.applySettings(this._settings);
  }

  setMaxRange(symbologySettings, newMaxRange, step) {
    const currentMin = this.getSymbologyMinRange(symbologySettings);
    const newRanges = [];
    for (var minItem = currentMin; minItem <= newMaxRange; minItem += step) {
      newRanges.push(minItem);
    }
    symbologySettings.activeSymbolCounts = newRanges;
    this._barcodeCapture.applySettings(this._settings);
  }

  get locationSelection() {
    return this._settings.locationSelection;
  }

  set locationSelection(newValue) {
    this._settings.locationSelection = newValue;
    this._barcodeCapture.applySettings(this._settings);
  }

  set locationSelectionRadiusValue(newValue) {
    if (this.locationSelection.type != this.radiusLocationSelection) {
      return;
    }
    const currentUnit = this.locationSelectionRadiusMeasureUnit;
    const newRadius = new ScanditCore.NumberWithUnit(newValue, currentUnit);
    this.locationSelection = new ScanditCore.RadiusLocationSelection(newRadius);
  }

  get locationSelectionRadiusValue() {
    if (this.locationSelection.type != this.radiusLocationSelection) {
      return 0;
    }
    return this.locationSelection.radius.value;
  }

  set locationSelectionRadiusMeasureUnit(newUnit) {
    if (this.locationSelection.type != this.radiusLocationSelection) {
      return;
    }
    const currentValue = this.locationSelectionRadiusValue;
    const newRadius = new ScanditCore.NumberWithUnit(currentValue, newUnit);
    this.locationSelection = new ScanditCore.RadiusLocationSelection(newRadius);
  }

  get locationSelectionRadiusMeasureUnit() {
    if (this.locationSelection.type == this.radiusLocationSelection) {
      return this.locationSelection.radius.unit;
    }
  }

  set currentRectangularLocationSizeSpecification(newValue) {
    this._currentRectangularLocationSizeSpecification = newValue;
  }

  get currentRectangularLocationSizeSpecification() {
    return this._currentRectangularLocationSizeSpecification;
  }

  set locationSelectionRectangularWidth(newValue) {
    if (this.locationSelection.type != this._rectangularLocationSelection) {
      return;
    }
    this._locationSelectionRectangularWidth = newValue;
    this.setNewRectangularLocationSelection();
  }

  get locationSelectionRectangularWidth() {
    return this._locationSelectionRectangularWidth;
  }

  set locationSelectionRectangularHeight(newValue) {
    if (this.locationSelection.type != this._rectangularLocationSelection) {
      return;
    }
    this._locationSelectionRectangularHeight = newValue;
    this.setNewRectangularLocationSelection();
  }

  get locationSelectionRectangularHeight() {
    return this._locationSelectionRectangularHeight;
  }

  set locationSelectionRectangularHeightAspect(newValue) {
    if (this.locationSelection.type != this._rectangularLocationSelection) {
      return;
    }
    this._locationSelectionRectangularHeightAspect = newValue;
    this.setNewRectangularLocationSelection();
  }

  get locationSelectionRectangularHeightAspect() {
    return this._locationSelectionRectangularHeightAspect;
  }

  set locationSelectionRectangularWidthAspect(newValue) {
    if (this.locationSelection.type != this._rectangularLocationSelection) {
      return;
    }
    this._locationSelectionRectangularWidthAspect = newValue;
    this.setNewRectangularLocationSelection();
  }

  get locationSelectionRectangularWidthAspect() {
    return this._locationSelectionRectangularWidthAspect;
  }

  resetRectangularLocationSelectionValues() {
    this._locationSelectionRectangularWidth = new ScanditCore.NumberWithUnit(
      0,
      ScanditCore.MeasureUnit.DIP
    );
    this._locationSelectionRectangularHeight = new ScanditCore.NumberWithUnit(
      0,
      ScanditCore.MeasureUnit.DIP
    );
    this._locationSelectionRectangularHeightAspect = 0.0;
    this._locationSelectionRectangularWidthAspect = 0.0;
  }

  setNewRectangularLocationSelection() {
    if (
      this.currentRectangularLocationSizeSpecification ==
      common.SizeSpecification.WidthAndHeight
    ) {
      const size = new ScanditCore.SizeWithUnit(
        this.locationSelectionRectangularWidth,
        this.locationSelectionRectangularHeight
      );
      this.locationSelection =
        ScanditCore.RectangularLocationSelection.withSize(size);
    } else if (
      this.currentRectangularLocationSizeSpecification ==
      common.SizeSpecification.WidthAndAspectRatio
    ) {
      this.locationSelection =
        ScanditCore.RectangularLocationSelection.withWidthAndAspectRatio(
          this.locationSelectionRectangularWidth,
          this.locationSelectionRectangularHeightAspect
        );
    } else if (
      this.currentRectangularLocationSizeSpecification ==
      common.SizeSpecification.HeightAndAspectRatio
    ) {
      this.locationSelection =
        ScanditCore.RectangularLocationSelection.withHeightAndAspectRatio(
          this.locationSelectionRectangularHeight,
          this.locationSelectionRectangularWidthAspect
        );
    }
  }

  get soundEnabled() {
    return this._barcodeCapture.feedback.success.sound != null;
  }

  set soundEnabled(newValue) {
    const sound = newValue ? ScanditCore.Sound.defaultSound : null;
    this._barcodeCapture.feedback.success = new ScanditCore.Feedback(
      this._barcodeCapture.feedback.success.vibration,
      sound
    );
  }

  get vibrationEnabled() {
    return this._barcodeCapture.feedback.success.vibration != null;
  }

  set vibrationEnabled(newValue) {
    const vibration = newValue ? ScanditCore.Vibration.defaultVibration : null;

    this._barcodeCapture.feedback.success = new ScanditCore.Feedback(
      vibration,
      this._barcodeCapture.feedback.success.sound
    );
  }

  get continuousScanningEnabled() {
    return this._continuousScanningEnabled;
  }

  set continuousScanningEnabled(newValue) {
    this._continuousScanningEnabled = newValue;
  }

  set scanAreaTopMargin(topMargin) {
    this.dataCaptureView.scanAreaMargins = new ScanditCore.MarginsWithUnit(
      this.scanAreaLeftMargin,
      this.scanAreaRightMargin,
      topMargin,
      this.scanAreaBottomMargin
    );
  }

  get scanAreaTopMargin() {
    return this.dataCaptureView.scanAreaMargins.top;
  }

  set scanAreaRightMargin(rightMargin) {
    this.dataCaptureView.scanAreaMargins = new ScanditCore.MarginsWithUnit(
      this.scanAreaLeftMargin,
      rightMargin,
      this.scanAreaTopMargin,
      this.scanAreaBottomMargin
    );
  }

  get scanAreaRightMargin() {
    return this.dataCaptureView.scanAreaMargins.right;
  }

  set scanAreaBottomMargin(bottomMargin) {
    this.dataCaptureView.scanAreaMargins = new ScanditCore.MarginsWithUnit(
      this.scanAreaLeftMargin,
      this.scanAreaRightMargin,
      this.scanAreaTopMargin,
      bottomMargin
    );
  }

  get scanAreaBottomMargin() {
    return this.dataCaptureView.scanAreaMargins.bottom;
  }

  set scanAreaLeftMargin(leftMargin) {
    this.dataCaptureView.scanAreaMargins = new ScanditCore.MarginsWithUnit(
      leftMargin,
      this.scanAreaRightMargin,
      this.scanAreaTopMargin,
      this.scanAreaBottomMargin
    );
  }

  get scanAreaLeftMargin() {
    return this.dataCaptureView.scanAreaMargins.left;
  }

  get shouldShowScanAreaGuides() {
    return this._overlay.shouldShowScanAreaGuides;
  }

  set shouldShowScanAreaGuides(newValue) {
    this._overlay.shouldShowScanAreaGuides = newValue;
  }

  get pointOfInterestX_Value() {
    return this._pointOfInterest.x.value;
  }

  set pointOfInterestX_Value(newValue) {
    this._pointOfInterest = new ScanditCore.PointWithUnit(
      new ScanditCore.NumberWithUnit(newValue, this.pointOfInterestX_Unit),
      this._pointOfInterest.y
    );

    this._dataCaptureView.pointOfInterest = this._pointOfInterest;
  }

  get pointOfInterestX_Unit() {
    return this._pointOfInterest.x.unit;
  }

  set pointOfInterestX_Unit(newValue) {
    this._pointOfInterest = new ScanditCore.PointWithUnit(
      new ScanditCore.NumberWithUnit(this.pointOfInterestX_Value, newValue),
      this._pointOfInterest.y
    );

    this._dataCaptureView.pointOfInterest = this._pointOfInterest;
  }

  get pointOfInterestY_Value() {
    return this._pointOfInterest.y.value;
  }

  set pointOfInterestY_Value(newValue) {
    this._pointOfInterest = new ScanditCore.PointWithUnit(
      this._pointOfInterest.x,
      new ScanditCore.NumberWithUnit(newValue, this.pointOfInterestY_Unit)
    );

    this._dataCaptureView.pointOfInterest = this._pointOfInterest;
  }

  get pointOfInterestY_Unit() {
    return this._pointOfInterest.y.unit;
  }

  set pointOfInterestY_Unit(newValue) {
    this._pointOfInterest = new ScanditCore.PointWithUnit(
      this._pointOfInterest.x,
      new ScanditCore.NumberWithUnit(this.pointOfInterestY_Value, newValue)
    );

    this._dataCaptureView.pointOfInterest = this._pointOfInterest;
  }

  get pointOfInterest() {
    return this._pointOfInterest;
  }

  get defaultBrush() {
    let defaultOverlay = ScanditBarcode.BarcodeCaptureOverlay.withBarcodeCaptureForViewWithStyle(
      this._barcodeCapture, null, this._overlay.style
    );

    return defaultOverlay.brush;
  }

  get currentBrush() {
    return this._overlay.brush;
  }

  set currentBrush(newBrush) {
    this._overlay.brush = newBrush;
  }

  get currentOverlayStyle() {
    return this._overlay.style;
  }

  set currentOverlayStyle(newStyle) {
    var shouldShowScanAreaGuides = this._overlay.shouldShowScanAreaGuides;
    var viewfinder = this._overlay.viewfinder;

    this._dataCaptureView.removeOverlay(this._overlay);

    this._overlay = ScanditBarcode.BarcodeCaptureOverlay.withBarcodeCaptureForViewWithStyle(
      this._barcodeCapture,
      this._dataCaptureView,
      newStyle
    );

    this._overlay.shouldShowScanAreaGuides = shouldShowScanAreaGuides;
    this._overlay.viewfinder = viewfinder;
  }

  get enabledCompositeTypes() {
    return this._settings.enabledCompositeTypes;
  }

  enableCompositeType(compositeType) {
    if (this._settings.enabledCompositeTypes.includes(compositeType)) {
      return;
    }
    this.toggleAllSymbologies(false);
    this._settings.enabledCompositeTypes.push(compositeType);
    this._settings.enableSymbologiesForCompositeTypes(
      this._settings.enabledCompositeTypes
    );
  }

  disableCompositeType(compositeType) {
    const index = this._settings.enabledCompositeTypes.indexOf(compositeType);
    if (index > -1) {
      this._settings.enabledCompositeTypes.splice(index, 1);
    } else {
      return;
    }

    this.toggleAllSymbologies(false);
    this._settings.enableSymbologiesForCompositeTypes(
      this._settings.enabledCompositeTypes
    );
  }

  get codeDuplicateFilter() {
    return this._settings.codeDuplicateFilter;
  }

  set codeDuplicateFilter(newValue) {
    this._settings.codeDuplicateFilter = newValue;
    this._barcodeCapture.applySettings(this._settings);
  }

  get logoAnchor() {
    return this._dataCaptureView.logoAnchor;
  }

  set logoAnchor(newValue) {
    this._dataCaptureView.logoAnchor = newValue;
  }

  get _logoOffsetX() {
    return this._dataCaptureView.logoOffset.x;
  }

  get logoOffsetX_Value() {
    return this._dataCaptureView.logoOffset.x.value;
  }

  set logoOffsetX_Value(newValue) {
    Ti.API.info(
      `Logo offset value x ${newValue} with unit ${this.logoOffsetX_Unit}`
    );
    this._dataCaptureView.logoOffset = new ScanditCore.PointWithUnit(
      new ScanditCore.NumberWithUnit(newValue, this.logoOffsetX_Unit),
      this._logoOffsetY
    );
  }

  get logoOffsetX_Unit() {
    return this._dataCaptureView.logoOffset.x.unit;
  }

  set logoOffsetX_Unit(newValue) {
    Ti.API.info(
      `Logo offset unit x ${newValue} with value ${this.logoOffsetX_Value}`
    );
    this._dataCaptureView.logoOffset = new ScanditCore.PointWithUnit(
      new ScanditCore.NumberWithUnit(this.logoOffsetX_Value, newValue),
      this._logoOffsetY
    );
  }

  get _logoOffsetY() {
    return this._dataCaptureView.logoOffset.y;
  }

  get logoOffsetY_Value() {
    return this._dataCaptureView.logoOffset.y.value;
  }

  set logoOffsetY_Value(newValue) {
    this._dataCaptureView.logoOffset = new ScanditCore.PointWithUnit(
      this._logoOffsetX,
      new ScanditCore.NumberWithUnit(newValue, this.logoOffsetY_Unit)
    );
  }

  get logoOffsetY_Unit() {
    return this._dataCaptureView.logoOffset.y.unit;
  }

  set logoOffsetY_Unit(newValue) {
    this._dataCaptureView.logoOffset = new ScanditCore.PointWithUnit(
      this._logoOffsetX,
      new ScanditCore.NumberWithUnit(this.logoOffsetY_Value, newValue)
    );
  }

  get tapToFocusEnabled() {
    return this._dataCaptureView.focusGesture != null;
  }

  set tapToFocusEnabled(enabled) {
    if (enabled) {
      this._dataCaptureView.focusGesture = new ScanditCore.TapToFocus();
    } else {
      this._dataCaptureView.focusGesture = null;
    }
  }

  get swipeToZoomEnabled() {
    return this._dataCaptureView.zoomGesture != null;
  }

  set swipeToZoomEnabled(enabled) {
    if (enabled) {
      this._dataCaptureView.zoomGesture = new ScanditCore.SwipeToZoom();
    } else {
      this._dataCaptureView.zoomGesture = null;
    }
  }

  get isTorchControlEnabled() {
    return this._torchControl != null;
  }

  set isTorchControlEnabled(enabled) {
    if (enabled) {
      this._torchControl = new ScanditCore.TorchSwitchControl();
      this._dataCaptureView.addControl(this._torchControl);
    } else {
      this._dataCaptureView.removeControl(this._torchControl);
      this._torchControl = null;
    }
  }

  get currentViewfinder() {
    return this._currentViewFinder;
  }

  set currentViewfinder(newValue) {
    if (this._currentViewFinder == newValue) {
      return;
    }

    this._currentViewFinder = newValue;
    if (newValue == ViewfinderTypes.Aimer) {
      this._overlay.viewfinder = new ScanditCore.AimerViewfinder();
    } else if (newValue == ViewfinderTypes.Laserline) {
      this._overlay.viewfinder = new ScanditCore.LaserlineViewfinder();
    } else if (newValue == ViewfinderTypes.Rectangular) {
      this._overlay.viewfinder = new ScanditCore.RectangularViewfinder();
    } else {
      this._overlay.viewfinder = null;
    }
  }

  get aimerFrameColor() {
    return this._overlay.viewfinder.frameColor;
  }

  set aimerFrameColor(newValue) {
    this._overlay.viewfinder.frameColor = newValue;
  }

  get aimerDotColor() {
    return this._overlay.viewfinder.dotColor;
  }

  set aimerDotColor(newValue) {
    this._overlay.viewfinder.dotColor = newValue;
  }

  get laserlineStyle() {
    return this._overlay.viewfinder.style;
  }

  set laserlineStyle(newValue) {
    this._overlay.viewfinder = new ScanditCore.LaserlineViewfinder(newValue);
  }

  get laserLineWidth_Value() {
    return this._overlay.viewfinder.width.value;
  }

  set laserLineWidth_Value(newValue) {
    this._overlay.viewfinder.width = new ScanditCore.NumberWithUnit(
      newValue,
      this.laserLineWidth_Unit
    );
  }

  get laserLineWidth_Unit() {
    return this._overlay.viewfinder.width.unit;
  }

  set laserLineWidth_Unit(newValue) {
    this._overlay.viewfinder.width = new ScanditCore.NumberWithUnit(
      this.laserLineWidth_Value,
      newValue
    );
  }

  get laserlineEnabledColor() {
    return this._overlay.viewfinder.enabledColor;
  }

  set laserlineEnabledColor(newValue) {
    this._overlay.viewfinder.enabledColor = newValue;
  }

  get laserlineDisabledColor() {
    return this._overlay.viewfinder.disabledColor;
  }

  set laserlineDisabledColor(newValue) {
    this._overlay.viewfinder.disabledColor = newValue;
  }

  get rectangularViewfinderStyle() {
    return this._overlay.viewfinder.style;
  }

  set rectangularViewfinderStyle(newValue) {
    var dimming = this._overlay.viewfinder.dimming;
    var animation = this._overlay.viewfinder.animation;
    this._overlay.viewfinder = new ScanditCore.RectangularViewfinder(
      newValue,
      this.rectangularViewfinderLineStyle
    );
    this._overlay.viewfinder.dimming = dimming;
    this._overlay.viewfinder.animation = animation;
  }

  get rectangularViewfinderLineStyle() {
    return this._overlay.viewfinder.lineStyle;
  }

  set rectangularViewfinderLineStyle(newValue) {
    this._overlay.viewfinder = new ScanditCore.RectangularViewfinder(
      this.rectangularViewfinderStyle,
      newValue
    );
  }

  get dimming() {
    return this._overlay.viewfinder.dimming;
  }

  set dimming(newValue) {
    this._overlay.viewfinder.dimming = Number(newValue);
  }

  get rectangularColor() {
    return this._overlay.viewfinder.color;
  }

  set rectangularColor(newValue) {
    this._overlay.viewfinder.color = newValue;
  }

  get isAnimationEnabled() {
    return this._overlay.viewfinder.animation != null;
  }

  set isAnimationEnabled(newValue) {
    if (newValue) {
      this._overlay.viewfinder.animation =
        new ScanditCore.RectangularViewfinderAnimation(false);
    } else {
      this._overlay.viewfinder.animation = null;
    }
  }

  get isLooping() {
    return (
      this.isAnimationEnabled && this._overlay.viewfinder.animation.isLooping
    );
  }

  set isLooping(newValue) {
    this._overlay.viewfinder.animation =
      new ScanditCore.RectangularViewfinderAnimation(newValue);
  }

  get currentRectangularViewFinderSizeSpecification() {
    return this._currentRectangularViewFinderSizeSpecification;
  }

  set currentRectangularViewFinderSizeSpecification(newValue) {
    this._currentRectangularViewFinderSizeSpecification = newValue;
  }

  get rectangularViewfinderWidth() {
    return this._rectangularViewfinderWidth;
  }

  set rectangularViewfinderWidth(newValue) {
    this._rectangularViewfinderWidth = newValue;
  }

  get rectangularViewfinderHeightAspect() {
    return this._rectangularViewfinderHeightAspect;
  }

  set rectangularViewfinderHeightAspect(newValue) {
    this._rectangularViewfinderHeightAspect = newValue;
  }

  get rectangularViewfinderHeight() {
    return this._rectangularViewfinderHeight;
  }

  set rectangularViewfinderHeight(newValue) {
    this._rectangularViewfinderHeight = newValue;
  }

  get rectangularViewfinderWidthAspect() {
    return this._rectangularViewfinderWidthAspect;
  }

  set rectangularViewfinderWidthAspect(newValue) {
    this._rectangularViewfinderWidthAspect = newValue;
  }

  get rectangularViewfinderShorterDimension() {
    return this._rectangularViewfinderShorterDimension;
  }

  set rectangularViewfinderShorterDimension(newValue) {
    this._rectangularViewfinderShorterDimension = newValue;
  }

  get rectangularViewfinderShorterDimension_Aspect() {
    return this._rectangularViewfinderShorterDimensionAspect;
  }

  set rectangularViewfinderShorterDimension_Aspect(newValue) {
    this._rectangularViewfinderShorterDimensionAspect = newValue;
  }

  updateRectangularViewfinderSize() {
    if (this.currentViewfinder != ViewfinderTypes.Rectangular) {
      return;
    }

    if (
      this.currentRectangularViewFinderSizeSpecification ==
      SizeSpecification.WidthAndHeight
    ) {
      this._overlay.viewfinder.setSize(
        new ScanditCore.SizeWithUnit(
          this._rectangularViewfinderWidth,
          this._rectangularViewfinderHeight
        )
      );
    } else if (
      this.currentRectangularViewFinderSizeSpecification ==
      SizeSpecification.WidthAndHeightAspect
    ) {
      this._overlay.viewfinder.setWidthAndAspectRatio(
        this._rectangularViewfinderWidth,
        this._rectangularViewfinderHeightAspect
      );
    } else if (
      this.currentRectangularViewFinderSizeSpecification ==
      SizeSpecification.HeightAndWithAspect
    ) {
      this._overlay.viewfinder.setHeightAndAspectRatio(
        this._rectangularViewfinderHeight,
        this._rectangularViewfinderWidthAspect
      );
    } else if (
      this.currentRectangularViewFinderSizeSpecification ==
      SizeSpecification.ShorterDimensionAndAspectRatio
    ) {
      this._overlay.viewfinder.setShorterDimensionAndAspectRatio(
        this._rectangularViewfinderShorterDimension,
        this._rectangularViewfinderShorterDimensionAspect
      );
    }
  }
}

const ViewfinderTypes = {
  None: "None",
  Rectangular: "Rectangular",
  Laserline: "Laserline",
  Aimer: "Aimer",
};

const SizeSpecification = {
  WidthAndHeight: "Width And Height",
  WidthAndHeightAspect: "Width And Height Aspect",
  HeightAndWithAspect: "Height And With Aspect",
  ShorterDimensionAndAspectRatio: "Shorter Dimension And Aspect Ratio",
};

exports.instance = new SettingsManager();
exports.ViewfinderTypes = ViewfinderTypes;
exports.SizeSpecification = SizeSpecification;
