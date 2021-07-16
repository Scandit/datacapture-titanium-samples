var globalNavigationWindow;

export function openWindow(window) {
  if (globalNavigationWindow) {
    globalNavigationWindow.openWindow(window);
  } else {
    globalNavigationWindow = Ti.UI.createNavigationWindow({ window: window });
    globalNavigationWindow.open();
  }
}
