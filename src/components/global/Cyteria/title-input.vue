<template>
    <span class="title-input">
        <span class="icon">
            <iconify-icon v-if="iconifyName != null" :name="iconifyName"></iconify-icon>
            <svg-icon v-if="iconId != null" :icon-id="iconId"></svg-icon>
        </span>
        <slot></slot>
    </span>
</template>

<script>
    import vue_iconifyIcon from "../iconify-icon.vue";
    import vue_langText from "../lang-text.vue";
    import vue_svgIcon from "../svg-icon.vue";

    export default {
        props: {
            iconifyName: {
                default: null
            },
            iconId: {
                default: null
            }
        },
        components: {
            'iconify-icon': vue_iconifyIcon,
            'lang-text': vue_langText,
            'svg-icon': vue_svgIcon
        }
    }
</script>

<style lang="less" scoped>
    .title-input {
        position: relative;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
    
        & > .icon {
            left: 0.4rem;
            top: 0.4rem;
            position: absolute;
        }
        & > .icon-before-short {
            margin-right: 0.3rem;
            display: inline-block;
        }
        & > .icon > svg {
            color: var(--primary-light);
            width: 1.4rem;
            height: 1.4rem;
        }
        & > input {
            padding: 0.5rem;
            border: 0;
            border-bottom: 1px solid var(--primary-light);
            transition: 0.3s;
            font-size: 1rem;
            width: 20rem;
            padding-left: 2.6rem;
        }
        & > input:focus {
            border-bottom-color: var(--primary-light-3);
        }
        & input.short {
            width: 3rem;
            text-align: center;
            vertical-align: middle;
            padding: 0.3rem 0.6rem;
        }
        & > .title {
            color: var(--primary-light-4);
            padding: 0.4rem 0.2rem;
        }
        & > .text.inner {
            margin: 0 0.3rem;
            display: inline-block;
        }
    }

    @media screen and (max-width: 24rem) {
        .title-input > input {
            width: 100%;
        }
    }
</style>