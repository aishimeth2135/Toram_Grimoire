export default function() {
  return {
    'Damage Calculation': {
      'Calc Item Base Text': {
        'physical_damage': '物理伤害',
        'magic_damage': '魔法伤害',
        'atk': 'ATK',
        'matk': 'MATK',
        'sub_atk': '副手ATK',
        'sub_atk_multiplier': '副手倍率',
        'two_handed_skill_level': '((双手合持))等级',
        'character_level': '角色等级',
        'target_level': '目标等级',
        'target_def': '目标DEF',
        'target_mdef': '目标MDEF',
        'physical_pierce': '物理贯穿',
        'magic_pierce': '魔法贯穿',
        'skill_constant': '技能常数',
        'skill_constant_str': 'STR',
        'skill_constant_dex': 'DEX',
        'skill_constant_agi': 'AGI',
        'skill_constant_int': 'INT',
        'skill_constant_vit': 'VIT',
        'unsheathe_attack': '拔刀攻击',
        'dagger_atk': '小刀ATK',
        'other_constant': '其它常数',
        'skill_multiplier': '技能倍率',
        'skill_multiplier_str': 'STR',
        'skill_multiplier_dex': 'DEX',
        'skill_multiplier_agi': 'AGI',
        'skill_multiplier_int': 'INT',
        'skill_multiplier_vit': 'VIT',
        'critical_damage': '暴击伤害',
        'critical_rate': '暴击率',
        'magic_critical_conversion_rate': '法术暴击转化率',
        'short_range_damage': '近距离威力',
        'long_range_damage': '远距离威力',
        'unsheathe_attack_multiplier': '拔刀攻击',
        'netural_element': '无属性',
        'fire_element': '火属性',
        'water_element': '水属性',
        'earth_element': '地属性',
        'wind_element': '风属性',
        'light_element': '光属性',
        'dark_element': '暗属性',
        'stronger_against_neutral': '对无属性',
        'stronger_against_fire': '对火属性',
        'stronger_against_water': '对水属性',
        'stronger_against_earth': '对地属性',
        'stronger_against_wind': '对风属性',
        'stronger_against_light': '对光属性',
        'stronger_against_dark': '对暗属性',
        'target_neutral_resistance': '对无抗性',
        'target_fire_resistance': '对火抗性',
        'target_water_resistance': '对水抗性',
        'target_earth_resistance': '对地抗性',
        'target_wind_resistance': '对风抗性',
        'target_light_resistance': '对光抗性',
        'target_dark_resistance': '对暗抗性',
        'target_physical_resistance': '物理抗性',
        'target_magic_resistance': '魔法抗性',
        'poration': '惯性加成',
        'stability': '稳定率',
        'probability_of_graze': 'Graze机率',
        'combo_multiplier': '连击倍率',
        'other_multiplier': '其它倍率'
      },
      'Container Title': {
        'damage_type': '伤害类型',
        'atk': '角色攻击力',
        'atk_other': '角色攻击力（其它）',
        'level_difference': '等级差距',
        'target_def': '目标防御力',
        'pierce': '防御贯穿',
        'skill_constant': '技能常数',
        'unsheathe_attack_contant': '拔刀攻击（常数）',
        'other_constant': '其它常数',
        'skill_multiplier': '技能倍率',
        'critical': '暴击',
        'range_damage': '距离威力',
        'unsheathe_attack_multiplier': '拔刀攻击（倍率）',
        'element': '攻击属性',
        'stronger_against_element': '对属性伤害加成',
        'target_element_resistance': '目标对属抗性',
        'target_resistance': '目标抗性',
        'poration': '惯性影响',
        'stability': '稳定率',
        'other_multiplier': '其它倍率'
      },
      'Container Tips': {
        'damage_type': '攻击的伤害类型。',
        'atk': '角色的面板攻击力。',
        'atk_other': [
          '在特定条件下，会影响攻击力的其它因素。',
          '((副手ATK))及((双手合持等级))皆可以开关。关闭后该项目便不会被计算。',
          '((副手ATK))为装备((双剑))时特有的属性。((双剑技能))中的攻击技能，((副手ATK))会被计入伤害公式内。',
          '简要而言，((副手ATK))会乘上((副手倍率))并加到有效ATK上。',
          '技能((双手合持))的触发条件可于技能查询中查看。'
        ],
        'level_difference': '角色与目标（怪物）的等级差值。',
        'target_def': '目标的防御力。',
        'pierce': '角色的物理贯穿及魔法贯穿。贯穿会无视目标等比例的防御力。',
        'skill_constant': '技能的伤害常数。',
        'unsheathe_attack_contant': [
          '常数的拔刀攻击加成。',
          '例如：缎晶((葛瓦))提供的拔刀攻击+100。'
        ],
        'other_constant': '特定情况下会有的其它常数。平常情况下不用特别设定',
        'skill_multiplier': '技能的伤害倍率。',
        'critical': [
          '伤害计算时，会计算((暴击率))与((暴击伤害))对伤害的期望值。',
          '((暴击率))可透过点击进行开关。关闭后，伤害计算会视为必定暴击。意即伤害计算结果为暴击时的伤害。',
          '若想计算无暴击时的伤害，可将此项目关闭。或将暴击率设为0。',
          '魔法伤害暴击时的计算公式与物理伤害不同，此处有一个名词叫((法术暴击转化率))。((法术暴击转化率))决定魔法暴击的发生机率，以及发生暴击时的暴击伤害，两者分别从物理暴击率、物理暴击伤害按比例转化而来。',
          '目前仅有被动技能((分段爆裂))以及主动技能((元素斩噼))赋予的((衰弱))状态，会提高法术暴击转化率。',
          '((法术暴击转化率))范例：若暴击率为80%、暴击伤害为150%、法术暴击转化率为50%。则造成魔法伤害时，暴击率为40%，暴击伤害为125%'
        ],
        'range_damage': [
          '发动技能时，与目标的距离会有不同的伤害加成。',
          '离目标8m以上（含）时，为视为远距离，否则为近距离。'
        ],
        'unsheathe_attack_multiplier': [
          '倍率的拔刀攻击加成。',
          '例如：缎晶((奥狄隆马其纳))提供的拔刀攻击+10%。'
        ],
        'stronger_against_element': '对目标属性的伤害加成。',
        'target_element_resistance': '目标对属性攻击的抗性。',
        'target_resistance': '目标的物理抗性或魔法抗性。例如：物理抗性为30%时，受到的物理伤害会减少30%。',
        'poration': '惯性带来的伤害加成。最低为-50%，最高为+150%。',
        'stability': [
          '稳定率会造成伤害浮动，因此伤害计算以期望值作计算。期望值部分亦包含Graze机率带来的影响。',
          '伤害计算部分会显示伤害的浮动。即最小伤害与最大伤害。',
          '((魔法伤害))的稳定率计算与物理伤害不同，并且有上限90%。',
          '((Graze))会使稳定度减半，因此计算出来的最小伤害也会减半。',
          '((Graze机率))可透过点击进行开关。关闭后，伤害计算会视为必定不发生Graze。',
          '((魔法伤害))不会发生Graze。'
        ],
        'other_multiplier': [
          '特定情况下会有的其它倍率。会直接乘上最终伤害。',
          '多个其他倍率需自行相乘后，再填入((其他倍率))。例如：120%*120%=144%。计算完毕后填入144。'
        ]
      },
      'User Set': {
        'str': '角色STR',
        'dex': '角色DEX',
        'int': '角色INT',
        'agi': '角色AGI',
        'vit': '角色VIT'
      },
      'Warn': {
        'Calculation Name too long': '名称不得超过16个字元。',
        'Disable char': '已自动清除被禁用的字元。'
      },
      'build': '配置',
      'Damage': '伤害期望值',
      'Comparative Damage': '比较',
      'Damage Floating: without critical': '无暴击伤害',
      'Damage Floating: critical': '暴击伤害',
      'save': '储存',
      'load': '读取',
      'save to csv': '储存成档案',
      'load from csv': '读取档案',
      'save to url': '用网址分享',
      'Main Menu: title': '选单',
      'Save Load: title': '选取档案',
      'delete': '删除',
      'copy': '复制',
      'create calculation': '新增配置'
    }
  };
}