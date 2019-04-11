const getObj = (path, obj) => path.split('.').reduce((res, key) => res[key], obj);
const getSourceKey = (sourcePath) => sourcePath.split('.')[sourcePath.split('.').length - 1];

function Mutate(mutateObj) {
  this.mutateObj = mutateObj;
}

Mutate.prototype.value = function() {
  return this.mutateObj;
}

Mutate.prototype.findRootObjectByPath = function(path) {
  if (path.trim() === '') {
    return this.mutateObj;
  }
  try {
    return getObj(path, this.mutateObj);
  } catch (e) {}
};

Mutate.prototype.doesObjectMatchByProperties = function(propertiesToMatch) {
  const propertiesKeys = Object.keys(propertiesToMatch);
  let match = true;

  propertiesKeys.forEach(property => {
    if (
      !this.value().hasOwnProperty(property) ||
      typeof this.value()[property] != typeof propertiesToMatch[property]
    ) {
      match = false;
      return;
    }

    if (typeof this.value()[property] == 'string' && this.value()[property].localeCompare(propertiesToMatch[property])) {
      match = false;
      return;
    }

    if (typeof this.value()[property] == 'number' && this.value()[property] !== propertiesToMatch[property]) {
      match = false;
    }
  });
  return match;
}

Mutate.prototype.findRootObjectByProperties = function(properties) {
  const foundObjects = new Set();

  const iterate = (obj) => {
    const objKeys = Object.keys(obj);
    objKeys.forEach(property => {
      if (new Mutate(obj).doesObjectMatchByProperties(properties)) {
        foundObjects.add(obj);
      }
      if (obj.hasOwnProperty(property)) {
        if (typeof obj[property] === "object") {
          iterate(obj[property]);
        }
      }
    });
  };

  iterate(this.value());
  return Array.from(foundObjects);
};

Mutate.prototype.addToKey = function(destinationPath, object, findSettings = {}) {
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

  const destinationObjs = this.findRootObjectByProperties(matchProperties).map(obj => new Mutate(obj));

  destinationObjs.forEach(destinationObj => {
    destinationObj.addToKey(destinationPath, object);
  });
};

Mutate.prototype.createKey = function(destinationPath, value) {
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

Mutate.prototype.copyFromKey = function(sourcePath, destinationPath, findSettings = {}) {
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

Mutate.prototype.deleteKey = function(sourcePath) {
  const sourceKey = getSourceKey(sourcePath);
  const sourcePathList = sourcePath.split('.');
  sourcePathList.splice(-1, 1);
  const sourceObjectPath = sourcePathList.join('.');
  const sourceObject = getObj(sourceObjectPath, this);
  delete sourceObject[sourceKey];
};

Mutate.prototype.moveKey = function(sourcePath, destinationPath) {
  const source = getObj(sourcePath, this);
  const destination = getObj(destinationPath, this);

  const sourceKey = getSourceKey(sourcePath);
  destination[sourceKey] = source;

  this.deleteKey(sourcePath);
};


// TODO: won't work
Mutate.prototype.renameKey = function(oldKey, newKey) {
  if (oldKey === newKey) {
    return this.mutateObj;
  }
  if (this.hasOwnProperty(oldKey)) {
    this.mutateObj[newKey] = this.mutateObj[oldKey];
    delete this[oldKey];
  }
  return this.mutateObj;
};

Mutate.prototype.renameKeys = function(oldKey, newKey) {
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

  iterate(this.mutateObj);
};

module.exports = {
  Mutate
}
