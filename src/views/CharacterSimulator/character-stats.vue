<template>
  <section>
    <div class="character-stat-categorys">
      <div v-for="data in showCharacterStatDatas" class="category" :key="data.name">
        <div class="title">{{ data.name }}</div>
        <div class="stats">
          <span v-for="stat in data.stats" :key="stat.id">
            <span class="name">{{ stat.name }}</span>
            <span class="value">{{ stat.value }}</span>
          </span>
        </div>
      </div>
    </div>
  </section>
</template>
<script>
export default {
  props: ['characterState', 'showCharacterStatDatas']
}
</script>
<style lang="less" scoped>
.character-stat-categorys {
  > .category {
    padding: 0 0.6rem;
    margin-bottom: 1.2rem;

    > .title {
      border-bottom: 1px solid var(--primary-light);
      padding-bottom: 0.1rem;
      padding-left: 0.3rem;
      font-size: 0.9rem;
      color: var(--primary-purple);
    }

    > .stats {
      > span {
        padding: 0.2rem 0.6rem;
        border-bottom: 1px solid var(--primary-light-2);
        margin: 0.3rem;
        display: inline-block;

        > .name {
          margin-right: 0.4rem;
        }

        > .value {
          color: var(--primary-light-4);
        }
      }
    }
  }
}
</style>