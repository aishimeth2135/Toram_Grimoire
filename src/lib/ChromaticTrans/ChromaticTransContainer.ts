import { markRaw } from 'vue'

import { ChromaticTransStep } from './ChromaticTransStep'
import { type ChromaticTransGem, getBaseGemColor, isBaseGem } from './gems'

export class ChromaticTransContainer {
  private selections: (ChromaticTransGem | null)[]
  private currentSteps: readonly ChromaticTransStep[]

  private constructor(
    selections: (ChromaticTransGem | null)[],
    currentSteps: readonly ChromaticTransStep[]
  ) {
    this.selections = selections
    this.currentSteps = currentSteps

    this.recalculate()
  }

  static create(): ChromaticTransContainer {
    return new ChromaticTransContainer(markRaw(Array.from({ length: 5 }, () => null)), markRaw([]))
  }

  get steps(): readonly ChromaticTransStep[] {
    return this.currentSteps
  }

  get pool(): readonly number[] {
    return this.steps[this.steps.length - 1].pool
  }

  selectGem(index: number, gem: ChromaticTransGem | null): void {
    if (!this.steps[index] || (index === 0 && gem !== null && !isBaseGem(gem))) {
      return
    }

    this.selections[index] = gem
    if (index === 0 && gem === null) {
      this.selections.fill(null)
    }
    this.recalculate()
  }

  previewGem(index: number, gem: ChromaticTransGem): ChromaticTransStep {
    if (!this.steps[index]) {
      return this.steps[0]
    }

    return ChromaticTransStep.create(index, gem, this.steps[index - 1])
  }

  getGemPreviewColor(index: number, gem: ChromaticTransGem): number {
    if (isBaseGem(gem)) {
      return getBaseGemColor(gem)
    }
    if (gem === 'pearl' || gem === 'obsidian') {
      return gem === 'pearl' ? 1 : 5
    }
    if (gem === 'diamond') {
      return this.steps[index - 1]?.color ?? 0
    }
    return this.previewGem(index, gem).color
  }

  private recalculate(): void {
    const steps: ChromaticTransStep[] = markRaw([])
    const count = this.selections[0] ? 5 : 1
    for (let index = 0; index < count; index += 1) {
      steps.push(
        ChromaticTransStep.createWithMarkRaw(index, this.selections[index], steps[index - 1])
      )
    }
    this.currentSteps = steps
  }
}
