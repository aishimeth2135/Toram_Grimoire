import GetLang from "../../main/module/LanguageSystem.js";

function Lang(s){
	return GetLang('stat base/' + s);
}


class StatBase {
	constructor(bn, t, hm){
		this.baseName = bn;
		this.text = t;
		this.hasMultiplier = hm;
		this.attributes = {};
	}
	appendAttribute(n, v){
		if ( n && v !== null && v !== void 0 )
			this.attributes[n] = v;
		return this;
	}
	show(type, v, config){
		config = Object.assign({
			processPositiveValue: null,
			processNegativeValue: null,
			set_sign: null,
			calc: true
        }, config);

		if ( typeof v != 'number' && config.calc )
			v = parseFloat(v);
		const processFormula = (formula, unit) => {
			const sign = config.set_sign ? config.set_sign : (v < 0 ? '' : '+');
			formula = formula.split('::')[v < 0 ? 1 : 0] || formula;
			let res = formula
				.replace('$t', this.text)
				.replace('$u', unit)
				.replace('$s', sign)
				.replace('$v', config.calc ? Math.floor(v) : v)
				.replace(/\$(\d+)d/, (m, m1) => v.toFixed(parseInt(m1)));
			if ( config.processPositiveValue && v >= 0 )
				res = config.processPositiveValue(res);
			if ( config.processNegativeValue && v < 0 )
				res = config.processNegativeValue(res);
			return res;
		}
		switch (type) {
			case StatBase.TYPE_CONSTANT: {
				const formula = this.attributes['constant_formula'] || '$t$s$v$u';
				return processFormula(formula, this.hasMultiplier ? '' : '%');
			}
			case StatBase.TYPE_MULTIPLIER: {
				const formula = this.attributes['multiplier_formula'] || '$t$s$v$u';
				return processFormula(formula, '%');
			}
			case StatBase.TYPE_TOTAL: {
				const formula = Lang('type total: preText') + '$t$s$v$u';
				return processFormula(formula, '%');;
			}
		}
	}
	getShowData(type, v){
		let title = '', tail = '';
		switch (type) {
			case StatBase.TYPE_CONSTANT: {
				title = this.text;

				if ( !this.hasMultiplier )
					tail = '%';
				if ( this.attributes['constant_formula'] && !this.attributes['constant_formula'].includes('$u') )
					tail = '';
			} break;
			case StatBase.TYPE_MULTIPLIER: {
				title = this.text;
				tail = '%';
				if ( this.attributes['multiplier_formula'] && !this.attributes['multiplier_formula'].includes('$u') )
					tail = '';
			} break;
			case StatBase.TYPE_TOTAL: {
				title = Lang('type total: preText') + this.text;
				tail = '%';
			} break;
		}
		return {
			result: this.show(type, v),
			title,
			value: v,
			tail
		};
	}
	createSimpleStat(type, v){
		return new SimpleStat(this, type, v);
	}
}

StatBase.TYPE_CONSTANT = Symbol('constant');
StatBase.TYPE_MULTIPLIER = Symbol('multiplier');
StatBase.TYPE_TOTAL = Symbol('total');


class SimpleStat {
	constructor(base, type, v=0){
		this.base = base;
		this.type = type;
		this.value = v;
	}
	show(config){
		return this.base.show(this.type, this.value, config);
	}
	getShowData(){
		return this.base.getShowData(this.type, this.value);	
	}
	statValue(v){
		if ( v !== void 0 )
			this.value = v;
		return this.value;
	}
	baseName(){
		return this.base.baseName;
	}
}

export default StatBase;