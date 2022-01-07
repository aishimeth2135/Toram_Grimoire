function setAttributes(ele: Element, dict: Record<string, any>) {
  Object.keys(dict).forEach(key => {
    if (dict[key] !== null)
      ele.setAttribute(key, dict[key]);
  });
}

function convertRemToPixels(rem: number) {
  return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

export default {
  setAttributes,
  convertRemToPixels,
};
