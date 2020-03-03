import vue_main from "./vue/main.vue";

import Vue from "vue";

export default class Controller {
    constructor(){

    }
    init(el){
        const vm = new Vue({
            el: el,
            template: '<main-scope></main-scope>',
            data(){
                return {
                    
                };
            },
            components: {
                'main-scope': vue_main
            }
        });
    }
};