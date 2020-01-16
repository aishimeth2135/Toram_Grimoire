<template>
    <transition name="fade">
        <div class="window" v-show="visible" @click="$emit('close-window')">
            <div class="container" @click.stop>
                <div class="top">
                    <div class="Cyteria scope-icon title">
                        <iconify-icon name="mdi:checkbox-multiple-blank-circle-outline"></iconify-icon>
                        <lang-text :lang-id="titleLangId" class="text"></lang-text>
                    </div>
                    <span class="buttons">
                        <slot name="top-buttons"></slot>
                        <span class="Cyteria Button icon-only" @click="$emit('close-window')">
                            <iconify-icon name="ic:round-close"></iconify-icon>
                        </span>
                    </span>
                </div>
                <div class="content">
                    <slot></slot>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
    import vue_iconifyIcon from "../iconify-icon.vue";
    import vue_langText from "../lang-text.vue";

    export default {
        props: ['titleLangId', 'visible'],
        components: {
            'iconify-icon': vue_iconifyIcon,
            'lang-text': vue_langText
        }
    };
</script>

<style lang="less" scoped>
    .window {
        position: fixed;
        height: 100%;
        width: 100%;
        top: 0;
        left: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 50;
        background-color: rgba(var(--rgb-black), 0.1);

        &.fade-enter {
            opacity: 0;
        }
        &.fade-enter-active, &.fade-leave-active {
            transition: 0.3s ease;
        }
        &.fade-leave-to {
            opacity: 0;
        }

        & > .container {
            width: 25rem;
            margin: 1rem 0.5rem;
            border: 1px solid var(--primary-light);
            background-color: var(--white);
            padding: 1rem;
            overflow-y: auto;
            max-height: calc(100% - 1rem);

            & > .top {
                padding-bottom: 0.6rem;
                display: flex;
                align-items: center;
                & > .buttons {
                    margin-left: auto;
                    & > .button {
                        margin-right: 0.3rem;
                    }
                }
                & > .title {
                    margin: 0.2rem;
                    color: var(--primary-purple);
                }
            }
        }

        &.frozen-top {
            padding: 0 1rem;
            padding-bottom: 1rem;
            & > .top {
                background-color: var(--white);
                position: sticky;
                top: 0;
                padding-top: 1rem;
                z-index: 5;
            }
        }
    }
    @media screen and (max-width: 26rem) {
        .window > .container {
            width: calc(100% - 1rem);
        }
    }
</style>