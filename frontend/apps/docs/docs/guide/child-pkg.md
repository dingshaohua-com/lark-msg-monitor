# 抽取子包
主项目优化：将通用的，业务无关的部分，抽取为子包。使得主项目更清晰！

## 集成tailwind
Tailwind有一堆预设的 css 样式集合，而且它会按需打包 class 样式，并智能解决class冲突等问题，所以无论你是使用什么ui框架，它都推荐作为基础配置！

### 抽离到子包
将 tailwind 抽离到 @repo/config-tailwind 中，内容大致如下
```shell
config-tailwind
  |--config
  |--layers # 自定义className
    |--base.css # 基础类，如html、body等
    |--components.css  # 组件类，如输入框、按钮等
    |--utilities.css # 工具类，如阴影、圆角等
  |--themes # 主题
  |--base-styles.css # 入口
  |--package.json
  |--postcss.config.js # PostCSS 插件
```

:::tip 为啥要PostCSS
不同于 Vite，在 Rsbuild 中 Tailwind CSS v4 需要通过 PostCSS 插件来来注册 Tailwind CSS 的 PostCSS 插件。
:::

### 使用子包
虽然你在 @repo/config-tailwind 包里已经配置好了 PostCSS，但 Rsbuild 需要在当前项目目录下找到 postcss.config.js 文件才能正确加载这些配置。因此main项目也需要此文件
```js title=mian/postcss.config.js
import { postcssConfig } from '@repo/config-tailwind/postcss';

export default postcssConfig;
```

哦，对了别忘了，记得在 main项目安装它`pnpm add --D @repo/config-tailwind --workspace`.

最后 在 apps/main 项目的 style.css 引用即可
```css App.css
@import "@repo/config-tailwind";
```

看看效果，在 App.tsx 中`<p className="text-red-300">你好</p>`

## 集成ShadCn
对比完整的框架antd，shadcn/ui是一个代码库，它 无运行时依赖，基于Tailwind CSS，极致的定制自由。"你自己的组件库"理念：源码在手，随意修改，深度定制无限制。

shadcn/ui：只包含你实际使用的组件代码； Ant Design：包含完整库，即使只用一个按钮

关键决策点：你想要完全的设计控制权（shadcn）还是开箱即用的完整方案（Ant Design）？


### 抽离到子包
将shadcn/ui相关的都抽离到 ui-shadcn 子包中
```shell
ui-shadcn
  |-src # shadcn的核心，你安装的组件和工具都在这里
  |-components.json # shadcn 项目配置文件，它告诉 CLI 如何为你的项目生成和配置组件
  |-package.json 
  |-tsconfig.json # 主要配置路径和识别jsx，让其作为子包独立存在而不报错
```

好了，让我尝试安装一个按钮，终端进入ui-shadcn 子包目录下，执行
```shell
pnpm dlx shadcn@latest add button
```

### 使用子包
进入到主项目 main，安装此包 `pnpm add --D @repo/ui-shadcn --workspace`
```jsx title=apps/main/src/App.tsx
import "./App.css";
import {Button} from "@repo/ui-shadcn/button"

const App = () => {
  return  <Button>测试</Button>;
};

export default App;
```

## 集成自己组件库
有些时候我们也想自己抽离一些跟业务无关的纯ui组件库。

### 抽离到子包
在packages创建新的子包项目 ui-custom，并初始化它
```shell
ui-custom
  |--src # 自定义组件们
  |--package.json
  |--tsconfig.json 
     # 作为独立子包所需的ts配置，
     # 注意特意为它提出了一个
     # @repo/config-ts/react-lib.json
```

另外为了方便合并外部class，还特意为此子包封装个了 cn 工具函数。

我们定义一个自定义的 `Card组件`吧
```jsx title=packages/ui-custom/src/card/index.tsx
import React from "react";
import {cn} from "../utils"

type CardPops = React.ComponentProps<'div'> 
export default function Card(props: CardPops){
    return <div className={cn('border', props.className)}>
        {props.children}
    </div>
}
```


### 使用子包
进入到主项目 main，安装此包 `pnpm add @repo/ui-custom --workspace`
```jsx title=apps/main/src/App.tsx
import "./App.css";
import Card from "@repo/ui-custom/card"

const App = () => {
  return <Card>你好啊</Card>;
};

export default App;
```


## 封装通用工具类
创建一个子包 `@repo/utils`使用，这个没有什么好讲的，看代码即可！