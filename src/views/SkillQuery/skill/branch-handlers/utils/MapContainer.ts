export default class MapContainer<AttrMap extends Record<string, any>> {
  private _attrMap: AttrMap

  constructor(mapOrKeys?: string[] | AttrMap) {
    if (Array.isArray(mapOrKeys)) {
      this._attrMap = keysToAttrMap<AttrMap>(mapOrKeys)
    } else if (typeof mapOrKeys === 'object') {
      this._attrMap = mapOrKeys
    } else {
      this._attrMap = {} as AttrMap
    }
  }

  append(...keys: (keyof AttrMap)[]) {
    keys.forEach(key => this._attrMap[key] = (null) as AttrMap[keyof AttrMap])
  }

  appendIterable(key: keyof AttrMap, length: number) {
    Array(length).fill(0).forEach((value, idx) => {
      this._attrMap[`${String(key)}.${idx}` as keyof AttrMap] = (null) as AttrMap[keyof AttrMap]
    })
  }

  remove(key: keyof AttrMap) {
    delete this._attrMap[key]
  }

  set(key: keyof AttrMap, value: AttrMap[keyof AttrMap]) {
    this._attrMap[key] = value
  }

  get value() {
    return this._attrMap
  }
}

function keysToAttrMap<T extends Record<string, any>>(keys: string[]): T {
  const newAttrMap = {} as Record<string, any>
  keys.forEach(key => newAttrMap[key] = null)
  return newAttrMap as T
}
