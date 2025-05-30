// pages/create/create.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        name: '',
        description: '',
        words: '',
        mainCategory: '',
        subCategory: '',
        mainCategories: ['中文词库', '英文词库'],
        subCategories: {
            '中文词库': ['一年级上', '一年级下', '二年级上', '二年级下', '三年级上', '三年级下', '四年级上', '四年级下', '五年级上', '五年级下'],
            '英文词库': ['小托福', '托福', 'SSAT', '其它']
        },
        loading: false,
        showBatchImport: false,
        batchImportText: '',
        batchImportType: 'chinese', // 'chinese' 或 'english'
        importLog: [] // 新增日志数组
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        // 设置默认值
        this.setData({
            mainCategory: this.data.mainCategories[0],
            subCategory: this.data.subCategories[this.data.mainCategories[0]][0]
        });
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    },

    // 输入词库名称
    onNameInput(e) {
        this.setData({
            name: e.detail.value
        })
    },

    // 输入词库描述
    onDescInput(e) {
        this.setData({
            description: e.detail.value
        })
    },

    // 输入单词列表
    onWordsInput(e) {
        this.setData({
            words: e.detail.value
        })
    },

    // 选择主分类
    onMainCategoryChange(e) {
        const mainCategory = this.data.mainCategories[e.detail.value]
        this.setData({
            mainCategory,
            subCategory: this.data.subCategories[mainCategory][0]
        })
    },

    // 选择子分类
    onSubCategoryChange(e) {
        this.setData({
            subCategory: this.data.subCategories[this.data.mainCategory][e.detail.value]
        })
    },

    // 创建词库
    createWordList() {
        const { name, description, words, mainCategory, subCategory } = this.data

        // 验证输入
        if (!name.trim()) {
            wx.showToast({
                title: '请输入词库名称',
                icon: 'none'
            })
            return
        }

        if (!words.trim()) {
            wx.showToast({
                title: '请输入词语列表',
                icon: 'none'
            })
            return
        }

        // 解析词语列表
        const wordList = this.parseWords(words)
        if (wordList.length === 0) {
            wx.showToast({
                title: '词语格式不正确',
                icon: 'none'
            })
            return
        }

        this.setData({ loading: true })

        // 调用云函数创建词库
        wx.cloud.callFunction({
            name: 'addWordList',
            data: {
                name,
                description,
                words: wordList,
                mainCategory,
                subCategory
            },
            success: res => {
                if (res.result.success) {
                    wx.showToast({
                        title: '创建成功',
                        icon: 'success'
                    })
                    // 返回词库列表页
                    setTimeout(() => {
                        wx.navigateBack()
                    }, 1500)
                } else {
                    wx.showToast({
                        title: res.result.error || '创建失败',
                        icon: 'none'
                    })
                }
            },
            fail: err => {
                console.error('创建词库失败', err)
                wx.showToast({
                    title: '创建失败',
                    icon: 'none'
                })
            },
            complete: () => {
                this.setData({ loading: false })
            }
        })
    },

    // 解析词语列表
    parseWords(text) {
        const lines = text.split('\n').filter(line => line.trim())
        const words = []
        
        for (const line of lines) {
            // 支持多种分隔符：逗号、制表符、空格
            const parts = line.split(/[,\t\s]+/).filter(part => part.trim())
            if (parts.length >= 1) {
                const word = {
                    text: parts[0].trim(),
                    pinyin: parts[1] ? parts[1].trim() : ''
                }
                words.push(word)
            }
        }
        
        return words
    },

    // 显示批量导入界面
    showBatchImport() {
        this.setData({ showBatchImport: true });
    },

    // 隐藏批量导入界面
    hideBatchImport() {
        this.setData({ 
            showBatchImport: false,
            batchImportText: ''
        });
    },

    // 批量导入文本变化
    onBatchImportInput(e) {
        this.setData({ batchImportText: e.detail.value });
    },

    // 切换导入类型
    onImportTypeChange(e) {
        this.setData({ batchImportType: e.detail.value });
    },

    // 添加日志
    addImportLog(msg) {
        this.setData({
            importLog: (this.data.importLog || []).concat([msg])
        });
    },

    // 处理批量导入
    async handleBatchImport() {
        const { batchImportText, mainCategory, subCategory } = this.data;
        if (!batchImportText.trim()) {
            wx.showToast({ title: '请输入要导入的内容', icon: 'none' });
            return;
        }
        if (!mainCategory || !subCategory) {
            wx.showToast({ title: '请选择一级目录和二级目录', icon: 'none' });
            return;
        }
        this.setData({ loading: true, importLog: [] });
        try {
            const lessons = this.parseBatchImport(batchImportText, mainCategory, subCategory);
            const results = [];
            for (let i = 0; i < lessons.length; i++) {
                const lesson = lessons[i];
                this.addImportLog(`正在处理：${lesson.name}`);
                try {
                    const result = await this.createWordListFromLesson(lesson);
                    this.addImportLog(`✅ ${lesson.name} 导入成功`);
                    results.push(result);
                } catch (err) {
                    this.addImportLog(`❌ ${lesson.name} 导入失败: ${err.message}`);
                }
            }
            console.log('批量导入结果:', results);
            wx.showToast({ title: '导入完成', icon: 'success' });
            setTimeout(() => { wx.navigateBack(); }, 1500);
        } catch (error) {
            console.error('批量导入失败:', error);
            wx.showToast({ title: '导入失败', icon: 'none' });
        } finally {
            this.setData({ loading: false });
        }
    },

    // 解析批量导入文本
    parseBatchImport(text, mainCategory, subCategory) {
        const lines = text.split('\n').filter(line => line.trim()); // 过滤空行
        const lessons = [];
        let currentLesson = null;

        for (const line of lines) {
            const trimmedLine = line.trim();
            // 支持 #2 或 # 2 或 #2 乌黑 ... 或 # 2 乌黑 ...
            const lessonMatch = trimmedLine.match(/^#\s*(\d+)\s*(.*)$/);
            if (lessonMatch) {
                if (currentLesson) {
                    lessons.push(currentLesson);
                }
                const lessonNumber = lessonMatch[1];
                currentLesson = {
                    name: `${subCategory}${lessonNumber}`,
                    description: `${subCategory}第${lessonNumber}课`,
                    words: []
                };
                // 处理本行后面的词语
                const restWords = lessonMatch[2].trim();
                if (restWords) {
                    const words = restWords.split(/\s+/).filter(word => word.trim());
                    for (const word of words) {
                        currentLesson.words.push({ text: word });
                    }
                }
            } else if (currentLesson) {
                // 解析词语（支持每行多个词语）
                const words = trimmedLine.split(/\s+/).filter(word => word.trim());
                for (const word of words) {
                    currentLesson.words.push({ text: word });
                }
            }
        }

        // 添加最后一个课
        if (currentLesson) {
            lessons.push(currentLesson);
        }

        console.log('解析结果:', lessons);
        return lessons;
    },

    // 从课创建词库
    async createWordListFromLesson(lesson) {
        return new Promise((resolve, reject) => {
            // 直接创建词库，不获取拼音
            wx.cloud.callFunction({
                name: 'addWordList',
                data: {
                    name: lesson.name,
                    description: lesson.description,
                    words: lesson.words, // 只存 text 字段
                    mainCategory: this.data.mainCategory,
                    subCategory: this.data.subCategory,
                    grade: this.data.subCategory
                },
                success: res => {
                    console.log('创建词库结果:', res.result);
                    if (res.result.success) {
                        resolve(res.result);
                    } else {
                        reject(new Error(res.result.error || '创建词库失败'));
                    }
                },
                fail: reject
            });
        });
    }
})