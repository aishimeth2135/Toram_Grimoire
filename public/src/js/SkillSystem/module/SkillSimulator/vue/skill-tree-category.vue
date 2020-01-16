<template>
    <div class="skill-tree-category">
        <div class="skill-trees">
            <skill-tree v-for="(st, index) in skillTreeCategoryState.skillTreeStates"
                v-if="st.visible" :skill-tree-state="st" :key="index">
            </skill-tree>
        </div>
    </div>
</template>

<script>
    import vue_skillTree from "./skill-tree.vue";

    export default {
        props: ['skillTreeCategoryState'],
        components: {
            'skill-tree': vue_skillTree
        }
    };
</script>

<style lang="less" scoped>
    
</style>