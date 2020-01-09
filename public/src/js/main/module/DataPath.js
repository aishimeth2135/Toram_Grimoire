function DataPath(id){
    /* 語言資料：
        依陣列排序，依序為[en, zh_tw, ja, zh_cn]
    */
    switch (id) {
        case 'Skill':
            return 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS_XhF85gZ5sd9AtOMSM6JY4OuQwFlD6kToQynQ4bMq_fiaUNr26c7dbrIs6WeWnscKe1rau1npWYe7/pub?gid=170573319&single=true&output=csv&range=A:Q';
        case 'Skill/language':
            return  [
                'https://docs.google.com/spreadsheets/d/e/2PACX-1vS_XhF85gZ5sd9AtOMSM6JY4OuQwFlD6kToQynQ4bMq_fiaUNr26c7dbrIs6WeWnscKe1rau1npWYe7/pub?gid=170573319&single=true&output=csv&range=R:R',
                null,
                'https://docs.google.com/spreadsheets/d/e/2PACX-1vS_XhF85gZ5sd9AtOMSM6JY4OuQwFlD6kToQynQ4bMq_fiaUNr26c7dbrIs6WeWnscKe1rau1npWYe7/pub?gid=170573319&single=true&output=csv&range=S:S',
                'https://docs.google.com/spreadsheets/d/e/2PACX-1vS_XhF85gZ5sd9AtOMSM6JY4OuQwFlD6kToQynQ4bMq_fiaUNr26c7dbrIs6WeWnscKe1rau1npWYe7/pub?gid=170573319&single=true&output=csv&range=T:T'
            ];
        case 'Skill Main':
            return 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS_XhF85gZ5sd9AtOMSM6JY4OuQwFlD6kToQynQ4bMq_fiaUNr26c7dbrIs6WeWnscKe1rau1npWYe7/pub?gid=2033454381&single=true&output=csv&range=A:D';
        case 'Skill Main/language': 
            return [
                'https://docs.google.com/spreadsheets/d/e/2PACX-1vS_XhF85gZ5sd9AtOMSM6JY4OuQwFlD6kToQynQ4bMq_fiaUNr26c7dbrIs6WeWnscKe1rau1npWYe7/pub?gid=2033454381&single=true&output=csv&range=F:F',
                null,
                'https://docs.google.com/spreadsheets/d/e/2PACX-1vS_XhF85gZ5sd9AtOMSM6JY4OuQwFlD6kToQynQ4bMq_fiaUNr26c7dbrIs6WeWnscKe1rau1npWYe7/pub?gid=2033454381&single=true&output=csv&range=G:G',
                'https://docs.google.com/spreadsheets/d/e/2PACX-1vS_XhF85gZ5sd9AtOMSM6JY4OuQwFlD6kToQynQ4bMq_fiaUNr26c7dbrIs6WeWnscKe1rau1npWYe7/pub?gid=2033454381&single=true&output=csv&range=H:H'
            ];
        case 'Character Stats':
            return 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS_XhF85gZ5sd9AtOMSM6JY4OuQwFlD6kToQynQ4bMq_fiaUNr26c7dbrIs6WeWnscKe1rau1npWYe7/pub?gid=616452461&single=true&output=csv&range=A:D';
        case 'Character Stats/language':
            return [
                null,
                null,
                null,
                'https://docs.google.com/spreadsheets/d/e/2PACX-1vS_XhF85gZ5sd9AtOMSM6JY4OuQwFlD6kToQynQ4bMq_fiaUNr26c7dbrIs6WeWnscKe1rau1npWYe7/pub?gid=616452461&single=true&output=csv&range=J:K'
            ];
        case 'Tag':
            return 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS_XhF85gZ5sd9AtOMSM6JY4OuQwFlD6kToQynQ4bMq_fiaUNr26c7dbrIs6WeWnscKe1rau1npWYe7/pub?gid=1107380961&single=true&output=csv&range=A:C';
        case 'Tag/language':
            return [
                'https://docs.google.com/spreadsheets/d/e/2PACX-1vS_XhF85gZ5sd9AtOMSM6JY4OuQwFlD6kToQynQ4bMq_fiaUNr26c7dbrIs6WeWnscKe1rau1npWYe7/pub?gid=1107380961&single=true&output=csv&range=D:E',
                null,
                'https://docs.google.com/spreadsheets/d/e/2PACX-1vS_XhF85gZ5sd9AtOMSM6JY4OuQwFlD6kToQynQ4bMq_fiaUNr26c7dbrIs6WeWnscKe1rau1npWYe7/pub?gid=1107380961&single=true&output=csv&range=F:G',
                'https://docs.google.com/spreadsheets/d/e/2PACX-1vS_XhF85gZ5sd9AtOMSM6JY4OuQwFlD6kToQynQ4bMq_fiaUNr26c7dbrIs6WeWnscKe1rau1npWYe7/pub?gid=1107380961&single=true&output=csv&range=H:I'
            ];
        case 'Equipment/divided':
            return [
                'https://docs.google.com/spreadsheets/d/e/2PACX-1vRwaGM9CClGkSw-6iUFmdOyIeI-_9i5RvIuHdSCTCUgFCk7GV4v1evt5C79JSG5P66ZGopM2-ZJJaEA/pub?gid=0&single=true&output=csv&range=A2:I6000',
                'https://docs.google.com/spreadsheets/d/e/2PACX-1vRwaGM9CClGkSw-6iUFmdOyIeI-_9i5RvIuHdSCTCUgFCk7GV4v1evt5C79JSG5P66ZGopM2-ZJJaEA/pub?gid=0&single=true&output=csv&range=A6001:I12000',
                'https://docs.google.com/spreadsheets/d/e/2PACX-1vRwaGM9CClGkSw-6iUFmdOyIeI-_9i5RvIuHdSCTCUgFCk7GV4v1evt5C79JSG5P66ZGopM2-ZJJaEA/pub?gid=0&single=true&output=csv&range=A12001:I18000'
            ];
        case 'Enchant':
            return 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ4beI9I-sFoTgbTaKeMHRVo3xNm3gc5nQ-MWb9u7dlzRk0QmnMoJwcaR0815IqP0t-9-htpS8mUdQ1/pub?gid=0&single=true&output=csv&range=A:K';

    }
    console.warn("Unknow DataPath Name.")
    return void 0;
};

function createLoadDataPromise(path, data_ary, index){
    return new Promise((resolve, reject) => {
        if ( typeof path == 'string' && path ){
            Papa.parse(path, {
                download: true,
                complete(res){
                    data_ary[index] = res.data;
                    resolve();
                },
                error(err){
                    data_ary[index] = null;
                    console.warn("Error when load data.");
                    console.log(err);
                    reject();
                }
            });
        }
        else {
            data_ary[index] = null;
            resolve();
        }
    });
}

export {DataPath, createLoadDataPromise};