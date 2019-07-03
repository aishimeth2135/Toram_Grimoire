function SkillTreeTableData(/*int*/stcn, /*int*/stn) {
	const data_ary = [
		[
			[[4, 2, 2, 1], [1], [2, 2, 1], [1], [2, 2, -2], [1, 1]],
			[[3, 2, -3], [1, -2], [1, 1, 1, 1], [2, -4], [1, 1, -2]],
			[[2, 1, 1, 1, 1], [1, 1, 1, 1], [-5],[1, 1, 1, -2]],
			[[2, 1, 1, 1, 1], [1, 1, 1, 1], [1, 1, -3],[1, -4]],
			[[4, 1, 1, -2], [1, 1, 1, 1], [1, 1, -2],[1, 1, -2]],
			[[4, 2, 2, 1], [1], [2, 1, 1], [-2], [1, -3], [1, 1, -2]],
			[[2, 2, 2, 2, 1], [1], [1, 1, -3], [2, -4], [1, 1, -2]]
		],
		[
			[[2, 1, 1], [-2], [2, 1, 1], [-2]],
			[[2, 1, 1, 1], [1, -2], [1, 1, -2]],
			[[2, 1, 1, 1], [1, -2], [1, 1, -2]],
			[[1, 1, 1, 1], [1, 1, 1, 1]],
			[[1, 1, 1, 1], [1, 1, 1, 1]],
			[[1, 1, 1, 1], [1, 1, 1, 1]]
		],
		[
			[[-4], [1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1]],
			[[1, 1, 1, 1, 1], [1, 1, 1, 1, 1], [1, 1, 1, 1, 1]],
			[[-2], [-2], [-2], [2, 1], [1], [2, 1], [1]]
		],
		[
			[[4, 1, 1, 1, 1], [1, 1, -2], [2, 1, -2], [1, 1, 1], [-5]],
			[[3, 1, 1, 1, 1], [1, 1, -2], [1, 1, -2], [1]],
			[[3, 1, 1], [1, 1], [1, 1]]
		],
		[
			[[1, 1, 1], [1, 1, 1]],
			[[1, 1, 1], [1, 1, 1]],
			[[2, 1, 1, 1], [-3], [0, 0, 1, 1]],
			[[3, 2, 0, 1], [0, 1], [1, -2], [0, 0, -2]],
			[[-2], [3, 1], [1], [1]]
		]
	][stcn][stn];

	if ( !data_ary )
		[[1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1]];
	return {ary: data_ary};
}

function SkillTreeTable(/**/data){
	let he = document.createElement("table");
	data.ary.forEach(function(trA){
		let frg = document.createDocumentFragment();
		trA.forEach(function(tdD){
			let td = document.createElement("td");

			if (tdD > 1)
				td.setAttribute("rowspan", tdD);

			frg.appendChild(td);
			td.setAttribute('data-empty', "0");

			if ( tdD === 0 )
				td.setAttribute('data-empty', "1");

			if (tdD < -1){
				++tdD;
				while (tdD != 0){
					++tdD;
					const t = document.createElement("td");
					t.setAttribute('data-empty', "1");
					frg.appendChild(t);
				}
			}
		});
		let tr = document.createElement("tr");
		tr.appendChild(frg);
		he.appendChild(tr);
	});
	return he;
}

export {SkillTreeTableData, SkillTreeTable};