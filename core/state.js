const prefix = "runlevel:";
const memory = new Map();
let storageAvailable = true;

function keyFor(key) {
  return `${prefix}${key}`;
}

export function set(key, value) {
  const storageKey = keyFor(key);
  const serialized = String(JSON.stringify(value));
  memory.set(storageKey, serialized);

  if (storageAvailable) {
    try {
      sessionStorage.setItem(storageKey, serialized);
    } catch {
      storageAvailable = false;
    }
  }
}

export function get(key) {
  const storageKey = keyFor(key);
  let value = memory.get(storageKey) ?? null;

  if (storageAvailable) {
    try {
      value = sessionStorage.getItem(storageKey);
      if (value === null) {
        memory.delete(storageKey);
      } else {
        memory.set(storageKey, value);
      }
    } catch {
      storageAvailable = false;
    }
  }

  if (value === null) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export function remove(key) {
  const storageKey = keyFor(key);
  memory.delete(storageKey);

  if (storageAvailable) {
    try {
      sessionStorage.removeItem(storageKey);
    } catch {
      storageAvailable = false;
    }
  }
}

export function clear() {
  memory.clear();

  if (storageAvailable) {
    try {
      Object.keys(sessionStorage)
        .filter((key) => key.startsWith(prefix))
        .forEach((key) => sessionStorage.removeItem(key));
    } catch {
      storageAvailable = false;
    }
  }
}

export default {
  set,
  get,
  remove,
  clear,
};
