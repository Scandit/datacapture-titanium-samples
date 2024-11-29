const ScanditCore = require('scandit-titanium-datacapture-core');
const ScanditBarcode = require('scandit-titanium-datacapture-barcode');

const permissions = require('permissions');

// Enter your Scandit License key here.
// Your Scandit License key is available via your Scandit SDK web account.
const licenseKey = '-- ENTER YOUR SCANDIT LICENSE KEY HERE --';

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
        const barcode = session.newlyRecognizedBarcode;
        if (barcode == null) return;

        // Disable barcode capture until dialog is dismissed.
        mode.isEnabled = false;

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
