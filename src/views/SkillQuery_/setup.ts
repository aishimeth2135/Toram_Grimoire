import { ref, computed, provide, reactive, watch, nextTick } from 'vue';
import type { Ref, ComputedRef, WritableComputedRef } from 'vue';

import Grimoire from '@/shared/Grimoire';

import SkillComputingContainer, { SkillItem } from '@/lib/Skill/SkillComputingContainer';
import { Skill } from '@/lib/Skill/Skill';
import Tag from '@/lib/Tag/Tag';

import { findStackState, TAG_BUTTON_CLASS_NAME } from './utils';
import { ComputingContainerInjectionKey, SkillTagInjectionKey } from './injection-keys';

function setupSkillTag(detailModal: Ref<{ $el: HTMLElement } | null>) {
  const positionElement: Ref<null | HTMLElement> = ref(null);
  const currentTags: Ref<Tag[]> = ref([]);
  const _tagModalVisible = ref(false);

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

  const tagModalVisible: WritableComputedRef<boolean> = computed({
    get() {
      return _tagModalVisible.value;
    },
    set(value) {
      if (!value) {
        clearTag();
      }
      _tagModalVisible.value = value;
    },
  });

  const handleTagButtonContent = (el: HTMLElement): void => {
    if (!el.querySelector) {
      return;
    }
    const enter = function(this: HTMLElement) {
      clearTag();
      appendTag(this.innerText);
      positionElement.value = this;
    };
    const leave = function() {
      if (!tagModalVisible.value) {
        clearTag();
      }
    };
    const click = function() {
      tagModalVisible.value = true;
    };
    el.querySelectorAll('.' + TAG_BUTTON_CLASS_NAME)
      .forEach((node) => {
        const tagButton = node as HTMLElement;
        if (tagButton.getAttribute('data-tag-listener-flag') === '1') {
          return;
        }
        if (!findTag(tagButton.innerText)) {
          return;
        }
        tagButton.addEventListener('mouseenter', enter);
        tagButton.addEventListener('mouseleave', leave);
        tagButton.addEventListener('click', click);
        tagButton.setAttribute('data-tag-listener-flag', '1');
      });
  };

  watch(currentTags, async () => {
    await nextTick();
    if (detailModal.value && detailModal.value.$el && detailModal.value.$el.querySelectorAll) {
      const click = function(this: HTMLElement, error: Event) {
        error.stopPropagation();
        appendTag(this.innerText);
      };
      detailModal.value.$el.querySelectorAll('.' + TAG_BUTTON_CLASS_NAME)
        .forEach(el => {
          if (el.getAttribute('data-tag-listener-flag') === '1')
            return;
          el.addEventListener('click', click);
          el.setAttribute('data-tag-listener-flag', '1');
        });
    }
  });

  provide(SkillTagInjectionKey, {
    handleTagButtonContent,
  });

  return {
    currentTags,
    clearTag,
    tagModalVisible,
    positionElement,
    handleTagButtonContent,
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
