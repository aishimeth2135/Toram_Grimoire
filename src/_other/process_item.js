import CharacterSystem from "../js/CharacterSystem/CharacterSystem.js";
import CY from "../js/main/module/Cyteria";

const CharaSystem = new CharacterSystem();

async function start(){
    await CharaSystem.init_statList();
    console.log('Init Finish');
    return new Promise((resolve, reject) => {
        resolve();
    });
}

const INDEXS = {
    name: 0,
    category: 1,
    base: 2,
    stability: 3,
    attribute_category: 4,
    attribute_name: 5,
    attribute_values: [6, 7],
    caption: 8
};

function processStatName(s){
    let t = s.match(/^(.+)\s(%)/);
    t = t ? t.slice(1) : [s, ''];
    const base = CharaSystem.findStatBaseFromText(t[0]);
    
    let baseName = {
        '拔刀攻擊': 'unsheathe_attack',
        '拔刀攻擊 %': 'unsheathe_attack_multiplier'
    }[s];

    if ( baseName === void 0 )
        baseName = {
            '武器 ATK': 'weapon_atk',
            '貼地傷害減輕': 'reduce_dmg_floor'
        }[t[0]];

    if ( baseName === void 0 )
        baseName = base ? base.baseName : void 0;
        
    const unit = t[1] == '%' && (!base || base.hasMultiplier) ? t[1] : '';
    if ( baseName === void 0 ){
        console.log('not find: ' + s);
        baseName = '(not find)' + t[0];
    }
    return {
        baseName,
        unit
    };
}

function MainProcess(data){
    data.forEach((c, i) => {
        if ( i == 0 ) return;
        const t = c['stats'].find(stat => stat['Stat/Effect'] == '潛力');
        if ( t !== void 0 ){
            let cnt = 1;
            let pre = data[i-cnt];
            while ( CY.object.isEmpty(pre['recipe_info']) ){
                ++cnt;
                pre = data[i-cnt];
            }
            if ( pre['name'] == c['name'] ){
                if ( !pre['recipe_info'] )
                    pre['recipe_info'] = {};
                pre['recipe_info']['potential'] = t['Amount'];
            }
            c['name'] = '@REMOVE';
        }
    });
    data = data.filter(c => c['name'] != '@REMOVE');

    const result = [];
    const top_column = ['名稱', '類別', '基礎ATK/DEF', '基礎穩定度', '屬性分類', '屬性名稱', '屬性值1', '屬性值2', '說明'];
    result.push(top_column);
    let A;

    function createColumn(){
        if ( A )
            result.push(A);
        return new Array(top_column.length);
    }
    function getBase(ary){
        const t = ary.find(a => a['Stat/Effect'] == '基本 ATK' || a['Stat/Effect'] == '基本 DEF');
        return t !== void 0 ? t['Amount'] : '-';
    }
    function getStability(ary){
        const t = ary.find(a => a['Stat/Effect'] == '基礎穩定率 %');
        return t !== void 0 ? t['Amount'] : '';
    }
    function getDye(ary){
        ary = ary.map(i => i === '' || Number.isInteger(parseInt(i)) ? i : '?');
        let res = '';
        if ( ary[0] )
            res += ('A' + ary[0]);
        if ( ary[1] )
            res += ('B' + ary[1]);
        if ( ary[2] )
            res += ('C' + ary[2]);
        return res;
    }
    function getCategory(t){
        let res = {
            '[1 Handed Sword]': '單手劍',
            '[2 Handed Sword]': '雙手劍',
            '[Staff]': '法杖',
            '[Magic Device]': '魔導具',
            '[Bow]': '弓',
            '[Bowgun]': '弩',
            '[Knuckles]': '拳套',
            '[Halberd]': '旋風槍',
            '[Katana]': '拔刀劍',
            '[Shield]': '盾牌',
            '[Dagger]': '小刀',
            '[Arrow]': '箭矢',
            '[Armor]': '身體裝備',
            '[Additional]': '追加裝備',
            '[Special]': '特殊裝備'
        }[t];
        if ( !res ){
            console.log('Unknow Type: ' + t);
            res = '?';
        }
        return res;
    }
    function getRestriction(t){
        const m = t.match(/^(.+)\s(only)$/);
        if ( !m )
            console.log('error: ' + t);
        else
            return m[1].toLowerCase();
    }

    A = createColumn();

    const count_max = 2000;

    if ( count_max < data.length)
        data = data.slice(0, count_max);

    data.forEach((c, curloc) => {
        try {
            A[INDEXS.name] = c['name'];
            A[INDEXS.category] = getCategory(c['category']);
            const base_stats = c['base_stats'];
            A[INDEXS.base] = getBase(base_stats);
            A[INDEXS.stability] = getStability(base_stats);
            A[INDEXS.caption] = '';

            if ( c['stats'] && c['stats'].length != 0 ){
                A[INDEXS.attribute_category] = 'stats';
                c['stats'].forEach((stat, i) => {
                    const stat_pro = processStatName(stat['Stat/Effect']);
                    A[INDEXS.attribute_name] = stat_pro.baseName;
                    A[INDEXS.attribute_values[0]] = stat['Amount'] + stat_pro.unit;
                    A[INDEXS.attribute_values[1]] = stat['Restriction'] == '-' ? '' : getRestriction(stat['Restriction']);
                    A = createColumn();
                });
            }
            

            if ( c['obtains'] && c['obtains'].length != 0 ){
                const has_list = [];
                c['obtains'].forEach((obtain, i) => {
                    A[INDEXS.attribute_category] = 'obtain';
                    let type = '', map = null, name = null, npc = null, dye = null;
                    if ( obtain['Monster'] ){
                        const cur = obtain['Monster'];
                        if ( cur.includes('[NPC]') )
                            type = 'smith';
                        else {
                            const _dye = getDye(obtain['Dye']);
                            let m = cur.match(/\[(.+)\]\s*(.+)\(Lv/);
                            if ( !m )
                                m = cur.match(/\[(.+)\]\s*(.+)/);
                            if ( has_list.find(i => i.name == m[2] && i.map == obtain['Map'] && i.dye === _dye) )
                                return;
                            type = m ? {
                                'Boss': 'boss',
                                'Mini Boss': 'mini_boss',
                                'Normal Monster': 'mobs'
                            }[m[1]] : 'other';
                            map = obtain['Map'];
                            if ( _dye !== '' )
                                dye = _dye;
                            name = m ? m[2] : cur.trim();
                            has_list.push({
                                name,
                                map,
                                dye: _dye
                            });
                        }
                    }
                    if ( obtain['Quest'] ){
                        type = 'quest';
                        name = obtain['Quest'];
                        npc = obtain['NPC'];
                        map = obtain['Map'];
                    }

                    A[INDEXS.attribute_name] = 'type';
                    A[INDEXS.attribute_values[0]] = type;
                    A = createColumn();
                    if ( name !== null ){
                        A[INDEXS.attribute_name] = 'name';
                        A[INDEXS.attribute_values[0]] = name;
                        A = createColumn();
                    }
                    if ( npc !== null ){
                        A[INDEXS.attribute_name] = 'npc';
                        A[INDEXS.attribute_values[0]] = npc;
                        A = createColumn();
                    }
                    if ( map !== null ){
                        A[INDEXS.attribute_name] = 'map';
                        A[INDEXS.attribute_values[0]] = map;
                        A = createColumn();
                    }
                    if ( dye !== null ){
                        A[INDEXS.attribute_name] = 'dye';
                        A[INDEXS.attribute_values[0]] = dye;
                        A = createColumn();
                    }
                });
            }
            if ( c['recipe_info'] && !CY.object.isEmpty(c['recipe_info']) ){
                const cur = c['recipe_info'];
                A[INDEXS.attribute_category] = 'recipe';

                if ( cur['potential'] ){
                    A[INDEXS.attribute_name] = 'item_level';
                    A[INDEXS.attribute_values[0]] = cur['Item Level'] && cur['Item Level'] !== 'N/A' ? cur['Item Level'] : '?';
                    A = createColumn();
                    A[INDEXS.attribute_name] = 'item_difficulty';
                    A[INDEXS.attribute_values[0]] = cur['Item Level'] && cur['Item Difficulty'] !== 'N/A' ? cur['Item Difficulty'] : '?';
                    A = createColumn();
                    A[INDEXS.attribute_name] = 'potential';
                    A[INDEXS.attribute_values[0]] = cur['potential'] && cur['potential'] !== 'N/A' ? cur['potential'] : '?';
                    A = createColumn();
                }
                A[INDEXS.attribute_name] = 'cost';
                A[INDEXS.attribute_values[0]] = cur['NPC Fee'].split(' ')[0];
                A = createColumn();
                    
                A[INDEXS.attribute_name] = 'materials';
                A[INDEXS.attribute_values[0]] = cur['Materials:']
                ? cur['Materials:'].split('- ')
                .map(i => i.replace(/Mana|Metal|Cloth|Wood|Beast|Medicine/g, t => ({
                    'Mana': '魔素', 'Metal': '金屬', 'Cloth': '布料',
                    'Wood': '木材', 'Beast': '獸品', 'Medicine': '藥品'
                }[t])).split('x ').reverse().join('#')
                ).slice(1).join(',')
                : '?';
                A = createColumn();
            }
        }
        catch(e){
            console.log("error at: " + curloc + ' ' + c['name']);
            console.log(c);
            console.log(e.stack);
        }
    });
    console.log(result);
    return result;
}

export {start, MainProcess};