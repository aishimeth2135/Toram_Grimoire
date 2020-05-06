import Grimoire from "@Grimoire";
import {startLoadingMsg, loadingMsg, loadingError, loadingFinished, loadingSuccess, AllLoadingFinished} from "@global-modules/LoadingPage.js";
import {viewInit, viewInitReady, viewInitEnd, handleInit} from "@global-modules/viewInit.js";
import GetLang from "@global-modules/LanguageSystem.js";

import zh_tw from "./LanguageData/zh_tw.js";
import en from "./LanguageData/en.js";
import ja from "./LanguageData/ja.js";
import zh_cn from "./LanguageData/zh_cn.js";


async function start(){
    await viewInit({
        languageDatas: {zh_tw, en, ja, zh_cn}
    });
    
    viewInitReady();

    viewInitEnd();
}

export default function (){
    handleInit( start );
};