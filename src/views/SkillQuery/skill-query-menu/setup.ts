import { ref, computed, watch } from 'vue';
import type { Ref } from 'vue';

import Grimoire from '@/shared/Grimoire';

import { SkillTree } from '@/lib/Skill/Skill';
import { convertEffectEquipment } from '@/lib/Skill/SkillComputingContainer/utils';
import { EquipmentRestriction } from '@/lib/Skill/SkillComputingContainer';
import { EquipmentTypes } from '@/lib/Character/CharacterEquipment/enums';
import { CharacterEquipment } from '@/lib/Character/CharacterEquipment';

function setupEquipmentSelect(
  skillTree: Ref<SkillTree>,
  emit: (event: 'update:selected-equipment', data: EquipmentRestriction) => void,
) {
  const { t } = Grimoire.i18n;

  const equipmentOptionsMapping = computed(() => {
    const mainList = new Set<EquipmentTypes | null>();
    const subList = new Set<EquipmentTypes | null>();
    const bodyList = new Set<EquipmentTypes | null>();
    skillTree.value.skills.forEach(skill => {
      skill.effects.forEach(effect => {
        const data = convertEffectEquipment(effect.mainWeapon, effect.subWeapon, effect.bodyArmor, effect.equipmentOperator);
        data.forEach(item => {
          mainList.add(item.main);
          subList.add(item.sub);
          bodyList.add(item.body);
        });
      });
    });
    // ensure null is at the end of list
    mainList.delete(null);
    subList.delete(null);
    bodyList.delete(null);

    return {
      main: [...mainList, null],
      sub: [...subList, null],
      body: [...bodyList, null],
    };
  });

  const currentEquipment: Ref<EquipmentRestriction> = ref({
    main: null,
    sub: null,
    body: null,
  });

  const submitCurrentEquipment = () => {
    emit('update:selected-equipment', currentEquipment.value);
  };

  function handleToggleCurrentEquipment(key: keyof EquipmentRestriction, confirmConflict: boolean, force?: EquipmentTypes | null) {
    const list = equipmentOptionsMapping.value[key];
    const idx = list.indexOf(currentEquipment.value[key]);
    force = force === undefined ? list[idx > -1 && idx !== list.length - 1 ? idx + 1 : 0] : force;
    currentEquipment.value[key] = force;
    if (key !== 'body' && confirmConflict) {
      confirmWeaponConflict(key);
    }
  }

  const toggleCurrentEquipment = (key: keyof EquipmentRestriction, force?: EquipmentTypes | null) => {
    handleToggleCurrentEquipment(key, true, force);
    submitCurrentEquipment();
  };

  function confirmWeaponConflict(target: 'main' | 'sub') {
    const check = () => {
      const main = currentEquipment.value.main,
        sub = currentEquipment.value.sub;
      if (main === null || sub === null) {
        return true;
      }
      const validSubs: Set<EquipmentTypes | null> = new Set();
      switch (main) {
        case EquipmentTypes.Empty:
        case EquipmentTypes.OneHandSword:
        case EquipmentTypes.Staff:
          validSubs.add(EquipmentTypes.NinjutsuScroll);
        /* falls through */
        case EquipmentTypes.Bowgun:
          validSubs.add(EquipmentTypes.Knuckle);
        /* falls through */
        case EquipmentTypes.Knuckle:
          validSubs
            .add(EquipmentTypes.Arrow)
            .add(EquipmentTypes.Shield)
            .add(EquipmentTypes.Dagger)
            .add(EquipmentTypes.MagicDevice);
          break;
        case EquipmentTypes.Katana:
          validSubs
            .add(EquipmentTypes.Dagger)
            .add(EquipmentTypes.NinjutsuScroll);
          break;
        case EquipmentTypes.Halberd:
          validSubs
            .add(EquipmentTypes.Arrow)
            .add(EquipmentTypes.Dagger);
          break;
        case EquipmentTypes.Bow:
          validSubs
            .add(EquipmentTypes.Arrow)
            .add(EquipmentTypes.Katana);
          break;
        case EquipmentTypes.MagicDevice:
          validSubs.add(EquipmentTypes.NinjutsuScroll);
      }
      validSubs.add(EquipmentTypes.Empty);
      return validSubs.has(sub);
    };
    while (!check()) {
      handleToggleCurrentEquipment(target === 'main' ? 'sub' : 'main', false);
    }
  }

  const getEquipmentText = (value: EquipmentTypes | null) => {
    return value !== null ? t(`common.Equipment.category.${value}`) : t('skill-query.equipment.no-select');
  };

  const getEquipmentImagePath = (value: EquipmentTypes | null) => {
    return value !== null ? CharacterEquipment.getImagePath(value) : 'mdi:radiobox-marked';
  };

  const resetCurrentEquipment = () => {
    const options = equipmentOptionsMapping.value;
    currentEquipment.value.main = options.main.length === 0 ? null : options.main[0];
    currentEquipment.value.sub = options.sub.length === 0 ? null : options.sub[0];
    currentEquipment.value.body = options.body.length === 0 ? null : options.body[0];
    confirmWeaponConflict('main');
    submitCurrentEquipment();
  };

  const equipmentOptions = computed(() => {
    const datas: { key: keyof EquipmentRestriction; value: (EquipmentTypes | null)[] }[] = [];
    Object.entries(equipmentOptionsMapping.value).forEach(([key, value]) => {
      if (value.length === 1 && value[0] === null) {
        return;
      }
      datas.push({ key: key as keyof EquipmentRestriction, value });
    });
    return datas;
  });

  watch(equipmentOptions, () => resetCurrentEquipment(), { immediate: true });

  return {
    equipmentOptions,
    getEquipmentText,
    getEquipmentImagePath,
    toggleCurrentEquipment,
  };
}

function setupSkillLevel(skillLevel: Ref<number>) {
  const levels = [1, 5, 10];
  const toggleSkillLevel = () => {
    const idx = levels.indexOf(skillLevel.value);
    const newValue = levels[idx !== -1 && idx !== levels.length - 1 ? idx + 1 : 0];
    skillLevel.value = newValue;
  };

  return {
    toggleSkillLevel,
  };
}

export {
  setupEquipmentSelect,
  setupSkillLevel,
};

