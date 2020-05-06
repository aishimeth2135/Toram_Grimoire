<template>
    <div class="skill-root">
        <div class="skill-tree-categorys">
            <skill-tree-category v-for="(stc, index) in skillRootState.skillTreeCategoryStates"
                v-if="stc.visible"
                :skill-tree-category-state="stc"
                :key="index">
            </skill-tree-category>
        </div>
    </div>
</template>

<script>
    import vue_skillTreeCategory from "./skill-tree-category.vue";

    export default {
        props: ['skillRootState'],
        components: {
            'skill-tree-category': vue_skillTreeCategory
        }
    }
</script>

<style lang="less" scoped>
    .skill-root {
        padding: 0.6rem 0.2rem;
        min-height: 20rem;
        position: relative;
        z-index: 1;
    }

</style>