/**
 * 只用於快速建立HTMLElement。知道怎麼用就好，不一定要看懂內部程式。
 * @param  {String}       tag_name   tag名稱，如div、span等。
 * @param  {String|Array} class_list css-class清單
 * @param  {String}       inner_html innerHTML
 * @param  {JsonObject}   attrs      用於setAttribute的key-value物件。
 * @return {HTMLElement}
 */
function simpleCreateHTML(tag_name, class_list, inner_html, attrs){
    const check = t => t !== void 0 && t !== null;

    const node = document.createElement(tag_name);
    if ( check(class_list) ){
        class_list = Array.isArray(class_list) ? class_list : [class_list];
        node.classList.add(...class_list);
    }
    if ( check(inner_html) ){
        node.innerHTML = inner_html;
    }
    if ( check(attrs) ){
        Object.keys(attrs).forEach(k => node.setAttribute(k, attrs[k]));
    }
    return node;
}

/**
 * class是物件導向的基礎，不知道做什麼用的可以去查。
 * constructor()是javascript內，class的「建構子」。
 * 一般來說，class的第一個字會是大寫。
 */

class Car {
    constructor(name){
        this.name = name;
        this.speed = 10;
        this.position = 0;
    }
}

class Controller {
    constructor(){
        this.cars = [];

        this.nodes = {
            'cars': null
        };

        this.status = {
            carMoveTimer: null,
            carMovePass: false,
            carMoveInterval: 100,
            trackLength: 5000
        };
    }
    /**
     * 這個系統的控制器(Controller)初始化用的函數。「初始化」就是所有主要程式要跑之前，一定要先做的某些事情。
     * @param  {HTMLElement} main_node 要鑲入這個系統的介面節點。
     * @return {undefined}
     */
    init(main_node){
        main_node.classList.add('main--');

        const cars_scope = simpleCreateHTML('div', 'cars');
        main_node.appendChild(cars_scope);
        this.nodes['cars'] = cars_scope;
    }
    /**
     * 某台車子獲勝時，會呼叫的函數。
     * @param  {Car}       car 獲勝的那台車。
     * @return {undefined}
     */
    carWin(car){
        // 下面是最簡單的範例。
        alert(car.name + '獲勝。');
    }
    /**
     * 用來建立更新車子資料及介面的計時器。計時器會根據設定的週期，定時自動做某些事情。
     * @return {undefined}
     */
    startCarTimer(){
        const car_nodes = this.nodes['cars'].querySelectorAll('.car-scope');

        // 建立一個定時器，每carMoveInterval毫秒就會讓車子移動一次。
        this.status.carMoveTimer = setInterval(() => {
            // 如果沒有處於pass狀態，讓所有車往前移動。
            if ( !this.status.carMovePass ){
                this.cars.forEach((car, i) => {
                    //車子往前移動。
                    car.position += car.speed;
                    // 如果這輛車到達終點，就認定他獲勝。
                    if ( car.position >= this.status.trackLength ){
                        car.position = this.status.trackLength;
                        this.stopCarTimer();
                        this.carWin(car);
                    }
                    // 更新單台車子的元件介面
                    this.updateCarHTML(car_nodes[i], car);
                });
            }
        }, this.status.carMoveInterval);
    }
    /**
     * 用來清除(中止)讓車子資料更新的定時器的函數。清除後只能用startCarTimer()重啟。
     * @return {undefined}
     */
    stopCarTimer(){
        clearInterval(this.status.carMoveTimer);
        this.status.carMoveTimer = null;
    }
    /**
     * 僅用於建立Car物件，建立介面相關的程式碼則寫在createCarHTML()。
     * @param  {String} name
     * @return {undefined}
     */
    createCar(name){
        //如果name沒有給值，給定一個預設值。
        name = name || '車子' + (this.cars.length + 1).toString();

        const car = new Car(name);
        this.cars.push(car);

        this.nodes['cars'].appendChild(this.createCarHTML(car));
    }
    /**
     * 更新車子元件的內部介面。所有更新車子元件介面的程式都寫在這。
     * @param  {HTMLElement} node 必定是creaetCarHTML()創建出來的
     * @param  {Car}         car  Car物件
     * @return {undefined}
     */
    updateCarHTML(node, car){
        const car_node = node.querySelector('.car');

        // 更新位置
        car_node.style.top = (100 * car.position / this.status.trackLength).toFixed(1) + '%';
    }
    /**
     * 建立一個用於介面的車子元件。
     * @param  {Car}         car Car物件
     * @return {HTMLElement} 
     */
    createCarHTML(car){
        const car_scope = simpleCreateHTML('div', 'car-scope');

        // 顯示名稱用
        car_scope.appendChild(simpleCreateHTML('div', 'car-name', car.name));

        // 跑道
        const track_node = simpleCreateHTML('div', 'car-track');
        // 車子本體
        const car_node = simpleCreateHTML('span', 'car');


        // 這個只是裝飾用的跑道線，無必要性。
        track_node.appendChild(simpleCreateHTML('div', 'track-line'));

        track_node.appendChild(car_node);
        car_scope.appendChild(track_node);

        return car_scope;
    }
}


/**
 * ===========================
 * 測試用
 */

const main_controller = new Controller();
main_controller.init(document.querySelector('#main'));

// 建兩台車當作測試
main_controller.createCar();
main_controller.createCar();

// 開始跑。
main_controller.startCarTimer();
