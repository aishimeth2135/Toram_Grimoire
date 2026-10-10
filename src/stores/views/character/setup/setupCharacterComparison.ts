import { type Ref, ref } from 'vue'

import Grimoire from '@/shared/Grimoire'
import { useNotify } from '@/shared/composables/Notify'

import type { Character } from '@/lib/Character/Character'
import {
  CHARACTER_COMPARISON_TABLE_LIMIT,
  CharacterComparisonTable,
} from '@/lib/Character/CharacterComparisonTable'

function createDefaultTables(): CharacterComparisonTable[] {
  const t = Grimoire.i18n.t
  return [
    new CharacterComparisonTable(t('character-simulator.character-comparison.physical'), [
      'atk',
      'physical_pierce',
      'stability',
      'critical_rate',
      'critical_damage',
      'accuracy',
      'max_mp',
      'attack_mp_recovery',
      'motion_time',
    ]),
    new CharacterComparisonTable(t('character-simulator.character-comparison.magic'), [
      'atk',
      'magic_pierce',
      'magic_stability_min',
      'magic_stability_max',
      'magic_critical_rate',
      'magic_critical_damage',
      'max_mp',
      'cspd',
    ]),
    new CharacterComparisonTable(t('character-simulator.character-comparison.survival'), [
      'max_hp',
      'physical_resistance',
      'magic_resistance',
      'reduce_dmg_physical',
      'reduce_dmg_magic',
      'ailment_resistance',
    ]),
  ]
}

export function setupCharacterComparisonTables(characters: Ref<Character[]>) {
  const comparisonTables = ref<CharacterComparisonTable[]>(createDefaultTables())
  const notify = useNotify()

  const appendComparisonTable = (table?: CharacterComparisonTable) => {
    if (comparisonTables.value.length >= CHARACTER_COMPARISON_TABLE_LIMIT) {
      notify(
        Grimoire.i18n.t('character-simulator.build-limit-reached', {
          num: CHARACTER_COMPARISON_TABLE_LIMIT,
        })
      )
      return
    }

    comparisonTables.value.push(
      table ??
        new CharacterComparisonTable(
          Grimoire.i18n.t('character-simulator.character-comparison.new-table')
        )
    )
  }

  const removeComparisonTable = (table: CharacterComparisonTable) => {
    comparisonTables.value = comparisonTables.value.filter(item => item.id !== table.id)
    characters.value.forEach(character => {
      const build = character.comparisonTableBuild
      build.tables = build.tables.filter(item => item.id !== table.id)
    })
  }

  const resetComparisonTables = () => {
    comparisonTables.value = createDefaultTables()
  }

  return { comparisonTables, appendComparisonTable, removeComparisonTable, resetComparisonTables }
}
