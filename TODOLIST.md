# TOTP Auth 开发清单

## 项目初始化
- [x] 1. 创建目录结构 (src/, tests/)
- [x] 2. 初始化 package.json
- [x] 3. 配置 tsconfig.json
- [x] 4. 配置 rollup.config.js
- [x] 5. 配置 jest.config.js

## 核心模块开发
- [x] 6. 实现 src/types.ts (类型定义)
- [x] 7. 实现 src/base32.ts (Base32 编解码)
- [x] 8. 实现 src/hotp.ts (HOTP 基础实现)
- [x] 9. 实现 src/totp.ts (TOTP 核心实现)
- [x] 10. 实现 src/index.ts (主入口)

## 测试
- [x] 11. 编写 totp.test.ts 测试用例
- [x] 12. 运行测试验证功能

## 文档与发布准备
- [x] 13. 编写 README.md
- [x] 14. 构建项目 (npm run build)

## 发布
- [ ] 15. 发布到 npm
