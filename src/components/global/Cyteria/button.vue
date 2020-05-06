<template>
    <span :class="rootClass" @click="buttonClick">
        <template v-if="isNormalLayout">
            <iconify-icon v-if="iconifyName != null" :name="iconifyName"></iconify-icon>
            <svg-icon v-if="iconId != null" :icon-id="iconId"></svg-icon>
            <lang-text v-if="textLangId != null" :lang-id="textLangId" class="text"></lang-text>
            <span v-else-if="$slots['default']" class="text">
                <slot></slot>
            </span>
            <slot name="tail"></slot>
            <span class="content-right" v-if="$slots['content-right']">
                <slot name="content-right"></slot>
            </span>
        </template>
        <template v-else>
            <div v-if="type == 'with-title'" class="pre-title">
                <slot name="title"></slot>
            </div>
            <div class="title">
                <iconify-icon v-if="iconifyName != null" :name="iconifyName"></iconify-icon>
                <svg-icon v-if="iconId != null" :icon-id="iconId"></svg-icon>
                <lang-text v-if="textLangId != null" :lang-id="textLangId" class="text"></lang-text>
                <span v-else-if="$slots['default']" class="text">
                    <slot></slot>
                </span>
                <slot name="tail"></slot>
                <span class="content-right" v-if="$slots['content-right']">
                    <slot name="content-right"></slot>
                    <cy-icon-text :iconify-name="menuVisible ? 'ic-round-keyboard-arrow-up' : 'ic-round-keyboard-arrow-down'" />
                </span>
            </div>
            <div v-if="type == 'description'" class="description">
                <slot name="description"></slot>
            </div>
            <template v-if="type == 'drop-down'">
                <div class="menu" v-show="menuVisible" @click.stop>
                    <slot name="menu"></slot>
                </div>
            </template>
        </template>
        <!-- <template v-if="!['description', 'drop-down', 'with-title'].includes(type)">
            <iconify-icon v-if="iconifyName != null" :name="iconifyName"></iconify-icon>
            <svg-icon v-if="iconId != null" :icon-id="iconId"></svg-icon>
            <lang-text v-if="textLangId != null" :lang-id="textLangId" class="text"></lang-text>
            <span v-else-if="$slots['default']" class="text">
                <slot></slot>
            </span>
            <slot name="tail"></slot>
            <span class="content-right" v-if="$slots['content-right']">
                <slot name="content-right"></slot>
            </span>
        </template> -->
        <!-- <template v-else>
            <div class="title">
                <iconify-icon v-if="iconifyName != null" :name="iconifyName"></iconify-icon>
                <svg-icon v-if="iconId != null" :icon-id="iconId"></svg-icon>
                <lang-text v-if="textLangId != null" :lang-id="textLangId" class="text"></lang-text>
                <span v-else class="text">
                    <slot></slot>
                </span>
            </div>
            <div v-if="type == 'description' && $slots['description']" class="description">
                <slot name="description"></slot>
            </div>
            <div class="menu" v-else-if="type == 'drop-down' && menuVisible" @click.stop>
                <slot name="menu"></slot>
            </div>
        </template> -->
    </span>
</template>

<script>
    import vue_iconifyIcon from "../iconify-icon.vue";
    import vue_langText from "../lang-text.vue";
    import vue_svgIcon from "../svg-icon.vue";

    import vuecy_iconText from "@global-vue-components/Cyteria/icon-text.vue";

    export default {
        props: {
            type: {
                type: String,
                default: 'simple',
                validator(v){
                    return ['simple', 'icon-only', 'line', 'description', 'drop-down', 'with-title'].includes(v);
                }
            },
            iconifyName: {
                default: null
            },
            iconId: {
                default: null
            },
            textLangId: {
                default: null
            }
        },
        data(){
            return {
                menuVisible: false
            };
        },
        computed: {
            isNormalLayout(){
                return !['description', 'drop-down', 'with-title'].includes(this.type);
            },
            rootClass(){
                return ['Button', this.type].join(' ');
            }
        },
        methods: {
            buttonClick(){
                if ( this.type == 'drop-down' )
                    this.menuVisible = !this.menuVisible;
                this.$emit('click');
            }
        },
        components: {
            'iconify-icon': vue_iconifyIcon,
            'lang-text': vue_langText,
            'svg-icon': vue_svgIcon,
            'cy-icon-text': vuecy_iconText
        }
    };
</script>

<style lang="less" scoped>
    @deep-operator: ~'>>>';

    /* ==========================================================================
       Button
       ========================================================================== */
    .Button {
        cursor: pointer;
        display: inline-block;
    }

    .Button {
        text-align: center;
        transition: 0.3s;

        @{deep-operator} svg {
            fill: currentcolor;
            color: var(--primary-light-2);
        }

        &:hover @{deep-operator} svg,
        &.cur @{deep-operator} svg,
        &.selected @{deep-operator} svg{
            color: var(--primary-light-4);
        }
        
        &:hover @{deep-operator} > .text,
        &.cur @{deep-operator} > .text,
        &.selected @{deep-operator} > .text {
            color: var(--primary-light-4);
        }

        > .title {
            @{deep-operator} svg {
                fill: currentcolor;
                color: var(--primary-light-2);
            }
            

            &:hover @{deep-operator} svg ,
            &.cur @{deep-operator} svg ,
            &.selected @{deep-operator} svg {
                color: var(--primary-light-3);
            }
        }
    }

    .Button {
        /* flip icon
           ========================================================================== */
        &.flip-icon @{deep-operator} svg {
            animation: flip-icon 3s ease 0s infinite;
        }

        /* simple
           ========================================================================== */
        &.simple {
            padding: 0.35rem 0.5rem;
            border-bottom: 1px var(--primary-light) solid;
            margin: 0.2rem;
            display: inline-flex;
            align-items: center;

            &:hover, &.cur, &.selected {
                border-bottom-color: var(--primary-light-3);
            }

            & > span {
                display: inline-flex;
                align-items: center;
            }

            @{deep-operator} svg {
                height: 1.2rem;
                width: 1.2rem;
                flex-shrink: 0;
            }
            .text {
                margin-left: 0.4rem;
            }
            &.no-border {
                border: 0;

                & > .text {
                    color: var(--primary-light-4);
                }
            }

            &.icon-big @{deep-operator} svg {
                height: 1.8rem;
                width: 1.8rem;
            }
            &.icon-big @{deep-operator} svg + .text {
                margin-left: 0.7rem;
            }

            &.no-padding {
                padding: 0;
            }
            &.inline {
                margin-top: 0;
                margin-bottom: 0;
                padding: 0;
                border: 0;
            }

            &.disabled {
                color: var(--primary-light);
                position: relative!important;

                &::before {
                    width: 100%;
                    height: 100%;
                    cursor: not-allowed;
                    z-index: 10;
                    display: inline-block;
                    position: absolute;
                    left: 0;
                    top: 0;
                    content: '';
                }
            }
        }

        /* icon-only
           ========================================================================== */
        &.icon-only {
            padding: 0.3rem;
            margin: 0 0.2rem;

            @{deep-operator} svg {
                width: 1.2rem;
                height: 1.2rem;
                flex-shrink: 0;
                display: block;
            }
        }

        /* single-line
           ========================================================================== */
        &.single-line {
            padding-top: 0;
            padding-bottom: 0;
        }

        /* border
           ========================================================================== */
        &.border.icon-only {
            border-radius: 0.2rem;
            border: 1px var(--primary-light-2) solid;

            &:hover {
                border: 1px var(--primary-light-4) solid;
            }
        }
        
        /* line
           ========================================================================== */
        &.line {
            margin: 0.3rem;
            padding: 0.4rem 0.7rem;
            background-color: var(--white);
            border-left: 3px solid var(--primary-light-2);
            display: flex;
            align-items: center;
            justify-content: flex-start;

            &.inline {
                display: inline-flex;
                min-width: 15rem;
            }

            &.no-border {
                border: 0;
            }

            & @{deep-operator} svg {
                width: 1.4rem;
                height: 1.4rem;
            }
            &.icon-small @{deep-operator} svg {
                width: 1.3rem;
                height: 1.3rem;
            }
            .text {
                display: inline-block;
                white-space: nowrap;
                margin-left: 0.6rem;
            }

            &.selection {
                color: var(--primary-light-2);
            }

            &.selected, &:hover {
                color: var(--primary-light-4);
                border-left-color: var(--primary-light-3);
            }

            & > .content-right {
                margin-left: auto;
                display: inline-flex;
                align-items: center;
            }

            &.multiple-line {
                flex-wrap: wrap;

                & > .content {
                    display: flex;
                    align-items: center;
                    justify-content: flex-start;
                }

                & > .extra-line {
                    width: 100%;
                    margin-top: 0.3rem;
                    font-size: 0.9rem;
                    text-align: left;
                    padding-left: 0.6rem;

                    svg {
                        width: 0.9rem;
                        height: 0.9rem;
                    }
                }
            }
        }

        &.description {
            max-width: 19.4rem;
            min-width: 12rem;
            border-left: 3px solid var(--primary-light-2);
            padding: 0.4rem 0.7rem;
            margin: 0.3rem;
            background-color: var(--white);
            text-align: left;

            &:hover, &.select {
                border-left-color: var(--primary-light-3);
            }

            .title {
                display: flex;
                align-items: center;
                justify-content: flex-start;
                color: var(--primary-light-4);

                & @{deep-operator} svg {
                    width: 1.4rem;
                    height: 1.4rem;
                }

                & > .text {
                    display: inline-block;
                    white-space: nowrap;
                    margin-left: 0.6rem;
                }
            }

            .description {
                padding: 0.3rem 0.3rem 0.3rem 0.6rem;
            }

            &.selection {
                .title {
                    color: var(--primary-light-2);
                }
                &.select {
                    color: var(--primary-light-4);
                }
            }
        }

        &.drop-down {
            min-width: 12rem;
            border-left: 3px solid var(--primary-light-2);
            padding: 0.4rem 0.7rem;
            margin: 0.3rem;
            background-color: var(--white);
            text-align: left;

            .title {
                display: flex;
                align-items: center;
                justify-content: flex-start;
                color: var(--primary-light-4);

                & @{deep-operator} svg {
                    width: 1.4rem;
                    height: 1.4rem;
                }

                & > .text {
                    display: inline-block;
                    white-space: nowrap;
                    margin-left: 0.6rem;
                }
            }

            .menu {
                padding-top: 0.4rem;
                padding-left: 0.4rem;
            }
        }

        &.with-title {
            margin: 0.3rem;
            background-color: var(--white);
            display: flex;
            align-items: center;

            .title {
                display: flex;
                align-items: center;
                justify-content: flex-start;
                color: var(--primary-light-4);
                padding: 0.35rem 0.5rem;
                border-bottom: 1px var(--primary-light) solid;

                & @{deep-operator} svg {
                    width: 1.4rem;
                    height: 1.4rem;
                }

                & > .text {
                    display: inline-block;
                    white-space: nowrap;
                    margin-left: 0.6rem;
                }
            }

            > .pre-title {
                font-size: 0.9rem;
                color: var(--primary-light-3);
                margin-right: 0.4rem;
            }
        }
    }

    
    @keyframes flip-icon {
        0% {
            transform: rotateY(0deg);
        }
        40% {
            transform: rotateY(360deg);
        }
    }

    /* floating
       ========================================================================== */
    // .frozen-floating-button-parent {
    //     display: flex;
    //     flex-wrap: wrap;
    //     align-items: flex-start;
    // }
    // .Button.frozen-floating {
    //     position: sticky;
    //     background-color: var(--primary-light-2);
    //     border-radius: 50%;
    //     padding: 0.8rem;
    //     border-bottom: 1px solid var(--primary-light);
    //     box-shadow: 0 0 0.2rem 0.1rem var(--primary-light);
    // }
    // .Button.frozen-floating > svg {
    //     width: 2.0rem;
    //     height: 2.0rem;
    //     fill: white;
    //     display: block;
    // }
    // .Button.frozen-floating.bottom-right {
    //     bottom: 1.3rem;
    //     margin-right: 1.3rem;
    //     margin-left: auto;
    //     align-self: flex-end;
    // }
    // .Button.frozen-floating:hover {
    //     background-color: var(--primary-light-4);
    // }
</style>