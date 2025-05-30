/**
 * 配置工具测试用例
 */

const {
  config,
  checkConfig,
  getConfig,
  getCloudFunctionConfig,
  getDatabaseConfig,
  getStorageConfig,
  logger
} = require('../miniprogram/utils/config');

// 模拟配置
const mockConfig = {
  envId: 'test-env-id',
  debug: true,
  cloudFunctions: {
    testFunction: {
      timeout: 20,
      memorySize: 128
    }
  },
  database: {
    name: 'test-db',
    collections: {
      test: 'test-collection'
    }
  },
  storage: {
    directories: {
      test: 'test-dir'
    }
  }
};

// 模拟 logger
const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
};

describe('配置工具测试', () => {
  beforeEach(() => {
    // 重置模拟函数
    jest.clearAllMocks();
    // 替换 logger
    Object.assign(logger, mockLogger);
  });

  describe('checkConfig', () => {
    test('应该通过有效的配置', () => {
      Object.assign(config, mockConfig);
      const result = checkConfig();
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('应该检测到缺失的必填配置', () => {
      Object.assign(config, { ...mockConfig, envId: '' });
      const result = checkConfig();
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].key).toBe('envId');
    });

    test('应该检测到无效的云函数配置', () => {
      Object.assign(config, {
        ...mockConfig,
        cloudFunctions: {
          invalidFunction: {
            timeout: 'invalid',
            memorySize: 'invalid'
          }
        }
      });
      const result = checkConfig();
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].key).toBe('cloudFunctions.invalidFunction');
    });
  });

  describe('getConfig', () => {
    test('应该返回配置值', () => {
      Object.assign(config, mockConfig);
      expect(getConfig('envId')).toBe('test-env-id');
      expect(getConfig('debug')).toBe(true);
    });

    test('应该返回默认值', () => {
      Object.assign(config, mockConfig);
      expect(getConfig('nonExistent', 'default')).toBe('default');
    });
  });

  describe('getCloudFunctionConfig', () => {
    test('应该返回云函数配置', () => {
      Object.assign(config, mockConfig);
      const functionConfig = getCloudFunctionConfig('testFunction');
      expect(functionConfig).toEqual({
        timeout: 20,
        memorySize: 128
      });
    });

    test('应该返回空对象当云函数配置不存在', () => {
      Object.assign(config, mockConfig);
      const functionConfig = getCloudFunctionConfig('nonExistent');
      expect(functionConfig).toEqual({});
    });
  });

  describe('getDatabaseConfig', () => {
    test('应该返回数据库配置', () => {
      Object.assign(config, mockConfig);
      const dbConfig = getDatabaseConfig();
      expect(dbConfig).toEqual({
        name: 'test-db',
        collections: {
          test: 'test-collection'
        }
      });
    });

    test('应该返回空对象当数据库配置不存在', () => {
      Object.assign(config, { ...mockConfig, database: undefined });
      const dbConfig = getDatabaseConfig();
      expect(dbConfig).toEqual({});
    });
  });

  describe('getStorageConfig', () => {
    test('应该返回存储配置', () => {
      Object.assign(config, mockConfig);
      const storageConfig = getStorageConfig();
      expect(storageConfig).toEqual({
        directories: {
          test: 'test-dir'
        }
      });
    });

    test('应该返回空对象当存储配置不存在', () => {
      Object.assign(config, { ...mockConfig, storage: undefined });
      const storageConfig = getStorageConfig();
      expect(storageConfig).toEqual({});
    });
  });

  describe('logger', () => {
    test('应该记录信息日志', () => {
      logger.info('test message');
      expect(mockLogger.info).toHaveBeenCalledWith('test message');
    });

    test('应该记录警告日志', () => {
      logger.warn('test warning');
      expect(mockLogger.warn).toHaveBeenCalledWith('test warning');
    });

    test('应该记录错误日志', () => {
      logger.error('test error');
      expect(mockLogger.error).toHaveBeenCalledWith('test error');
    });

    test('应该在开发环境下记录调试日志', () => {
      process.env.NODE_ENV = 'development';
      logger.debug('test debug');
      expect(mockLogger.debug).toHaveBeenCalledWith('test debug');
    });

    test('不应该在生产环境下记录调试日志', () => {
      process.env.NODE_ENV = 'production';
      logger.debug('test debug');
      expect(mockLogger.debug).not.toHaveBeenCalled();
    });
  });
}); 