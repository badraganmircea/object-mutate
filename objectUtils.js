const getObj = (path, obj) => path.split('.').reduce((res, key) => res[key], obj);
const getSourceKey = (sourcePath) => sourcePath.split('.')[sourcePath.split('.').length - 1];

Object.prototype.findRootObjectByPath = function(path) {
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

    if (
      (typeof this[property] == 'string' || typeof this[property] == 'number') &&
      this[property] !== propertiesToMatch[property]
    ) {
      match = false;
    }
  });

  return match;
}

Object.prototype.findRootObjectByProperties = function(properties) {
  const foundObjects = [];

  const iterate = (obj) => {
    const objKeys = Object.keys(obj);
    objKeys.forEach(property => {
      if (obj.hasOwnProperty(property)) {
        if (obj[property].doesObjectMatchByProperties(properties)) {
          foundObjects.push(obj[property]);
        }
        if (typeof obj[property] === "object") {
          iterate(obj[property]);
        }
      }
    });
  };

  iterate(this);
  return foundObjects;
};

Object.prototype.addToKey = function(destinationPath, object) {
  const destinationObj = getObj(destinationPath, this);
  const destinationKey = Object.keys(object)[0];
  destinationObj[destinationKey] = {
    ...object[destinationKey]
  };
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