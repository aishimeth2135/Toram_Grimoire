/**
 * @param {object} param
 * @param {string} param.data
 * @param {string} [param.fieldType = "text/txt"] - default: "text/txt"
 * @param {string} param.fileName - complete file name (name + ext)
 */
function save({ data, fileType = 'text/txt', fileName }) {
  const blob = new Blob([data], { type: fileType + ';charset=utf-8;' });
  const link = document.createElement("a");

  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


/**
 * @callback LoadFileSucceed
 * @param {string} fileResult
 * @returns {void}
 */
/**
 * @callback LoadFileError
 * @param {any} error
 * @returns {void}
 */
/**
 * @callback BeforeLoadFile
 * @returns {void}
 */
/**
 * @callback CheckFileType
 * @param {string} fileType - ext of file
 * @returns {boolean}
 */
/**
 * @param {object} param
 * @param {LoadFileSucceed} param.succeed
 * @param {LoadFileError} param.error
 * @param {BeforeLoadFile} param.beforeLoad
 * @param {CheckFileType} param.checkFileType
 */
function load({
  succeed = null,
  error = null,
  beforeLoad = null,
  checkFileType = null,
}) {
  try {
    const input = document.createElement('input');
    input.type = 'file';
    input.addEventListener('change', function() {
      beforeLoad && beforeLoad();

      const file = this.files[0];
      const type = file.name.split('.').slice(-1)[0];
      if (checkFileType && !checkFileType(type)) {
        return;
      }

      const fr = new FileReader();
      fr.addEventListener('load', function() {
        succeed && succeed(this.result);
        document.body.removeChild(input);
      })
      fr.readAsText(file);
    });

    input.style.display = 'none';
    document.body.appendChild(input);
    input.click();
  } catch (e) {
    error && error(e);
  }
}

export default { save, load };
