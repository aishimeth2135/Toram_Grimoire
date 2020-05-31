import CY from "../../main/module/cyteria.js";
import GetLang from "../../main/module/LanguageSystem.js";
import Icons from "../../main/module/SvgIcons.js";
import ShowMessage from "../../main/module/ShowMessage.js";

function Lang(s, vs){
    return GetLang('Save Load System/' + s, vs);
}

export default class Controller {
    constructor(){
        this._methods = {};

        this.nodes = {};

        const ctrr = this;
        this.listeners = {
            saveloadCsvFile(e){
                const ctr = this.getAttribute('data-ctr');
                switch (ctr){
                    case 'save_csv': {
                        const str = ctrr.getSaveCsvString();
                        if ( !str ){
                            ShowMessage(Lang('Warn/File is empty'))
                            return;
                        }
                        CY.csv.saveFile(str, ctrr.csvFileName());
                        ctrr.afterActionFinish();
                        break;
                    }
                    case 'load_csv':
                        CY.csv.loadFile({
                            loadFileSucceeded: res => {
                                ctrr.loadCsvString(res);
                                ctrr.afterActionFinish();
                            },
                            wrongFileType: () => ShowMessage(Lang('Warn/Wrong file type: csv'))
                        });
                        break;
                }
            },
            openSaveLoadWindow(e){
                ctrr.updateSaveLoadScope();
                const scope = ctrr.nodes.save_load;
                scope.classList.remove('hidden');
                scope.setAttribute('data-ctr', this.getAttribute('data-ctr'));
            },
            clickSaveLoad(e){
                const scope = ctrr.nodes.save_load;
                const ctr = scope.getAttribute('data-ctr');
                const stg = window.localStorage;

                const pretext = ctrr.dataPretext + this.getAttribute('data-i') + '-';

                const stg_name_names = pretext + 'names';
                const stg_name_data = pretext + 'data';

                const no_data = this.getAttribute('data-status') == 'no-data';
                switch (ctr){
                    case 'save': {
                        if ( !no_data && this.getAttribute('data-status') != 'confirm' ){
                            const cur = this.parentNode.querySelector('.scope[data-status="confirm"]');
                            if ( cur )
                                cur.setAttribute('data-status', '');
                            this.setAttribute('data-status', 'confirm');
                            const cfm = this.parentNode.querySelector('.save-confirm-tips');
                            cfm.classList.remove('hidden');
                            this.parentNode.insertBefore(cfm, this.nextSibling);
                            return;
                        }
                        const str = ctrr.getSaveCsvString();
                        if ( !str )
                            return;
                        stg.setItem(stg_name_names, ctrr.getSaveNameList().join(',,'));
                        stg.setItem(stg_name_data, str);
                        ShowMessage(Lang('Warn/Saving success'), 'done', 'save success');
                        break;
                    }
                    case 'load':
                        if ( no_data )
                            return;
                        if ( this.getAttribute('data-status') != 'confirm' && ctrr.beforeLoadConfirm() ){
                            const cur = this.parentNode.querySelector('.scope[data-status="confirm"]');
                            if ( cur )
                                cur.setAttribute('data-status', '');
                            this.setAttribute('data-status', 'confirm');
                            const cfm = this.parentNode.querySelector('.load-confirm-tips');
                            cfm.classList.remove('hidden');
                            this.parentNode.insertBefore(cfm, this.nextSibling);
                            return;
                        }
                        ctrr.loadCsvString(stg.getItem(stg_name_data));
                        ShowMessage(Lang('Warn/Loading success'), 'done', 'load success');
                        break;
                }
                scope.classList.add('hidden');
                ctrr.afterActionFinish();
            },
            closeWindow(e){
                this.parentNode.parentNode.classList.add('hidden');
            }
        };
    }
    init(set){
        function emptyFun(){
            // nothing
        }
        set = Object.assign({
            csvFileName: () => 'state',
            getSaveNameList: () => [],
            getSaveCsvString: () => '',
            loadCsvString: emptyFun,
            afterActionFinish: emptyFun,
            beforeLoadConfirm: () => true,
            error: emptyFun,
            saveSize: 5,
            buttonClassList: ['Cyteria', 'Button', 'line']
        }, set);

        ['csvFileName', 'getSaveNameList', 'getSaveCsvString', 'loadCsvString', 'afterActionFinish', 'beforeLoadConfirm']
            .forEach(p => {
                this._methods[p] = set[p];
            });

        if ( !set.name )
            throw new Error('Name of system must be set.');

        if ( !CY.storageAvailable('localStorage') ){
            set.error();
            return;
        }

        const simpleCreateHTML = CY.element.simpleCreateHTML;

        this.dataPretext = set.name + '--';
        this.SAVE_SIZE = set.saveSize;

        const menu_node = set.menuNode;

        const save_btn = simpleCreateHTML('span', set.buttonClassList, Icons('save') + '<span class="text">' + Lang('save') + '</span>', {'data-ctr': 'save'});
        save_btn.addEventListener('click', this.listeners.openSaveLoadWindow);
        const load_btn = simpleCreateHTML('span', set.buttonClassList, Icons('book-page') + '<span class="text">' + Lang('load') + '</span>', {'data-ctr': 'load'});
        load_btn.addEventListener('click', this.listeners.openSaveLoadWindow);
        const save_to_csv_btn = simpleCreateHTML('span', set.buttonClassList, Icons('csv-file') + '<span class="text">' + Lang('save to csv') + '</span>', {'data-ctr': 'save_csv'});
        save_to_csv_btn.addEventListener('click', this.listeners.saveloadCsvFile);
        const load_from_csv_btn = simpleCreateHTML('span', set.buttonClassList, Icons('file-import') + '<span class="text">' + Lang('load from csv') + '</span>', {'data-ctr': 'load_csv'});
        load_from_csv_btn.addEventListener('click', this.listeners.saveloadCsvFile);

        menu_node.appendChild(save_btn);
        menu_node.appendChild(load_btn);
        menu_node.appendChild(save_to_csv_btn);
        menu_node.appendChild(load_from_csv_btn);

        const createCloseWindowButton = () => {
            const btn = simpleCreateHTML('span', ['Cyteria', 'Button', 'icon-only', 'button', 'start'], Icons('close'));
            btn.addEventListener('click', this.listeners.closeWindow);
            return btn;
        };

        const sl_scope = simpleCreateHTML('div', ['Save-Load-System', 'Cyteria', 'window', 'top-center', 'frozen-top', 'save-load-scope', 'hidden']);
        const sl_scope_top = simpleCreateHTML('div', 'top');
        sl_scope_top.appendChild(simpleCreateHTML('span', 'name', Lang('Save Load: title')));
        sl_scope_top.appendChild(createCloseWindowButton());
        sl_scope.appendChild(sl_scope_top);
        sl_scope.appendChild(simpleCreateHTML('div', 'content'));

        this.nodes.save_load = sl_scope;

        //暫，幾個版本後拿掉
        const stg = window.localStorage;
        Array(this.SAVE_SIZE).fill().forEach((p, i) => {
            const _pretext = '--' + i + '-',
                pretext = this.dataPretext + i + '-';

            const _stg_name_names = _pretext + 'names',
                stg_name_names = pretext + 'names';
            const _names = stg.getItem(_stg_name_names),
                names = stg.getItem(stg_name_names);
            if ( _names && !names ){
                const _stg_name_data = _pretext + 'data';
                stg.setItem(stg_name_names, stg.getItem(_stg_name_names));
                stg.setItem(pretext + 'data', stg.getItem(_stg_name_data));
            }
        });

        return this;
    }
    csvFileName(){
        return this._methods['csvFileName']();
    }
    beforeLoadConfirm(){
        return this._methods['beforeLoadConfirm']();
    }
    afterActionFinish(){
        this._methods['afterActionFinish']();
    }
    getSaveNameList(){
        return this._methods['getSaveNameList']();;
    }
    getSaveCsvString(){
        return this._methods['getSaveCsvString']();;
    }
    loadCsvString(str){
        this._methods['loadCsvString'](str);
    }
    updateSaveLoadScope(){
        const scope = this.nodes.save_load.querySelector('.content');
        CY.element.removeAllChild(scope);

        const frg = document.createDocumentFragment();

        const simpleCreateHTML = CY.element.simpleCreateHTML;

        const stg = window.localStorage;

        Array(this.SAVE_SIZE).fill().forEach((p, i) => {
            const t = simpleCreateHTML('div', 'scope', null, {'data-i': i});
            const title = simpleCreateHTML('div', ['Cyteria', 'scope-icon'], Icons('book') + '<span class="text">'+ Lang('file') + ' ' + (i+1) + '</span>');
            const detail = simpleCreateHTML('div', 'detail');

            const names = stg.getItem(this.dataPretext + i + '-names');
            if ( names ){
                const ul = simpleCreateHTML('ul', ['Cyteria', 'ul', 'simple']);
                names.split(',,').forEach(a => ul.appendChild(simpleCreateHTML('li', null, a)));
                detail.appendChild(ul);
            }
            else {
                detail.appendChild(simpleCreateHTML('div', 'no-data', Lang('no data')));
                t.setAttribute('data-status', 'no-data');
            }

            t.appendChild(title);
            t.appendChild(detail);

            t.addEventListener('click', this.listeners.clickSaveLoad);
            frg.appendChild(t);
        });

        frg.appendChild(simpleCreateHTML('div', ['Cyteria', 'Text', 'tips', 'save-confirm-tips', 'hidden', 'entrance', 'fade-in-down'], Lang('Warn/Confirm to overwrite existing data')));
        frg.appendChild(simpleCreateHTML('div', ['Cyteria', 'Text', 'tips', 'load-confirm-tips', 'hidden', 'entrance', 'fade-in-down'], Lang('Warn/Confirm to load data')));

        scope.appendChild(frg);
    }
    /**
     * 對外接口。須透過此函數把存讀擋的視窗appendChild至任意node。
     */
    getSaveLoadWindow(){
        return this.nodes.save_load;
    }
}