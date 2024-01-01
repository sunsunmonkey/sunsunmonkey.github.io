# vite 源码

## 处理配置文件

就是一个简单的匹配找到 vite.config

```ts
for (const filename of DEFAULT_CONFIG_FILES) {
  const filePath = path.resolve(configRoot, filename);
  if (!fs.existsSync(filePath)) continue;

  resolvedPath = filePath;
  break;
}
```

然后进行打包解析这个文件
在这个函数里，用的是 esbuild

```ts
async function bundleConfigFile(
  fileName: string,
  isESM: boolean
): Promise<{ code: string; dependencies: string[] }> {}
```

然后将其打包在根目录下
for esm, before we can register loaders without requiring users to run node
with --experimental-loader themselves, we have to do a hack here:
write it to disk, load it with native Node ESM, then delete the file.

如果是 ESM 格式，Vite 会将编译后的 js 代码写入临时文件，通过 Node 原生 ESM Import 来读取这个临时的内容，以获取到配置内容，再直接删掉临时文件
你就会发现这个文件
![vite_config](/imgs/vite/vite_config.png)

```ts
const userConfig = await loadConfigFromBundledFile(
  resolvedPath,
  bundled.code,
  isESM
);
```

userConfig 就有了就是你写的 vite.config.ts 文件

之后的 config 会与命令行的配置进行合并

```ts
config = mergeConfig(loadResult.config, config);
```

值得注意的是，后面有一个记录 configFileDependencies 的操作。因为配置文件代码可能会有第三方库的依赖，所以当第三方库依赖的代码更改时，Vite 可以通过 HMR 处理逻辑中记录的 configFileDependencies 检测到更改，再重启 DevServer ，来保证当前生效的配置永远是最新的。

```ts
configFileDependencies = loadResult.dependencies;
```

### 处理插件

第二个重点环节是 解析用户插件。首先，我们通过 apply 参数 过滤出需要生效的用户插件。为什么这么做呢？因为有些插件只在开发阶段生效，或者说只在生产环境生效，我们可以通过 apply: 'serve' 或 'build' 来指定它们，同时也可以将 apply 配置为一个函数，来自定义插件生效的条件。

```ts
const filterPlugin = (p: Plugin) => {
  if (!p) {
    return false;
  } else if (!p.apply) {
    return true;
  } else if (typeof p.apply === "function") {
    return p.apply({ ...config, mode }, configEnv);
  } else {
    return p.apply === command;
  }
};
```

### 处理 alias

我们可以看到 alias 的处理@vite/env、@vite/client 这种替换成其打包后的位置
然后自己的 alias 在 config.resolve?.alias 里处理

```ts
const clientAlias = [
  {
    find: /^\/?@vite\/env/,
    replacement: path.posix.join(FS_PREFIX, normalizePath(ENV_ENTRY)),
  },
  {
    find: /^\/?@vite\/client/,
    replacement: path.posix.join(FS_PREFIX, normalizePath(CLIENT_ENTRY)),
  },
];

// resolve alias with internal client alias
const resolvedAlias = normalizeAlias(
  mergeAlias(clientAlias, config.resolve?.alias || [])
);
```

### 处理一些基础配置

```ts
const resolveOptions: ResolvedConfig["resolve"] = {
  mainFields: config.resolve?.mainFields ?? DEFAULT_MAIN_FIELDS,
  conditions: config.resolve?.conditions ?? [],
  extensions: config.resolve?.extensions ?? DEFAULT_EXTENSIONS,
  dedupe: config.resolve?.dedupe ?? [],
  preserveSymlinks: config.resolve?.preserveSymlinks ?? false,
  alias: resolvedAlias,
};
```

### 加载环境变量

```ts
const envDir = config.envDir
  ? normalizePath(path.resolve(resolvedRoot, config.envDir))
  : resolvedRoot;
const userEnv =
  inlineConfig.envFile !== false &&
  loadEnv(mode, envDir, resolveEnvPrefix(config));
```
