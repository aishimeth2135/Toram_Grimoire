import GlossaryTag from './GlossaryTag'

export default class GlossarySystem {
  tags: GlossaryTag[]

  constructor() {
    this.tags = []
  }
  appendTag(name: string) {
    const tag = new GlossaryTag(name)
    this.tags.push(tag)
    return tag
  }
}
