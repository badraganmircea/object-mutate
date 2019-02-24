import '../objectUtils';

describe('find root object suite', () => {
  it('inserts object at root', () => {
    const object = {
      a: {
        b: 'c'
      },
      e: [1, 2, 3]
    }

    expect(object.findRootObjectByPath('')).toBe(object);
  });

  it('finds object pointer at path', () => {
    const object = {
      a: {
        b: 'c'
      },
      e: [1, 2, 3]
    }

    expect(object.findRootObjectByPath('a.b')).toBe(object.a.b);
    expect(object.findRootObjectByPath('a')).toBe(object.a);
    expect(object.findRootObjectByPath('e')).toBe(object.e);
  });

  it('doesn\'t find object pointer if not existent', () => {
    const object = {
      a: {
        b: 'c',
        d: {
          f: []
        }
      },
      g: {}
    }

    expect(object.findRootObjectByPath('a.b.d')).toBe(undefined);
    expect(object.findRootObjectByPath('a.e')).toBe(undefined);
    expect(object.findRootObjectByPath('a.c.d')).toBe(undefined);
  });

  it('finds correct object inside another object', () => {
    const object = {
      a: {
        b: 'c',
        d: {
          f: []
        }
      },
      g: {
        h: {}
      }
    }
    const insideObject = object.findRootObjectByPath('a.d');
    expect(insideObject.findRootObjectByPath('f')).toBe(object.a.d.f);
    expect(insideObject.findRootObjectByPath('f')).toBe(insideObject.f);
  });
});

describe('object match by properties', () => {
  it('compares if 2 objects match with same values', () => {
    const properties = {
      a: {},
      b: 'c',
      d: {}
    }
    const obj = {
      a: {},
      b: 'c',
      d: {},
      f: []
    }
    expect(obj.doesObjectMatchByProperties(properties)).toEqual(true);
  });

  it('compares if 2 objects match with different values', () => {
    const properties = {
      a: 'value1',
      b: 'value2'
    };
    const obj = {
      a: [
        'value1'
      ],
      b: 'value2'
    }
    expect(obj.doesObjectMatchByProperties(properties)).toEqual(false);
  });
});

describe('find root objectS suite', () => {
  it('finds single object', () => {
    const obj = {
      a: {
        b: {
          c: 'some value'
        },
        d: {
          e: [{
            f: 'g',
            h: 'h'
          }]
        }
      }
    };

    const properties = {
      c: 'some value'
    }

    expect(obj.findRootObjectByProperties(properties)).toEqual([obj.a.b]);
  })

  it('finds object even if in array', () => {
    const obj = {
      a: {
        b: {
          c: 'some value'
        },
        d: {
          e: [{
            f: 'g',
            h: 'h'
          }]
        }
      }
    };

    const properties = {
      f: 'g',
      h: 'h'
    }

    expect(obj.findRootObjectByProperties(properties)).toEqual([
      obj.a.d.e[0]
    ]);
  });

  it('finds all objects with properties', () => {
    const obj = {
      a: {
        b: {
          c: 'some value',
          f: 'g',
          h: 'h'
        },
        d: {
          e: [{
            f: 'g',
            h: 'h'
          }]
        },
        i: {
          j: [{
              h: 'i'
            },
            {
              f: 'g',
              h: 'h',
              g: 'g'
            }
          ]
        }
      }
    };

    const properties = {
      f: 'g',
      h: 'h'
    }

    expect(obj.findRootObjectByProperties(properties)).toEqual([
      obj.a.b, obj.a.d.e[0], obj.a.i.j[1]
    ]);
  })
});

describe('addToKey suite', () => {
  it('adds key to simple object (absolute path)', () => {
    const object = {
      a: {
        b: 'c'
      }
    }
    object.addToKey('a', {
      d: 'e'
    }, {
      isPathAbsolute: true
    });

    expect(object).toEqual({
      a: {
        b: 'c',
        d: 'e'
      }
    });
  });

  it('overrides existing keys (absolute path)', () => {
    const object = {
      a: {
        b: {
          d: 'g'
        }
      }
    }
    object.addToKey('a.b', {
      d: 'e'
    }, {
      isPathAbsolute: true
    });

    expect(object).toEqual({
      a: {
        b: {
          d: 'e'
        }
      }
    });
  });

  it('adds key to simple object (relative to one object found)', () => {
    const object = {
      a: {
        b: {
          d: 'g'
        },
        f: {
          c: 'c'
        }
      }
    }

    object.addToKey('', {
      x: 'e'
    }, {
      matchProperties: {
        d: 'g'
      }
    });

    expect(object).toEqual({
      a: {
        b: {
          d: 'g',
          x: 'e'
        },
        f: {
          c: 'c'
        }
      }
    })
  });

  it('adds key to all object (relative to one object found and no arrays)', () => {
    const object = {
      a: {
        b: {
          d: 'g',
          t: 't',
        },
        f: {
          c: 'c',
          f: 'f',
          d: 'g',
        }
      }
    }

    object.addToKey('', {
      x: 'e'
    }, {
      matchProperties: {
        d: 'g'
      }
    });

    expect(object).toEqual({
      a: {
        b: {
          d: 'g',
          t: 't',
          x: 'e'
        },
        f: {
          c: 'c',
          f: 'f',
          d: 'g',
          x: 'e'
        }
      }
    });
  });

  it(' adds keys to an object inside an array', () => {
    const object = {
      a: {
        b: {
          d: 'g',
          t: 't',
        },
        f: [{
          c: 'c',
          f: 'f',
          d: 'g',
        }]
      }
    }

    object.addToKey('', {
      x: {
        y: 'y'
      }
    }, {
      matchProperties: {
        d: 'g'
      }
    });

    expect(object).toEqual({
      a: {
        b: {
          d: 'g',
          t: 't',
          x: {
            y: 'y'
          }
        },
        f: [{
          c: 'c',
          f: 'f',
          d: 'g',
          x: {
            y: 'y'
          }
        }]
      }
    });
  });

  it('injects object to relative path inside found object by settings', () => {
    const object = {
      a: {
        b: {
          t: 't',
        },
        f: [{
          c: 'c',
          f: 'f',
          d: 'g',
          x: {
            j: 'j'
          }
        }]
      }
    }

    object.addToKey('x', {
      o: {
        y: 'y'
      }
    }, {
      matchProperties: {
        d: 'g'
      }
    });

    expect(object).toEqual({
      a: {
        b: {
          t: 't'
        },
        f: [{
          c: 'c',
          f: 'f',
          d: 'g',
          x: {
            j: 'j',
            o: {
              y: 'y'
            }
          }
        }]
      }
    });
  });
});