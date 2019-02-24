import '../objectUtils';

describe('find root object suite', () => {
  it('finds object pointer at path', () => {
    const object = {
      a: {
        b: 'c'
      },
      e: [1, 2, 3]
    }

    expect(object.findRootObject({
      path: 'a.b'
    })).toBe(object.a.b);
    expect(object.findRootObject({
      path: 'a'
    })).toBe(object.a);
    expect(object.findRootObject({
      path: 'e'
    })).toBe(object.e);
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

    expect(object.findRootObject({
      path: 'a.b.d'
    })).toBe(undefined);
    expect(object.findRootObject({
      path: 'a.e'
    })).toBe(undefined);
    expect(object.findRootObject({
      path: 'a.c.d'
    })).toBe(undefined);
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
    const insideObject = object.findRootObject({
      path: 'a.d'
    });
    expect(insideObject.findRootObject({
      path: 'f'
    })).toBe(object.a.d.f);
    expect(insideObject.findRootObject({
      path: 'f'
    })).toBe(insideObject.f);
  });
});