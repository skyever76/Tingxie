// 测试云函数
const testCloudFunctions = async () => {
  try {
    // 测试获取词表
    console.log('测试 getWordList...')
    const getWordListResult = await wx.cloud.callFunction({
      name: 'getWordList',
      data: { id: 'test_id' }
    })
    console.log('getWordList 结果:', getWordListResult)

    // 测试更新词表
    console.log('测试 updateWordList...')
    const updateWordListResult = await wx.cloud.callFunction({
      name: 'updateWordList',
      data: {
        id: 'test_id',
        name: '测试词表',
        description: '这是一个测试词表',
        words: [
          { text: 'apple', pinyin: 'ping guo' },
          { text: 'banana', pinyin: 'xiang jiao' }
        ],
        category: '水果',
        isPublic: false
      }
    })
    console.log('updateWordList 结果:', updateWordListResult)

    // 测试获取听写进度
    console.log('测试 getDictationProgress...')
    const getProgressResult = await wx.cloud.callFunction({
      name: 'getDictationProgress',
      data: { wordListId: 'test_id' }
    })
    console.log('getDictationProgress 结果:', getProgressResult)

    // 测试更新听写进度
    console.log('测试 updateDictationProgress...')
    const updateProgressResult = await wx.cloud.callFunction({
      name: 'updateDictationProgress',
      data: {
        wordListId: 'test_id',
        wordListName: '测试词表',
        totalWords: 2,
        completedWords: 1,
        accuracy: 50,
        timeSpent: 60,
        mistakes: ['apple']
      }
    })
    console.log('updateDictationProgress 结果:', updateProgressResult)

  } catch (error) {
    console.error('测试失败:', error)
  }
}

// 导出测试函数
module.exports = {
  testCloudFunctions
} 