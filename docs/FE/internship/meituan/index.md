# 美团实习

## 部门及时间

美团到店基础架构部门-Rome

2024.5.14-2024.9.6

## 处理 TT（工单）

处理 TT（工单）共记 12 个，

比较有价值的一个 TT [realContentHash 的理解](realHashContent.md)

## 基于 webcontianer 的 webIDE 插件开发

webIDE 这里指的就是 opensumi 旗下的一个纯前端的 IDE 就是没有服务器跑在客户端上

[codeblitz](https://github.com/opensumi/codeblitz) 在美团叫 mcodeblitz（能力支持给内部的低代码平台）

这里我们就有一个需求就是希望跑自己的 lint 检测（公司内部）的代码检测基于 eslint 以及各种 nodejs 模块，我们都知道浏览器无法直接跑 nodejs

所以有以下几种方案

- 直接在浏览器初始化 ESlint 的 Linter 类 就是[eslint-linter-browserify](https://www.npmjs.com/package/eslint-linter-browserify) (但是只支持 ESLint 内置的规则：第三方 ESLint 插件一般会用 Common JS 作为模块标准，无法直接在 Web 场景引入)

- 在 CI 服务器上运行 ESLint （只能扫描仓库中已提交的代码，单次扫描需要 3~5min）局限性也比较高

- 所以我们最终决定使用在 webcontainer 的 Node.js 实例中运行 ESLint

### 基础设计

本次代码扫描插件可以拆解为两个部分

- 插件容器：负责 Webcontainer 的初始化并在其中执行代码扫描程序，将用户的输入作为请求发送给代码扫描程序，在代码扫描程序输出结果后，反馈到编辑器的界面中

- 代码扫描程序：根据项目的实际情况生成 ESLint 配置，并启动 ESLint 实例。接收代码扫描请求并交给 ESLint 进行扫描，再将扫描结果回传

#### 插件容器：

由于 OpenSumi 框架的插件运行在一个 WebWorker 进程中，无法访问 DOM。但是 Webcontainer 技术需要挂载 iframe 节点（即使不需要实际展示），因此必须运行在编辑器的前端中。因此需要考虑的难点在于如何让 Webcontainer 在 OpenSumi 插件中运行起来。

OpenSumi 插件是 VSCode 插件的超集，除了支持 VSCode 的 API 外，还支持通过 React 技术栈进行视图的拓展定制，为此提供了 Browser 端的入口，同时可以与插件的其它入口进行通信。基于这个特性，我们可以把 Webcontainer 运行在 Browser 端入口中，把 IDE 的交互逻辑运行在插件入口中，通过通信机制完成两个入口的融合

#### 代码扫描程序

代码扫描程序运行在 Webcontainer 中，目前 Webcontainer 只支持 spawn 来启动 Node.js 程序，不支持 fork，因此要实现与插件端入口的交互，需要作为一个 Node.js 的 CLI 程序，通过指定格式的标准输入和标准输出实现调用。代码扫描程序以 ESLint 作为核心，接收代码扫描请求并交给 ESLint 进行扫描，再将扫描结果回传。整体流程如下。

### 遇到的问题

- webcontainer 内部不支持 git 操作，但是上游仓库需要使用这块功能，解决方案也比较简单就是改成配置式然后用 pnpm-patch 打补丁
- webcontainer 需要读取的是字符串，对文件编写不友好，配置 raw-loader 来加载
- webcontainer 首次加载时间太慢，后面展开说说

### webcontainer 首次加载时间提速

我们每次进入相当于一个新的环境，都需要重新下载，就是在浏览侧执行`pnpm i` 我们首先想到的就是把 pnpm lock 文件保存起来然后再下载，效果一般那我们更进一步，我们就想把 node_modules 缓存起来

### node_modules 缓存

缓存的起初因为我们都知道 pnpm 是软硬链接相联系的，然后我起初把软连接也当成了文件处理结果就是，文件居然高达 2GB 没错，这就是 node_modules, 之后我尝试直接舍弃掉软连接，然后缓存发现只有 200 多 MB

然后还能正常使用个人猜测是`pnpm i` 会重新建立起软链同时这个时间很快

然后 200 多 MB 我们也只能选择 indexedDB 来存储

### 缓存引起的卡顿

但是我们一下子存取这么多，会出现一个超级大对象导致内存不足，会出现一段时间卡顿，即使 indexedDB 是异步，所以我们只能采用分片的思想，分片存储，分片提取使用

### webcontianer 启动依赖 wasm 文件

目前看来是 60MB+的静态文件（包括 WASM、JS 文件），这部分应该可以通过镜像站优化

### 优化结果

通过这些优化过程我们首次检测从原来的 15s 优化到了 8s 优化约 46%

## 复杂代码重构

vscode 侧插件的 webview 页面的开发

通过到综提供的 api 进行 ai 的重构

我们使用 vscode 的 codeLens 实现实现代码内部调起页面

页面使用 ai 的流式输出，使用 marked-it 进行动态解析呃回传的 md

## CloudIDE 信息安全

[CloudIDE 信息安全](cloudIDE.md)
