const getObj = (path, obj) => path.split('.').reduce((res, key) => res[key], obj);
const getSourceKey = (sourcePath) => sourcePath.split('.')[sourcePath.split('.').length - 1];

Object.prototype.findRootObjectByPath = function(path) {
  if (path.trim() === '') {
    return this;
  }
  try {
    return getObj(path, this);
  } catch (e) {}
};

Object.prototype.doesObjectMatchByProperties = function(propertiesToMatch) {
  const propertiesKeys = Object.keys(propertiesToMatch);
  let match = true;

  propertiesKeys.forEach(property => {
    if (
      !this.hasOwnProperty(property) ||
      typeof this[property] != typeof propertiesToMatch[property]
    ) {
      match = false;
      return;
    }

    if (typeof this[property] == 'string' && this[property].localeCompare(propertiesToMatch[property])) {
      match = false;
      return;
    }

    if (typeof this[property] == 'number' && this[property] !== propertiesToMatch[property]) {
      match = false;
    }
  });
  return match;
}

Object.prototype.findRootObjectByProperties = function(properties) {
  const foundObjects = new Set();

  const iterate = (obj) => {
    const objKeys = Object.keys(obj);
    objKeys.forEach(property => {
      if (obj.doesObjectMatchByProperties(properties)) {
        foundObjects.add(obj);
      }
      if (obj.hasOwnProperty(property)) {
        if (typeof obj[property] === "object") {
          iterate(obj[property]);
        }
      }
    });
  };

  iterate(this);
  return Array.from(foundObjects);
};

Object.prototype.addToKey = function(destinationPath, object, findSettings = {}) {
  const {
    matchProperties
  } = findSettings;

  let destinationObj;
  if (!matchProperties) {
    if (typeof object == 'object') {
      destinationObj = this.findRootObjectByPath(destinationPath);
      const objectKeys = Object.keys(object);

      objectKeys.forEach(key => {
        destinationObj[key] = object[key];
      });
    } else {
      this.createKey(destinationPath, object);
    }

    return;
  }

  const destinationObjs = this.findRootObjectByProperties(matchProperties);
  destinationObjs.forEach(destinationObj => {
    destinationObj.addToKey(destinationPath, object, {
      isPathAbsolute: true
    });
  });
};

Object.prototype.createKey = function(destinationPath, value) {
  const indexOfName = destinationPath.lastIndexOf('.');

  if (indexOfName > -1) {
    const name = destinationPath.substring(indexOfName + 1, destinationPath.length);
    const path = destinationPath.substring(0, indexOfName);

    const obj = this.findRootObjectByPath(path);

    if (!obj) return;

    obj[name] = value;

    return;
  }

  this[destinationPath] = value;
}

Object.prototype.copyFromKey = function(sourcePath, destinationPath, findSettings = {}) {
  const {
    matchProperties
  } = findSettings;

  if (!matchProperties) {
    this.createKey(destinationPath, this.findRootObjectByPath(sourcePath));
    return;
  }

  const referenceObjects = this.findRootObjectByProperties(matchProperties);
  referenceObjects.forEach(refObject => {
    refObject.copyFromKey(sourcePath, destinationPath);
  });
};

Object.prototype.deleteKey = function(sourcePath) {
  const sourceKey = getSourceKey(sourcePath);
  const sourcePathList = sourcePath.split('.');
  sourcePathList.splice(-1, 1);
  const sourceObjectPath = sourcePathList.join('.');
  const sourceObject = getObj(sourceObjectPath, this);
  delete sourceObject[sourceKey];
};

Object.prototype.moveKey = function(sourcePath, destinationPath) {
  const source = getObj(sourcePath, this);
  const destination = getObj(destinationPath, this);

  const sourceKey = getSourceKey(sourcePath);
  destination[sourceKey] = source;

  this.deleteKey(sourcePath);
};

Object.prototype.renameKey = function(oldKey, newKey) {
  if (oldKey === newKey) {
    return this;
  }
  if (this.hasOwnProperty(oldKey)) {
    this[newKey] = this[oldKey];
    delete this[oldKey];
  }
  return this;
};

Object.prototype.renameKeys = function(oldKey, newKey) {
  if (oldKey === newKey) {
    return this;
  }

  const iterate = (obj) => {
    const objKeys = Object.keys(obj);
    objKeys.forEach(property => {
      if (obj.hasOwnProperty(property)) {
        if (property === oldKey) {
          obj.renameKey(oldKey, newKey);
        }
        if (typeof obj[property] === "object") {
          iterate(obj[property]);
        }
      }
    });
  };

  iterate(this);
};