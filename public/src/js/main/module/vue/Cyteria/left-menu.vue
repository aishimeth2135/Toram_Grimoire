<template>
    <span class="global--left-menu-button" @click="unfold=!unfold">
        <span class="Cyteria Button icon-only top-button">
            <iconify-icon :name="currentIconName"></iconify-icon>
        </span>
        <transition name="fade">
            <div class="menu" v-show="unfold">
                <div class="container">
                    <slot></slot>
                </div>
            </div>
        </transition>
    </span>
</template>

<script>
    import vue_iconifyIcon from "../iconify-icon.vue";

    export default {
        data(){
            return {
                unfold: false
            };
        },
        computed: {
            currentIconName(){
                return 'ic:round-menu';
            }
        },
        components: {
            'iconify-icon': vue_iconifyIcon
        }
    };
</script>

<style lang="less" scoped>
    .global--left-menu-button {
        z-index: 99;
        & > .top-button {
            position: relative;
            z-index: 2;
        }
        & > .menu {
            z-index: 1;
            min-height: 100%;
            position: absolute;
            width: 16rem;
            top: 0;
            left: -0.2rem;
            max-height: calc(100vh - 5rem);
            opacity: 1;
            background-color: rgba(var(--rgb-white), 0.3);

            &.fade-enter, &.fade-leave-to {
                opacity: 0;
            }
            &.fade-enter-active, &.fade-leave-active {
                transition: opacity 0.4s ease;
            }

            & > .container {
                padding: 0.6rem;
                padding-top: 2rem;
                width: 100%;
                height: 100%;
                border: 1px solid var(--primary-light-2);
                background-color: var(--white);

                & /deep/ .title-line {
                    // border-top: 1px solid var(--primary-light-2);
                    padding-bottom: 0.4rem;
                    padding-top: 1rem;
                    padding-left: 0.4rem;
                    font-size: 0.9rem;
                    color: var(--primary-light-3);
                }
            }
        }
    }
    @media screen and (min-width: 30rem) {
        .Cyteria.window {
            width: calc(100% - 1rem);
        }
    }
</style>