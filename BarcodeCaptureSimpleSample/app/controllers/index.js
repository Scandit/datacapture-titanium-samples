const ScanditCore = require('scandit-titanium-datacapture-core');
const ScanditBarcode = require('scandit-titanium-datacapture-barcode');

const permissions = require('permissions');

// There is a Scandit sample license key set below here.
// This license key is enabled for sample evaluation only.
// If you want to build your own application, get your license key by signing up for a trial at https://ssl.scandit.com/dashboard/sign-up?p=test
const licenseKey = 'AW7z5wVbIbJtEL1x2i7B3/cet/ClBNVHZTfPtvJ2n3L/LY6/FDbqtzYItFO0DmhIJ2JP1Vxu7po1f74HqF9UTtRB/1DHY+CJdTiq/6dQ8vFgd9rzwlVfSYFgWPp9fK5nVUmnHyt9W5oRMcXObjYeC7Q/FO0NA0yRHUEtt/aBpnv/AxYTKG8wyVNqZKMJn+bhz/CFbH5pjtdj2aE85TlPGfQK4sBP/K2ONcx2ndbmY82SOquLlcZ55uAFuj4yCuQEI6iuokblpDVsql+vDiw3XMOmqwbmuGnAuCtGbtjyyWyQCKeiKWtZzdy+Cz7NnW/yRdwKY1xBjkaMA+A+NWeBxp9O2Ou6dBCPsRPg0Nqfv92sbv050dQc/+xccvEXWSi8UnD+AQoKp5V3gR/Yae/5+4fII9X3Tqjf/aNvXDw3m7YDQ+b+IJnkzLN5EgwGnzUmI8z3qMx9xcqhkWwBE/SSuIP47tBp5xwz02kN6qb+vZc/1p5EUQ/VtGVBfD1e+5Dii56BHsfPId/JpKpGUX1FFAYuT1uEbf7xLREDtFobn05tDxYPLrCa0hciRwCdWxHbUnYR1BF3zQQHih5Dd5qGyA5yKsgCsg7Na+9gC8O6hxpWlB4SbIFMEDluvJ+0v0ww5nnP2PWAO7v4k+Sgn7cQa7gDhQNee+pfuDvUlprUufio+dUmOUYNbn2TVwRVATmPx4U+p8Acg+Ohj85bSwPk+cNoq3Te6N0Ts5JnwrjCvVq6yrfbqyGFbgIhJiSxtgiZOfMZu8KoCvBfIUFE2A5WlNNaMZmQAtPozR31iX/Z2LuCIBhkFXGdd9CW/YPKhs8m25jlbOKnl0DWiBnM';

// Create data capture context using your license key.
const context = ScanditCore.DataCaptureContext.forLicenseKey(licenseKey);

// Use the world-facing (back) camera and set it as the frame source of the context. The camera is off by
// default and must be turned on to start streaming frames to the data capture context for recognition.
const camera = ScanditCore.Camera.default;
context.setFrameSource(camera);

// The barcode capturing process is configured through barcode capture settings
// and are then applied to the barcode capture instance that manages barcode recognition.
const settings = new ScanditBarcode.BarcodeCaptureSettings();

// The settings instance initially has all types of barcodes (symbologies) disabled. For the purpose of this
// sample we enable a very generous set of symbologies. In your own app ensure that you only enable the
// symbologies that your app requires as every additional enabled symbology has an impact on processing times.
settings.enableSymbologies([
    ScanditBarcode.Symbology.EAN13UPCA,
    ScanditBarcode.Symbology.EAN8,
    ScanditBarcode.Symbology.UPCE,
    ScanditBarcode.Symbology.QR,
    ScanditBarcode.Symbology.DataMatrix,
    ScanditBarcode.Symbology.Code39,
    ScanditBarcode.Symbology.Code128,
    ScanditBarcode.Symbology.InterleavedTwoOfFive,
]);

// Some linear/1d barcode symbologies allow you to encode variable-length data. By default, the Scandit
// Data Capture SDK only scans barcodes in a certain length range. If your application requires scanning of one
// of these symbologies, and the length is falling outside the default range, you may need to adjust the "active
// symbol counts" for this symbology. This is shown in the following few lines of code for one of the
// variable-length symbologies.
const symbologySettings = settings.settingsForSymbology(ScanditBarcode.Symbology.Code39);
symbologySettings.activeSymbolCounts = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

// Create new barcode capture mode with the settings from above.
const barcodeCapture = ScanditBarcode.BarcodeCapture.forContext(context, settings);

// Register a listener to get informed whenever a new barcode got recognized.
barcodeCapture.addListener({
    didScan: (mode, session, _) => {
        const barcode = session.newlyRecognizedBarcodes[0];
        const symbology = new ScanditBarcode.SymbologyDescription(barcode.symbology);

        // The `alert` dialog displays the barcode information and will re-enable barcode capture once clicked.
        const dialog = Ti.UI.createAlertDialog({
            message: `Scanned: ${barcode.data} (${symbology.readableName})`,
            ok: 'OK',
            title: 'Scan Result',
            persistent: true
        });
        dialog.addEventListener('click', function (_e) {
            mode.isEnabled = true;
        });
        dialog.show();

        // Disable barcode capture until dialog is dismissed.
        mode.isEnabled = false;
    }
});

// To visualize the on-going barcode capturing process on screen, setup a data capture view that renders the
// camera preview. The view must be connected to the data capture context.
const dataCaptureView = new ScanditCore.DataCaptureView(context);

// Add a barcode capture overlay to the data capture view to render the location of captured barcodes on top of
// the video preview. This is optional, but recommended for better visual feedback.
const overlay = ScanditBarcode.BarcodeCaptureOverlay.withBarcodeCaptureForViewWithStyle(
    barcodeCapture,
    dataCaptureView,
    ScanditBarcode.BarcodeCaptureOverlayStyle.Frame);

overlay.viewfinder = new ScanditCore.RectangularViewfinder(
  ScanditCore.RectangularViewfinderStyle.Square,
  ScanditCore.RectangularViewfinderLineStyle.Light
);

const openScanner = () => {
    // Create a window to add the data capture view to (you can also create a view).
    const window = Titanium.UI.createWindow({
        title: 'Scandit DataCapture View',
        navBarHidden: true
    });

    // Add the capture view to the window (or view).
    dataCaptureView.addToContainer(window);

    // Add listener that opens camera once window is open.
    window.addEventListener('open', function (_e) {
        // Switch camera on to start streaming frames and enable the barcode capture mode.
        // The camera is started asynchronously and will take some time to completely turn on.
        camera.switchToDesiredState(ScanditCore.FrameSourceState.On);
        barcodeCapture.isEnabled = true;
    });

    window.addEventListener('close', function (_e) {
        // Switch camera on to start streaming frames and enable the barcode capture mode.
        // The camera is started asynchronously and will take some time to completely turn on.
        camera.switchToDesiredState(ScanditCore.FrameSourceState.Off);
        barcodeCapture.isEnabled = false;
    });

    window.open();
}

// Request camera permissions and open the scanner when accepted.
permissions.getCameraPermissions(openScanner);
