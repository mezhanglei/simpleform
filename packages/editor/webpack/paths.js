const path = require("path");
const fs = require('fs');
// 返回运行当前脚本的工作目录的路径。
const appRoot = fs.realpathSync(process.cwd());
// 加载根目录下面的其他目录
const resolveApp = relativePath => path.resolve(appRoot, relativePath);
// 打包入口
const srcPath = resolveApp('src');
// lib输出目录
const libOutputPath = resolveApp('lib');
// 页面输出目录
const distOutputPath = resolveApp('dist');
// node_modules的目录
const nodeModulesPath = resolveApp('node_modules');
// 引入配置
const configs = require('./configs.js');
// 是否为开发环境
const isDev = configs.isDev;
// 是否打包dist
const isDist = configs.isDist;
// 打包页面入口
const distEntry = path.join('example', 'index');
// 打包库的入口
const libEntry = path.join(srcPath, 'index');
// 应用html模板
const appHtml = path.join('example', 'index.html');
// 打包入口
const appEntry = isDev || isDist ? distEntry : libEntry;
// 输出目录
const outputPath = isDev || isDist ? distOutputPath : libOutputPath;
// 合并为一个对象输出
module.exports = {
  appRoot,
  srcPath,
  nodeModulesPath,
  appEntry,
  appHtml,
  outputPath,
  // 资源访问的公共绝对路径, 并且访问路由会加上对应的路径字符串， 默认为/不能为空(格式如: /publicPath/)
  publicPath: isDev ? '/' : './',
  babelrcPath: path.join(appRoot, './.babelrc'),
  mockPath: path.join(srcPath, 'mock')
};
