// pages/create/create.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        mainCategory: '',
        subCategory: '',
        mainCategories: ['中文词库', '英文词库'],
        subCategories: {
            '中文词库': ['一年级上', '一年级下', '二年级上', '二年级下', '三年级上', '三年级下', '四年级上', '四年级下', '五年级上', '五年级下'],
            '英文词库': ['小托福', '托福', 'SSAT', '其它']
        },
        loading: false,
        batchImportText: '',
        importLog: [], // 导入日志数组
        type: 'chinese', // 'chinese' 或 'english'
        content: '',
        showFormat: false,
        feedback: [], // 用于存储处理反馈
        selectedGrade: '', // 选中的年级
        gradeIndex: 0, // 选中的年级索引
        grades: ['一年级上', '一年级下', '二年级上', '二年级下', '三年级上', '三年级下', '四年级上', '四年级下', '五年级上', '五年级下']
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        if (options.type) {
            this.setData({
                type: options.type
            })
        }
        // 根据传入的参数设置词库类型
        const mainCategory = this.data.type === 'chinese' ? '中文词库' : '英文词库';
        this.setData({
            mainCategory,
            subCategory: this.data.subCategories[mainCategory][0]
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

    // 选择主分类
    onMainCategoryChange(e) {
        const mainCategory = this.data.mainCategories[e.detail.value];
        this.setData({
            mainCategory,
            subCategory: this.data.subCategories[mainCategory][0]
        });
    },

    // 选择子分类
    onSubCategoryChange(e) {
        this.setData({
            subCategory: this.data.subCategories[this.data.mainCategory][e.detail.value]
        });
    },

    // 批量导入文本变化
    onBatchImportInput(e) {
        this.setData({ batchImportText: e.detail.value });
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
            const { lessons, parseErrors } = this.parseBatchImport(batchImportText, mainCategory, subCategory);
            
            // 显示解析警告/错误
            if (parseErrors.length > 0) {
                this.addImportLog('解析过程中发现以下问题：');
                parseErrors.forEach(error => this.addImportLog(`⚠️ ${error}`));
            }

            if (lessons.length === 0) {
                this.addImportLog('❌ 没有找到有效的课文内容');
                wx.showToast({ title: '导入失败', icon: 'none' });
                return;
            }

            const results = [];
            let successCount = 0;
            let failCount = 0;

            for (let i = 0; i < lessons.length; i++) {
                const lesson = lessons[i];
                this.addImportLog(`正在处理：${lesson.name} (${lesson.words.length}个词语)`);
                try {
                    const result = await this.createWordListFromLesson(lesson);
                    this.addImportLog(`✅ ${lesson.name} 导入成功`);
                    results.push(result);
                    successCount++;
                } catch (err) {
                    this.addImportLog(`❌ ${lesson.name} 导入失败: ${err.message}`);
                    failCount++;
                }
            }

            // 显示最终结果
            this.addImportLog(`\n导入完成：成功 ${successCount} 个，失败 ${failCount} 个`);
            if (failCount === 0) {
                wx.showToast({ title: '导入完成', icon: 'success' });
                setTimeout(() => { wx.navigateBack(); }, 1500);
            } else {
                wx.showToast({ 
                    title: `部分导入成功 (${successCount}/${lessons.length})`, 
                    icon: 'none',
                    duration: 2000
                });
            }
        } catch (error) {
            console.error('批量导入失败:', error);
            this.addImportLog(`❌ 导入过程出错: ${error.message}`);
            wx.showToast({ title: '导入失败', icon: 'none' });
        } finally {
            this.setData({ loading: false });
        }
    },

    // 解析批量导入文本
    parseBatchImport(text, mainCategory, subCategory) {
        const lines = text.split('\n');
        const lessons = new Map(); // 使用 Map 存储课文数据，key 为课文编号
        let currentLessonNum = null;
        let parseErrors = [];
        let processedWords = new Set(); // 用于跟踪已处理的词语

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue; // 跳过空行

            // 检查是否是课文标记行
            const lessonMatch = line.match(/^#\s*(\d+)\s*(.*)$/);
            if (lessonMatch) {
                // 新课文开始
                const lessonNum = lessonMatch[1];
                currentLessonNum = lessonNum;
                
                // 创建新课文的词语列表
                if (!lessons.has(lessonNum)) {
                    lessons.set(lessonNum, {
                        name: `${subCategory}${lessonNum}`,
                        description: `${subCategory}第${lessonNum}课`,
                        words: []
                    });
                }

                // 处理标记行后面的词语
                const restWords = lessonMatch[2].trim();
                if (restWords) {
                    const words = restWords.split(/[,\s]+/).filter(word => word.trim());
                    for (const word of words) {
                        if (!processedWords.has(word)) {
                            lessons.get(lessonNum).words.push({ text: word });
                            processedWords.add(word);
                        } else {
                            parseErrors.push(`提示: 词语 "${word}" 已存在，已跳过`);
                        }
                    }
                }
            } else if (currentLessonNum) {
                // 处理当前课文下的词语行
                const words = line.split(/[,\s]+/).filter(word => word.trim());
                if (words.length > 0) {
                    for (const word of words) {
                        if (!processedWords.has(word)) {
                            lessons.get(currentLessonNum).words.push({ text: word });
                            processedWords.add(word);
                        } else {
                            parseErrors.push(`提示: 词语 "${word}" 已存在，已跳过`);
                        }
                    }
                }
            } else {
                // 处理未分类的词语
                parseErrors.push(`警告: 第 ${i + 1} 行 "${line}" 没有对应的课文编号`);
            }
        }

        // 检查每个课文是否有词语
        for (const [lessonNum, lesson] of lessons) {
            if (lesson.words.length === 0) {
                parseErrors.push(`警告: 第 ${lessonNum} 课没有词语`);
            }
        }

        // 转换为数组格式
        const lessonsArray = Array.from(lessons.values());

        // 打印解析结果和错误信息
        console.log('解析结果:', lessonsArray);
        if (parseErrors.length > 0) {
            console.log('解析警告/错误:', parseErrors);
        }

        return {
            lessons: lessonsArray,
            parseErrors
        };
    },

    // 从课创建词库
    async createWordListFromLesson(lesson) {
        return new Promise((resolve, reject) => {
            // 验证词库名称
            if (!lesson.name || !lesson.name.trim()) {
                console.error('词库名称为空:', lesson);
                reject(new Error('词库名称不能为空'));
                return;
            }

            // 验证词语列表
            if (!lesson.words || !Array.isArray(lesson.words) || lesson.words.length === 0) {
                console.error('词语列表为空:', lesson);
                reject(new Error('词语列表不能为空'));
                return;
            }

            // 验证分类
            if (!this.data.mainCategory || !this.data.subCategory) {
                console.error('分类信息不完整:', {
                    mainCategory: this.data.mainCategory,
                    subCategory: this.data.subCategory
                });
                reject(new Error('请选择一级目录和二级目录'));
                return;
            }

            console.log('正在创建词库:', {
                name: lesson.name,
                description: lesson.description,
                words: lesson.words,
                mainCategory: this.data.mainCategory,
                subCategory: this.data.subCategory
            });

            // 直接创建词库，不获取拼音
            wx.cloud.callFunction({
                name: 'addWordList',
                data: {
                    name: lesson.name.trim(),
                    description: lesson.description || `${this.data.subCategory}第${lesson.name.replace(/[^0-9]/g, '')}课`,
                    words: lesson.words,
                    mainCategory: this.data.mainCategory,
                    subCategory: this.data.subCategory,
                    grade: this.data.subCategory
                },
                success: res => {
                    console.log('创建词库结果:', res.result);
                    if (res.result && res.result.success) {
                        resolve(res.result);
                    } else {
                        const error = res.result ? res.result.error : '未知错误';
                        console.error('创建词库失败:', error);
                        reject(new Error(error || '创建词库失败'));
                    }
                },
                fail: err => {
                    console.error('调用云函数失败:', err);
                    reject(err);
                }
            });
        });
    },

    // 选择年级
    onGradeChange(e) {
        const index = e.detail.value
        this.setData({
            gradeIndex: index,
            selectedGrade: this.data.grades[index]
        })
    },

    // 输入内容变化
    onContentChange(e) {
        this.setData({
            content: e.detail.value
        });
    },

    // 显示格式说明
    showFormatGuide() {
        this.setData({
            showFormat: true
        });
    },

    // 隐藏格式说明
    hideFormatGuide() {
        this.setData({
            showFormat: false
        });
    },

    // 创建词库
    async createWordList() {
        const { type, content, selectedGrade } = this.data;
        
        if (!content || !content.trim()) {
            wx.showToast({
                title: '请输入内容',
                icon: 'none'
            });
            return;
        }

        if (type === 'chinese' && !selectedGrade) {
            wx.showToast({
                title: '请选择年级',
                icon: 'none'
            });
            return;
        }

        this.setData({ 
            loading: true,
            feedback: [] // 清空之前的反馈
        });

        try {
            // 解析输入的文本
            const lines = content.trim().split('\n');
            const lessons = new Map();
            let currentLessonNum = null;
            let totalWords = 0;

            for (const line of lines) {
                const trimmedLine = line.trim();
                if (!trimmedLine) continue;

                // 检查是否是课文标记行
                const lessonMatch = trimmedLine.match(/^#\s*(\d+)\s*(.*)$/);
                if (lessonMatch) {
                    const lessonNum = lessonMatch[1];
                    currentLessonNum = lessonNum;
                    
                    // 创建新课文的词语列表
                    if (!lessons.has(lessonNum)) {
                        lessons.set(lessonNum, {
                            name: `${selectedGrade}第${lessonNum}课`,
                            description: `${selectedGrade}第${lessonNum}课词语`,
                            words: []
                        });
                    }

                    // 处理标记行后面的词语
                    const restWords = lessonMatch[2].trim();
                    if (restWords) {
                        const words = restWords.split(/[,\s]+/).filter(word => word.trim());
                        lessons.get(lessonNum).words.push(...words.map(text => ({ text })));
                        totalWords += words.length;
                    }
                } else if (currentLessonNum) {
                    // 处理当前课文下的词语行
                    const words = trimmedLine.split(/[,\s]+/).filter(word => word.trim());
                    if (words.length > 0) {
                        lessons.get(currentLessonNum).words.push(...words.map(text => ({ text })));
                        totalWords += words.length;
                    }
                }
            }

            // 创建词库
            const results = [];
            for (const lesson of lessons.values()) {
                console.log('准备创建词库:', {
                    name: lesson.name,
                    description: lesson.description,
                    words: lesson.words,
                    mainCategory: type === 'chinese' ? '中文词库' : '英文词库',
                    subCategory: selectedGrade,
                    grade: selectedGrade
                });

                const res = await wx.cloud.callFunction({
                    name: 'addWordList',
                    data: {
                        name: lesson.name,
                        description: lesson.description,
                        words: lesson.words,
                        mainCategory: type === 'chinese' ? '中文词库' : '英文词库',
                        subCategory: selectedGrade,
                        grade: selectedGrade
                    }
                });

                console.log('创建词库结果:', res);

                if (res.result && res.result.success) {
                    console.log('词库创建成功:', {
                        id: res.result.data.id,
                        name: lesson.name,
                        totalLists: res.result.data.totalLists
                    });
                    results.push(res.result);
                } else {
                    console.error('创建词库失败:', res.result?.error || '未知错误');
                    throw new Error(res.result?.error || '创建词库失败');
                }
            }

            wx.showToast({
                title: `创建成功：${lessons.size}个词库，${totalWords}个词语`,
                icon: 'success',
                duration: 2000
            });
            
            // 延迟返回上一页
            setTimeout(() => {
                wx.navigateBack();
            }, 2000);

        } catch (error) {
            console.error('创建词库失败:', error);
            wx.showToast({
                title: error.message || '创建失败',
                icon: 'none'
            });
        } finally {
            this.setData({ loading: false });
        }
    },

    // 取消按钮点击
    onCancel() {
        wx.navigateBack();
    }
});