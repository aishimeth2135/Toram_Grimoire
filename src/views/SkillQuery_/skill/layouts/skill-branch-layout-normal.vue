<template>
  <fieldset class="p-1">
    <legend>
      <cy-icon-text
        class="mr-3"
        :icon="nameIcon"
        text-color="purple"
      >
        {{ container.get('name') }}
      </cy-icon-text>
      <div v-if="nameProps" class="inline-flex text-sm self-end space-x-1.5">
        <span v-for="nameProp in nameProps" :key="nameProp" class="inline-block text-green">
          {{ nameProp }}
        </span>
      </div>
    </legend>
    <div v-if="subContentDatas" class="fles items-center flex-wrap px-1 mb-1">
      <template v-for="contentData in subContentDatas" :key="contentData.key">
        <span class="sub-content-item">
          <cy-icon-text
            size="small"
            :text-color="contentData.value ? 'dark' : (contentData.color ? contentData.color : 'light-3')"
            :icon="contentData.icon"
          >
            <span v-html="contentData.label"></span>
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
  </fieldset>
</template>

<script lang="ts" setup>
import DisplayDataContainer from '../branch-handlers/utils/DisplayDataContainer';

interface Prop {
  container: DisplayDataContainer;
  nameProps?: string[];
  nameIcon?: string[];
  subContentDatas?: {
    key: string;
    icon: string;
    label: string;
    color?: string;
    value?: string;
  }[];
}

defineProps<Prop>();
</script>

<style lang="postcss">
.sub-content-item {
  margin: 0.1rem 0;
  @apply mr-3 inline-flex items-center;
}
</style>
