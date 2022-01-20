class Tag {
  name: string
  frames: TagFrame[]

  constructor(name: string) {
    this.name = name
    this.frames = []
  }
  appendFrame(type: string, value: string) {
    const frame = new TagFrame(type, value)
    this.frames.push(frame)
    return frame
  }
}

class TagFrame {
  type: string
  value: string[]
  constructor(type: string, value: string) {
    this.type = type
    this.value = [value]
  }
  appendValue(value: string) {
    this.value.push(value)
  }
}

export default Tag
export { Tag, TagFrame }

