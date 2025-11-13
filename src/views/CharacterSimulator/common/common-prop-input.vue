<script lang="ts" setup>
import CommonPropInputBase from './common-prop-input-base.vue'

interface Props {
  title: string
}

defineProps<Props>()

const innerValue = defineModel<string>('value', { required: true })
</script>

<template>
  <CommonPropInputBase :title="title" class="max-w-[15rem]" v-slot="{ inputId, setInputFocus }">
    <div class="w-full" @click.stop>
      <input
        :id="inputId"
        ref="inputElement"
        v-model="innerValue"
        type="text"
        class="w-full bg-transparent text-primary-70"
        @focus="setInputFocus(true)"
        @blur="setInputFocus(false)"
      />
    </div>
  </CommonPropInputBase>
</template>
