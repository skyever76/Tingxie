# 配置说明文档

## 概述

本文档详细说明了亚当听写小程序的配置系统，包括本地开发配置、云函数配置以及配置检查工具的使用方法。

## 配置结构

### 1. 本地开发配置 (config.local.js)

```javascript
module.exports = {
  // 云环境 ID（必填）
  envId: 'your-env-id',
  
  // 云函数配置
  cloudFunctions: {
    // 各云函数的配置
    functionName: {
      timeout: 20,      // 超时时间（秒）
      memorySize: 128,  // 内存大小（MB）
      // 其他特定配置
    }
  },
  
  // 开发环境配置
  debug: true,         // 是否开启调试模式
  
  // 数据库配置
  database: {
    name: 'tingxie',   // 数据库名称
    collections: {     // 集合名称
      wordLists: 'word_lists',
      categories: 'categories',
      texts: 'texts',
      progress: 'progress'
    }
  },
  
  // 存储配置
  storage: {
    directories: {     // 存储目录
      audio: 'audio/',
      images: 'images/'
    }
  }
};
```

### 2. 云函数配置 (config.local.json)

```json
{
  "envId": "your-env-id",        // 云环境 ID
  "functionName": "function-name", // 云函数名称
  "timeout": 20,                 // 超时时间（秒）
  "memorySize": 128,            // 内存大小（MB）
  "triggers": [],               // 触发器配置
  "variables": {                // 环境变量
    "KEY": "value"
  },
  "runtime": "Nodejs12.16",     // 运行环境
  "region": "ap-shanghai",      // 部署区域
  "description": "云函数描述",   // 函数描述
  "author": "开发者名称",        // 作者
  "version": "1.0.0"           // 版本号
}
```

## 配置项说明

### 必填配置

1. **envId**
   - 类型：string
   - 说明：云环境 ID，用于标识云开发环境
   - 获取方式：云开发控制台 -> 设置 -> 环境 ID

### 可选配置

1. **cloudFunctions**
   - 类型：object
   - 说明：云函数配置，包含每个云函数的特定配置
   - 子项：
     - timeout：超时时间（秒）
     - memorySize：内存大小（MB）

2. **debug**
   - 类型：boolean
   - 说明：是否开启调试模式
   - 默认值：false

3. **database**
   - 类型：object
   - 说明：数据库配置
   - 子项：
     - name：数据库名称
     - collections：集合名称映射

4. **storage**
   - 类型：object
   - 说明：存储配置
   - 子项：
     - directories：存储目录配置

## 配置检查工具

### 使用方法

```javascript
const { checkConfig, getConfig, getCloudFunctionConfig } = require('./utils/config');

// 检查配置
if (!checkConfig()) {
  console.error('配置检查失败');
  return;
}

// 获取配置值
const envId = getConfig('envId');
const debug = getConfig('debug', false);

// 获取云函数配置
const functionConfig = getCloudFunctionConfig('getWordList');
```

### 错误处理

1. **配置缺失**
   - 错误信息：`缺少必要配置: envId`
   - 解决方法：在 config.local.js 中设置 envId

2. **配置格式错误**
   - 错误信息：`配置格式错误: [具体错误]`
   - 解决方法：检查配置文件格式是否符合要求

3. **云函数配置缺失**
   - 错误信息：`云函数配置缺失: [函数名]`
   - 解决方法：在 cloudFunctions 中添加对应配置

## 最佳实践

1. **配置管理**
   - 使用 config.local.js.example 作为模板
   - 不要将实际配置文件提交到代码库
   - 定期备份配置文件

2. **环境隔离**
   - 开发环境使用本地配置
   - 生产环境使用云开发控制台配置
   - 使用环境变量区分不同环境

3. **安全建议**
   - 敏感信息使用云开发控制台管理
   - 定期更新密钥和密码
   - 限制配置文件的访问权限

## 常见问题

1. **Q: 如何获取云环境 ID？**
   A: 登录云开发控制台 -> 设置 -> 环境 ID

2. **Q: 配置修改后不生效？**
   A: 检查配置文件是否正确加载，可能需要重启开发工具

3. **Q: 如何添加新的云函数配置？**
   A: 在 cloudFunctions 对象中添加新的配置项

## 更新日志

### v1.0.0 (2024-03-xx)
- 初始版本
- 支持基本配置管理
- 添加配置检查工具 