<template>
  <fieldset class="skill-branch-layout-normal border-1 border-light p-2 pt-1 bg-white">
    <legend class="flex items-center px-3">
      <cy-icon-text
        :icon="nameIcon"
        text-color="purple"
      >
        {{ container.get('name') }}
      </cy-icon-text>
      <div v-if="nameProps" class="inline-flex text-sm self-end space-x-1.5 ml-3">
        <span v-for="nameProp in nameProps" :key="nameProp" class="inline-block text-green">
          {{ nameProp }}
        </span>
      </div>
    </legend>
    <div v-if="subContentDatas" class="fles items-center flex-wrap px-1">
      <template v-for="contentData in subContentDatas" :key="contentData.key">
        <span class="sub-content-item">
          <cy-icon-text
            size="small"
            :text-color="contentData.color"
            :icon="contentData.icon"
          >
            <span v-html="contentData.title"></span>
          </cy-icon-text>
          <span v-if="contentData.value" class="text-light-3 text-sm ml-1.5">
            {{ contentData.value }}
          </span>
        </span>
      </template>
    </div>
    <div class="px-1">
      <slot></slot>
    </div>
    <div>
      <slot name="extra"></slot>
    </div>
  </fieldset>
</template>

<script lang="ts" setup>
import { computed, toRefs } from '@vue/reactivity';

import DisplayDataContainer from '../branch-handlers/utils/DisplayDataContainer';

interface Props {
  container: DisplayDataContainer;
  nameProps?: string[];
  nameIcon?: string;
  subContents?: {
    key: string;
    icon: string;
    title?: string;
    color?: string;
    value?: string;
  }[];
}

const props = withDefaults(defineProps<Props>(), {
  nameIcon: 'mdi-checkbox-multiple-blank-circle',
});
const { container, subContents } = toRefs(props);

const subContentDatas = computed(() => {
  if (!subContents?.value) {
    return [];
  }
  return subContents.value
    .filter(subContent => subContent.key.split('|').every(key => container.value.has(key)))
    .map(subContent => {
      return {
        key: subContent.key,
        icon: subContent.icon,
        title: subContent.title ?? container.value.get(subContent.key),
        color: subContent.value ? 'dark' : (subContent.color ? subContent.color : 'light-3'),
        value: subContent.value ?? '',
      };
    })
    .filter(item => item.title || (item.title && item.value));
});
</script>

<style lang="postcss">
.sub-content-item {
  margin: 0.1rem 0;
  @apply mr-3 inline-flex items-center;
}

.skill-branch-layout-normal {
  @media screen and (min-width: 40rem) {
    min-width: 30rem;
  }
}
</style>
