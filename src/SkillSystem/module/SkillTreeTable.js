function SkillTreeTableData(/*int*/stcn, /*int*/stn) {
	let data_size = 0, data_ary = null;
	switch (stcn)
	{
		case 0:
			switch (stn)
			{
				case 0:
					data_ary = [[4, 2, 2, 1], [1], [2, 2, 1], [1], [2, 2, -2], [1, 1]];
					break;
				case 1:
					data_ary = [[3, 2, -3], [1, -2], [1, 1, 1, 1], [2, -4], [1, 1, -2]];
					break;
				case 2:
					data_ary = [[2, 1, 1, 1, 1], [1, 1, 1, 1], [-5],[1, 1, 1, -2]];
					break;
				case 3:
					data_ary = [[2, 1, 1, 1, 1], [1, 1, 1, 1], [1, 1, -3],[1, -4]];
					break;
				case 4:
					data_ary = [[4, 1, 1, -2], [1, 1, 1, 1], [1, 1, -2],[1, 1, -2]];
					break;
				case 5:
					data_ary = [[4, 2, 2, 1], [1], [2, 1, 1], [-2], [1, -3], [1, 1, -2]];
					break;
				case 6:
					data_ary = [[2, 2, 2, 2, 1], [1], [1, 1, -3], [2, -4], [1, 1, -2]];
					break;
			}
			break;
		case 1:
			switch (stn)
			{
				case 0:
					data_ary = [[2, 1, 1], [-2], [2, 1, 1], [-2]];
					break;
				case 1:
					data_ary = [[2, 1, 1, 1], [1, -2], [1, 1, -2]];
					break;
				case 2:
					data_ary = [[2, 1, 1, 1], [1, -2], [1, 1, -2]];
					break;
				case 3:
					data_ary = [[1, 1, 1, 1], [1, 1, 1, 1]];
						break;
				case 4:
					data_ary = [[1, 1, 1, 1], [1, 1, 1, 1]];
					break;
				case 5:
					data_ary = [[1, 1, 1, 1], [1, 1, 1, 1]];
					break;
			}
			break;
		case 2:
			switch (stn)
			{
				case 0:
					data_ary = [[-2], [-2], [-2], [2, 1], [1], [2, 1], [1]];
					break;
				case 1:
					data_ary = [[1, 1, 1, 1, 1], [1, 1, 1, 1, 1], [1, 1, 1, 1, 1]];
					break;
				case 2:
					data_ary = [[-4], [1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1]];
					break;
			}
			break;
		case 3:
			switch (stn)
			{
				case 0:
					data_ary = [[4, 1, 1, 1, 1], [1, 1, -2], [2, 1, -2], [1, 1, 1], [-5]];
					break;
				case 1:
					data_ary = [[3, 1, 1, 1, 1], [1, 1, -2], [1, 1, -2], [1]];
					break;
				case 2:
					data_ary = [[3, 1, 1], [1, 1], [1, 1]];
					break;
			}
			break;
		case 4:
			switch (stn)
			{
				case 0:
					data_ary = [[1, 1, 1], [1, 1, 1]];
					break;
				case 1:
					data_ary = [[1, 1, 1], [1, 1, 1]];
					break;
			}
			break;
	}
	if ( data_ary === null )
		data_ary = [[1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1]];
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