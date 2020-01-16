import "./main.js";

import "../../../css/main/main.css";
import "../../../css/main/Cyteria/Cyteria.css";
import "../../../css/main/global.css";

import "../../../css/SkillQuery/DrawSkillTree.css";
import "../../../css/SaveLoad/main.css";

if (module.hot) {
    module.hot.accept('./main.js', function() {
        console.log('Accepting the updated printMe module!');
        printMe();
    })
}