import Vue from 'vue';
import vue_main from "./module/vue/main.vue";

export default class SaveLoadSystem {
    constructor(){
    }
    init(options){
        const vm = new Vue({
            template: '<main-scope v-bind="options"></main-scope>',
            data(){
                return {
                    options: options
                };
            },
            components: {
                'main-scope': vue_main
            }
        });

        vm.$mount();

        const f = document.querySelector('body > footer > .author-information');
        f.insertBefore(vm.$el, f.firstChild);
    }
}