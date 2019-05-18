
let Cyteria = {
	element: {
		remove: function(){
			let args = Array.from(arguments);
			Array.from(arguments).forEach(function(node){
				if ( node )
					node.parentNode.removeChild(node);
			});
		},
		removeAllChild: function(node){
			if ( !node ) return;
			while( node.firstChild )
				node.removeChild(node.firstChild);
			return node;
		},
		setAttributes: function(ele, dict){
			Object.keys(dict).forEach(k =>{
				if ( dict[k] !== null )
					ele.setAttribute(k, dict[k])
			});
		}
	},
	class: {
		/*@param c : Child Class
		| @param [... : Parent Class
		*/
		extends: function(c){
			let args = Array.from(arguments);
			c.prototype = Object.create(args[1].prototype);
			args.forEach(function(item, i){
				if (i <= 1) return;
				Object.assign(c.prototype, item.prototype);
			});
			c.constructor = c;
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
		create(width, height, attr={}){
			const svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
			attr = Object.assign({
				xmlns: "http://www.w3.org/2000/svg",
				width, height,
				viewBox: `0 0 ${width} ${height}`
			}, attr);
			Cyteria.element.setAttributes(svg, attr);
			return svg;
		},
		drawCircle(cx, cy, r, attr={}){
			const circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
			attr = Object.assign({
				cx, cy, r
			}, attr);
			Cyteria.element.setAttributes(circle, attr);
			return circle;
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
			const ssx = startR*Math.cos(endAngle*Math.PI/180) + cx,
				ssy = -startR*Math.sin(endAngle*Math.PI/180) + cy,
				sex = startR*Math.cos(startAngle*Math.PI/180) + cx,
				sey = -startR*Math.sin(startAngle*Math.PI/180) + cy,
				esx = endR*Math.cos(startAngle*Math.PI/180) + cx,
				esy = -endR*Math.sin(startAngle*Math.PI/180) + cy,
				eex = endR*Math.cos(endAngle*Math.PI/180) + cx,
				eey = -endR*Math.sin(endAngle*Math.PI/180) + cy;
			return `M${ssx} ${ssy} A${startR} ${startR} 0 0 ${clockwise == 1 ? 0 : 1} ${sex} ${sey} L${esx} ${esy} A${endR} ${endR} 0 0 ${clockwise} ${eex} ${eey} Z`;
		},
		createAnimate(attributeName, attr={}){
			attr = Object.assign({
				attributeName,
				repeatCount: 'indefinite'
			}, attr);
			const ani = document.createElementNS("http://www.w3.org/2000/svg", 'animate');
			Cyteria.element.setAttributes(ani, attr);
			return ani;
		}
	}
};

export default Cyteria;