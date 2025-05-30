/**
 * 配置检查和加载工具
 */

// 默认配置
const defaultConfig = {
  envId: '',
  debug: false
};

// 配置验证规则
const validationRules = {
  envId: {
    type: 'string',
    required: true,
    message: '云环境 ID 不能为空'
  },
  debug: {
    type: 'boolean',
    required: false,
    default: false
  },
  cloudFunctions: {
    type: 'object',
    required: false,
    validate: (value) => {
      if (!value) return true;
      return Object.values(value).every(func => 
        typeof func === 'object' && 
        typeof func.timeout === 'number' &&
        typeof func.memorySize === 'number'
      );
    },
    message: '云函数配置格式错误'
  }
};

// 日志工具
const logger = {
  info: (message) => {
    console.log(`[配置] ${message}`);
  },
  warn: (message) => {
    console.warn(`[配置] ${message}`);
  },
  error: (message) => {
    console.error(`[配置] ${message}`);
  },
  debug: (message) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[配置] ${message}`);
    }
  }
};

// 加载本地配置
let localConfig = {};
try {
  logger.info('开始加载本地配置...');
  localConfig = require('../config.local.js');
  logger.info('本地配置加载成功');
  logger.debug('配置内容:', JSON.stringify(localConfig, null, 2));
} catch (e) {
  logger.warn('未找到本地配置文件，使用默认配置');
  logger.debug('错误详情:', e.message);
}

// 合并配置
const config = {
  ...defaultConfig,
  ...localConfig
};

/**
 * 验证配置值
 * @param {*} value 配置值
 * @param {Object} rule 验证规则
 * @returns {boolean} 是否通过验证
 */
function validateValue(value, rule) {
  if (rule.required && (value === undefined || value === null || value === '')) {
    logger.debug(`配置项验证失败: 必填项为空`);
    return false;
  }
  
  if (value !== undefined && value !== null) {
    if (rule.type && typeof value !== rule.type) {
      logger.debug(`配置项验证失败: 类型错误，期望 ${rule.type}，实际 ${typeof value}`);
      return false;
    }
    
    if (rule.validate && !rule.validate(value)) {
      logger.debug(`配置项验证失败: 自定义验证未通过`);
      return false;
    }
  }
  
  return true;
}

/**
 * 检查必要配置
 * @returns {Object} 检查结果
 */
function checkConfig() {
  logger.info('开始检查配置...');
  const errors = [];
  
  // 检查每个配置项
  Object.entries(validationRules).forEach(([key, rule]) => {
    const value = config[key];
    
    if (!validateValue(value, rule)) {
      const error = {
        key,
        message: rule.message || `配置项 ${key} 验证失败`
      };
      errors.push(error);
      logger.error(`配置检查失败: ${error.message}`);
    }
  });
  
  // 检查云函数配置
  if (config.cloudFunctions) {
    Object.entries(config.cloudFunctions).forEach(([name, funcConfig]) => {
      if (!validateValue(funcConfig, validationRules.cloudFunctions)) {
        const error = {
          key: `cloudFunctions.${name}`,
          message: `云函数 ${name} 配置验证失败`
        };
        errors.push(error);
        logger.error(`配置检查失败: ${error.message}`);
      }
    });
  }
  
  const result = {
    valid: errors.length === 0,
    errors
  };
  
  if (result.valid) {
    logger.info('配置检查通过');
  } else {
    logger.error(`配置检查失败，共 ${errors.length} 个错误`);
  }
  
  return result;
}

/**
 * 获取配置值
 * @param {string} key 配置键
 * @param {*} defaultValue 默认值
 * @returns {*} 配置值
 */
function getConfig(key, defaultValue) {
  const value = config[key];
  if (value === undefined || value === null) {
    logger.debug(`获取配置 ${key}，使用默认值: ${defaultValue}`);
    return defaultValue;
  }
  logger.debug(`获取配置 ${key}: ${value}`);
  return value;
}

/**
 * 获取云函数配置
 * @param {string} functionName 云函数名称
 * @returns {Object} 云函数配置
 */
function getCloudFunctionConfig(functionName) {
  const functionConfig = config.cloudFunctions?.[functionName];
  if (!functionConfig) {
    logger.warn(`云函数 ${functionName} 配置缺失`);
    return {};
  }
  logger.debug(`获取云函数 ${functionName} 配置:`, functionConfig);
  return functionConfig;
}

/**
 * 获取数据库配置
 * @returns {Object} 数据库配置
 */
function getDatabaseConfig() {
  const dbConfig = config.database || {};
  logger.debug('获取数据库配置:', dbConfig);
  return dbConfig;
}

/**
 * 获取存储配置
 * @returns {Object} 存储配置
 */
function getStorageConfig() {
  const storageConfig = config.storage || {};
  logger.debug('获取存储配置:', storageConfig);
  return storageConfig;
}

// 导出工具
module.exports = {
  config,
  checkConfig,
  getConfig,
  getCloudFunctionConfig,
  getDatabaseConfig,
  getStorageConfig,
  logger // 导出日志工具，方便测试
}; 