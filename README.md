# 亚当听写小程序

一个基于微信小程序平台的智能听写应用，支持中英文词库管理、智能听写、进度追踪等功能。

## 主要功能

- 📚 词库管理：创建、编辑、删除个人词库
- 🎯 智能听写：支持中英文听写，自动评分
- 📊 进度追踪：记录学习进度，查看统计
- 🔄 分类管理：支持多级分类，方便管理
- 👥 社交分享：支持词库分享，共同学习

## 技术栈

- 前端：微信小程序原生开发
- 后端：微信云开发
- 数据库：云数据库
- 存储：云存储
- 语音：微信小程序语音合成

## 项目结构

```
├── miniprogram/          # 小程序前端代码
│   ├── pages/           # 页面文件
│   ├── components/      # 组件
│   └── utils/          # 工具函数
├── cloudfunctions/      # 云函数
│   ├── getWordList/    # 获取词库
│   ├── addWordList/    # 添加词库
│   └── ...            # 其他云函数
└── project.config.json  # 项目配置文件
```

## 安装步骤

1. 克隆仓库
```bash
git clone https://github.com/skyever76/Tingxie.git
cd Tingxie
```

2. 安装微信开发者工具
- 下载并安装[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)

3. 导入项目
- 打开微信开发者工具
- 选择"导入项目"
- 选择项目目录
- 填入 AppID：wx67da5b793c1926e0（或使用测试号）

4. 云开发配置
- 开通云开发
- 创建云环境
- 在 project.config.json 中配置云环境 ID

5. 部署云函数
- 在微信开发者工具中，右键点击 cloudfunctions 目录下的每个云函数
- 选择"上传并部署：云端安装依赖"

## 环境配置

### 1. 本地开发配置
创建 `config.local.js` 文件（已加入 .gitignore）：
```javascript
module.exports = {
  // 云环境 ID
  envId: 'your-env-id',
  
  // 云函数配置
  cloudFunctions: {
    // 各云函数的配置
    getWordList: {
      // 特定配置
    },
    // ... 其他云函数配置
  },
  
  // 其他本地开发配置
  debug: true,
  // ...
}
```

### 2. 云函数配置
每个云函数目录下可以创建 `config.local.json`（已加入 .gitignore）：
```json
{
  "envId": "your-env-id",
  "functionName": "function-name",
  "timeout": 20,
  "memorySize": 128,
  "triggers": [],
  "variables": {
    "KEY": "value"
  }
}
```

### 3. 敏感信息
- 所有包含敏感信息的配置文件都已加入 .gitignore
- 请勿将包含密钥、密码等敏感信息的文件提交到代码库
- 使用云开发控制台管理敏感配置

## 使用说明

1. 词库管理
   - 点击"创建词库"添加新词库
   - 支持导入/导出词库
   - 可设置词库分类和权限

2. 听写功能
   - 选择词库开始听写
   - 支持自动播放和手动控制
   - 实时评分和进度记录

3. 进度追踪
   - 查看学习统计
   - 导出学习报告

## 开发计划

- [x] 基础词库管理
- [x] 听写核心功能
- [x] 进度追踪
- [ ] 社交分享
- [ ] 智能推荐
- [ ] 更多语言支持

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License

## 联系方式

- GitHub Issues: [提交问题](https://github.com/skyever76/Tingxie/issues)
- 项目地址: [https://github.com/skyever76/Tingxie](https://github.com/skyever76/Tingxie)

## 更新日志

### v1.0.0 (2024-03-xx)
- 初始版本发布
- 支持基础词库管理
- 实现听写核心功能
- 添加进度追踪功能 