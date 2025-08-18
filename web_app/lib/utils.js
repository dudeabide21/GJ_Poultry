// lib/utils.js
export function sanitizeSensorValue(value, errorValue = 98, nullValue = null) {
  return value === errorValue || typeof value === "undefined"
    ? nullValue
    : value;
}
