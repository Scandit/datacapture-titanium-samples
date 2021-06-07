function getCameraPermissions(opt) {
    if (OS_ANDROID) {
        // Android
        const permissions = ['android.permission.CAMERA'];
        const hasPermission = Ti.Android.hasPermission(permissions);

        // Check if the permissions are already allowed.
        if (hasPermission) {
            // Run callback
            return opt();
        }
        // no permission - request it
        Ti.Android.requestPermissions(permissions, (e) => {
            if (e.successs) {
                // run callback
                opt();
            } else {
                // ask again
                getCameraPermissions(opt);
            }
        });
    } else {
        // iOS
        Ti.Media.requestCameraPermissions((e) => {
            if (e.success) {
                // run callback
                opt();
            } else {
                // ask again
                getCameraPermissions(opt);
            }
        });
    }
}

exports.getCameraPermissions = getCameraPermissions;
