function saveFile(csv_str, file_name){
    const blob = new Blob([csv_str], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");

    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', file_name + '.csv');
    link.classList.add('hidden');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
function loadFile(onload_fun, wrong_file_type_fun){
    const input = document.createElement('input');
    input.type = 'file';
    input.addEventListener('change', function(e){
        document.body.removeChild(input);
        const file = this.files[0];
        const type = file.name.split('.').slice(-1);
        if ( type != 'csv' ){
            if ( typeof wrong_file_type_fun == 'function' )
                wrong_file_type_fun();
            return;
        }
        const fr = new FileReader();
        fr.onload = function(e){
            onload_fun(this.result);
        };
        fr.readAsText(file);
    });

    input.classList.add('hidden');
    document.body.appendChild(input);
    input.click();
}

export default {saveFile, loadFile};