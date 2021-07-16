exports.createContainerView = (top, height, left) => {
  return Ti.UI.createView({
    backgroundColor: "#fff",
    height: height,
    top: top,
    left: left,
    horizontalWrap: false,
    width: Titanium.UI.FILL,
  });
};

exports.createVerticalContainerView = (top, height, left) => {
  return Ti.UI.createView({
    backgroundColor: "#fff",
    height: height,
    top: top,
    left: left,
    horizontalWrap: false,
    layout: "vertical",
    width: Titanium.UI.FILL,
  });
};

exports.createPickerRow = (title, value) => {
  return Ti.UI.createPickerRow({
    title: title,
    color: "#000",
    properties: { value: value },
    textAlign: "right",
    right: 0,
  });
};

exports.createLeftLabel = (title, left) => {
  return Ti.UI.createLabel({
    color: "#000",
    text: title,
    textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
    width: Titanium.UI.SIZE,
    height: Titanium.UI.SIZE,
    left: left,
  });
};

exports.createRightLabel = (title, right) => {
  return Ti.UI.createLabel({
    color: "#000",
    text: title,
    textAlign: Ti.UI.TEXT_ALIGNMENT_RIGHT,
    width: Titanium.UI.SIZE,
    height: Titanium.UI.SIZE,
    right: right,
  });
};

exports.createSlider = (min, max, value) => {
  return Titanium.UI.createSlider({
    min: min,
    minRange: min,
    max: max,
    maxRange: max,
    width: Ti.UI.FILL,
    value: value,
    right: 10,
    left: 10,
  });
};

exports.createWindow = (title) => {
  const window = Titanium.UI.createWindow({
    title: title,
    backgroundColor: "#f5f5f5",
    navBarHidden: false,
    onBack: () => window.close(),
  });
  return window;
};
