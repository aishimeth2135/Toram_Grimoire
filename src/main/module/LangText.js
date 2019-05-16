
function currentLanguage(){
	return 1;
}

const ATTRIBUTE_NAME = 'data-langtext';

function AnalysisLangText(s){
	let l = s.split('|,|');
	return l[currentLanguage()] || l[0];
}

function ConvertLangText(hnode){
	let list = hnode.querySelectorAll(`a[${ATTRIBUTE_NAME}], input[${ATTRIBUTE_NAME}]`);
	Array.from(list).forEach((item) => {
		item.innerHTML = AnalysisLangText(item.getAttribute(ATTRIBUTE_NAME));
	});
}

function toLangText(s, setting={}){
    if ( s === void 0 || s === null ) return '';
	s = s.replace(new RegExp('"', 'g'), '&quot;');
	const a = document.createElement('a');
	a.setAttribute(ATTRIBUTE_NAME, s);
	if ( setting.href )
		a.href = setting.href;
	if ( setting.class )
		(!Array.isArray(setting.class)) ? a.classList.add(setting.class) : a.classList.add(...setting.class);
	return a.outerHTML;
}

export {ConvertLangText, toLangText, currentLanguage};