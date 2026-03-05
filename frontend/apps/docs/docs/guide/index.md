# 创建项目

## 创建空项目
:::tip  注意
咱并没用[官方提到](https://turborepo.dev/docs/getting-started/installation)的`pnpm dlx create-turbo`来初始化项目，因为和咱们的rsbuild架构不符，不但复杂且带有太多干扰。
:::

使用`pnpm init`初始化空项目react-full-project即可

## Monorepo

先创建以下文件，来表示此项目为 Monorepo
```yml title=pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
```

接着我们分别再项目中创建这两个目录apps、和packages。apps下初始化两个项目
```shell
apps
  |--main // 用rsbuild创建，修改包名为@repo/main
  |--docs // 用rspress创建，修改包名为@repo/docs
```


## Turborepo
根项目中安装 turbo，使用Turborepo 来管理 Monorepo
```
pnpm add --D turbo
```

此时我们根项目应是这个
```json title=package.json
{
 "name": "frontend",
 "version": "0.0.1",
 "packageManager": "pnpm@10.27.0",
 "scripts": {
  "build": "turbo run build",
  "dev:main": "turbo run dev --filter=@repo/main",
  "dev:docs": "turbo run dev --filter=@repo/docs"
 },
 "devDependencies": {
  "turbo": "^2.7.5"
 }
}
```

创建turbo.json
```json
{
  "$schema": "https://turborepo.dev/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
       "outputs": ["../../dist/**", "../../dist/docs/**"]
    },
    "dev": {
      "persistent": true,
      "cache": false
    }
  }
}
```
:::tip  注意
outputs 之所这样，是因为我们main项目是基于rsbuild，而文档docs是基于rspress。它们构建输出的就是dist目录！
:::




