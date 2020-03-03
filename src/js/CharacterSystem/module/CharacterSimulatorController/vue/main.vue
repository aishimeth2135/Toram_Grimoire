<template>
    <article>
        <div class="main">
            <div class="Cyteria Layout sticky-header top">
                <div class="content">
                    <cy-left-menu>
                        <div class="column">
                            <template v-for="(chara, i) in characters">
                                <transition name="fade">
                                    <span class="Cyteria Button line selection"
                                        :class="{'selected': currentCharacterIndex == i}"
                                        @click="selectCurrentCharacter(i)">
                                        <iconify-icon name="ant-design:build-outlined"></iconify-icon>
                                        <span class="text">{{ chara.name }}</span>
                                    </span>
                                </transition>
                            </template>
                        </div>
                    </cy-left-menu>
                </div>
            </div>
            <section>
                <div v-for="(field, i) in currentCharacter.equipmentFields"
                    class="character-field"
                    @click="selectFieldEquipment(field)">
                    <div class="field-name text-small">{{ field-name }}</div>
                    <div v-if="field.currentEquipment != null" class="equipment">
                        <div class="top">
                            <span class="Cyteria scope-icon equipment-name">
                                <iconify-icon name="mdi:sword"></iconify-icon>
                                <lang-text class="text" :lang-id="'Character Simulator/character field names/' + field.type.description"></lang-text>
                            </span>
                            <span class="equipment-type">{{ getFieldTypeText(field.currentEquipment) }}</span>
                        </div>
                        <!-- <div class="sub"></div> -->
                        <div class="equipment-stats">
                            <span v-for="(stat, j) in field.currentEquipment.stats">{{ stat.show() }}</span>
                        </div>
                    </div>
                    <div v-else>
                        <lang-text lang-id="Character Simulator/Warn/no equipment selected"></lang-text>
                    </div>
                </div>
            </section>
        </div>
        <div class="window-container">
            <cy-window :visible="browseEquipmentsWindowState.visible"
                @close-window="browseEquipmentsWindowState.visible = false"
                :title-lang-id="'Character Simulator/browse equipments/' + browseEquipmentsWindowState.action">

                <div class="equipments-scope">
                    <div class="equipments">
                        <span v-if="browsedEquipments.length == 0">
                            {{ langText('Character Simulator/Warn/no eligible equipments found') }}
                        </span>
                        <span v-for="(eq, i) in browsedEquipments"></span>
                    </div>
                    <div v-if="browseEquipmentsWindowState.selectedEquipment != null" class="equipment-information"></div>
                </div>
            </cy-window>
            <cy-window :visible="appendEquipmentWindowState.visible"
                @close-window="appendEquipmentWindowState.visible = false"
                :title-lang-id="'Character Simulator/append equipment/window title: ' + appendEquipmentWindowState.action"
            >
                <transition name="fade">
                    <div v-show="appendEquipmentWindowState.action == 'select-mode'">
                        <span class="Cyteria Button line" @click="setAppendEquipmentAction('search')">
                            <iconify-icon name="mdi:sword"></iconify-icon>
                            <span class="text">{{ langText('append equipment/action: search') }}</span>
                        </span>
                        <span class="Cyteria Button line" @click="setAppendEquipmentAction('custom')">
                            <iconify-icon name="ic-outline-category"></iconify-icon>
                            <span class="text">{{ langText('append equipment/action: custom') }}</span>
                        </span>
                    </div>
                    <div v-if="appendEquipmentWindowState.action == 'search'" class="append-equipment--search">
                        <div class="Cyteria Layout title-input-scope">
                            <span class="icon">
                                <iconify-icon name="ic-outline-category"></iconify-icon>
                            </span>                                    
                            <input type="text" v-model="appendEquipmentWindowState.searchEquipmentText" :placeholder="langText('append equipment/search equipment placeholder')" />
                            <div class="search-result">
                                <div v-for="(eq, i) in appendEquipmentSearchResult()"></div>
                            </div>
                        </div>
                    </div>
                    <div v-else-if="appendEquipmentWindowState.action == 'custom'"></div>
                </transition>
            </cy-window>
        </div>
    </article>
</template>

<script>
    import {EquipmentField, Character} from "../class/main.js";
    import {MainWeapon, SubWeapon, BodyArmor} from "../class/CharacterEquipment.js";

    import vue_equipmentField from "./equipment-field.vue";
    // import vue_langText from "global-vue-components/lang-text.vue";
    import vuecy_window from "global-vue-components/Cyteria/window.vue";
    import vuecy_leftMenu from "global-vue-components/Cyteria/left-menu.vue";


    function Lang(s, vs){
        return GetLang('Character Simulator/' + s, vs);
    }

    export default {
        data(){
            return {
                characters: [],
                currentCharacterIndex: -1,
                equpiments: [],
                browseEquipmentsWindowState: {
                    visible: false,
                    action: 'browse',
                    currentField: null,
                    filter: {
                        field: null,
                        equipmentTypes: null
                    }
                },
                appendEquipmentWindowState: {
                    visible: false,
                    action: 'select-mode'
                }
            };
        },
        created(){
            this.createCharacter();
        },
        computed: {
            currentCharacter(){
                return this.characters[this.currentCharacterIndex];
            },
            browsedEquipments(){
                return this.equpiments;
            }
        },
        methods: {
            appendEquipmentSearchResult(){

            },
            setAppendEquipmentAction(action){
                this.appendEquipmentWindowState.action = action;
            },
            selectFieldEquipment(field){
                const state = this.browseEquipmentsWindowState;
                state.visible = true;
                state.action = 'select-field-equipment';
                state.currentField = field;
            },
            createCharacter(){
                const c = new Character(this.lang('character') + ' ' + (this.characters.length + 1).toString());

                this.currentCharacterIndex = this.characters.length;
                this.characters.push({
                    origin: c
                });
            },
            selectCurrentCharacter(index){
                this.currentCharacterIndex = index;
            },
            getFieldTypeText(field){
                return this.lang('field type text/' + field.type.description);
            },
            langText(s, vs){
                return Lang(s, vs);
            },
            getLangText(s, vs){
                return GetLang(s, vs);
            }
        },
        components: {
            'equipment-field': vue_equipmentField,
            // 'lang-text': vue_langText,
            'cy-window': vuecy_window,
            'cy-left-menu': vuecy_leftMenu
        }
    };
</script>

<style lang="less" scoped>
    .character-field > .equipment {

    }
    
    .fade-enter-to, .fade-leave {
        opacity: 1;
    }
    .fade-enter, .fade-leave-to {
        opacity: 0;
    }
    .fade-enter-active, .fade-leave-active {
        transition: 0.3s ease;
    }
</style>