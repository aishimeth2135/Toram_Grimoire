import DataPath from "../main/module/DataPath.js";
import LoadEquipmentData from "./module/LoadEquipmentData.js";
import {Items} from "./module/ItemElements.js";
import SearchController from "./module/SearchController.js";

export default class ItemSystem {
    constructor(){
        this.items = new Items();
        this.searchController = new SearchController(this);
    }
    init(){
        const _this = this;
        return new Promise((resolve, reject) => {
            Papa.parse(DataPath().EquipmentData, {
                download: true,
                complete(res){
                    LoadEquipmentData(_this.items, res.data);
                    resolve();
                },
                error(err){
                    console.warn("讀取裝備資料時發生錯誤。");
                    console.log(err);
                    reject();
                }
            });
        });
    }
}