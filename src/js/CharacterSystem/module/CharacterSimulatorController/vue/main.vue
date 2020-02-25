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
            <equipment-field :field="currentCharacterField"></equipment-field>
        </div>
    </article>
</template>

<script>
    import {Character} from "../class.js";
    import vue_equipmentField from "./equipment-field.vue";

    function Lang(s, vs){
        return GetLang('Character Simulator/' + s, vs);
    }

    export default {
        data(){
            return {
                characters: []
                currentCharacterIndex: 
            };
        },
        created(){
            this.createCharacter();
        },
        computed: {
            currentCharacter(){
                return this.characters[this.currentCharacterIndex];
            },
            currentCharacterField(){
                const t = this.currentCharacter;
                return t.origin.equipmentFields[t.currentFieldIndex];
            }
        },
        methods: {
            createCharacter(){
                const c = new Character(Lang('character') + ' ' + (this.characters.length + 1).toString());
                this.currentCharacterIndex = this.characters.length;
                this.characters.push({
                    origin: c,
                    currentFieldIndex: 0
                });
            },
            selectCurrentCharacter(index){
                this.currentCharacterIndex = index;
            }
        },
        components: {
            'equipment-field': vue_equipmentField
        }
    };
</script>

<style lang="less">
    
</style>