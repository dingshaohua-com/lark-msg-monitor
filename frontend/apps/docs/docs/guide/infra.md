# 基建
这里主要讲 主项目的基建过程！


## React Compiler
[React Compiler](https://zh-hans.react.dev/learn/react-compiler) 是一个构建时工具，它可自动优化 React 应用。让你摆脱手动编写 memo和callback 的心智负担。

rsbuild 官方也给出了 如何开启 [react-compiler的教程](https://rsbuild.rs/zh/guide/framework/react#react-compiler)！

## 路径别名
Rsbuild 默认就支持路径别名（Path Aliases），跟项目以 `@` 开头，且支持ts提示，   
如果不能满足你的个性化需求，可以查看[官方文档](https://rsbuild.rs/zh/guide/advanced/alias)自定义！

## 其它
以下在线项目中并未集成

* 路由: 虽然rsbuild[官方推荐](https://rsbuild.rs/zh/guide/framework/react#%E8%B7%AF%E7%94%B1)TanStack Router，但是我个人更倾向于[React Router](https://www.cnblogs.com/dingshaohua/p/17510919.html)
* hook扩展库：ahooks，内置了很多实用的钩子，比如useControllableValue、useMount、useRequest
* ts-pattern：模板语法的扩展，可以优雅的处理if else的渲染逻辑
* immerjs: 更好的处理好react状态，尤其是当你想修改较深的状态时
* 无限加载：推荐 @tanstack/react-query+react-intersection-observer
* 虚拟列表：推荐 @tanstack/react-virtual
