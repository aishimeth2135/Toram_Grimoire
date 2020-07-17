<template>
  <div class="equipment-field">
    <div class="top">
      <span class="name">{{ langText('character field names/' + field.type.description) }}</span>
      <div class="buttons">
        <cy-button iconify-name="ic-round-view-list" type="icon-only" class="inline"
          @click="$emit('select-field-equipment', field)" />
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    props: ['field'],
    inject: ['langText']
  }
</script>
<style lang="less" scoped>
  .equipment-field {
    padding: 0.6rem;
    border: 1px solid var(--primary-light);
    margin: 0.8rem 0;

    > .top {
      display: flex;
      align-items: center;

      > .name {
        font-size: 0.9rem;
        color: var(--primary-purple);
      }

      > .buttons {
        margin-left: auto;
      }
    }
  }
</style>