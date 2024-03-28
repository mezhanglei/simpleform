---
title: '贡献指南'
nav:
  title: 列表
---

<!--
  感谢你的贡献！😄
-->

# 参与贡献

如果你也想参与开发，请阅读如下说明：

## 分支管理

该项目长期维护两个分支 `master` 和 `development`。如果你要提一个 pull request，那么请基于 `development` 分支来做，我会不定时合并 development 到 master，并发布版本与同步到 npm。

## Bugs

该项目使用 [GitHub Issues](https://github.com/Jacky-Summer/monki-ui/issues) 来做 bug 追踪。

## 第一次贡献

如果你还不清楚怎么在 GitHub 上提 Pull Request ，可以阅读下面这篇文章来学习：

[如何优雅地在 GitHub 上贡献代码](https://segmentfault.com/a/1190000000736629)

## Pull Request

### 🤔 这个变动的性质是？

- [ ] 新特性提交
- [ ] 日常 bug 修复
- [ ] 站点、文档改进
- [ ] 演示代码改进
- [ ] 组件样式/交互改进
- [ ] TypeScript 定义更新
- [ ] 包体积优化
- [ ] 性能优化
- [ ] 功能增强
- [ ] 重构
- [ ] 代码风格优化
- [ ] 测试用例
- [ ] 其他改动（是关于什么的改动？）

### 任何 PR 请基于 `development` 分支来做，`code review` 通过后会合并。

### PR 标题与 commit 信息开头请遵循如下规范：

- ✨ feat：新功能
- 🔧 chore：构建过程或辅助工具的变动
- 📝 docs：仅文档新增/改动
- 🐛 fix：修复 bug
- 🚀 perf：性能优化
- 🔨 refactor：某个已有功能重构
- ⏪ revert：代码回滚
- 🎨 style：代码格式改变
- ✅ test：添加缺失的测试或更正现有的测试
- 📦 build：改变了 build 工具
- 👷 ci：持续集成

🎉 release（only used in PR title）：发布版本提交

更多详细小贴士请阅读[pull request 模板](https://github.com/Jacky-Summer/monki-ui/blob/development/.github/PULL_REQUEST_TEMPLATE/pr_cn.md)

**在你发送 Pull Request 之前**，请确认你是按照下面的步骤来做的：

1. 基于`development`分支做修改。
2. 在项目根目录下运行了 `yarn install`。
3. 如果你修复了一个 bug 或者新增了一个功能，请确保写了相应的测试，这很重要。
4. 确认所有的测试都是通过的 `yarn test`。 小贴士：开发过程中可以用 `yarn test --watch TestName` 来运行指定的测试。
5. 运行 `yarn test -u` 来更新 [jest snapshot](http://facebook.github.io/jest/docs/en/snapshot-testing.html#snapshot-testing-with-jest) 并且把这些更新也提交上来（如果有的话）。
6. 确保你的代码通过了 lint 检查 `yarn lint`. 小贴士: Lint 会在你 `git commit` 的时候自动运行。

## 开发流程

在你 clone 了 monki-ui 的代码并且使用 `yarn install` 安装完依赖后，你还可以运行下面几个常用的命令：

1. `yarn start` 在本地运行 Monki UI 的网站。
2. `yarn lint` 检查代码风格。
3. `yarn test` 运行测试。
4. `yarn build:lib` 编译 TypeScript 与 CSS 代码到 dist 目录。
5. `yarn build:docs` 构建 monki-ui 的组件库文档版本到 docs-dist 目录。
