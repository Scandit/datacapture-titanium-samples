var globalNavigationWindow;

export function openWindow(window) {
  var isInitialWindow = !globalNavigationWindow;
  if (isInitialWindow) {
    globalNavigationWindow = Ti.UI.createNavigationWindow({ window: window });
    globalNavigationWindow.open();
  } else {
    globalNavigationWindow.openWindow(window);
  }

  // Create custom title for the double click to home screen navigation
  const title = Ti.UI.createLabel({
    text: window.title,
    color: '#000',
    font: {
      fontSize: '20dp'
    }
  });

  title.addEventListener('dblclick', function (_e) {
    popToRoot();
  });

  if (OS_ANDROID) {
    window.addEventListener('open', function (_e) {
      window.activity.actionBar.customView = title;
      window.activity.actionBar.setDisplayShowTitleEnabled(false);
      window.activity.actionBar.displayHomeAsUp = !isInitialWindow;
    });
  } else if (OS_IOS) {
    window.titleControl = title;
  }
}

export function popToRoot() {
  if (globalNavigationWindow) {
    globalNavigationWindow.popToRootWindow();
  }
}
