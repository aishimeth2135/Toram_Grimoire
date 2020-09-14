export default function() {
  return {
    'global': {
      'second': '秒',
      'confirm': '確定',
      'cancel': '取消',
      'clear': '清除',
      'split string': '、',
      'menu': '選單',
      'delete': '刪除',
      'remove': '移除',
      'copy': '複製',
      'download': '下載',
      'search': '查詢',
      'recovery': '復原',
      'button': '按鈕',
      'none': '無',
      'create': '建立',
      'close': '關閉',
      'copy to clipboard finished': '已複製文本至剪貼簿。',
      'LocalStorage is inavailable': '此瀏覽器版本無法使用內建儲存功能。',
    },
    'Loading Page': {
      'bottom tips': '載入資料中，請稍後...<br />若載入途中發生錯誤，請先試著重新整理網頁。'
    },
    'Footer': {
      'baha home': '巴哈小屋',
      'night mode': '夜間模式',
      'user guide': '操作指引'
    },
    'Settings': {
      'title': '設定',
      'switch font': {
        'title': '更改字體',
        'caption': '若字體顯示有問題（特定裝置會發生），或是不喜歡現在的預設字體，可以切換字體為基本字體。',
        'warn 1': '切換後可能要花費數秒的時間下載字體，才能完成替換。',
        'default font': '預設字體',
        'base font': '基本字體'
      },
      'language': {
        'title': '語言設定',
        'caption': '可選擇頁面顯示的語言，一般情況下不必特別設定。',
        'warn 1': '設定完畢後，頁面需重新整理方得生效。',
        'warn 2': '尚未翻譯的部分依然會顯示其他語言。',
        'button texts': {
          'lang auto': '自動判定',
          'lang 0': 'English',
          'lang 1': '繁體中文',
          'lang 2': '日本語',
          'lang 3': '简体中文'
        }
      },
      'second language': {
        'title': '次要語言設定',
        'caption': '可設定第二優先級的語言。簡單來說，若選擇的語言還沒有翻譯，便會優先顯示這邊設定的語言。',
        'warn 1': '設定完畢後，頁面需重新整理方得生效。',
        'warn 2': '若第二優先級語言依然沒有翻譯，則會顯示原始資料（一般而言是繁體中文）。',
      },
      'storage backup': {
        'title': '存檔備份',
        'caption': '由於魔法書是使用瀏覽器的內建功能來實現存檔，因此可能因為清除瀏覽資料或更換裝置等因素，導致存檔遺失。透過下方的按鈕可以將整個魔法書的存檔資料儲存成一個檔案，並在需要讀取資料時，透過下方的按鈕進行讀取。亦可以讀取他人提供的檔案。',
        'warn 1': '進行讀取後，原本的資料將會被覆蓋。',
        'warn 2': '讀取成功後，請直接重新整理網頁，可以確保系統正確初始化。',
        'button texts': {
          'save': '存檔資料備份',
          'load': '讀取存檔資料'
        },
        'Save succeefully': '存檔成功。',
        'Load succeefully': '讀取成功。',
        'Load failed': '讀取失敗。',
        'Wrong type of file': '讀取的檔案必須為文字（.txt）檔。'
      }
    },
  };
}