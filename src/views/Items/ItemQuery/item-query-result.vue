<template>
  <div>
    <div ref="topHiddenFlag"></div>
    <div class="overflow-x-auto">
      <div class="min-w-min">
        <ItemQueryResultItem
          v-for="eq in currentResults"
          :key="eq.origin.id"
          :equipment="eq"
        />
      </div>
    </div>
    <div class="flex justify-center mt-4">
      <cy-button-border
        icon="akar-icons:circle-chevron-left"
        :disabled="previousPageDisabled"
        @click="previousPage"
      >
        {{ $lang('previous page') }}
      </cy-button-border>
      <cy-button-border
        icon="akar-icons:circle-chevron-right"
        :disabled="nextPageDisabled"
        @click="nextPage"
      >
        {{ $lang('next page') }}
      </cy-button-border>
    </div>
    <div class="flex justify-center text-sm text-light-2 mt-2">
      {{ $lang('current page', [pageCount + 1]) }}
    </div>
  </div>
</template>

<script>
import { computed, ref, nextTick, readonly, watch, toRefs } from 'vue';

import vue_ItemQueryResultItem from './item-query-result-item';

const NUMBER_OF_ITEMS_OF_PAGE = 30;

export default {
  RegisterLang: 'Item Query',
  components: {
    ItemQueryResultItem: vue_ItemQueryResultItem,
  },
  props: {
    equipments: {
      type: Array,
      required: true,
    },
  },
  setup(props) {
    const { equipments } = toRefs(props);
    const pageCount = ref(0);
    const currentResults = computed(() => {
      const start = pageCount.value * NUMBER_OF_ITEMS_OF_PAGE;
      return equipments.value.slice(start, start + NUMBER_OF_ITEMS_OF_PAGE);
    });
    const nextPageDisabled = computed(() => {
      return pageCount.value * NUMBER_OF_ITEMS_OF_PAGE > props.equipments.length;
    });
    const previousPageDisabled = computed(() => {
      return pageCount.value === 0;
    });
    const topHiddenFlag = ref(null);
    const returnToTop = () => {
      topHiddenFlag.value.scrollIntoView({ behavior: 'smooth' });
    };
    const nextPage = async () => {
      pageCount.value += 1;
      await nextTick();
      returnToTop();
    };
    const previousPage = async () => {
      pageCount.value -= 1;
      await nextTick();
      returnToTop();
    };
    watch(equipments, () => pageCount.value = 0);
    return {
      nextPage,
      previousPage,
      currentResults,
      nextPageDisabled,
      previousPageDisabled,
      topHiddenFlag,
      pageCount: readonly(pageCount),
    };
  },
};
</script>
