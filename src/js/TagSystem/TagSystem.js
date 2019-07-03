import Tag from "./module/Tag.js";
import TagController from "./module/TagController.js";
import DataPath from "../main/module/DataPath.js";
import LoadTagData from "./module/LoadTagData.js";


export default class TagSystem {
    constructor(){
        this.tagList = [];
    }
    init(options){
        this.controller = new TagController(this, options.mainNode).init();
        const _this = this;
        return new Promise((resolve, reject) => {
            Papa.parse(DataPath().TagData, {
                download: true,
                complete(res){
                    LoadTagData(_this, res.data);
                    resolve();
                },
                error(err){
                    console.warn("讀取標籤資料時發生錯誤。");
                    console.log(err);
                    reject();
                }
            });
        });
    }
    appendTag(n){
        const t = new Tag(n);
        this.tagList.push(t);
        return t;
    }
}