<template>
    <span class="Cyteria Button simple no-border no-padding User-Guide--main" @click="startGuide()">
        <iconify-icon name="mdi:rabbit"></iconify-icon>
        <lang-text class="text" lang-id="footer/user guide"></lang-text>
        <div v-if="state != 'wait'" class="main" ref="main" @click.stop="nextPage()">
            <template v-if="state == 'show'" v-for="(g, i) in currentElementGroups">
                <template v-for="(o, j) in computeGroupElements(g)">
                    <transition name="narrow-down" appear>
                        <div v-if="o.type == 'light-circle'" class="light-circle"
                            :style="o.style" :class="{first: i == 0}" :key="o.key">
                        </div>
                    </transition>
                    <div v-if="o.type == 'group-text'" class="group-text"
                        :style="o.style" v-html="o.innerHTML">
                    </div>
                </template>
            </template>
            <div v-if="currentCaptionPage !== null" class="main-caption">
                <div class="container">
                    <div class="title">{{ currentCaptionPage.title }}</div>
                    <div class="caption">{{ currentCaptionPage.caption }}</div>
                    <div class="tips">{{ currentCaptionPage.tips }}</div>
                    <div v-show="state == 'start'" class="scope-button">
                        <span class="Cyteria Button simple" @click="skipGuide()">
                            <iconify-icon name="ic:baseline-skip-next"></iconify-icon>
                            <lang-text class="text" lang-id="User Guide System/skip user guide"></lang-text>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </span>
</template>

<script>
    import vue_iconifyIcon from "@global-vue-components/iconify-icon.vue";
    import vue_svgIcon from "@global-vue-components/svg-icon.vue";
    import vue_langText from "@global-vue-components/lang-text.vue";

    import {UserGuideFrame, UserGuideText, ElementGroup} from "../Element.js";

    import {GetLang, InitLanguageData} from "@global-modules/LanguageSystem.js";
    import CY from "@global-modules/cyteria.js";

    import zh_tw from "../LanguageData/zh_tw.js";
    import en from "../LanguageData/en.js";
    import ja from "../LanguageData/ja.js";
    import zh_cn from "../LanguageData/zh_cn.js";

    InitLanguageData({zh_tw, en, ja, zh_cn});
    function Lang(s, vs){
         return GetLang('User Guide System/' + s, vs);
    }

    export default {
        props: {
            name: {
                type: String,
                required: true
            },
            targetElement: {
                type: [HTMLElement, Element, Node]
            },
            start: {
                type: Object,
                default(){
                    return {};
                }
            },
            end: {
                type: Object,
                default(){
                    return {};
                }
            },
            framesDatas: Array /*[
                Object {
                    id: Integer,
                    type: Symbol,  // UserGuideFrame.TYPE_XXX
                    elementGroupsDatas: Array [
                        Object {
                            id: Integer,
                            text: String,
                            position: Symbol //UserGuideText.POSITION_XXX
                        }
                    ]
                }
            ]*/
        },
        data(){
            const self = this;
            const start =  Object.assign({
                caption: Lang('Start Caption: default'),
                title: Lang('Start Title: default'),
                tips: Lang('Start Caption Tips: default')
            }, this.start);
            const end = Object.assign({
                caption: Lang('End Caption: default'),
                title: Lang('End Title: default'),
                tips: Lang('End Caption Tips: default')
            }, this.end);

            let defaultState = 'start';
            if ( CY.storageAvailable('localStorage') ){
                const name = 'User-Guide-System--' + this.name;
                if ( window.localStorage[name] == '1' )
                    defaultState = 'wait';
                else
                    window.localStorage[name] = '1';
            }
            else
                defaultState = 'wait';

            return {
                startPage: start,
                endPage: end,
                currentIndex: -1,
                state: defaultState,
                listeners: {
                    windowResize: function(e){
                        self.$forceUpdate();
                    },
                    windowScroll: function(e){
                        self.$forceUpdate();
                    }
                }
            };
        },
        mounted(){
            window.addEventListener('resize', this.listeners.windowResize);
            window.addEventListener('scroll', this.listeners.windowScroll);
        },
        destroyed() {
           window.removeEventListener("resize", this.listeners.windowResize);
           window.removeEventListener('scroll', this.listeners.windowScroll);
        },
        computed: {
            frames(){
                const attr_name = 'data-user-guide-set';
                const frames = [];

                this.targetElement.querySelectorAll(`*[${attr_name}]`).forEach(p => {
                    const t = p.getAttribute(attr_name);
                    const [ids, extra_set] = t.split('|');
                    const [fid, gid] = ids.split('-').map(a => parseInt(a, 10));

                    let f = frames.find(a => a.id == fid);
                    const fd = this.framesDatas.find(a => a.id == fid);
                    if ( !f ){
                        f = new UserGuideFrame(fid, fd.type);
                        const index = frames.findIndex(a => a.id >= fid);
                        index != -1 ? frames.splice(index, 0, f) : frames.push(f);
                    }
                    
                    const gd = fd.elementGroupsDatas.find(a => a.id == gid);
                    let g = f.elementGroups.find(a => a.id == gid);
                    if ( !g ){
                        g = f.appendElementGroup(gid);
                        gd.text && g.setText(gd.position, gd.text.replace(/\(\((.+)\)\)/g, (m, m1) => `<span class="mark">${m1}</span>`));
                    }
                    g.appendElement(p);
                });

                console.log("---------------------------", frames);
                return frames;
            },
            currentCaptionPage(){
                if ( this.state == 'start' )
                    return this.startPage;
                if ( this.state == 'prepare-end' )
                    return this.endPage;
                return null;
            },
            currentElementGroups(){
                const t = this.frames[this.currentIndex];
                return t ? t.elementGroups : [];
            }
        },
        methods: {
            changeState(set){
                this.state = set;
            },
            nextPage(){
                if ( this.state == 'prepare-end' ){
                    this.endGuide();
                    return;
                }
                if ( this.state == 'start' )
                    this.changeState('show');

                ++this.currentIndex;
                if ( this.currentIndex >= this.frames.length )
                    this.changeState('prepare-end');
            },
            skipGuide(){
                this.endGuide();
            },
            startGuide(){
                this.changeState('start');
            },
            endGuide(){
                this.changeState('wait');
                this.currentIndex = -1;
            },
            computeGroupElements(group){
                const data = [];

                let min_left = null,
                    max_right = null,
                    max_bottom = null,
                    min_top = null;

                group.elements.forEach(el => {
                    const rect = el.getBoundingClientRect();
                    const l = rect.left,
                        r = rect.left + rect.width,
                        t = rect.top,
                        b = rect.top + rect.height;
                    (min_left == null || l < min_left) && (min_left = l);
                    (max_right == null || r > max_right) && (max_right = r);
                    (min_top == null || t < min_top) && (min_top = t);
                    (max_bottom == null|| b > max_bottom) && (max_bottom = b);
                });

                const pd = 40, text_space = 40, text_pd = 20;

                data.push({
                    type: 'light-circle',
                    style: {
                        left: (min_left - pd) + 'px',
                        top: (min_top - pd) + 'px',
                        width: (max_right - min_left + 2*pd) + 'px',
                        height: (max_bottom - min_top + 2*pd) + 'px'   
                    },
                    key: group.parent.id + '-' + group.id
                });

                if ( group.guideText !== null ){
                    const text_style = {};
                    const pos = group.guideText.position;

                    const vw = this.$refs['main'].clientWidth,
                        vh = this.$refs['main'].clientHeight;
                    if ( pos == UserGuideText.POSITION_TOP || pos == UserGuideText.POSITION_BOTTOM ){
                        if ( pos == UserGuideText.POSITION_TOP )
                            text_style.bottom = (vh - min_top + pd + text_space) + 'px';
                        else
                            text_style.top = (max_bottom + pd + text_space) + 'px';

                        const m = vw / 2;
                        if ( max_right <= m || (max_right - m < m - min_left) ){ // 如果偏左
                            text_style.left = Math.max(min_left - pd, text_pd) + 'px';
                            text_style['max-width'] = (vw - min_left - text_pd) + 'px';
                        }
                        else {
                            text_style.right = Math.max(vw - max_right - pd, text_pd) + 'px';
                            text_style['max-width'] = (max_right - text_pd) + 'px';
                            //text_style['text-align'] = 'right';
                        }
                    }
                    if ( pos == UserGuideText.POSITION_LEFT || pos == UserGuideText.POSITION_RIGHT ){
                        if ( pos == UserGuideText.POSITION_LEFT ){
                            text_style.left = text_pd + 'px';
                            text_style['max-width'] = (min_left - text_space - text_pd) + 'px';
                            //text_style['text-align'] = 'right';
                        }
                        else {
                            text_style.left = (max_right + text_space) + 'px';
                            text_style['max-width'] = (vw - max_right - text_pd) + 'px';
                        }

                        const m = vh / 2;
                        if ( max_bottom <= m || (max_bottom - m < m - min_top ) ) // 如果偏上
                            text_style.top = min_top + 'px';
                        else
                            text_style.bottom = (vw - max_bottom) + 'px';
                    }
                    
                    data.push({
                        type: 'group-text',
                        innerHTML: group.guideText.text,
                        style: text_style
                    });
                }
                return data;
            }
        },
        components: {
            'iconify-icon': vue_iconifyIcon,
            'lang-text': vue_langText,
            'svg-icon': vue_svgIcon
        }
    };
</script>

<style lang="less" scoped>
    .main {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 100;
        white-space: normal;

        & > .main-caption {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            background-color: rgba(var(--rgb-black), 0.5);
    
            & > .container {
                background-color: var(--white);
                padding: 1rem;
                border: 0.2rem solid var(--primary-light-2);
                box-shadow: 0 0 0 0.5rem var(--white);
                max-width: calc(100% - 2rem);

                & > .title {
                    font-size: 1.5rem;
                    margin-bottom: 1.2rem;
                    font-weight: bold;
                }
                & > .caption {
                    margin-bottom: 2rem;
                }
                & > .tips {
                    font-size: 0.9rem;
                    color: var(--primary-light-2);
                    margin-bottom: 1.5rem;
                }
                & > .buttons-scope > .Cyteria.Button {
                    background-color: var(--primary-light);
                    border-radius: 0.2rem;
                }
            }
        }

        & > .light-circle {
            position: absolute;
            border-radius: 50%;
        }

        & > .light-circle.first {
            box-shadow: 0 0 0 calc(100vh + 100vw) var(--black);
            opacity: 0.6;
        }
        & > .group-text,
        & > .main-caption > .container {
            display: inline-block;
            position: absolute;
            background-color: var(--white);
            padding: 1rem;
        }
        & > .group-text {
            text-align: left;
        }
    }

    .narrow-down-enter {
        background-color: var(--black);
        box-shadow: 0 0 0 calc(100vh + 100vw) var(--white);
    }
    .narrow-down-enter-active {
        transition: 0.4s;
    }
</style>

<style lang="css">
    .User-Guide--main .group-text > .mark {
        color: var(--primary-light-4);
        border-left: 1px solid var(--primary-light-4);
        border-right: 1px solid var(--primary-light-4);
        padding: 0 0.4rem;
        margin: 0 0.4rem;
    }
</style>