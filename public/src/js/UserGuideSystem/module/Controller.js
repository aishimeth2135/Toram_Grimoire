import CY from "../../main/module/cyteria.js";
import Icons from "../../main/module/SvgIcons.js";

import GetLang from "../../main/module/LanguageSystem.js";
import {UserGuideFrame, UserGuideText, ElementGroup} from "./Element.js";


function Lang(s, vs){
    return GetLang('User Guide System/' + s, vs);
}

export default class Controller {
    constructor(){
        this.frames = [];

        this.nodes = {
            'main': null,
            'skip-guide-button': null
        }

        this.status = {
            startCaption: Lang('Start Caption: default'),
            startTitle: Lang('Start Title: default'),
            currentIndex: -1,
            prepareEnd: false
        };
    }
    init(){
        const simpleCreateHTML = CY.element.simpleCreateHTML;
        const main = simpleCreateHTML('div', ['User-Guide--main', 'hidden']);

        const ctrr = this;
        main.addEventListener('click', function(e){
            if ( ctrr.status.prepareEnd ){
                ctrr.reset();
                return;
            }
            !ctrr.nextFrame() && ctrr.end();
        });

        const skip_btn = simpleCreateHTML('span', ['Cyteria', 'Button', 'simple', 'no-border'], Icons('close') + `<span class="text">${Lang('skip user guide')}</span>`);
        skip_btn.addEventListener('click', function(e){
            ctrr.end();
        })
        this.nodes['skip-guide-button'] = skip_btn;

        document.body.appendChild(main);
        this.nodes['main'] = main;

        return this;
    }
    setStartText(title, cap){
        this.status.startTitle = title;
        this.status.startCaption = cap;
    }
    appendFrame(type){
        const f = new UserGuideFrame(type);
        this.frames.push(f);
        return f;
    }
    start(){
        this.reset();
        
        const cap = CY.element.simpleCreateHTML('div', 'main-caption', '<div class="container">'
            + `<div class="title">${this.status.startTitle}</div>`
            + `<div class="content">${this.status.startCaption}</div>`
            + `<div class="tips">${Lang('Start Caption Tips')}</div>`
            + '<div class="buttons-scope"></div></div>');
        cap.querySelector('.buttons-scope').appendChild(this.nodes['skip-guide-button']);
        CY.element.removeAllChild(this.nodes['main']);
        this.nodes['main'].appendChild(cap);

        this.nodes['main'].classList.remove('hidden');
    }
    end(){
        const cap = CY.element.simpleCreateHTML('div', 'main-caption', '<div class="container">'
            + `<div class="title">${Lang('End Title')}</div>`
            + `<div class="content">${Lang('End Caption')}</div>`
            + `<div class="tips">${Lang('End Caption Tips')}</div>`
            + '</div>');
        CY.element.removeAllChild(this.nodes['main']);
        this.nodes['main'].appendChild(cap);

        this.status.prepareEnd = true;
    }
    reset(){
        this.nodes['main'].classList.add('hidden');
        this.status.currentIndex = -1;
        this.status.prepareEnd = false;
    }
    nextFrame(){
        ++this.status.currentIndex;
        if ( this.status.currentIndex >= this.frames.length )
            return false;

        this.updateMainHTML();
        return true;
    }
    updateMainHTML(){
        const simpleCreateHTML = CY.element.simpleCreateHTML;
        CY.element.removeAllChild(this.nodes['main']);

        const f = this.frames[this.status.currentIndex];
        const main_frg = document.createDocumentFragment();

        f.elementGroups.forEach((group, group_index) => {
            let min_left = null,
                max_right = null,
                max_bottom = null,
                min_top = null;
            
            const frg = document.createDocumentFragment();

            group.elements.forEach(el => {
                const rect = el.getBoundingClientRect();
                const l = rect.left,
                    r = rect.left + rect.width,
                    t = rect.top,
                    b = rect.top + rect.height;
                (min_left == null || l < min_left) && (min_left = l);
                (max_right == null || r > max_right) && (max_right = r);
                (min_top == null || t < min_top) && (min_top = t);
                (max_bottom == null|| b > max_bottom) && (max_bottom = b);
            });

            const pd = 40, text_space = 40, text_pd = 20;
            const bg_circle = simpleCreateHTML('div', 'bg-circle');
            group_index == 0 && bg_circle.classList.add('first');
            bg_circle.setAttribute('style', `left:${(min_left - pd)}px;top:${(min_top - pd)}px;`
                + `width:${(max_right - min_left + 2*pd)}px;height:${(max_bottom - min_top + 2*pd)}px`);

            main_frg.appendChild(bg_circle);
            main_frg.appendChild(frg);

            if ( group.guideText !== null ){
                const text_scope = simpleCreateHTML('div', 'text-scope', group.guideText.text);
                let text_pos_style = '';
                const pos = group.guideText.position;
                const vw = this.nodes['main'].clientWidth,
                    vh = this.nodes['main'].clientHeight;
                if ( pos == UserGuideText.POSITION_TOP || pos == UserGuideText.POSITION_BOTTOM ){
                    text_pos_style = pos == UserGuideText.POSITION_TOP
                        ? `bottom:${(vh - min_top + pd + text_space)}px;`
                        : `top:${(max_bottom + pd + text_space)}px;`;
                    const m = vw / 2;
                    
                    text_pos_style += ( max_right <= m || (max_right - m < m - min_left) ) // 如果偏左
                        ? `left:${min_left - pd}px;width:${(vw - min_left - text_pd)}px;`
                        : `right:${vw - max_right}px;width:${(max_right - text_pd)}px;text-align:right;`
                }
                if ( pos == UserGuideText.POSITION_LEFT || pos == UserGuideText.POSITION_RIGHT ){
                    text_pos_style = pos == UserGuideText.POSITION_LEFT
                        ? `left:${text_pd}px;width:${min_left - text_space - text_pd}px;text-align:right;`
                        : `left:${(max_right + text_space)}px;width:${vw - max_right - text_pd}px;`;
                    const m = vh / 2;
                    text_pos_style += ( max_bottom <= m || (max_bottom - m < m - min_top ) ) // 如果偏上
                        ? `top:${min_top}px;`
                        : `bottom:${(vw  - max_bottom)}px;`;
                }
                text_scope.setAttribute('style', text_pos_style);

                main_frg.appendChild(text_scope);
            }
        });

        this.nodes['main'].appendChild(main_frg);
    }
}
