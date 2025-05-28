// 学习进度统计页面
const app = getApp()

// 引入图表库
import * as echarts from '../../ec-canvas/echarts'

Page({
  data: {
    totalWords: 0,
    completedWords: 0,
    accuracy: 0,
    totalTime: '0分钟',
    historyList: [],
    ec: {
      lazyLoad: true
    },
    page: 1,
    pageSize: 20,
    hasMore: true,
    loading: false,
    showSkeleton: true
  },

  onLoad() {
    this.resetAndLoad()
  },

  onShow() {
    this.resetAndLoad()
  },

  // 重置分页并加载
  resetAndLoad() {
    this.setData({
      historyList: [],
      page: 1,
      hasMore: true,
      showSkeleton: true
    })
    this.loadStatistics()
  },

  // 加载统计数据
  async loadStatistics() {
    if (this.data.loading || !this.data.hasMore) return
    this.setData({ loading: true })
    try {
      // 优先读取本地缓存第一页
      if (this.data.page === 1) {
        const cached = wx.getStorageSync('learningHistory') || []
        if (cached.length > 0) {
          this.setData({ historyList: cached, showSkeleton: false })
        }
      }
      wx.showLoading({ title: '加载中' })
      const db = wx.cloud.database()
      
      // 获取词库总数
      const wordListsRes = await db.collection('word_lists')
        .where({
          _openid: app.globalData.openid
        })
        .get()
      
      const totalWords = wordListsRes.data.reduce((sum, list) => sum + list.totalWords, 0)
      
      // 获取学习记录分页
      const historyRes = await db.collection('learning_history')
        .where({
          _openid: app.globalData.openid
        })
        .orderBy('date', 'desc')
        .skip((this.data.page - 1) * this.data.pageSize)
        .limit(this.data.pageSize)
        .get()
      
      const newList = historyRes.data.map(item => ({
        ...item,
        date: this.formatDate(item.date),
        time: this.formatTime(item.duration)
      }))
      const allList = this.data.historyList.concat(newList)
      
      // 计算总完成数和正确率
      const completedWords = allList.reduce((sum, item) => sum + item.words, 0)
      const totalCorrect = allList.reduce((sum, item) => sum + item.correct, 0)
      const accuracy = completedWords ? Math.round(totalCorrect / completedWords * 100) : 0
      
      // 计算总时长
      const totalDuration = allList.reduce((sum, item) => sum + item.duration, 0)
      const totalTime = this.formatTime(totalDuration)
      
      this.setData({
        totalWords,
        completedWords,
        accuracy,
        totalTime,
        historyList: allList,
        hasMore: newList.length === this.data.pageSize,
        showSkeleton: false
      })
      
      // 只缓存第一页
      if (this.data.page === 1) wx.setStorageSync('learningHistory', newList)
      
      // 渲染图表
      if (this.data.page === 1) this.initChart()
    } catch (error) {
      console.error('加载统计数据失败：', error)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
      if (this.data.page === 1) {
        const cached = wx.getStorageSync('learningHistory') || []
        if (cached.length > 0) {
          this.setData({ historyList: cached, showSkeleton: false })
        }
      }
    } finally {
      wx.hideLoading()
      this.setData({ loading: false })
      wx.stopPullDownRefresh && wx.stopPullDownRefresh()
    }
  },

  // 初始化图表
  initChart() {
    const { historyList } = this.data
    const chartComponent = this.selectComponent('#progressChart')
    
    if (chartComponent) {
      chartComponent.init((canvas, width, height, dpr) => {
        const chart = echarts.init(canvas, null, {
          width: width,
          height: height,
          devicePixelRatio: dpr
        })
        
        // 准备数据
        const dates = historyList.map(item => item.date)
        const words = historyList.map(item => item.words)
        const accuracy = historyList.map(item => item.accuracy)
        
        const option = {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            }
          },
          legend: {
            data: ['完成词数', '正确率'],
            top: 0
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            data: dates,
            axisLabel: {
              rotate: 45
            }
          },
          yAxis: [
            {
              type: 'value',
              name: '词数',
              position: 'left'
            },
            {
              type: 'value',
              name: '正确率',
              position: 'right',
              axisLabel: {
                formatter: '{value}%'
              }
            }
          ],
          series: [
            {
              name: '完成词数',
              type: 'bar',
              data: words
            },
            {
              name: '正确率',
              type: 'line',
              yAxisIndex: 1,
              data: accuracy
            }
          ]
        }
        
        chart.setOption(option)
        return chart
      })
    }
  },

  // 格式化日期
  formatDate(date) {
    const d = new Date(date)
    return `${d.getMonth() + 1}月${d.getDate()}日`
  },

  // 格式化时间
  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60)
    return `${minutes}分钟`
  },

  // 获取设置中的振动开关
  getVibrationSetting() {
    try {
      const settings = wx.getStorageSync('dictationSettings')
      return settings && settings.vibration !== undefined ? settings.vibration : true
    } catch {
      return true
    }
  },

  // 导出学习记录
  async handleExport() {
    if (this.getVibrationSetting()) wx.vibrateShort()
    try {
      const { historyList } = this.data
      if (historyList.length === 0) {
        wx.showToast({
          title: '暂无学习记录',
          icon: 'none'
        })
        return
      }

      const exportData = historyList.map(item => ({
        日期: item.date,
        完成词数: item.words,
        正确率: `${item.accuracy}%`,
        用时: item.time
      }))

      const jsonStr = JSON.stringify(exportData, null, 2)
      
      // 复制到剪贴板
      wx.setClipboardData({
        data: jsonStr,
        success: () => {
          wx.showToast({
            title: '已复制到剪贴板',
            icon: 'success'
          })
        }
      })
    } catch (error) {
      console.error('导出失败：', error)
      wx.showToast({
        title: '导出失败',
        icon: 'error'
      })
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.resetAndLoad()
  },

  // 触底加载更多
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({ page: this.data.page + 1 }, () => {
        this.loadStatistics()
      })
    }
  }
}) 