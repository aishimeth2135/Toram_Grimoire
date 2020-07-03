<template>
  <section>
    <equipment-field v-for="field in character.equipmentFields"
      :key="field.id"
      :field="field" />
  </section>
</template>
<script>
  import vue_equipmentField from "./equipment-field.vue";
  export default {
    props: ['character'],
    components: {
      'equipment-field': vue_equipmentField
    }
  }
</script>
<style lang="less" scoped>
@deep-operator: ~'>>>';
</style>