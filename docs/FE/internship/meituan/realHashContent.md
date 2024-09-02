# realContentHash 的理解

何为 realContentHash

[官网解释](https://webpack.js.org/configuration/optimization/#optimizationrealcontenthash) 官网写的比较简单，但他的默认值是 true 就是默认开启的

然后发现一个 issue 比较值得关注[https://github.com/webpack/webpack/issues/9520](https://github.com/webpack/webpack/issues/9520)

从我的理解来看就是设置了 [realContentHash](https://webpack.docschina.org/configuration/optimization/#optimizationrealcontenthash) 为 false 就是 hash 是和其 bundle 的东西关系就是本案例中的 vuex ｜ vue ｜ vue-router

而不是最后产物的内容

而如果我们设置了 [realContentHash](https://webpack.docschina.org/configuration/optimization/#optimizationrealcontenthash) 为 true 就是最后生成和最终文件的内容有关的 hash 就能解决之前的 tt 问题

vue cli 为何设置为 false

![vue-cli](/imgs/internship/realContenhash/vue-cli.png)

这是注释的链接[https://github.com/jantimon/html-webpack-plugin/issues/1554#issuecomment-753653580](https://github.com/jantimon/html-webpack-plugin/issues/1554#issuecomment-753653580)

看起来和 [webpack-subresource-integrity](https://github.com/waysact/webpack-subresource-integrity) 这个有关，不过现在看来似乎也是历史问题了，主要和 vue-cli 的 [integrity](https://cli.vuejs.org/zh/config/#integrity) 这个属性有关的，这个是 2021.4 月改动的为了兼容，

但是看这个链接的[这个位置](https://github.com/jantimon/html-webpack-plugin/issues/1554#issuecomment-1065427538)看起来 [webpack-subresource-integrity](https://github.com/waysact/webpack-subresource-integrity) 似乎已经解决这个问题

关于 react

据我测试观察 cra 是没有设置为 realContentHash 为 false 证明是默认值 true

然后 umi 也是 undefined，那就是使用默认值为 true

![umi](/imgs/internship/realContenhash/umi.png)

所以我认为用 true 比较合适并且没有什么影响
