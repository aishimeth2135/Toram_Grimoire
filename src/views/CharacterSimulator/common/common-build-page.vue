<script lang="ts">
interface CommonBuild extends CommonItem {
  name: string
}
</script>

<script lang="ts" setup generic="Build extends CommonBuild">
import { computed, ref } from 'vue'
import Draggable from 'vuedraggable'
import CommonBuildDropdowns from './common-build-dropdowns.vue'
import CommonSelectBuildContent from './common-select-build-content.vue'
import CommonSideOptions from './common-side-options.vue'
import { type CommonItem } from '@/lib/common/Items'
import { useI18n } from 'vue-i18n'

interface Props {
  currentBuild: Build | null
  buildsReadonly?: boolean
}
interface Emits {
  (evt: 'select-build', value: Build): void
  (evt: 'add-build'): void
  (evt: 'copy-build'): void
  (evt: 'remove-build'): void
}

const selectedBuild = defineModel<Build | null>('selectedBuild', {
  required: true,
})
const builds = defineModel<Build[]>('builds', { required: true })

const props = withDefaults(defineProps<Props>(), {
  buildsReadonly: false,
})
const emit = defineEmits<Emits>()

const { t } = useI18n()

const innerCurrentBuild = computed<Build | null>(() => props.currentBuild)

const buildName = computed<string>({
  get() {
    return selectedBuild.value?.name || ''
  },
  set(value) {
    if (selectedBuild.value) {
      // eslint-disable-next-line vue/no-mutating-props
      selectedBuild.value.name = value
    }
  },
})

const moveMode = ref(false)
</script>

<template>
  <div class="px-2 wd-lg:flex">
    <div class="mb-3 border-b border-primary-10 px-1 pb-4 wd-lg:hidden">
      <div class="flex items-center wd-lg:hidden">
        <CommonBuildDropdowns
          v-model="selectedBuild"
          :options="builds"
          :current-value="innerCurrentBuild"
          class="flex-shrink-0"
          addable
          @add-item="emit('add-build')"
        >
          <template #item="{ item: build }">
            {{ build.name }}
          </template>
        </CommonBuildDropdowns>
        <cy-button-circle
          v-if="!buildsReadonly"
          icon="mdi:sort"
          small
          class="ml-4"
          :selected="moveMode"
          color="blue"
          @click="moveMode = !moveMode"
        />
      </div>
      <div v-if="moveMode" class="mt-4 w-full max-w-xs pb-2">
        <div class="px-1 py-1.5 text-right text-sm text-primary-30">
          {{ t('character-simulator.build-common.move-tips') }}
        </div>
        <Draggable
          v-model="builds"
          item-key="id"
          class="rounded border-1 border-primary-20"
        >
          <template #item="{ element }">
            <div class="flex cursor-move items-center px-4 py-2.5">
              <cy-icon icon="ic:baseline-drag-indicator" class="mr-2" />
              {{ element.name }}
            </div>
          </template>
        </Draggable>
      </div>
    </div>
    <CommonSideOptions
      v-model="selectedBuild"
      v-model:options="builds"
      :current-value="innerCurrentBuild"
      :addable="!buildsReadonly"
      :movable="!buildsReadonly"
      @add-item="emit('add-build')"
    >
      <template #item="{ item: build }">
        {{ build.name }}
      </template>
    </CommonSideOptions>
    <div class="wd-lg:w-full">
      <CommonSelectBuildContent
        :selected-build="selectedBuild"
        :current-build="innerCurrentBuild"
        @select-build="emit('select-build', selectedBuild!)"
      />
      <div class="mt-4">
        <slot name="header" />
      </div>
      <div class="mb-2 flex items-center">
        <cy-title-input
          v-model:value="buildName"
          icon="ic:baseline-drive-file-rename-outline"
        />
        <div class="ml-4 flex items-center space-x-2">
          <cy-button-circle
            icon="bx:copy-alt"
            small
            @click="emit('copy-build')"
          />
          <cy-button-circle
            icon="ic-baseline-delete-outline"
            color="secondary"
            small
            @click="emit('remove-build')"
          />
        </div>
      </div>
      <slot name="content" />
    </div>
    <slot name="modals" />
  </div>
</template>
