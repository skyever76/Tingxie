Page({
  data: {
    wordlist: {
      id: '',
      name: '',
      words: [
        { text: 'apple', meaning: '苹果' },
        { text: 'banana', meaning: '香蕉' }
      ]
    },
    editing: false,
    newWord: '',
    newMeaning: '',
    importText: '',
    showImport: false,
    loading: false
  },
  onLoad(options) {
    // 根据options.id加载词库
    this.setData({ loading: true })
    wx.cloud.callFunction({
      name: 'getMyWordLists',
      data: {},
      success: res => {
        if (res.result.success) {
          const wordlist = res.result.data.find(w => w._id === options.id)
          if (wordlist) {
            this.setData({ wordlist: { id: wordlist._id, name: wordlist.name, words: wordlist.words || [] } })
          } else {
            wx.showToast({ title: '词库不存在', icon: 'none' })
          }
        } else {
          wx.showToast({ title: '加载失败', icon: 'none' })
        }
      },
      complete: () => this.setData({ loading: false })
    })
  },
  startEdit() {
    this.setData({ editing: true });
  },
  finishEdit() {
    this.setData({ editing: false });
  },
  onWordInput(e) {
    this.setData({ newWord: e.detail.value });
  },
  onMeaningInput(e) {
    this.setData({ newMeaning: e.detail.value });
  },
  addWord() {
    if (!this.data.newWord) return;
    this.setData({
      'wordlist.words': [...this.data.wordlist.words, { text: this.data.newWord, meaning: this.data.newMeaning }],
      newWord: '',
      newMeaning: ''
    }, this.saveWordlist);
  },
  deleteWord(e) {
    const idx = e.currentTarget.dataset.idx;
    this.setData({
      'wordlist.words': this.data.wordlist.words.filter((_, i) => i !== idx)
    }, this.saveWordlist);
  },
  renameWordlist() {
    wx.showModal({
      title: '重命名词库',
      editable: true,
      placeholderText: '请输入新名称',
      success: res => {
        if (res.confirm && res.content) {
          this.setData({ 'wordlist.name': res.content }, this.saveWordlist);
        }
      }
    });
  },
  showImportPanel() {
    this.setData({ showImport: true });
  },
  hideImportPanel() {
    this.setData({ showImport: false, importText: '' });
  },
  onImportInput(e) {
    this.setData({ importText: e.detail.value });
  },
  importWords() {
    // 支持逗号、制表符、换行分隔的批量导入
    const lines = this.data.importText.split(/\n|\r/);
    const newWords = lines.map(line => {
      const [text, meaning] = line.split(/,|\t/);
      return text ? { text: text.trim(), meaning: (meaning || '').trim() } : null;
    }).filter(Boolean);
    this.setData({
      'wordlist.words': [...this.data.wordlist.words, ...newWords],
      showImport: false,
      importText: ''
    }, this.saveWordlist);
  },
  exportWords() {
    const content = this.data.wordlist.words.map(w => `${w.text},${w.meaning}`).join('\n');
    wx.setClipboardData({
      data: content,
      success: () => {
        wx.showToast({ title: '已复制到剪贴板', icon: 'none' });
      }
    });
  },
  // 新增：支持 CSV 格式导入
  importCSV() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['csv'],
      success: res => {
        const file = res.tempFiles[0];
        wx.getFileSystemManager().readFile({
          filePath: file.path,
          encoding: 'utf-8',
          success: res => {
            const lines = res.data.split(/\n|\r/);
            const newWords = lines.map(line => {
              const [text, meaning] = line.split(/,|\t/);
              return text ? { text: text.trim(), meaning: (meaning || '').trim() } : null;
            }).filter(Boolean);
            this.setData({
              'wordlist.words': [...this.data.wordlist.words, ...newWords]
            }, this.saveWordlist);
          }
        });
      }
    });
  },
  // 新增：支持 TXT 格式导入
  importTXT() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['txt'],
      success: res => {
        const file = res.tempFiles[0];
        wx.getFileSystemManager().readFile({
          filePath: file.path,
          encoding: 'utf-8',
          success: res => {
            const lines = res.data.split(/\n|\r/);
            const newWords = lines.map(line => {
              const [text, meaning] = line.split(/,|\t/);
              return text ? { text: text.trim(), meaning: (meaning || '').trim() } : null;
            }).filter(Boolean);
            this.setData({
              'wordlist.words': [...this.data.wordlist.words, ...newWords]
            }, this.saveWordlist);
          }
        });
      }
    });
  },
  // 新增：导出为 CSV 文件
  exportCSV() {
    const content = this.data.wordlist.words.map(w => `${w.text},${w.meaning}`).join('\n');
    const fileName = `${this.data.wordlist.name}.csv`;
    wx.getFileSystemManager().writeFile({
      filePath: `${wx.env.USER_DATA_PATH}/${fileName}`,
      data: content,
      encoding: 'utf-8',
      success: () => {
        wx.shareFileMessage({
          filePath: `${wx.env.USER_DATA_PATH}/${fileName}`,
          success: () => {
            wx.showToast({ title: '导出成功', icon: 'success' });
          }
        });
      }
    });
  },
  // 新增：导出为 TXT 文件
  exportTXT() {
    const content = this.data.wordlist.words.map(w => `${w.text},${w.meaning}`).join('\n');
    const fileName = `${this.data.wordlist.name}.txt`;
    wx.getFileSystemManager().writeFile({
      filePath: `${wx.env.USER_DATA_PATH}/${fileName}`,
      data: content,
      encoding: 'utf-8',
      success: () => {
        wx.shareFileMessage({
          filePath: `${wx.env.USER_DATA_PATH}/${fileName}`,
          success: () => {
            wx.showToast({ title: '导出成功', icon: 'success' });
          }
        });
      }
    });
  },
  saveWordlist() {
    wx.cloud.callFunction({
      name: 'updateWordList',
      data: {
        id: this.data.wordlist.id,
        name: this.data.wordlist.name,
        words: this.data.wordlist.words
      },
      success: r => {
        if (r.result.success) {
          wx.showToast({ title: '保存成功', icon: 'success' })
        } else {
          wx.showToast({ title: r.result.error || '保存失败', icon: 'none' })
        }
      },
      fail: () => wx.showToast({ title: '云函数调用失败', icon: 'none' })
    })
  }
}); 