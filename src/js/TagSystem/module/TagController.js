import CY from "../../main/module/cyteria.js";
import GetLang from "../../main/module/LanguageSystem.js";

function Lang(s){
    return GetLang("Tag System/" + s);
}


export default class TagController {
    constructor(parent, node){
        this.parent = parent;
        this.nodes = {
            main: node,
            content: null,
            tagName: null
        };
        this.status = {
            currentTag: null,
            readRecords: []
        };
        this.listeners = {
            showTagButton: null
        };
    }
    init(){
        const simpleCreateHTML = CY.element.simpleCreateHTML;
        const root = this.nodes.main;
        const ctrr = this;

        const top = simpleCreateHTML('div', 'top');

        const pre_btn = simpleCreateHTML('span', 'button', '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M14.71 15.88L10.83 12l3.88-3.88c.39-.39.39-1.02 0-1.41-.39-.39-1.02-.39-1.41 0L8.71 11.3c-.39.39-.39 1.02 0 1.41l4.59 4.59c.39.39 1.02.39 1.41 0 .38-.39.39-1.03 0-1.42z"/></svg>');
        pre_btn.addEventListener('click', function(e){
            const rs = ctrr.status.readRecords;
            if ( rs.length === 0 )
                return;
            ctrr.status.currentTag = null;
            ctrr.showTag(rs.pop());
        });
        top.appendChild(pre_btn);

        const name = simpleCreateHTML('span', 'name');

        const close = simpleCreateHTML('span', ['button', 'right'], '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M18.3 5.71c-.39-.39-1.02-.39-1.41 0L12 10.59 7.11 5.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41L10.59 12 5.7 16.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l4.89 4.89c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"/></svg>');
        close.addEventListener('click', function(e){
            ctrr.nodes.main.classList.add('hidden');
        });

        top.appendChild(pre_btn);
        top.appendChild(name);
        top.appendChild(close);

        root.appendChild(top);

        const content = simpleCreateHTML('div', 'content');
        root.appendChild(content);

        this.nodes.content = content;
        this.nodes.tagName = name;

        this.listeners.showTagButton = function(e){
            ctrr.showTagByName(this.innerText);
        };

        return this;
    }
    showTagByName(s){
        const res = this.parent.tagList.find(t => t.name === s);
        if ( s === '' || res === void 0 ){
            console.warn('Unknow Tag Name: ' + s);
            return;
        }
        this.showTag(res);
    }
    showTag(tag){
        if ( this.status.currentTag !== null )
            this.status.readRecords.push(this.status.currentTag);
        this.status.currentTag = tag;
        const he = document.createDocumentFragment();
        tag.frames.forEach(f => he.appendChild(this.createFrameHTML(f)));
        CY.element.removeAllChild(this.nodes.content);
        this.nodes.content.appendChild(he);

        this.nodes.main.classList.remove('hidden');
        this.nodes.tagName.innerHTML = tag.name;
    }
    createFrameHTML(f){
        function processText(t){
            return t
            .replace(/\(\(!((?:(?!\(\().)+)\)\)/g, (...args) => lightText(args[1]))
            .replace(/\(\(((?:(?!\(\().)+)\)\)/g, (...args) => separateText(args[1]))
            .replace(/#([^\s]+)\s(\w?)/g, (...args) => {
                let res = '<span class="show_tag_button">' + args[1] + '</span>';
                if ( args[2] !== '' )
                    res += " ";
                return res;
            });
        }
        function lightText(text){
            return '<span class="light">' + text + '</span>';
        }
        function separateText(t){
            return '<span class="separate_text">' + t + '</span>';
        }
        const type = f.type;
        const he = CY.element.simpleCreateHTML('div', 'frame-' + type);
        switch (type){
            case 'category':
                he.innerHTML = '<svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="1250pt" height="1250pt" viewBox="0 0 1250 1250" preserveAspectRatio="xMidYMid meet"><g transform="translate(0,1250) scale(0.1,-0.1)" fill="#000000" stroke="none"><path d="M1468 11473 c-29 -34 -57 -98 -75 -173 -15 -62 -18 -111 -16 -277 l2 -201 -102 34 c-112 38 -148 42 -168 18 -15 -18 -20 -114 -8 -164 4 -19 15 -100 24 -180 56 -495 128 -757 306 -1113 76 -153 214 -396 234 -412 7 -6 78 -141 158 -300 364 -728 566 -1026 995 -1466 l163 -168 -50 -203 c-137 -556 -160 -746 -168 -1370 l-5 -428 -55 -82 c-70 -108 -155 -259 -203 -361 -96 -210 -132 -392 -146 -743 l-7 -159 27 -32 c67 -80 199 -105 317 -59 37 14 69 22 73 19 3 -3 8 2 12 11 3 9 15 16 25 16 10 0 62 11 115 25 102 27 198 71 252 118 l34 28 62 -133 c35 -73 79 -160 99 -193 l35 -60 -221 -6 c-231 -6 -245 -8 -492 -40 -169 -23 -172 -23 -310 -44 -354 -53 -385 -59 -435 -85 -45 -23 -42 -7 -42 -205 0 -139 -13 -216 -66 -397 -33 -112 -30 -132 28 -159 33 -16 55 -15 368 12 389 32 865 65 1177 79 264 13 1155 6 1345 -9 74 -6 218 -18 320 -26 221 -19 532 -53 920 -101 157 -19 292 -36 300 -36 8 0 107 9 220 21 113 11 230 23 260 26 30 3 150 14 265 24 950 88 1527 101 2285 51 204 -14 768 -65 993 -91 150 -17 181 -18 205 -7 30 15 28 -14 15 253 -5 103 -2 140 21 264 24 132 25 146 11 167 -8 13 -24 24 -34 24 -10 0 -72 13 -137 29 -467 115 -798 166 -1299 201 -88 7 -183 15 -211 18 l-52 7 80 95 c111 131 206 278 295 455 42 82 77 152 79 154 2 2 31 -19 66 -46 152 -120 255 -176 398 -218 52 -15 163 -61 245 -100 173 -84 230 -105 286 -105 73 0 119 41 148 130 10 32 6 47 -43 175 -168 435 -316 713 -586 1103 -127 183 -128 184 -134 332 -2 63 -7 122 -9 130 -3 8 -11 94 -17 190 -10 158 -18 263 -36 445 -3 33 -12 112 -20 175 -9 63 -18 144 -21 180 -3 36 -9 70 -13 75 -4 6 -13 39 -20 75 -16 81 -73 261 -114 360 -30 72 -31 76 -16 107 8 18 50 68 93 111 42 43 77 86 77 94 0 9 25 41 55 72 30 30 55 59 55 63 1 15 196 243 397 465 155 171 503 524 658 669 154 143 526 469 739 649 293 248 381 320 387 320 10 0 119 180 119 197 0 8 5 23 10 34 23 42 -16 69 -124 89 -33 5 -61 12 -63 13 -2 2 17 22 43 43 72 61 142 134 147 154 7 27 -18 56 -51 63 -52 10 -661 67 -822 76 -219 13 -695 5 -870 -14 -571 -62 -1039 -208 -1763 -551 -295 -140 -1053 -539 -1090 -573 -16 -16 -24 -16 -80 -5 -399 82 -658 113 -957 114 -287 2 -542 -22 -1110 -104 l-235 -34 -110 70 c-194 125 -241 156 -658 427 -423 275 -994 659 -1350 908 -230 161 -773 557 -1107 808 -118 89 -225 167 -237 173 -31 17 -68 15 -85 -5z"/></g></svg><span>' + processText(f.value) + '</span>';
                break;
            case 'caption':
                he.innerHTML = processText(f.value);
                break;
            case 'list': {
                const ul = CY.element.simpleCreateHTML('ul', ['Cyteria', 'ul', 'simple']);
                Array.isArray(f.value)
                ? f.value.forEach(v => ul.appendChild(CY.element.simpleCreateHTML('li', null, processText(v))))
                : ul.appendChild(CY.element.simpleCreateHTML('li', null, processText(f.value)));

                he.appendChild(ul);
            }
        }
        this.processShowTagButton(he.querySelectorAll('.show_tag_button'));
        return he;
    }
    processShowTagButton(nodelist){
        Array.from(nodelist).forEach(node => node.addEventListener('click', this.listeners.showTagButton));
    }
}