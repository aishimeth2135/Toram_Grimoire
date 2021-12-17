import { ref, computed, provide, reactive, watch, nextTick } from 'vue';
import type { Ref, ComputedRef } from 'vue';

import Grimoire from '@/shared/Grimoire';

import SkillComputingContainer, { SkillItem } from '@/lib/Skill/SkillComputingContainer';
import { Skill } from '@/lib/Skill/Skill';
import Tag from '@/lib/Tag/Tag';

import { findStackState, TAG_BUTTON_CLASS_NAME } from './utils';
import { ComputingContainerInjectionKey } from './injection-keys';

function setupSkillTag(tagContent: Ref<{ $el: HTMLElement } | null>) {
  const currentTags: Ref<Tag[]> = ref([]);

  const findTag = (tagName: string): Tag | null => {
    const tag = Grimoire.Tag.tagList.find(item => item.name === tagName);
    return tag || null;
  };

  const appendTag = (tagName: string): void => {
    const tag = findTag(tagName);
    if (tag) {
      currentTags.value.push(tag);
    }
  };

  const clearTag = () => {
    currentTags.value = [];
  };

  watch(currentTags, async () => {
    await nextTick();
    if (tagContent.value && tagContent.value.$el && tagContent.value.$el.querySelectorAll) {
      const click = function(this: HTMLElement, error: Event) {
        error.stopPropagation();
        appendTag(this.innerText);
      };
      tagContent.value.$el.querySelectorAll('.' + TAG_BUTTON_CLASS_NAME)
        .forEach(el => {
          if (el.getAttribute('data-tag-listener-flag') === '1')
            return;
          el.addEventListener('click', click);
          el.setAttribute('data-tag-listener-flag', '1');
        });
    }
  });

  const tagButtonHover = (el: HTMLElement) => {
    clearTag();
    appendTag(el.innerText);
  };

  return {
    currentTags,
    clearTag,
    tagButtonHover,
  };
}

function setupComputingContainer(skill: Ref<Skill | null>) {
  const computingContainer: Ref<SkillComputingContainer> = ref(new SkillComputingContainer());
  const FORMULA_REPLACED_VARS = [
    'BSTR', 'BINT', 'BAGI', 'BVIT', 'BDEX', 'TEC',
    'STR', 'INT', 'AGI', 'VIT', 'DEX', 'shield_refining',
    'dagger_atk', 'target_def', 'target_level', 'guard_power',
  ];
  FORMULA_REPLACED_VARS.forEach(varName => {
    computingContainer.value.handleFormulaExtends.texts['$' + varName] = Grimoire.i18n.t(`skill-query.branch.formula-replaced-text.${varName}`);
  });

  const currentSkillItem: ComputedRef<SkillItem | null> = computed(() => {
    if (!skill.value) {
      return null;
    }
    return reactive(computingContainer.value.createSkillItem(skill.value)) as SkillItem;
  });

  const setStackValue = (stackId: number, value: number) => {
    currentSkillItem.value?.effectItems.forEach(effectItem => {
      const stackState = findStackState(effectItem, stackId);
      if (stackState) {
        stackState.value = value;
      }
    });
  };

  provide(ComputingContainerInjectionKey, { setStackValue });

  return {
    currentSkillItem,
    computingContainer,
  };
}

export {
  setupSkillTag,
  setupComputingContainer,
};
