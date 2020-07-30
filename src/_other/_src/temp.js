import CY from "../js/main/module/cyteria.js";

/**
 * @param  {HTMLElement} el
 * @return {undefined}    
 */
function init(el){
    // 輸入區塊
    const input_scope = document.createElement('div');
    input_scope.classList.add('input-scope');
    const input = document.createElement('input');
    input_scope.appendChild(input);

    //
    const button_scope = document.createElement('div');
    button_scope.classList.add('button-scope');
    const button_chars = [
        '(', ')', '%', 'AC',
        '7', '8', '9', '/',
        '4', '5', '6', '*',
        '1', '2', '3', '-',
        '0', '.', '=', '+'
    ];
    function button_listener(e){
        const ctr = this.getAttribute('data-ctr');
        switch (ctr){
            case 'AC':
                input.value = '';
                break;
            case '=': 
                input.value = calculate(input.value);
                break;
            default:
                input.value += ctr;
        }
    }
    button_chars.forEach(c => {
        const button = document.createElement('span');
        button.innerHTML = c;
        button.classList.add('button');
        button.setAttribute('data-ctr', c);
        button.addEventListener('click', button_listener);
        button_scope.appendChild(button);
    });

    //配置
    el.appendChild(input_scope);
    el.appendChild(button_scope);
    el.classList.add('calc-main');
}

function calculate(str){
    // 用來判斷字元是否是數字字元
    function isNumChar(c){
        return /^[0-9.]$/.test(c);
    }
    // 用來取得push時的權重
    function w(c){
        switch (c){
            case '+':
            case '-':
                return 5;
            case '*':
            case '/':
            case '%':
                return 6;
            case '(':
            case ')':
                return 8;
        }
    }

    const stk = [],     // 存放運算子的堆疊
        postFix = [];   // 存放postFix的陣列。因為要處理多位數及小數，所以不能用字串儲存。
    let num = '';       // 用來暫存數字的變數
    try {
        // str.split('') 可以把字串轉陣列
        str.split('').forEach((c, i) => {
            // 如果c是數字的字元（0~9以及.），就把這個字元串到num上後，然後continue迴圈。
            if ( isNumChar(c) ){
                num += c;
                return;
            }

            // 如果迴圈執行到這邊，表示不是c不是數字的字元，也就是遇到了運算子。
            // （因為如果c是數字，會被前面的contiune攔住）
            if ( num !== '' ){
                // 把num轉成數字後放到postFix裡。然後初始化num。
                // 因為演算法中，遇到數字都是直接放進postFix裡。
                // 這邊只是讓多位數串接成完整的數字後，再放入postFix。
                postFix.push(parseFloat(num));
                num = '';
            }

            // c為當前的運算子。開始對c作條件判斷。
            if ( c == ')' ){
                // 如果是")"，一直pop stk並放到postFix裡直到遇到"("
                let t;
                while ( (t = stk.pop()) != '(' ){
                    if ( stk.length == 0 ) // 左刮號找不到和它成對的右刮號時。
                        throw new Error('Unrecognized operator: )');
                    postFix.push(t);
                }
            }
            else {
                // 設c的權重為wi。stk.top()的權重為wt。
                // 不停pop stk並放到postFix裡，直到(wi > wt)。
                // 要注意'('在stk內部的話，權重為最小。
                while ( w(c) <= w(stk[stk.length - 1]) && stk[stk.length - 1] != '(' )
                    postFix.push(stk.pop());
                stk.push(c);
            }
        });
        // === 陣列到了尾端，一些處理
        
        // 如果num不為空，表示還有數字沒放進postFix
        if ( num !== '' )
            postFix.push(parseFloat(num));
        // 把stk剩下的運算子都拿出來放進postFix
        while ( stk.length != 0 )
            postFix.push(stk.pop());

        console.log(postFix);

        // 把postFix反轉。才可以一個個pop。
        postFix.reverse();

        // 精確計算小數用的含式庫
        const mh = CY.math;

        // 剛剛用來放運算子的stk已經清空，現在拿來暫存數字
        while ( postFix.length != 0 ){
            let p = postFix.pop();
            // 因為上面轉postFix時，已經把數字轉成float，所以可以這樣判斷
            if ( typeof p != 'number' ){
                const a = stk.pop(), b = stk.pop();
                if ( a == void 0 || b == void 0 )
                    throw new Error('Invaild formula: ' + str);
                switch (p){
                    case '+':
                        p = mh.add(b, a);
                        break;
                    case '-':
                        p = mh.sub(b, a);
                        break;
                    case '*':
                        p = mh.mul(b, a);
                        break;
                    case '/':
                        p = mh.div(b, a);
                        break;
                    case '%':
                        p = b % a;
                        break;
                }
            }
            stk.push(p);
        }
        return stk.pop();
    }
    catch(e){
        console.log(e.stack);
        return void 0;
    }       
}

function ready(){
    const main = document.getElementById('main');
    init(main);
}

ready();


// function weight(c){
//     return c的權重;
// }
// function isNumChar(c){
//     return c是否是數字的字元;
// }

// let postFix = [];
// let stack = []; // 存放運算子用

遍歷str {
    let c = 當前字元;
    let str = ""; //暫存

    if ( isNumChar(c) ){
        // *c放入postFix;
        *str += c;
    }
    else if ( c == ")" ){
        if ( str !== "" ){
            *str放入postFix;
            *str = "";
        }
        while ( 沒遇到"(" ){
            stack的top放入postFix;
        }
    }
    else {
        if ( str !== "" ){
            *str放入postFix;
            *str = "";
        }
        // c是")"以外的其它運算子
        // "("是例外，在stack內部時權重最小
        while ( weight(c) <= weight(stack的top) && stack的top != "(" ){
            stack的top放入postFix;
        }
        把c放入stack;
    }
}
while ( stack還沒空 )
    把stack的top放入postFix;
 
//calculate("(1+2)*(3+4)");

let a = 0;
for (let i=0; i<ary.length; ++i){
    a += ary[i];
}

ary.forEach(p => a += p);

// 比如說ary是一個物件陣列，
// 想在陣列中找到第一個value是3000的物件，並讓t為該物件。
// for的寫法：
let t;
for (let i=0; i<ary.length; ++i){
    if ( ary[i].value == 3000 ){
        t = ary[i];
        break;
    }
}

// 陣列函數的寫法
let t = ary.find(p => p.value == 3000);

for (let i=0; i<ary.length; ++i){
    if ( i == 0 )
        continue;
    // Do something
}

function add(a, b){
    return a + b;
}

let add = (a, b) => a + b;