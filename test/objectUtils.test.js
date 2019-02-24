import '../objectUtils';

describe('find root object suite', () => {
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