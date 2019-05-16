const
	BASE_NAME = 0,
	CAPTION = 1,
	HAS_MULTIPLIER = 2,
	CONSTANT_UNIT = 3;

export default function(character_system, csvs){
	const c = $.csv.toArrays(csvs);
	c.forEach(function(p, index){
		if ( index == 0 )
			return;
		character_system.appendStatBase(p[BASE_NAME], p[CAPTION], p[HAS_MULTIPLIER] == '無' ? false : true);
	});
};