import {
  type ComputedRef,
  type EffectScope,
  computed,
  effectScope,
  onScopeDispose,
  shallowRef,
  watch,
} from 'vue'

import { useCharacterStore } from '@/stores/views/character'
import type {
  CharacterStatCategoryResult,
  CharacterStatResultWithId,
} from '@/stores/views/character/setup/setupCharacter'

import type { Character } from '@/lib/Character/Character'

export interface CharacterComparisonColumn {
  character: Character
  stats: Map<string, CharacterStatResultWithId>
}

export function useCharacterComparisonColumns(comparedCharacters: ComputedRef<Character[]>) {
  const characterStore = useCharacterStore()
  const calculators = shallowRef<Map<number, ComputedRef<CharacterStatCategoryResult[]>>>(new Map())
  let scope: EffectScope | undefined

  watch(
    comparedCharacters,
    characters => {
      scope?.stop()
      scope = effectScope()
      const next = new Map<number, ComputedRef<CharacterStatCategoryResult[]>>()
      scope.run(() => {
        characters.forEach(character => {
          next.set(
            character.id,
            characterStore.setupCharacterComparedStatCategoryResults(
              shallowRef<Character>(character)
            )
          )
        })
      })
      calculators.value = next
    },
    { immediate: true }
  )

  onScopeDispose(() => scope?.stop())

  return computed<CharacterComparisonColumn[]>(() => {
    const characters = [characterStore.currentCharacter, ...comparedCharacters.value]
    return characters.map(character => {
      const categories =
        character.id === characterStore.currentCharacter.id
          ? characterStore.characterStatCategoryResults
          : (calculators.value.get(character.id)?.value ?? [])
      return {
        character,
        stats: new Map(
          categories.flatMap(category => category.stats.map(stat => [stat.id, stat] as const))
        ),
      }
    })
  })
}
