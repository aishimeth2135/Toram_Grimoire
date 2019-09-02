
let Cyteria = {
	element: {
		remove(){
			Array.from(arguments).forEach(node => {
				if ( node )
					node.parentNode.removeChild(node);
			});
		},
		removeAllChild(node){
			if ( !node ) return;
			while ( node.firstChild )
				node.removeChild(node.firstChild);
			return node;
		},
		setAttributes(ele, dict){
			Object.keys(dict).forEach(k => {
				if ( dict[k] !== null )
					ele.setAttribute(k, dict[k])
			});
		},
		simpleCreateHTML(type, classList, html, attr){
			const t = document.createElement(type);
			if ( classList !== void 0 && classList !== null ){
				Array.isArray(classList) ? t.classList.add(...classList): t.classList.add(classList);
			}
			if ( html !== void 0 && html !== null )
				t.innerHTML = html;
			if ( attr !== void 0 && attr !== null )
				Cyteria.element.setAttributes(t, attr);
			return t;
		},
		convertRemToPixels(rem){    
		    return rem*parseFloat(getComputedStyle(document.documentElement).fontSize);
		}
	},
	object: {
		empty(obj){
			if ( obj === null || typeof obj !== 'object' )
				return;
			Object.keys(obj).forEach(function(key){
				delete obj[key];
			});
		},
		isEmpty(obj){
			if ( typeof obj !== 'object' )
				return true;
			return Object.keys(obj).length == 0;
		}
	},
	svg: {
		create(width=0, height=0, attr={}){
			const svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
			attr = Object.assign({
				xmlns: "http://www.w3.org/2000/svg",
				version: '1.1',
				width, height,
				viewBox: `0 0 ${width} ${height}`
			}, attr);
			Cyteria.element.setAttributes(svg, attr);
			return svg;
		},
		drawText(x, y, content, attr={}){
			const text = document.createElementNS("http://www.w3.org/2000/svg", 'text');
			attr = Object.assign({
				x, y
			}, attr);
			Cyteria.element.setAttributes(text, attr);
			text.innerHTML = content;
			return text;
		},
		drawCircle(cx, cy, r, attr={}){
			const circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
			attr = Object.assign({
				cx, cy, r
			}, attr);
			Cyteria.element.setAttributes(circle, attr);
			return circle;
		},
		drawLine(x1, y1, x2, y2, attr={}){
			const line = document.createElementNS("http://www.w3.org/2000/svg", 'line');
			attr = Object.assign({
				x1, y1, x2, y2
			}, attr);
			Cyteria.element.setAttributes(line, attr);
			return line;
		},
		drawPath(d, attr={}){
			const path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
			attr = Object.assign({d}, attr);
			Cyteria.element.setAttributes(path, attr);
			return path;
		},
		drawSector(cx, cy, startR, endR, startAngle, endAngle, clockwise, attr={}){
			const path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
			attr = Object.assign({
				d: Cyteria.svg.getSectorD(cx, cy, startR, endR, startAngle, endAngle, clockwise),
				fill: 'none'
			}, attr);
			Cyteria.element.setAttributes(path, attr);
			return path;
		},
		getSectorD(cx, cy, startR, endR, startAngle , endAngle, clockwise){
			const deg = Math.PI/180;
			const ssx = startR*Math.cos(endAngle*deg) + cx,
				ssy = -startR*Math.sin(endAngle*deg) + cy,
				sex = startR*Math.cos(startAngle*deg) + cx,
				sey = -startR*Math.sin(startAngle*deg) + cy,
				esx = endR*Math.cos(startAngle*deg) + cx,
				esy = -endR*Math.sin(startAngle*deg) + cy,
				eex = endR*Math.cos(endAngle*deg) + cx,
				eey = -endR*Math.sin(endAngle*deg) + cy;
			return `M${ssx} ${ssy}A${startR} ${startR} 0 0 ${clockwise == 1 ? 0 : 1} ${sex} ${sey}L${esx} ${esy}A${endR} ${endR} 0 0 ${clockwise} ${eex} ${eey}Z`;
		},
		createAnimate(attributeName, attr={}){
			attr = Object.assign({
				attributeName,
				repeatCount: 'indefinite'
			}, attr);
			const ani = document.createElementNS("http://www.w3.org/2000/svg", 'animate');
			Cyteria.element.setAttributes(ani, attr);
			return ani;
		},
		drawImage(path, x, y, width, height, attr={}){
			const img = document.createElementNS("http://www.w3.org/2000/svg", 'image');
			attr = Object.assign({
				x, y, width, height
			}, attr);
			img.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', path);
			Cyteria.element.setAttributes(img, attr);
			return img;
		},
		createEmpty(name, attr={}){
			const ele = document.createElementNS("http://www.w3.org/2000/svg", name);
			Cyteria.element.setAttributes(ele, attr);
			return ele;
		},
		createSimpleImagePattern(id, path, width, height, attr={}, imgattr={}){
			const pat = document.createElementNS("http://www.w3.org/2000/svg", 'pattern');
			attr = Object.assign({
				width, height, id
			}, attr);
			Cyteria.element.setAttributes(pat, attr);
			pat.appendChild(Cyteria.svg.drawImage(0, 0, path, width, height, imgattr));
			return pat;
		},
		createLinearGradient(id, x1, y1, x2, y2, stops, attr={}){
			const lg = document.createElementNS("http://www.w3.org/2000/svg", 'linearGradient');
			attr = Object.assign({
				id, x1, y1, x2, y2
			}, attr);
			Cyteria.element.setAttributes(lg, attr);
			stops.forEach(a => lg.appendChild(Cyteria.svg.createEmpty('stop', a)));
			return lg;
		},
		createRadialGradient(id, cx, cy, r, stops, attr={}){
			const rg = document.createElementNS("http://www.w3.org/2000/svg", 'radialGradient');
			attr = Object.assign({
				id, cx, cy, r
			}, attr);
			Cyteria.element.setAttributes(rg, attr);
			stops.forEach(a => rg.appendChild(Cyteria.svg.createEmpty('stop', a)));
			return rg;
		}
	},
	csv: {
		saveFile(csv_str, file_name){
			const blob = new Blob([csv_str], { type: 'text/csv;charset=utf-8;' });
	        const link = document.createElement("a");

	        const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', file_name + '.csv');
            link.classList.add('hidden');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },
        loadFile(onload_fun, wrong_file_type_fun){
        	const input = document.createElement('input');
        	input.type = 'file';
        	input.addEventListener('change', function(e){
        		document.body.removeChild(input);
        		const file = this.files[0];
        		const type = file.name.split('.').slice(-1);
        		if ( type != 'csv' ){
        			if ( typeof wrong_file_type_fun == 'function' )
        				wrong_file_type_fun();
        			return;
        		}
        		const fr = new FileReader();
        		fr.onload = function(e){
        			onload_fun(this.result);
        		};
        		fr.readAsText(file);
        	});

        	input.classList.add('hidden');
        	document.body.appendChild(input);
        	input.click();
        }
	},
	copyToClipboard(s){
		const input = document.createElement('textarea');
		input.value = s;
		document.body.appendChild(input);
		input.select();
		const t = document.execCommand('copy');
		document.body.removeChild(input);
		return t;
	},
	storageAvailable(type){
		//copy from: https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
	    const storage = window[type];;
	    try {
	        var x = '__storage_test__';
	        storage.setItem(x, x);
	        storage.removeItem(x);
	        return true;
	    }
	    catch(e) {
	        return e instanceof DOMException && (
	            // everything except Firefox
	            e.code === 22 ||
	            // Firefox
	            e.code === 1014 ||
	            // test name field too, because code might not be present
	            // everything except Firefox
	            e.name === 'QuotaExceededError' ||
	            // Firefox
	            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
	            // acknowledge QuotaExceededError only if there's something already stored
	            (storage && storage.length !== 0);
	    }
	}
};

export default Cyteria;