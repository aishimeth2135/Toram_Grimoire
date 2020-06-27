

async function main(){
    const f1 = await fetch("./items.csv");
    const text = await f1.text();

    const f2 = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vS_XhF85gZ5sd9AtOMSM6JY4OuQwFlD6kToQynQ4bMq_fiaUNr26c7dbrIs6WeWnscKe1rau1npWYe7/pub?gid=616452461&single=true&output=csv&range=A:E');
    const stat_text = await f2.text();

    const stats = Papa.parse(stat_text).data;
    console.log(stats);

    const findId = s => {
        if ( s == '恨意值' )
            s = '仇恨值';
        if ( s == '攻擊MP恢復' || s == '攻擊回復MP' )
            s = '攻擊MP回復';
        if ( s == 'MP' || s == '最大MP' )
            s = 'MP上限';
        if ( s == 'HP' || s == '最大HP' )
            s = 'HP上限';
        if ( s == '地面屬性傷害減輕' )
            s = '地面傷害減輕';
        if ( s == '抗水性屬性' )
            s = '抗水屬性';

        const t = stats.find(p => p[1] == s);
        return t ? {id: t[0], has_m: t[3] == '包含'} : {id: null, has_m: false}; 
    };

    const NAME = 0,
        LIST = 1;

    const res = [];
    const createColumn = () => {
        const t = [];
        res.push(t);
        return t;
    };

    Papa.parse(text).data.forEach(p => {
        if ( p[0] == '' )
            return; 
        try {
            let enhancer = null;
            const name = p[NAME];
            const list = p[LIST].replace(/\(([^\)]+)\)\s{1}/, (m, m1) => {
                enhancer = m1.replace('強化', '');
                return '';
            });

            let cur = createColumn();
            cur[0] = name;

            list.split('、').forEach((a, i) => {
                let [m0, n, sign, value, unit] = a.match(/([^+-\d]+)([+-]?)(\d+)([%~]?)/);

                const {id, has_m} = findId(n);
                if ( !id ){
                    console.warn(n);
                    return;
                }

                if ( i != 0 ){
                    cur = createColumn();
                }
                else {
                    cur[1] = 'stats';
                }
                cur[2] = id;

                if ( !has_m )
                    unit = '';
                cur[3] = (sign == '-' ? '-' : '') + value + unit;
            });
            if ( enhancer ){
                cur = createColumn();
                cur[1] = 'other';
                cur[2] = 'enhancer';
                cur[3] = enhancer;
            }
        }
        catch (e){
            console.log(p);
            console.log(e);
        }
    });

    return Papa.unparse(res);
}

 main().then(res => document.getElementById('main').value = res);