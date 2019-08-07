import DataPath from "../main/module/DataPath.js";
import LoadEnchantData from "./module/LoadEnchantData.js";
import {EnchantCategory} from "./module/EnchantElement.js";
import EnchantSimulatorController from "./module/EnchantSimulatorController.js";


export default class EnchantSystem {
    constructor(){
        this.categorys = [];
    }
    init(){
        const _this = this;
        return new Promise((resolve, reject) => {
            Papa.parse(DataPath().EnchantData, {
                download: true,
                complete(res){
                    LoadEnchantData(_this, res.data);
                    resolve();
                },
                error(err){
                    console.warn("讀取附魔資料時發生錯誤。");
                    console.log(err);
                    reject();
                }
            });
        });
    }
    appendCategory(){
        const t = new EnchantCategory(...arguments);
        this.categorys.push(t);
        return t;
    }
    init_EnchantSimulator(main_node){
        this.EnchantSimulatorController = new EnchantSimulatorController(this);
        this.EnchantSimulatorController.init(main_node);
    }
}