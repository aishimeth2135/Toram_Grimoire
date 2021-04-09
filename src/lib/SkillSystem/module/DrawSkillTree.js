import CY from "@Util/Cyteria";

function GetDrawSetting() {
  return {
    gridWidth: 50,
    svgPadding: 40,
    textMargin: 5,
    iconPadding: 4
  };
}

function createDrawSkillTreeDefs() {
  const defs = CY.svg.createEmpty('defs');
  defs.id = 'app--draw-skill-tree-defs';

  const w = GetDrawSetting().gridWidth,
    Circle = CY.svg.drawCircle;

  // @lock
  const lock_pettern = CY.svg.createEmpty('pattern', { width: 1, height: 1, id: 'skill-icon-lock' });
  const lock = CY.svg.create(w, w, { x: (w - 24) / 2, y: (w - 24) / 2 });
  lock.innerHTML = '<path fill="var(--primary-light)" d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9z"/>';
  lock_pettern.appendChild(Circle(w / 2, w / 2, w / 2, { fill: 'var(--white)', 'stroke-width': 0 }));
  lock_pettern.appendChild(lock);

  defs.appendChild(lock_pettern);

  // background
  const skillIconBg = CY.svg.createLinearGradient('skill-icon-bg',
    '.5', '0', '.5', '1', [
      { offset: '0%', 'stop-color': 'white' },
      { offset: '50%', 'stop-color': '#FFD1EA' },
      { offset: '100%', 'stop-color': '#f7a8d3' }
    ]
  );

  defs.appendChild(skillIconBg);

  return defs;
}


function computeDrawSkillTreeData(st, options) {
  options = Object.assign({
    setSkillButtonExtraData: (skill, data) => [], // eslint-disable-line
    skillTreeType: 'normal'
  }, options);

  function tran(v) {
    return pad + w / 2 + v * w + textMargin;
  }

  let skills, findSkillByDrawOrder, getBaseSkill, s;
  if (options.skillTreeType == 'normal') {
    skills = st.skills;
    findSkillByDrawOrder = order => skills.find(a => a.drawOrder === order);
    getBaseSkill = skill => skill;
    s = st.drawTreeCode;
  } else {
    skills = st.levelSkills;
    findSkillByDrawOrder = order => skills.find(a => a.base.drawOrder === order);
    getBaseSkill = skill => skill.base;
    s = st.base.drawTreeCode;
  }

  s = s || 'S E S E S E S L S E S E S E S L S E S E S E S L S E S E S E S';

  const codes = s.toUpperCase()
    .replace(/([A-Z])(\d+)/g, (m, w, d) => Array(parseInt(d, 10)).fill(w).join(' '))
    .split(' ');
  const drawData = GetDrawSetting();
  const w = drawData.gridWidth,
    pad = drawData.svgPadding,
    textMargin = drawData.textMargin;

  const data = [];
  let x = 0,
    y = 0,
    maxw = 0,
    cnt = 0;

  codes.forEach(p => {
    if (cnt == skills.length)
      return;
    const c = p.charAt(0);
    switch (c) {
      case 'L':
        if (x > maxw)
          maxw = x;
        x = 0;
        ++y;
        break;
      case 'E':
        ++x;
        break;
      case 'D':
      case 'S':
        {
          p.slice(1).split('').forEach(t => {
            t == 'R' && data.push({
              type: 'tree-line',
              x1: tran(x),
              y1: tran(y),
              x2: tran(x + 1),
              y2: tran(y)
            });
            t == 'B' && data.push({
              type: 'tree-line',
              x1: tran(x),
              y1: tran(y),
              x2: tran(x),
              y2: tran(y + 1)
            });
          });
          let t;
          if (c == 'D')
            data.push({
              type: 'tree-dot',
              cx: tran(x),
              cy: tran(y),
              r: 2,
              class: ['dot']
            });
          if (c == 'S') {
            const _skill = findSkillByDrawOrder(cnt);
            const bskill = getBaseSkill(_skill);
            const name = bskill.name || '?';
            const skill_circle = {
              type: 'skill-circle',
              cx: tran(x),
              cy: tran(y),
              r: w / 2,
              class: ['skill-circle'],
              style: {},
              skill: _skill,
              path: getSkillIconPath(bskill)
            };
            let skill_name = null,
              extra_data = [];

            if (name != '?') {
              if (name != '@lock') {
                skill_name = {
                  type: 'skill-name',
                  x: tran(x),
                  y: tran(y) - w / 2 - textMargin,
                  innerText: name,
                  class: ['skill-name']
                };
                const patid = getSkillIconPatternId(bskill);
                skill_circle.style.fill = 'url(#' + patid + ')';
                extra_data = options.setSkillButtonExtraData(_skill, Object.assign({
                  cx: x,
                  cy: y,
                  lengthTransformFunction: tran,
                  documentFragment: t
                }, drawData));
              } else {
                skill_circle.class.push('lock');
              }
            }
            data.push(skill_circle);
            skill_name && data.push(skill_name);

            if (!Array.isArray(extra_data)) throw Error('options: setSkillButon must return array.');
            extra_data.length > 0 && data.push(...extra_data);
            ++cnt;
          }
          ++x;
        }
        break;
      case 'H':
        data.push({
          type: 'tree-line',
          x1: tran(x),
          y1: tran(y),
          x2: tran(x + 1),
          y2: tran(y)
        });
        ++x;
        break;
      case 'V':
        data.push({
          type: 'tree-line',
          x1: tran(x),
          y1: tran(y),
          x2: tran(x),
          y2: tran(y + 1)
        });
        ++x;
        break;
    }
  });

  if (x > maxw)
    maxw = x;

  return {
    data: data,
    width: tran(maxw) - w / 2 + pad,
    height: tran(y) + w / 2 + pad + textMargin
  };
}

function getSkillIconPath(skill) {
  return `/imgs/skill_icons/stc_${skill.parent.parent.id}/st_${skill.parent.id}/si_${skill.id}.png`;
}

function getSkillIconPatternData(st) {
  const drawData = GetDrawSetting();
  const w = drawData.gridWidth,
    iconPad = drawData.iconPadding;

  return st.skills.filter(skill => skill.name !== '@lock')
    .map(skill => {
      return {
        id: getSkillIconPatternId(skill),
        width: 1,
        height: 1,
        elements: [{
            type: 'circle',
            cx: w / 2,
            cy: w / 2,
            r: w / 2,
            class: ['skill-icon-pattern-bg']
          },
          {
            type: 'image',
            path: getSkillIconPath(skill),
            x: iconPad,
            y: iconPad,
            width: w - iconPad * 2,
            height: w - iconPad * 2
          }
        ]
      };
    });
  //const pat = CY.svg.createEmpty('pattern', {id: patid, width: 1, height: 1});
  //pat.appendChild(Circle(w/2, w/2, w/2, {fill: 'url(#skill-icon-bg)', 'stroke-width': 0}));
  //pat.appendChild(CY.svg.drawImage(`${skillIconPathRoot}si_${_skill.id}.png`, iconPad, iconPad, w-iconPad*2, w-iconPad*2));
}

function getSkillIconPatternId(skill) {
  return `skill-icon-pattern--${skill.parent.parent.id}-${skill.parent.id}-${skill.id}`;
}

export { createDrawSkillTreeDefs, computeDrawSkillTreeData, getSkillIconPatternData, GetDrawSetting, getSkillIconPath };