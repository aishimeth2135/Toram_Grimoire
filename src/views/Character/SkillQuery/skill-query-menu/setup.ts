import { type Ref, computed, ref, watch } from 'vue'

import Grimoire from '@/shared/Grimoire'

import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'
import { EquipmentTypes, isSubWeaponCompatible } from '@/lib/Character/CharacterEquipment'
import { EquipmentRestrictions, type EquipmentRestrictionsBaseKeys } from '@/lib/Character/Stat'
import { SkillTree } from '@/lib/Skill/Skill'
import { convertEffectEquipment } from '@/lib/Skill/SkillComputing'

function setupEquipmentSelect(
  skillTree: Ref<SkillTree>,
  emit: (event: 'update:selected-equipment', data: EquipmentRestrictions) => void
) {
  const { t } = Grimoire.i18n

  const equipmentOptionsMapping = computed(() => {
    const mainList = new Set<EquipmentTypes | null>()
    const subList = new Set<EquipmentTypes | null>()
    const bodyList = new Set<EquipmentTypes | null>()
    skillTree.value.skills.forEach(skill => {
      skill.effects.forEach(effect => {
        const data = convertEffectEquipment(effect)
        data.forEach(item => {
          mainList.add(item.main)
          subList.add(item.sub)
          bodyList.add(item.body)
        })
      })
    })
    // ensure null is at the end of list
    mainList.delete(null)
    subList.delete(null)
    bodyList.delete(null)

    return {
      main: [...mainList, null],
      sub: [...subList, null],
      body: [...bodyList, null],
    }
  })

  const currentEquipment: Ref<EquipmentRestrictions> = ref(EquipmentRestrictions.create())

  const submitCurrentEquipment = () => {
    emit('update:selected-equipment', currentEquipment.value)
  }

  function handleToggleCurrentEquipment(
    key: EquipmentRestrictionsBaseKeys,
    confirmConflict: boolean,
    force?: EquipmentTypes | null
  ) {
    const list = equipmentOptionsMapping.value[key]
    const idx = list.indexOf(currentEquipment.value[key])
    force = force === undefined ? list[idx > -1 && idx !== list.length - 1 ? idx + 1 : 0] : force
    currentEquipment.value[key] = force
    if (key !== 'body' && confirmConflict) {
      confirmWeaponConflict(key)
    }
  }

  const toggleCurrentEquipment = (
    key: EquipmentRestrictionsBaseKeys,
    force?: EquipmentTypes | null
  ) => {
    handleToggleCurrentEquipment(key, true, force)
    submitCurrentEquipment()
  }

  function confirmWeaponConflict(target: 'main' | 'sub') {
    const check = () => {
      const { main, sub } = currentEquipment.value
      if (main === null || sub === null || sub === EquipmentTypes.Empty) {
        return true
      }
      // Skill Query represents dual swords as a main weapon type.
      if (sub === EquipmentTypes.OneHandSword) {
        return false
      }
      return isSubWeaponCompatible(main, sub)
    }
    while (!check()) {
      handleToggleCurrentEquipment(target === 'main' ? 'sub' : 'main', false)
    }
  }

  const getEquipmentText = (value: EquipmentTypes | null) => {
    return value !== null
      ? t(`common.Equipment.category.${value}`)
      : t('skill-query.equipment.no-select')
  }

  const getEquipmentImagePath = (value: EquipmentTypes | null) => {
    return value !== null ? CharacterEquipment.getImagePath(value) : ''
  }

  const resetCurrentEquipment = () => {
    const options = equipmentOptionsMapping.value
    currentEquipment.value.main = options.main.length === 0 ? null : options.main[0]
    currentEquipment.value.sub = options.sub.length === 0 ? null : options.sub[0]
    currentEquipment.value.body = options.body.length === 0 ? null : options.body[0]
    confirmWeaponConflict('main')
    submitCurrentEquipment()
  }

  const equipmentOptions = computed(() => {
    const datas: {
      key: EquipmentRestrictionsBaseKeys
      value: (EquipmentTypes | null)[]
    }[] = []
    Object.entries(equipmentOptionsMapping.value).forEach(([key, value]) => {
      if (value.length === 1 && value[0] === null) {
        return
      }
      datas.push({ key: key as EquipmentRestrictionsBaseKeys, value })
    })
    return datas
  })

  watch(equipmentOptions, () => resetCurrentEquipment(), { immediate: true })

  return {
    equipmentOptions,
    getEquipmentText,
    getEquipmentImagePath,
    toggleCurrentEquipment,
  }
}

function setupSkillLevel(skillLevel: Ref<number>) {
  const levels = [1, 5, 10]
  const toggleSkillLevel = () => {
    const idx = levels.indexOf(skillLevel.value)
    const newValue = levels[idx !== -1 && idx !== levels.length - 1 ? idx + 1 : 0]
    skillLevel.value = newValue
  }

  return {
    toggleSkillLevel,
  }
}

export { setupEquipmentSelect, setupSkillLevel }
