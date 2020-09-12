import { SkillRoot } from "./module/SkillElements.js";
import { LoadSkillData, LoadSkillMainData } from "./module/LoadSkillData.js";
import { loadLangDatas } from "../main/module/DataPath.js";

class SkillSystem {
  constructor() {
    this.skillRoot = new SkillRoot(this);
  }
  async *init() {
    const promise_ary = [];

    const SkillData_ary = loadLangDatas('Skill', promise_ary),
      SkillMainData_ary = loadLangDatas('Skill Main', promise_ary);

    await Promise.all(promise_ary);
    yield;

    LoadSkillData(this.skillRoot, ...SkillData_ary);
    LoadSkillMainData(this.skillRoot, ...SkillMainData_ary);
  }
}

export default SkillSystem;