import GetLang from "../../main/module/LanguageSystem.js";

function Lang(s){
	return GetLang('stat base/' + s);
}


class StatBase {
	constructor(bn, t, hm){
		this.baseName = bn;
		this.text = t;
		this.hasMultiplier = hm;
		this.attributes = [];
	}
	appendAttribute(n, v){
		if ( n && v !== null && v !== void 0 )
			this.attributes[n] = v;
		return this;
	}
	show(type, v){
		if ( typeof v != 'number' )
			v = parseInt(v);
		switch (type) {
			case StatBase.TYPE_CONSTANT: {
				let res = this.text;
				res += v < 0 ? '' : '+';
				res += v;
				if ( !this.hasMultiplier )
					res += this.attributes['constant_unit'] === void 0 ? '%' : this.attributes['constant_unit'];
				return res;
			}
			case StatBase.TYPE_MULTIPLIER: {
				let res = this.text;
				res += v < 0 ? '' : '+';
				res += v;
				res += '%';
				return res;
			}
			case StatBase.TYPE_TOTAL: {
				let res = Lang('type total: preText') + this.text;
				res += v < 0 ? '' : '+';
				res += v;
				res += '%';
				return res;
			}
		}
	}
	getShowData(type, v){
		let title = '', tail = '';
		switch (type) {
			case StatBase.TYPE_CONSTANT: {
				title = this.text;
				if ( !this.hasMultiplier )
					tail = this.attributes['constant_unit'] === void 0 ? '%' : this.attributes['constant_unit'];
			} break;
			case StatBase.TYPE_MULTIPLIER: {
				title = this.text;
				tail = '%';
			} break;
			case StatBase.TYPE_TOTAL: {
				title = Lang('type total: preText') + this.text;
				tail = '%'
			} break;
		}
		return {title, value: v, tail};
	}
	createSimpleStat(type, v){
		return new SimpleStat(this, type, v);
	}
}

StatBase.TYPE_CONSTANT = Symbol();
StatBase.TYPE_MULTIPLIER = Symbol();
StatBase.TYPE_TOTAL = Symbol();


class SimpleStat {
	constructor(base, type, v=0){
		this.base = base;
		this.type = type;
		this.value = v;
	}
	show(){
		return this.base.show(this.type, this.value);
	}
	getShowData(){
		return this.base.getShowData(this.type, this.value);	
	}
	statValue(v){
		if ( v !== void 0 )
			this.value = v;
		return this.value;
	}
}

export default StatBase;