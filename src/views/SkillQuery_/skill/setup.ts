
import { ref, provide, onUpdated } from 'vue';
import type { Ref } from 'vue';

import { SkillTagInjectionKey } from './injection-keys';
import { createTagButtons, TAG_BUTTON_CLASS_NAME } from './branch-handlers/utils';

function SkillTag(detailWindow: Ref<HTMLElement | null>) {
  const positionElement: Ref<null | HTMLElement> = ref(null);
  const currentTags: Ref<{ name: string }[]> = ref([]);
  const tagWindowVisible = ref(false);

  const appendTag = (tagName: string) => {
    currentTags.value.push({
      name: tagName,
    });
  };

  const clearTag = () => {
    currentTags.value = [];
  };

  const handleTagButtonContent = (el: HTMLElement): void => {
    if (!el.querySelector)
      return;
    const enter = function(this: HTMLElement) {
      clearTag();
      appendTag(this.innerText);
      positionElement.value = this;
    };
    const leave = function() {
      if (!tagWindowVisible.value)
        clearTag();
    };
    const click = function() {
      tagWindowVisible.value = true;
    };
    el.querySelectorAll('.' + TAG_BUTTON_CLASS_NAME)
      .forEach((node) => {
        const tagButton = node as HTMLElement;
        if (!currentTags.value.find(tag => tag.name === tagButton.innerText))
          return;
        tagButton.addEventListener('mouseenter', enter);
        tagButton.addEventListener('mouseleave', leave);
        tagButton.addEventListener('click', click);
      });
  };

  onUpdated(() => {
    if (detailWindow.value) {
      const click = function(this: HTMLElement, error: Event) {
        error.stopPropagation();
        appendTag(this.innerText);
      };
      detailWindow.value.querySelectorAll('.' + TAG_BUTTON_CLASS_NAME)
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
    handleTagButtonContent,
    createTagButtons,
  };
}

export {
  SkillTag,
};
