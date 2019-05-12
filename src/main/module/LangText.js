
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

function toLangText(s){
    if ( s === void 0 || s === null ) return '';
	s = s.replace(new RegExp('"', 'g'), '&quot;');
	return `<a ${ATTRIBUTE_NAME}="${s}"></a>`;
}

export {ConvertLangText, toLangText, currentLanguage};