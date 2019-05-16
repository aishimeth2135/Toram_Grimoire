
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
	}
};

export default Cyteria;