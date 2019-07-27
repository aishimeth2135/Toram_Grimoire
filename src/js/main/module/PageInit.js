function PageInitFirst(){
    if ( localStorage['main-font-family'] !== '1' )
        document.querySelector('body').classList.add('font1');
}

function PageInit(){

}

export {PageInitFirst, PageInit};