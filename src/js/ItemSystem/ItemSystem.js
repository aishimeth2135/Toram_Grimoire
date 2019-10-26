import {DataPath, createLoadDataPromise} from "../main/module/DataPath.js";
import LoadEquipmentData from "./module/LoadEquipmentData.js";
import {Items} from "./module/ItemElements.js";
import SearchController from "./module/SearchController.js";

export default class ItemSystem {
    constructor(){
        this.items = new Items();
        this.searchController = new SearchController(this);
    }
    async* init(){
        const datas = [];

        const path = DataPath('Equipment/divided');

        const promise_ary = Array(3).fill().map((p, i) => createLoadDataPromise(path[i], datas, i));

        await Promise.all(promise_ary);
        yield;

        LoadEquipmentData(this.items, datas.flat());
    }
}