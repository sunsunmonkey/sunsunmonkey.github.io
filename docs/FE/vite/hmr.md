# vite hmr 的过程

### 模块依赖图构建

ModuleGraph 类

```ts
import { PartialResolvedId, TransformResult } from "rollup";
import { cleanUrl } from "./utils";

export class ModuleNode {
  // 资源访问 url
  url: string;
  // 资源绝对路径
  id: string | null = null;
  //哪些包导入了该包
  importers = new Set<ModuleNode>();
  //该包被哪些包导入
  importedModules = new Set<ModuleNode>();
  //该模块的内容
  transformResult: TransformResult | null = null;
  lastHMRTimestamp = 0;
  constructor(url: string) {
    this.url = url;
  }
}

export class ModuleGraph {
  // 资源 url 到 ModuleNode 的映射表
  urlToModuleMap = new Map<string, ModuleNode>();
  // 资源绝对路径到 ModuleNode 的映射表
  idToModuleMap = new Map<string, ModuleNode>();

  constructor(
    private resolveId: (url: string) => Promise<PartialResolvedId | null>
  ) {}

  getModuleById(id: string): ModuleNode | undefined {
    return this.idToModuleMap.get(id);
  }

  async getModuleByUrl(rawUrl: string): Promise<ModuleNode | undefined> {
    const { url } = await this._resolve(rawUrl);
    return this.urlToModuleMap.get(url);
  }

  //从url构建一个ModuleNode
  async ensureEntryFromUrl(rawUrl: string): Promise<ModuleNode> {
    const { url, resolvedId } = await this._resolve(rawUrl);
    // 首先检查缓存
    if (this.urlToModuleMap.has(url)) {
      return this.urlToModuleMap.get(url) as ModuleNode;
    }
    // 若无缓存，更新 urlToModuleMap 和 idToModuleMap
    const mod = new ModuleNode(url);
    mod.id = resolvedId;
    this.urlToModuleMap.set(url, mod);
    this.idToModuleMap.set(resolvedId, mod);
    return mod;
  }

  // 根据mod和其导入的包进行更新图
  async updateModuleInfo(
    mod: ModuleNode,
    importedModules: Set<string | ModuleNode>
  ) {
    const prevImports = mod.importedModules;
    for (const curImports of importedModules) {
      //是string就生成mod节点
      const dep =
        typeof curImports === "string"
          ? await this.ensureEntryFromUrl(cleanUrl(curImports))
          : curImports;
      if (dep) {
        mod.importedModules.add(dep);
        dep.importers.add(mod);
      }
    }
    // 清除已经不再被引用的依赖
    for (const prevImport of prevImports) {
      if (!importedModules.has(prevImport.url)) {
        prevImport.importers.delete(mod);
      }
    }
  }

  // HMR 触发时会执行这个方法
  invalidateModule(file: string) {
    const mod = this.idToModuleMap.get(file);
    if (mod) {
      // 更新时间戳
      mod.lastHMRTimestamp = Date.now();
      //去除mod的内容使其失活
      mod.transformResult = null;
      mod.importers.forEach((importer) => {
        this.invalidateModule(importer.id!);
      });
    }
  }

  private async _resolve(
    url: string
  ): Promise<{ url: string; resolvedId: string }> {
    const resolved = await this.resolveId(url);
    const resolvedId = resolved?.id || url;
    return { url, resolvedId };
  }
}
```

首先在服务启动前，我们需要初始化 ModuleGraph 实例:

```diff
// src/node/server/index.ts
+ import { ModuleGraph } from "../ModuleGraph";

export interface ServerContext {
  root: string;
  pluginContainer: PluginContainer;
  app: connect.Server;
  plugins: Plugin[];
+  moduleGraph: ModuleGraph;
}

export async function startDevServer() {
+  const moduleGraph = new ModuleGraph((url) => pluginContainer.resolveId(url));
  const pluginContainer = createPluginContainer(plugins);
  const serverContext: ServerContext = {
    root: process.cwd(),
    app,
    pluginContainer,
    plugins,
+    moduleGraph
  };

}

```

然后在加载完模块后，也就是调用插件容器的 load 方法后，我们需要通过 **ensureEntryFromUrl** 方法注册模块
当我们对 JS 模块分析完 import 语句之后，需要更新模块之间的依赖关系

### 服务器

- 创建文件监听器，以监听文件的变动
- 创建 WebSocket 服务端，负责和客户端进行通信

```ts
import connect from "connect";
import { red } from "picocolors";
import { WebSocketServer, WebSocket } from "ws";
import { HMR_PORT } from "./constants";

export function createWebSocketServer(server: connect.Server): {
  send: (msg: string) => void;
  close: () => void;
} {
  let wss: WebSocketServer;
  wss = new WebSocketServer({ port: HMR_PORT });
  wss.on("connection", (socket) => {
    socket.send(JSON.stringify({ type: "connected" }));
  });

  wss.on("error", (e: Error & { code: string }) => {
    if (e.code !== "EADDRINUSE") {
      console.error(red(`WebSocket server error:\n${e.stack || e.message}`));
    }
  });

  return {
    send(payload: Object) {
      const stringified = JSON.stringify(payload);
      //发送给所有客户端
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(stringified);
        }
      });
    },

    close() {
      wss.close();
    },
  };
}
```

### 客户端
