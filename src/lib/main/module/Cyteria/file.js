function save({ data, fileType, fileName }) {
  const blob = new Blob([data], { type: fileType + ';charset=utf-8;' });
  const link = document.createElement("a");

  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.classList.add('hidden');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function load({
  succee = null,
  error = null,
  beforeLoad = null,
  checkFileType = null
}) {
  try {
    const input = document.createElement('input');
    input.type = 'file';
    input.addEventListener('change', function() {
      document.body.removeChild(input);
      beforeLoad && beforeLoad();

      const file = this.files[0];
      const type = file.name.split('.').slice(-1);
      if (checkFileType && !checkFileType(type)) {
        return;
      }

      const fr = new FileReader();
      fr.addEventListener('load', function() {
        succee && succee(this.result);
      })
      fr.readAsText(file);
    });

    input.classList.add('hidden');
    document.body.appendChild(input);
    input.click();
  } catch (e) {
    error && error(e);
  }
}

export default { save, load };