import sanitize from 'sanitize-filename'


type FileSaveOptions = {
  data: string;
  fileType?: string;
  fileName: string;
}

function save({ data, fileType = 'text/txt', fileName }: FileSaveOptions): void {
  const blob = new Blob([data], { type: fileType + ';charset=utf-8;' })
  const link = document.createElement('a')

  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', sanitize(fileName.replace(/\s/g, '_')))
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}


type FileLoadSucceed = (fileResult: string) => void
type FileLoadError = (error: any) => void
type FileLoadBefore = () => void
type FileLoadCheckType = (fileType: string) => boolean

type FileLoadOptions = {
  succeed: FileLoadSucceed | null;
  error?: FileLoadError | null;
  beforeLoad?: FileLoadBefore | null;
  checkFileType?: FileLoadCheckType | null;
}

function load({
  succeed = null,
  error = null,
  beforeLoad = null,
  checkFileType = null,
}: FileLoadOptions) {
  try {
    const input = document.createElement('input')
    input.type = 'file'
    input.addEventListener('change', function() {
      if (this.files !== null) {
        beforeLoad && beforeLoad()

        const file = this.files[0]
        const type = file.name.split('.').slice(-1)[0]
        if (checkFileType && !checkFileType(type)) {
          return
        }

        const fr = new FileReader()
        fr.addEventListener('load', function() {
          succeed && succeed(this.result as string)
          document.body.removeChild(input)
        })
        fr.readAsText(file)
      } else {
        error && error(new Error('[Load File] unknown error.'))
      }
    })

    input.style.display = 'none'
    document.body.appendChild(input)
    input.click()
  } catch (e) {
    error && error(e)
  }
}

export default { save, load }
