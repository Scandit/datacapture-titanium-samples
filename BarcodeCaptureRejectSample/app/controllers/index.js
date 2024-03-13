const ScanditCore = require('scandit-titanium-datacapture-core');
const ScanditBarcode = require('scandit-titanium-datacapture-barcode');

const permissions = require('permissions');

// There is a Scandit sample license key set below here.
// This license key is enabled for sample evaluation only.
// If you want to build your own application, get your license key by signing up for a trial at https://ssl.scandit.com/dashboard/sign-up?p=test
const licenseKey = 'AbvELRLKNvXhGsHO0zMIIg85n3IiQdKMA2p5yeVDSOSZSZg/BhX401FXc+2UHPun8Rp2LRpw26tYdgnIJlXiLAtmXfjDZNQzZmrZY2R0QaJaXJC34UtcQE12hEpIYhu+AmjA5cROhJN3CHPoHDns+ho12ibrRAoFrAocoBIwCVzuTRHr0U6pmCKoa/Mn3sNPdINHh97m1X9Al9xjh3VOTNimP6ZjrHLVWEJSOdp2QYOnqn5izP1329PVcZhn8gqlGCRh+LJytbKJYI/KIRbMy3bNOyq5kNnr2IlOqaoXRgYdz2IU+jIWw8Cby9XoSB1zkphiYMmlCUqrDzxLUmTAXF4rSWobiM+OxnoImDqISpunJBQz0a5DSeT5Zf0lwwvXQLX4ghkgXozyYYfYvIKsqxJLZoza8g1BFsJ1i3fb0JYP2Ju209OMN2NTJifAu9ZJjQKGWS76Rmr/jre13jCqGgx5SX9F2lA2ZpF2AEb6rmYYmMtL9CPwWvstM+W295WvscH+gCBccZ9q3rxfIsak6cV2T50/2uBWfJJka6kL9UOjMOG3BOGKx+O+KWT/twwvOC+GcvC8s1qMwGNNM6G+/m7fG5Xtl5wtp3QhpzPJbBHSmlkYbxXQx0SpuWBmvxygyKOi3lUzz3gRzOdykWRXzrhiMAp5bb1y6n6g4O2v2TVgzWWF8vwZ6F60ehYDUq7pbusgT4Fl3fV7fYPgLxMMvXKduMmUlWyGv3CWL9LfvoY/hLl7RxoyUryTMmSfRVBcsKs+MWYJGh1iIvWk1UhOChb9IGI2PzUsHz7+OikuYMjKhR8LZZYalXpPiEVfT66yy75M5DODcjXRoFZU';

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
// sample we enable the QR symbology. In your own app ensure that you only enable the symbologies that your app
// requires as every additional enabled symbology has an impact on processing times.
settings.enableSymbologies([ScanditBarcode.Symbology.QR]);

// Create new barcode capture mode with the settings from above.
const barcodeCapture = ScanditBarcode.BarcodeCapture.forContext(context, settings);

// By default, every time a barcode is scanned, a sound (if not in silent mode) and a vibration are played.
// In the following we are setting a success feedback without sound and vibration.
barcodeCapture.feedback = { success: new ScanditCore.Feedback(null, null) };

// Register a listener to get informed whenever a new barcode got recognized.
const barcodeCaptureListener = {
	didScan: (mode, session, _) => {
		const barcode = session.newlyRecognizedBarcodes[0];
		const symbology = new ScanditBarcode.SymbologyDescription(barcode.symbology);

		// If the code scanned doesn't start with '09:', we will just ignore it and continue scanning.
		if (!barcode.data.startsWith('09:')) {
			return;
		}

		// Stop recognizing barcodes for as long as we are displaying the result. There won't be any
		// new results until the capture mode is enabled again. Note that disabling the capture mode
		// does not stop the camera, the camera continues to stream frames until it is turned off.
		mode.isEnabled = false;

		// Manually play the default feedback (sound and vibration).
		ScanditCore.Feedback.defaultFeedback.emit();

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
};

barcodeCapture.addListener(barcodeCaptureListener);

// To visualize the on-going barcode capturing process on screen, setup a data capture view that renders the
// camera preview. The view must be connected to the data capture context.
const dataCaptureView = new ScanditCore.DataCaptureView(context);

// Add a barcode capture overlay to the data capture view to render the location of captured barcodes on top of
// the video preview. This is optional, but recommended for better visual feedback.
const overlay = ScanditBarcode.BarcodeCaptureOverlay.withBarcodeCaptureForViewWithStyle(
	barcodeCapture,
	dataCaptureView,
	ScanditBarcode.BarcodeCaptureOverlayStyle.Frame);

// Add a square viewfinder as we are only scanning square QR codes.
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
