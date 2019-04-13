const Mutate = require('../objectUtils').Mutate;

describe('find root object suite', () => {
  it('returns undefined if no object is found', () => {
    const object = new Mutate({
      a: 'd'
    });
    expect(object.findRootObjectByPath('f')).toBe(undefined);
  });

  it('inserts object at root', () => {
    const object = new Mutate({
      a: {
        b: 'c'
      },
      e: [1, 2, 3]
    })

    expect(object.findRootObjectByPath('')).toBe(object.value());
  });

  it('finds object pointer at path', () => {
    const object = new Mutate({
      a: {
        b: 'c'
      },
      e: [1, 2, 3]
    });

    expect(object.findRootObjectByPath('a.b')).toBe(object.value().a.b);
    expect(object.findRootObjectByPath('a')).toBe(object.value().a);
    expect(object.findRootObjectByPath('e')).toBe(object.value().e);
  });

  it('doesn\'t find object pointer if not existent', () => {
    const object = new Mutate({
      a: {
        b: 'c',
        d: {
          f: []
        }
      },
      g: {}
    });

    expect(object.findRootObjectByPath('a.b.d')).toBe(undefined);
    expect(object.findRootObjectByPath('a.e')).toBe(undefined);
    expect(object.findRootObjectByPath('a.c.d')).toBe(undefined);
  });

  it('finds correct object inside another object', () => {
    const object = new Mutate({
      a: {
        b: 'c',
        d: {
          f: []
        }
      },
      g: {
        h: {}
      }
    });

    const insideObject = new Mutate(object.findRootObjectByPath('a.d'));
    expect(insideObject.findRootObjectByPath('f')).toBe(object.value().a.d.f);
    expect(insideObject.findRootObjectByPath('f')).toBe(insideObject.value().f);
  });
});

describe('does object match by properties', () => {
  it('compares if 2 objects match with same values', () => {
    const properties = {
      a: {},
      b: 'c',
      d: {}
    }
    const obj = new Mutate({
      a: {},
      b: 'c',
      d: {},
      f: []
    });

    expect(obj.doesObjectMatchByProperties(properties)).toEqual(true);
  });

  it('compares if 2 objects match with different values', () => {
    const properties = {
      a: 'value1',
      b: 'value2'
    };
    const obj = new Mutate({
      a: [
        'value1'
      ],
      b: 'value2'
    });
    expect(obj.doesObjectMatchByProperties(properties)).toEqual(false);
  });
});

describe('find root objectS by properties suite', () => {
  it('returns undefined if no object is found', () => {
    const properties = {
      a: 'c'
    }
    const obj = new Mutate({
      d: 'd'
    });

    expect(obj.findRootObjectByProperties(properties)).toEqual([]);
  });

  it('finds single object', () => {
    const obj = new Mutate({
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
    });

    const properties = {
      c: 'some value'
    }

    expect(obj.findRootObjectByProperties(properties)).toEqual([obj.value().a.b]);
  })

  it('finds object even if in array', () => {
    const obj = new Mutate({
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
    });

    const properties = {
      f: 'g',
      h: 'h'
    }

    expect(obj.findRootObjectByProperties(properties)).toEqual([
      obj.value().a.d.e[0]
    ]);
  });

  it('finds all objects with properties', () => {
    const obj = new Mutate({
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
    });

    const properties = {
      f: 'g',
      h: 'h'
    }

    expect(obj.findRootObjectByProperties(properties)).toEqual([
      obj.value().a.b, obj.value().a.d.e[0], obj.value().a.i.j[1]
    ]);
  })
});

describe('addToKey suite', () => {
  it('adds the key correctly', () => {
    const object = new Mutate({
      "type": "workflowEngine",
      "smt": "smt",
      "configuration": {
        "dasmdasmda": "lkasdlkas"
      }
    });

    object.addToKey('configuration', {
      props: {
        'adad': 'adada'
      }
    }, {
      matchProperties: {
        "type": "workflowEngine",
        "smt": "smt",
      }
    });
    expect(object.value()).toEqual({
      "type": "workflowEngine",
      "smt": "smt",
      "configuration": {
        "props": {
          'adad': 'adada'
        },
        "dasmdasmda": "lkasdlkas"
      }
    })
  });

  it('doesn\'t modify the object is key is not existent', () => {
    const object = new Mutate({
      a: {
        b: 'c'
      }
    });

    object.addToKey('d.r', 124);

    expect(object).toEqual(object);
  });

  it('doesn\'t modify the object is key is not existent (by matched properties)', () => {
    const object = new Mutate({
      a: {
        b: 'c'
      }
    });

    object.addToKey('d.r', 124, {
      matchProperties: {
        d: 4
      }
    });

    expect(object).toEqual(object);
  });

  it('adds a string as value to the key', () => {
    const object = new Mutate({
      a: {
        d: '12'
      }
    });

    object.addToKey('a.r', '12');

    expect(object.value()).toEqual({
      a: {
        d: '12',
        r: '12'
      }
    })
  });

  it('adds number to a key', () => {
    const object = new Mutate({
      a: {
        d: '12',
        b: {
          d: '12'
        }
      }
    });

    object.addToKey('x', 12, {
      matchProperties: {
        d: '12'
      }
    })

    expect(object.value()).toEqual({
      a: {
        d: '12',
        x: 12,
        b: {
          d: '12',
          x: 12
        }
      }
    })
  });

  it('adds key to simple object (absolute path)', () => {
    const object = new Mutate({
      a: {
        b: 'c'
      }
    });

    object.addToKey('a', {
      d: 'e'
    }, {
      isPathAbsolute: true
    });

    expect(object.value()).toEqual({
      a: {
        b: 'c',
        d: 'e'
      }
    });
  });

  it('overrides existing keys (absolute path)', () => {
    const object = new Mutate({
      a: {
        b: {
          d: 'g'
        }
      }
    });

    object.addToKey('a.b', {
      d: 'e'
    }, {
      isPathAbsolute: true
    });

    expect(object.value()).toEqual({
      a: {
        b: {
          d: 'e'
        }
      }
    });
  });

  it('adds key to simple object (relative to one object found)', () => {
    const object = new Mutate({
      a: {
        b: {
          d: 'g'
        },
        f: {
          c: 'c'
        }
      }
    });

    object.addToKey('', {
      x: 'e'
    }, {
      matchProperties: {
        d: 'g'
      }
    });

    expect(object.value()).toEqual({
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
    const object = new Mutate({
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
    });

    object.addToKey('', {
      x: 'e'
    }, {
      matchProperties: {
        d: 'g'
      }
    });

    expect(object.value()).toEqual({
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

  it('adds keys to an object inside an array', () => {
    const object = new Mutate({
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
    });

    object.addToKey('', {
      x: {
        y: 'y'
      }
    }, {
      matchProperties: {
        d: 'g'
      }
    });

    expect(object.value()).toEqual({
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
    const object = new Mutate({
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
    });

    object.addToKey('x', {
      o: {
        y: 'y'
      }
    }, {
      matchProperties: {
        d: 'g'
      }
    });

    expect(object.value()).toEqual({
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

describe('create key suite', () => {
  it('does not modify the object if path is not correct', () => {
    const object = new Mutate({
      a: 'b',
      c: {
        e: 12,
        d: {
          f: 14
        }
      }
    });

    object.createKey('c.x.x', 17);

    expect(object).toEqual(object);
  });

  it('creates simple key to simple object', () => {
    const object = new Mutate({
      a: 'b'
    });

    object.createKey('t', 'f');

    expect(object.value()).toEqual({
      a: 'b',
      t: 'f'
    });
  });

  it('creates key to deeper path', () => {
    const object = new Mutate({
      a: 'b',
      c: {
        e: 12,
        d: {
          f: 14
        }
      }
    });

    object.createKey('c.d.g', 17);

    expect(object.value()).toEqual({
      a: 'b',
      c: {
        e: 12,
        d: {
          f: 14,
          g: 17
        }
      }
    });
  })

  it('creates a key with an object', () => {
    const object = new Mutate({
      a: 'sd'
    });

    object.createKey('h', {
      i: 'd'
    })

    expect(object.value()).toEqual({
      a: 'sd',
      h: {
        i: 'd'
      }
    });
  });
});

describe('copy keys suite', () => {
  it('does not modify the object if the destination path is not correct', () => {
    const object = new Mutate({
      a: 'smt'
    });

    object.copyFromKey('d.g', 'b');

    expect(object.value()).toEqual({
      a: 'smt'
    })
  });

  it('copies simple key', () => {
    const object = new Mutate({
      a: 'smt'
    });

    object.copyFromKey('a', 'b');

    expect(object.value()).toEqual({
      a: 'smt',
      b: 'smt'
    })
  });

  it('copies from complex path', () => {
    const object = new Mutate({
      a: {
        b: {
          d: 'smt'
        }
      }
    });

    object.copyFromKey('a.b.d', 'a.c');

    expect(object.value()).toEqual({
      a: {
        b: {
          d: 'smt'
        },
        c: 'smt'
      }
    })
  });

  it('copies from found object with matched properties', () => {
    const object = new Mutate({
      a: {
        ref: {
          b: 'c',
          d: {
            h: 'f'
          }
        }
      }
    });

    object.copyFromKey('d', 'x', {
      matchProperties: {
        b: 'c'
      }
    });

    expect(object.value()).toEqual({
      a: {
        ref: {
          b: 'c',
          d: {
            h: 'f'
          },
          x: {
            h: 'f'
          }
        }
      }
    });
  });

  it('copies from key from complex paths', () => {
    const object = new Mutate({
      a: {
        ref: {
          b: 'c',
          d: {
            h: 'f'
          },
          g: {
            i: {

            }
          }
        }
      }
    });

    object.copyFromKey('d.h', 'g.i.x', {
      matchProperties: {
        b: 'c'
      }
    });

    expect(object.value()).toEqual({
      a: {
        ref: {
          b: 'c',
          d: {
            h: 'f'
          },
          g: {
            i: {
              x: 'f'
            }
          }
        }
      }
    })
  });

  it('copies from all found objects including those in arrays', () => {
    const object = new Mutate({
      a: {
        ref: {
          b: 'c',
          h: 12,
          d: {
            h: 'f'
          }
        },
        ref2: [{
            b: 'c',
            h: 12
          },
          {
            h: 12
          }
        ]
      }
    });

    object.copyFromKey('d', 'o', {
      matchProperties: {
        b: 'c',
        h: 12
      }
    })

    expect(object.value()).toEqual({
      a: {
        ref: {
          b: 'c',
          h: 12,
          d: {
            h: 'f'
          },
          o: {
            h: 'f'
          }
        },
        ref2: [{
            b: 'c',
            h: 12,
            o: undefined
          },
          {
            h: 12
          }
        ]
      }
    })
  });
});