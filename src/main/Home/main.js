import {startLoadingMsg, loadingMsg, loadingFinished} from "../module/LoadingPage.js";
import {readyFirst, ready} from "./ready.js";

async function start(){
    readyFirst();

    ready({
        top_menu: document.getElementById('top-menu')
    });

    loadingFinished();
}
try {
    start();
}
catch(e) {
    console.log(e);
}

// Skills Information|,|技能資料|,|スキルインフォ
    // Game Mechanics|,|資料查詢|,|ゲーム関連資料
    // Website Version|,|版本資訊|,|サイト更新履,
    // Web Tool|,|小工具|,|WEBツール