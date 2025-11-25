// Small utility helpers used across the app
export function deepEqual(x, y) {
  if (x === y) return true;
  if ((typeof x == "object" && x != null) && (typeof y == "object" && y != null)) {
    if (Object.keys(x).length !== Object.keys(y).length) return false;
    for (const prop in x) {
      if (Object.prototype.hasOwnProperty.call(y, prop)) {
        if (!deepEqual(x[prop], y[prop])) return false;
      } else return false;
    }
    return true;
  }
  return false;
}

/**
 * Simple machine calibration to normalize timings across devices.
 * Returns factor (>=1) and rawTime.
 */
export function calibrateMachine() {
  const start = performance.now();
  let k = 0;
  for (let i = 0; i < 2000000; i++) k = (k + i) % 99999;
  const end = performance.now();
  const rawTime = end - start;
  const REFERENCE_TIME = 4.0; // reference modern machine estimate in ms
  let factor = rawTime / REFERENCE_TIME;
  if (factor < 1) factor = 1;
  return { factor, rawTime };
}

export function downloadJSON(filename, obj) {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(obj, null, 2));
  const a = document.createElement('a');
  a.setAttribute('href', dataStr);
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  a.remove();
}
