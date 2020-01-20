<template>
    <fragment v-if="localStorageAvailable">
        <span :class="buttonClassList" @click="openSelectDataWindow('save')">
            <iconify-icon name="mdi:content-save-outline"></iconify-icon>
            <lang-text class="text" lang-id="Save Load System/save"></lang-text>
        </span>
        <span :class="buttonClassList" @click="openSelectDataWindow('load')">
            <iconify-icon name="mdi:download"></iconify-icon>
            <lang-text class="text" lang-id="Save Load System/load"></lang-text>
        </span>
        <span :class="buttonClassList" @click="handleFile('save')">
            <iconify-icon name="ic:round-insert-drive-file"></iconify-icon>
            <lang-text class="text" lang-id="Save Load System/save to csv"></lang-text>
        </span>
        <span :class="buttonClassList" @click="handleFile('load')">
            <iconify-icon name="mdi:file-download-outline"></iconify-icon>
            <lang-text class="text" lang-id="Save Load System/load from csv"></lang-text>
        </span>
        <cy-window :visible="selectDataWindowVisible"
            @close-window="closeSelectDataWindow"
            title-lang-id="Save Load System/Save Load: title"
            class="select-data-window">
            <template v-for="(o, i) in buttonsStates">
                <div class="column" @click="selectData(i)">
                    <div class="Cyteria scope-icon line">
                        <iconify-icon name="bx:bxs-book-bookmark"></iconify-icon>
                        <span class="text">{{ o.title }}</span>
                    </div>
                    <div class="detail">
                        <ul v-if="!noData(i)" class="Cyteria ul simple">
                            <li v-for="(_name, j) in o.names">{{ _name }}</li>
                        </ul>
                        <lang-text v-if="noData(i)" tag-name="div"
                            class="no-data" lang-id="Save Load System/no data">
                        </lang-text>
                    </div>
                </div>
                <transition name="fade">
                    <lang-text v-if="i == currentButtonIndex" tag-name="div"
                        class="tips"
                        :lang-id="currentMode == 'save' ? 'Save Load System/Warn/Confirm to overwrite existing data' : 'Save Load System/Warn/Confirm to load data'">
                    </lang-text>
                </transition>
            </template>
        </cy-window>
    </fragment>
</template>

<script>
    import vue_iconifyIcon from "global-vue-components/iconify-icon.vue";
    import vue_svgIcon from "global-vue-components/svg-icon.vue";
    import vue_langText from "global-vue-components/lang-text.vue";
    import vuecy_window from "global-vue-components/Cyteria/window.vue";
    import {Fragment} from "vue-fragment";

    import ShowMessage from "global-modules/ShowMessage.js";
    import CY from "global-modules/cyteria.js"
    import {GetLang, InitLanguageData} from "global-modules/LanguageSystem.js";
    
    import zh_tw from "../LanguageData/zh_tw.js";
    import en from "../LanguageData/en.js";
    import ja from "../LanguageData/ja.js";
    import zh_cn from "../LanguageData/zh_cn.js";

    InitLanguageData({zh_tw, en, ja, zh_cn});

    function Lang(s, vs){
        return GetLang('Save Load System/' + s, vs);
    }

    const DoNothing = function(){
        // do nothing
    };

    export default {
        props: {
            name: {
                type: String,
                required: true
            },
            saveData: {
                type: Function,
                required: true
            },
            loadData: {
                type: Function, // callback(String data)
                required: true
            },
            fileName: {
                type: Function,
                default: () => 'state'
            },
            saveNameList: {
                type: Function,
                default: () => []
            },
            actionFinished: {
                type: Function,
                default: DoNothing
            },
            beforeLoadConfirm: {
                type: Function,
                default: DoNothing
            },
            error: {
                type: Function, // callback(Error)
                default: DoNothing
            },
            saveSize: {
                type: Number,
                default: 5,
                validator: v => Number.isInteger(v)
            },
            buttonClassList: {
                type: Array,
                default: () => ['Cyteria', 'Button', 'line']
            }
        },
        data(){
            return {
                buttonsStates: Array(this.saveSize).fill().map((p, i) => {
                    return {
                        title: Lang('file') + ' ' + i,
                        names: '',
                        data: null
                    };
                }),
                selectDataWindowVisible: false,
                currentButtonIndex: -1,
                currentMode: ''
            };
        },
        created(){
            this.updateButtonsStates();
        },
        computed: {
            localStorageAvailable(){
                return CY.storageAvailable('localStorage');
            }
        },
        methods: {
            updateButtonsStates(){
                this.buttonsStates.forEach((p, i) => {
                    p.names = (this.getLocalStorageData(i, 'name') || '').split(',,');
                    p.data = this.getLocalStorageData(i, 'data') || null;
                });
            },
            closeSelectDataWindow(){
                this.selectDataWindowVisible = false;
            },
            handleFile(mode){
                if ( mode == 'save' ){
                    const str = this.saveData();
                    if ( !str ){
                        ShowMessage(Lang('Warn/File is empty'));
                        return;
                    }
                    try {
                        CY.csv.saveFile(str, this.fileName());
                        this.actionFinished();
                    }
                    catch (e){
                        this.error(e);
                    }
                }
                else if ( mode == 'load' ){
                    CY.csv.loadFile({
                        loadFileSucceeded: res => {
                            try {
                                this.loadData(res);
                                this.actionFinished();
                            }
                            catch (e){
                                ShowMessage(Lang('Warn/An error occurred while loading data'));
                                this.error(e);
                            }
                        },
                        wrongFileType(){
                            ShowMessage(Lang('Warn/Wrong file type: csv'));
                        }
                    });
                }
            },
            noData(index){
                return this.buttonsStates[index].data == null;
            },
            openSelectDataWindow(mode){
                this.selectDataWindowVisible = true;
                this.currentMode = mode;

                this.currentButtonIndex = -1;
            },
            selectData(index){
                if ( this.currentMode == 'save' ){
                    if ( this.noData(index) || this.currentButtonIndex == index ){
                        this.saving(index);
                        this.currentButtonIndex = -1;
                        this.closeSelectDataWindow();
                        return;
                    }
                }
                else if ( this.currentMode == 'load' ){
                    if ( !this.noData(index) && (this.beforeLoadConfirm() || this.currentButtonIndex == index) ){
                        this.loading(index);
                        this.currentButtonIndex = -1;
                        this.closeSelectDataWindow();
                        return;
                    }
                }

                if ( this.currentButtonIndex != index )
                    this.currentButtonIndex = index;
            },
            saving(index){
                try {
                    const str = this.saveData();
                    const name = this.saveNameList().join(',,');

                    this.saveLocalStorageData(index, 'name', name);
                    this.saveLocalStorageData(index, 'data', str);

                    ShowMessage(Lang('Warn/Saving success'));
                    this.actionFinished();
                    this.updateButtonsStates();
                }
                catch (e){
                    this.error(e);
                }
            },
            loading(index){
                const d = this.getLocalStorageData(index, 'data');
                try {
                    this.loadData(d);
                    ShowMessage(Lang('Warn/Loading success'));
                    this.actionFinished();
                }
                catch (e){
                    ShowMessage(Lang('Warn/An error occurred while loading data'));
                    this.error(e);
                }
            },
            localStorageKey(index, type){
                return 'Save-Load-Data-System--' + index + '--' + this.name + '--' + type;
            },
            saveLocalStorageData(index, type, data){
                return window.localStorage.setItem(this.localStorageKey(index, type), data);
            },
            getLocalStorageData(index, type){
                return window.localStorage.getItem(this.localStorageKey(index, type));
            }
        },
        components: {
            'iconify-icon': vue_iconifyIcon,
            'lang-text': vue_langText,
            'svg-icon': vue_svgIcon,
            'cy-window': vuecy_window,
            'fragment': Fragment
        }
    };
</script>

<style lang="less" scope>
    .select-data-window > .container > .content {
        & > .column {
            margin-bottom: 0.5rem;
            border-left: 3px solid var(--primary-light-2);
            transition: 0.3s;
            cursor: pointer;
            padding: 0.4rem 0.8rem;

            &:hover {
                border-left-color: var(--primary-light-4);        
            }
            & > .detail > .no-data {
                text-align: center;
                padding: 0.6rem;
                color: var(--primary-light-2);
            }
        }
        & > .tips {
            margin-top: 0;
            margin-bottom: 1rem;
            color: var(--primary-light-2);
            font-size: 0.9rem;
            padding: 0 0.6rem;
            opacity: 1;
        }

        .fade-enter, .fade-leave-to {
            opacity: 0;
        }
        .fade-enter-active, .fade-leave-active {
            transition: 0.3s ease;
        }
    }
</style>