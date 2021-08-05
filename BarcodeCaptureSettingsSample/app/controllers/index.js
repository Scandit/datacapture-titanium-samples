const ScanditCore = require("scandit-titanium-datacapture-core");
const ScanditBarcode = require("scandit-titanium-datacapture-barcode");
const permissions = require("permissions");
const settings = require("/model/settings_manager");
const navigation = require("/model/navigation_helper");
const main_settings = require("/settings/main_settings");

const handleDidScan = (barcodeCapture, session, _) => {
  const barcode = session.newlyRecognizedBarcodes[0];
  const symbology = new ScanditBarcode.SymbologyDescription(barcode.symbology);

  Ti.API.info(`Scanned: ${barcode.data} (${symbology.readableName})`);

  if (settings.instance.continuousScanningEnabled) {
    var t = setTimeout(() => {
      dialog.hide();
      t = null;
    }, 1000);
  } else {
     // Disable barcode capture until dialog is dismissed.
    barcodeCapture.isEnabled = false;
  }

  let alertText = `Scanned: ${barcode.data} (${symbology.readableName})`;

  // Show data scanned for Composite Codes.
  if (barcode.compositeFlag && barcode.compositeFlag !== ScanditBarcode.CompositeFlag.Unknown) {
    let compositeCodeType = '';

    switch (barcode.compositeFlag) {
      case ScanditBarcode.CompositeFlag.GS1TypeA:
        compositeCodeType = "CC Type A";
        break;
      case ScanditBarcode.CompositeFlag.GS1TypeB:
        compositeCodeType = "CC Type B";
        break;
      case ScanditBarcode.CompositeFlag.GS1TypeC:
        compositeCodeType = "CC Type C";
        break;
      default:
        break;
    }

    alertText = `${compositeCodeType}\n${symbology.readableName}:\n${barcode.data}\n${barcode.compositeData}\nSymbol Count: ${barcode.symbolCount}`;
  }

  // Show data scanned for Add-on Codes.
  if (barcode.addOnData) {
    alertText = `${symbology.readableName}:\n${barcode.data} ${barcode.addOnData}\nSymbol Count: ${barcode.symbolCount}`;
  }

  // The `alert` dialog displays the barcode information and will re-enable barcode capture once clicked.
  const dialog = Ti.UI.createAlertDialog({
    message: alertText,
    ok: "OK",
    title: "Scan Result",
    persistent: true,
  });
  dialog.addEventListener("click", (e) => {
    if(!settings.instance.continuousScanningEnabled) {
      // Enable barcode capture only if continuous scan is not enabled
      barcodeCapture.isEnabled = true;
    }
  });
  dialog.show();
};

const barcodeCaptureListener = { didScan: handleDidScan };

const openScanner = () => {
  // Add the capture view to the window (or view).
  settings.instance.dataCaptureView.addToContainer($.scan_window);

  // Register a listener to get informed whenever a new barcode got recognized.
  settings.instance.barcodeCapture.addListener(barcodeCaptureListener);

  // Switch camera on to start streaming frames and enable the barcode capture mode.
  // The camera is started asynchronously and will take some time to completely turn on.
  settings.instance.camera.switchToDesiredState(
    ScanditCore.FrameSourceState.On
  );

  settings.instance.barcodeCapture.isEnabled = true;
};

$.scan_window.addEventListener("open", function (e) {
  permissions.getCameraPermissions(openScanner);
});

$.scan_window.addEventListener("focus", function (e) {
  settings.instance.camera.switchToDesiredState(
    ScanditCore.FrameSourceState.On
  );
});

if (OS_IOS) {
  const settingsButton = Titanium.UI.createButton({
    title: "Settings",
  });
  settingsButton.addEventListener("click", function (e) {
    openSettings();
  });
  $.scan_window.rightNavButton = settingsButton;
}

function openSettings() {
  settings.instance.camera.switchToDesiredState(
    ScanditCore.FrameSourceState.Off
  );
  main_settings.openSettingsList();
}

navigation.openWindow($.scan_window);
