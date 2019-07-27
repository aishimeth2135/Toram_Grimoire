export default function(character_system, c){
	const
		BASE_NAME = 0,
		CAPTION = 1,
		HAS_MULTIPLIER = 2,
		CONSTANT_FORMULA = 3,
		MULTIPLIER_FORMULA = 4;
	c.forEach((p, index) => {
		if ( index == 0 )
			return;
		const stat = character_system.appendStatBase(p[BASE_NAME], p[CAPTION], p[HAS_MULTIPLIER] == '無' ? false : true);
		if ( p[CONSTANT_FORMULA] )
			stat.appendAttribute('constant_formula', p[CONSTANT_FORMULA]);
		if ( p[MULTIPLIER_FORMULA] )
			stat.appendAttribute('multiplier_formula', p[MULTIPLIER_FORMULA]);
	});
};