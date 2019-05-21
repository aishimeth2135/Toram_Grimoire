const
	BASE_NAME = 0,
	CAPTION = 1,
	HAS_MULTIPLIER = 2,
	CONSTANT_UNIT = 3;

export default function(character_system, c){
	c.forEach(function(p, index){
		if ( index == 0 )
			return;
        const content_unit = p[CONSTANT_UNIT] === '' ? null : ( p[CONSTANT_UNIT] == '@none'  ? '' : p[CONSTANT_UNIT] );
		character_system.appendStatBase(p[BASE_NAME], p[CAPTION], p[HAS_MULTIPLIER] == '無' ? false : true)
            .appendAttribute('constant_unit', content_unit);
	});
};