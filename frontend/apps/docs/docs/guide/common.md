# 提取公共

## GitIgnore
基于 rsbuild 和 rspress 创建项目中的 `.gitignore` 相同，我们把 main 项目的此文件复制到根项目即可，然后删除两个项目的此文件即可！

## Biome
Biome 格式化代码、修复错误，不止于此，就在一瞬间！ 用于取代 Eslint+Prettier 。 本体使用 rust 编写，速度是上边的几十倍！

基于 rsbuild 和 rspress 创建项目中的 `biome.json` 相同，我们把它抽离到子包
```json title=packages/config-biome/index.json
{
  "$schema": "https://biomejs.dev/schemas/2.3.11/schema.json",
  "assist": {
    "actions": {
      "source": {
        "organizeImports": "on"
      }
    }
  },
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "formatter": {
    "indentStyle": "space",
    "lineWidth": 320
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single"
    }
  },
  "json": {
    "parser": {
      "allowComments": true,
      "allowTrailingCommas": true
    }
  },
  "css": {
    "parser": {
      "cssModules": true,
      "tailwindDirectives": true
    }
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "a11y": {
        "recommended": false
      },
      "style": {
        "noNonNullAssertion": "off"
      }
    }
  }
}
```

最后在根项目中创建此文件，这样全局皆准寻此配置
```json title=biome.json
{
  "extends": ["./packages/config-biome/index.json"]
}
```
:::tip 提示
外部继承限制: Biome 的 extends 配置不支持像 npm 包那样的模块解析（如 @repo/config-biome），它要一直接的文件路径。

怎么抽离法：将Biome的配置做为子包抽离为 @repo/config-biome，Biome / Prettier / ESLintd等只放在根目录起作用，一份配置管全仓，子项目基本零差异不用单独配置。
:::

哦，对了最后别忘了，在根项目中安装 `pnpm add --D @biomejs/biome --workspace-root`，并且在vscode安装biome插件

## Ts
基于 rsbuild 和 rspress 创建项目中的 `tsconfig.json` 极为相同（实际上整个项目的ts配置都大差不差），我们提取到 @repo/config-ts 放公共规则

里边创建一个 rs-app.json规则，给它们（mian和docs）用； 
```json title=packages/config-ts/rs-app.json
{
  "compilerOptions": {
    "lib": ["DOM", "ES2020"],
    "jsx": "react-jsx",
    "target": "ES2020",
    "noEmit": true,
    "skipLibCheck": true,
    "useDefineForClassFields": true,

    /* modules */
    "module": "ESNext",
    "moduleDetection": "force",
    "moduleResolution": "bundler",
    "verbatimModuleSyntax": true,
    "resolveJsonModule": true,
    "allowImportingTsExtensions": true,
    "noUncheckedSideEffectImports": true,

    /* type checking */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```


但是受限于TS的继承规则（下边提示中说明）。我们仍然需要保留两个项目的 tsconfig.json文件，只是作如下调整
```json title=apps/docs/tsconfig.json
{
 "extends": "@repo/config-ts/rs-app.json",
 "include": ["docs", "theme", "rspress.config.ts"],
  "mdx": {
    "checkMdx": true
  }
}
```
```json title=apps/main/tsconfig.json
{
  "extends": "@repo/config-ts/rs-app.json",
  "include": ["src"],
  "compilerOptions": {
    "paths": {
      "@/*":["./src/*"]
    }
  }
}
```

如果根目录不涉及到代码，只是组织文件的话，则无需给根项目配置 tsconfig！

哦，对了记得给两个项目安装提出去的包，否则无法继承
```shell
pnpm add --D @repo/config-ts --workspace
```

:::tip Ts继承规则
外部继承限制: include、exclude 和 files 不能通过 extends 被继承，这是 Ts 的一个设计限制，主要抽离的是 compilerOptions！

所以我们这样做：每个子项目必须有自己的 tsconfig.json，后再考虑继承 base，只补差异（outDir、paths、target 等）
:::
