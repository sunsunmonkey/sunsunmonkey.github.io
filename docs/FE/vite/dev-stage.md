# dev 阶段的 vite

## 预构建阶段

vite 源码是从 initDepsOptimizer 进入的

```ts
// vite\packages\vite\src\node\server\index.ts
initingServer = (async function () {
  await container.buildStart({});
  // start deps optimizer after all container plugins are ready
  if (isDepsOptimizerEnabled(config, false)) {
    await initDepsOptimizer(config, server);
  }
  warmupFiles(server);
  initingServer = undefined;
  serverInited = true;
})();
```

为了简单之后的代码我贴我自己的 sun-vite 的其实核心是差不多的，只是少了点特殊处理，理解起来也更容易

预处理大体又分为三个部分

- 确定入口
- 从入口处扫描依赖
- 预构建依赖

后面两步主要借助 esbuild 进行

### 从入口处扫描依赖

```ts
await build({
  entryPoints: [entry],
  bundle: true,
  write: false,
  plugins: [scanPlugin(deps)],
});
```

注意**write: false**表示产物不用写入磁盘，这就大大节省了磁盘 I/O 的时间了，也是依赖扫描为什么往往比依赖打包快很多的原因之一。

下面我们来看下 scanPlugin 做了什么

- 对一些如 css,less 等的一些文件进行忽略构建不让 esbuild 处理，防止 Esbuild 报错

- 对第三方导入的包进行记录记在 dep 里

```ts
import { Plugin } from "esbuild";
import { BARE_IMPORT_RE, EXTERNAL_TYPES } from "../constants";

export function scanPlugin(deps: Set<string>): Plugin {
  return {
    name: "esbuild:scan-deps",
    setup(build) {
      // 忽略的文件类型
      build.onResolve(
        { filter: new RegExp(`\\.(${EXTERNAL_TYPES.join("|")})$`) },
        (resolveInfo) => {
          console.log(resolveInfo);
          return {
            path: resolveInfo.path,
            // 打上 external 标记
            external: true,
          };
        }
      );
      // 记录依赖
      build.onResolve(
        {
          filter: BARE_IMPORT_RE,
        },
        (resolveInfo) => {
          const { path: id } = resolveInfo;
          // 推入 deps 集合中

          deps.add(id);
          return {
            path: id,
            // 忽略了node_modules的东西从而减少了构建发生时间
            // external直接略过不再进行递归bundle
            external: true,
          };
        }
      );
    },
  };
}
```

### 预构建依赖

这一步我们进行正式预构建就是吧第三方的文件打在一起减少网络请求

构建的内容放在**path.join("node_modules", ".m-vite");**

```ts
await build({
  entryPoints: [...deps],
  write: true,
  bundle: true,
  format: "esm",
  splitting: true,
  outdir: path.resolve(root, PRE_BUNDLE_DIR),
  plugins: [preBundlePlugin(deps)],
});
```

同样我们来看下**preBundlePlugin(deps)**

其实核心就是标记所要打包第三方包减少请求次数，然后进行 esModule 的转化

```ts
import { Loader, Plugin } from "esbuild";
import { BARE_IMPORT_RE } from "../constants";
// 用来分析 es 模块 import/export 语句的库
import { init, parse } from "es-module-lexer";
import path from "path";
// 一个实现了 node 路径解析算法的库
import resolve from "resolve";
// 一个更加好用的文件操作库
import fs from "fs-extra";
// 用来开发打印 debug 日志的库
import createDebug from "debug";
import { normalizePath } from "../utils";

const debug = createDebug("dev");

export function preBundlePlugin(deps: Set<string>): Plugin {
  return {
    name: "esbuild:pre-bundle",
    setup(build) {
      build.onResolve(
        {
          filter: BARE_IMPORT_RE,
        },
        (resolveInfo) => {
          const { path: id, importer } = resolveInfo;
          const isEntry = !importer;
          // 命中需要预编译的依赖
          if (deps.has(id)) {
            // 若为入口，则标记 dep 的 namespace
            return isEntry
              ? {
                  path: id,
                  namespace: "dep",
                }
              : {
                  // 因为走到 onResolve 了，所以这里的 path 就是绝对路径了
                  path: resolve.sync(id, { basedir: process.cwd() }),
                };
          }
        }
      );

      // 拿到标记后的依赖，构造代理模块，交给 esbuild 打包
      build.onLoad(
        {
          filter: /.*/,
          namespace: "dep",
        },
        async (loadInfo) => {
          await init;
          const id = loadInfo.path;
          const root = process.cwd();
          const entryPath = normalizePath(resolve.sync(id, { basedir: root }));
          const code = await fs.readFile(entryPath, "utf-8");
          const [imports, exports] = await parse(code);
          let proxyModule = [];
          // cjs
          if (!imports.length && !exports.length) {
            // 构造代理模块
            // 下面的代码后面会解释
            const res = require(entryPath);
            const specifiers = Object.keys(res);
            proxyModule.push(
              `export { ${specifiers.join(",")} } from "${entryPath}"`,
              `export default require("${entryPath}")`
            );
          } else {
            // esm 格式比较好处理，export * 或者 export default 即可
            if (exports.includes("default")) {
              proxyModule.push(`import d from "${entryPath}";export default d`);
            }
            proxyModule.push(`export * from "${entryPath}"`);
          }

          debug("代理模块内容: %o", proxyModule.join("\n"));
          const loader = path.extname(entryPath).slice(1);
          return {
            loader: loader as Loader,
            contents: proxyModule.join("\n"),
            resolveDir: root,
          };
        }
      );
    },
  };
}
```

由此整个预构建阶段完成我们进行启动服务器
同时进入中间件执行

## 服务器启动阶段

我们点击**ocalhost:3000**相当于发起一个 get 请求
所以我们中间件处理这个请求

```ts
import { NextHandleFunction } from "connect";
import { ServerContext } from "../index";
import path from "path";
import { pathExists, readFile } from "fs-extra";

export function indexHtmlMiddware(
  serverContext: ServerContext
): NextHandleFunction {
  return async (req, res, next) => {
    if (req.url === "/") {
      const { root } = serverContext;
      // 默认使用项目根目录下的 index.html
      const indexHtmlPath = path.join(root, "index.html");
      if (await pathExists(indexHtmlPath)) {
        const rawHtml = await readFile(indexHtmlPath, "utf8");
        let html = rawHtml;
        // 通过执行插件的 transformIndexHtml 方法来对 HTML 进行自定义的修改
        for (const plugin of serverContext.plugins) {
          if ((plugin as unknown as any).transformIndexHtml) {
            html = await (plugin as unknown as any).transformIndexHtml(html);
          }
        }

        res.statusCode = 200;
        res.setHeader("Content-Type", "text/html");
        return res.end(html);
      }
    }
    return next();
  };
}
```

然后就是一个核心transform的中间件
他会依次调用插件的 resolveId、load、transform 方法
以及一些resolve一些路径使得浏览器可以直接拿到相应的资源
其中JS/TS/JSX/TSX编译通过esbuild的transform处理
在插件里我们就会完成静态资源处理，JS/TS/JSX/TSX编译等等

其中主要有三个插件

- 路径解析插件
- Esbuild 语法编译插件
- import 分析插件
