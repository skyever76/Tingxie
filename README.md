# 听写小程序

一个功能强大的听写练习小程序，支持中英文单词和课文的听写练习。

## 功能特点

### 1. 词库管理
- 支持创建、编辑、删除词库
  - 创建词库：设置名称、描述、分类
  - 编辑词库：修改词库信息、添加/删除单词
  - 删除词库：支持单个删除和批量删除
- 支持导入/导出词库
  - 支持 Excel 格式导入
  - 支持 CSV 格式导入
  - 支持文本格式导入
  - 支持导出为 Excel
  - 支持导出为 CSV
- 支持词库分类和标签管理
  - 自定义分类
  - 多级分类
  - 标签管理
  - 分类筛选
- 支持词库搜索和筛选
  - 关键词搜索
  - 分类筛选
  - 标签筛选
  - 时间筛选
- 支持词库分享和复制
  - 分享给好友
  - 复制词库
  - 导入分享词库
  - 词库协作

### 2. 听写练习
- 支持单词听写和课文听写
  - 单词听写：支持中英文单词
  - 课文听写：支持中英文课文
  - 混合听写：支持单词和课文混合
- 支持自动播放和手动播放
  - 自动播放：定时播放
  - 手动播放：点击播放
  - 循环播放：设置循环次数
- 支持播放速度调节
  - 范围：0.5x-2.0x
  - 步进：0.1x
  - 快捷键调节
- 支持重复次数设置
  - 范围：1-5次
  - 自定义间隔
  - 智能重复
- 支持随机顺序播放
  - 完全随机
  - 智能随机
  - 难度随机
- 支持显示/隐藏答案
  - 即时显示
  - 延迟显示
  - 部分显示
- 支持显示拼音（中文）
  - 自动显示
  - 手动显示
  - 拼音标注
- 支持进度显示和保存
  - 实时进度
  - 自动保存
  - 进度恢复
- 支持断点续练
  - 自动保存
  - 手动保存
  - 进度恢复

### 3. 学习统计
- 支持学习时长统计
  - 每日统计
  - 每周统计
  - 每月统计
  - 总时长统计
- 支持正确率统计
  - 单词正确率
  - 课文正确率
  - 分类正确率
  - 趋势分析
- 支持学习进度统计
  - 词库进度
  - 分类进度
  - 总体进度
  - 目标完成度
- 支持学习历史记录
  - 练习记录
  - 错误记录
  - 复习记录
  - 时间记录
- 支持学习数据导出
  - Excel导出
  - CSV导出
  - PDF报告
  - 数据备份
- 支持学习报告生成
  - 每日报告
  - 每周报告
  - 每月报告
  - 自定义报告

### 4. 用户系统
- 支持微信一键登录
  - 快速登录
  - 自动登录
  - 登录状态保持
- 支持用户信息管理
  - 基本信息
  - 学习信息
  - 设置信息
  - 隐私设置
- 支持学习数据同步
  - 自动同步
  - 手动同步
  - 冲突处理
- 支持多设备数据同步
  - 设备管理
  - 数据同步
  - 状态同步
- 支持学习计划设置
  - 每日计划
  - 每周计划
  - 每月计划
  - 自定义计划

### 5. 界面设计
- 支持明暗主题切换
  - 自动切换
  - 手动切换
  - 定时切换
- 支持自定义主题色
  - 主题色选择
  - 自定义颜色
  - 主题预览
- 支持字体大小调节
  - 大小调节
  - 字体选择
  - 行高调节
- 支持界面布局自定义
  - 布局选择
  - 组件位置
  - 显示控制
- 支持手势操作
  - 滑动切换
  - 双击操作
  - 长按操作
- 支持键盘快捷键
  - 播放控制
  - 答案显示
  - 单词切换

### 6. 其他功能
- 支持离线使用
  - 离线词库
  - 离线练习
  - 数据缓存
- 支持后台播放
  - 后台运行
  - 通知控制
  - 状态保持
- 支持定时提醒
  - 学习提醒
  - 复习提醒
  - 目标提醒
- 支持学习提醒
  - 时间提醒
  - 进度提醒
  - 目标提醒
- 支持数据备份
  - 自动备份
  - 手动备份
  - 云端备份
- 支持自动更新
  - 版本更新
  - 数据更新
  - 资源更新

## 云参数说明

### 1. 用户相关
- `userInfo`: 用户基本信息
  - 作用：存储用户的基本信息，包括昵称、头像等
  - 类型：Object
  - 示例：`{nickName: "用户昵称", avatarUrl: "头像地址"}`
  - 字段说明：
    - `nickName`: 用户昵称
    - `avatarUrl`: 头像地址
    - `gender`: 性别
    - `country`: 国家
    - `province`: 省份
    - `city`: 城市
    - `language`: 语言

- `userSettings`: 用户设置
  - 作用：存储用户的个性化设置
  - 类型：Object
  - 示例：`{theme: "light", fontSize: "normal", autoPlay: true}`
  - 字段说明：
    - `theme`: 主题设置
    - `fontSize`: 字体大小
    - `autoPlay`: 自动播放
    - `playSpeed`: 播放速度
    - `repeatTimes`: 重复次数
    - `showPinyin`: 显示拼音
    - `showAnswer`: 显示答案
    - `randomOrder`: 随机顺序

- `userProgress`: 用户进度
  - 作用：记录用户的学习进度
  - 类型：Object
  - 示例：`{wordListId: {currentIndex: 0, completed: false}}`
  - 字段说明：
    - `wordListId`: 词库ID
    - `currentIndex`: 当前索引
    - `completed`: 完成状态
    - `lastUpdate`: 最后更新
    - `totalWords`: 总单词数
    - `learnedWords`: 已学单词数

### 2. 词库相关
- `wordLists`: 词库列表
  - 作用：存储用户创建的所有词库
  - 类型：Array
  - 示例：`[{id: "1", name: "词库1", words: []}]`
  - 字段说明：
    - `id`: 词库ID
    - `name`: 词库名称
    - `description`: 词库描述
    - `category`: 词库分类
    - `tags`: 词库标签
    - `words`: 单词列表
    - `createTime`: 创建时间
    - `updateTime`: 更新时间
    - `isPublic`: 是否公开
    - `author`: 作者信息

- `wordListSettings`: 词库设置
  - 作用：存储每个词库的特定设置
  - 类型：Object
  - 示例：`{"1": {playSpeed: 1.0, repeatTimes: 2}}`
  - 字段说明：
    - `playSpeed`: 播放速度
    - `repeatTimes`: 重复次数
    - `randomOrder`: 随机顺序
    - `showPinyin`: 显示拼音
    - `showAnswer`: 显示答案
    - `autoPlay`: 自动播放
    - `interval`: 播放间隔

- `wordCategories`: 词库分类
  - 作用：存储词库分类信息
  - 类型：Array
  - 示例：`[{id: "1", name: "分类1", parentId: null}]`
  - 字段说明：
    - `id`: 分类ID
    - `name`: 分类名称
    - `parentId`: 父分类ID
    - `order`: 排序
    - `createTime`: 创建时间
    - `updateTime`: 更新时间

### 3. 学习相关
- `learningProgress`: 学习进度
  - 作用：记录用户的学习进度
  - 类型：Object
  - 示例：`{"1": {currentIndex: 0, completed: false}}`
  - 字段说明：
    - `wordListId`: 词库ID
    - `currentIndex`: 当前索引
    - `completed`: 完成状态
    - `lastUpdate`: 最后更新
    - `totalWords`: 总单词数
    - `learnedWords`: 已学单词数
    - `correctCount`: 正确次数
    - `wrongCount`: 错误次数

- `learningStats`: 学习统计
  - 作用：记录用户的学习统计数据
  - 类型：Object
  - 示例：`{totalTime: 3600, correctRate: 0.85}`
  - 字段说明：
    - `totalTime`: 总学习时间
    - `correctRate`: 正确率
    - `totalWords`: 总单词数
    - `learnedWords`: 已学单词数
    - `dailyStats`: 每日统计
    - `weeklyStats`: 每周统计
    - `monthlyStats`: 每月统计
    - `categoryStats`: 分类统计

- `learningHistory`: 学习历史
  - 作用：记录用户的学习历史
  - 类型：Array
  - 示例：`[{wordListId: "1", startTime: "2024-03-20 10:00:00", endTime: "2024-03-20 11:00:00"}]`
  - 字段说明：
    - `wordListId`: 词库ID
    - `startTime`: 开始时间
    - `endTime`: 结束时间
    - `duration`: 持续时间
    - `correctCount`: 正确次数
    - `wrongCount`: 错误次数
    - `words`: 练习单词

### 4. 系统相关
- `systemConfig`: 系统配置
  - 作用：存储系统级别的配置信息
  - 类型：Object
  - 示例：`{version: "1.0.0", lastUpdate: "2024-03-20"}`
  - 字段说明：
    - `version`: 版本号
    - `lastUpdate`: 最后更新
    - `minVersion`: 最低版本
    - `forceUpdate`: 强制更新
    - `maintenance`: 维护状态
    - `announcement`: 公告信息
    - `features`: 功能开关
    - `limits`: 使用限制

- `cloudStorage`: 云存储配置
  - 作用：存储云存储相关的配置信息
  - 类型：Object
  - 示例：`{maxSize: 100, usedSize: 50}`
  - 字段说明：
    - `maxSize`: 最大容量
    - `usedSize`: 已用容量
    - `fileTypes`: 文件类型
    - `expireTime`: 过期时间
    - `backupConfig`: 备份配置
    - `syncConfig`: 同步配置
    - `cacheConfig`: 缓存配置

- `appConfig`: 应用配置
  - 作用：存储应用级别的配置信息
  - 类型：Object
  - 示例：`{theme: "light", language: "zh_CN"}`
  - 字段说明：
    - `theme`: 主题设置
    - `language`: 语言设置
    - `fontSize`: 字体大小
    - `autoPlay`: 自动播放
    - `playSpeed`: 播放速度
    - `repeatTimes`: 重复次数
    - `showPinyin`: 显示拼音
    - `showAnswer`: 显示答案

## 使用说明

### 1. 词库管理
1. 创建词库：点击"新建词库"按钮，输入词库名称和描述
2. 导入词库：支持从 Excel 文件导入词库
3. 编辑词库：点击词库进入编辑页面，可以添加、删除、修改单词
4. 导出词库：支持将词库导出为 Excel 文件
5. 删除词库：在词库列表页面长按词库可以删除

### 2. 听写练习
1. 选择词库：在词库列表中选择要练习的词库
2. 设置参数：设置播放速度、重复次数等参数
3. 开始练习：点击"开始练习"按钮开始听写
4. 控制播放：使用播放控制按钮控制音频播放
5. 查看答案：点击"显示答案"按钮查看正确答案
6. 切换单词：使用"上一个"和"下一个"按钮切换单词

### 3. 学习统计
1. 查看统计：在"统计"页面查看学习数据
2. 导出数据：支持导出学习数据为 Excel 文件
3. 查看历史：查看历史学习记录
4. 设置目标：设置学习目标和计划

### 4. 用户设置
1. 主题设置：选择明暗主题
2. 字体设置：调整字体大小
3. 播放设置：设置默认播放参数
4. 提醒设置：设置学习提醒
5. 数据同步：设置数据同步选项

## 开发说明

### 1. 环境要求
- 微信开发者工具
- Node.js 环境
- 云开发环境

### 2. 项目结构
```
miniprogram/
  ├── pages/          # 页面文件
  ├── components/     # 组件文件
  ├── utils/          # 工具函数
  ├── services/       # 服务层
  ├── styles/         # 样式文件
  └── app.js          # 入口文件
```

### 3. 开发流程
1. 克隆项目
2. 安装依赖
3. 配置云开发环境
4. 运行项目
5. 开发调试
6. 提交代码

### 4. 发布流程
1. 代码审查
2. 测试验证
3. 版本更新
4. 提交审核
5. 发布上线

## 更新日志

### v1.0.0 (2024-03-20)
- 初始版本发布
- 支持基本的听写功能
- 支持词库管理
- 支持学习统计

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交代码
4. 创建 Pull Request

## 许可证

MIT License 