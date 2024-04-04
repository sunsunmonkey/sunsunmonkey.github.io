# 官网性能优化
## 如何查看一个东西的性能
最为简单的就是**lighthouse**跑个分
由此我们就会引入几个概念

- **FP(first-paint)**，从页面加载开始到第一个像素绘制到屏幕上的时间
- **FCP(first-contentful-paint)**，从页面加载开始到页面内容的任何部分在屏幕上完成渲染的时间
- **LCP(largest-contentful-paint)**，从页面加载开始到最大文本块或图像元素在屏幕上完成渲染的时间
- **CLS(layout-shift)**，从页面加载开始和其[生命周期状态](https://link.juejin.cn?target=https%3A%2F%2Fdevelopers.google.com%2Fweb%2Fupdates%2F2018%2F07%2Fpage-lifecycle-api)变为隐藏期间发生的所有意外布局偏移的累积分数

这也是lighthouse会关注的几个点
稍微复杂点我们可以看**performance**
其实性能优化说难也不算难
核心就几个点

- 网络资源的优化
- js执行的效率
## 网络资源的优化
起初我们用到很多图片直接从figma拿下的，为了视觉感观的良好我选择了高倍率的图片
但这就导致网络请求会有3s之多严重影响了性能，而且同时发起多个请求，在http1.1情况下会造成阻塞
所以我们进行了优化
我们首先将字符集进行压缩
然后图片使用了tinypng去压缩，然后我发现用页面的压缩有点麻烦就简单写了一个脚本去整个批量去压缩图片用tinypng，这也后来集成到了团队的rrfe工具里

## 减少同一时间的网络请求数量

一开始我们其实页面是全部加载出来的，随着我们页面的越写越多请求越来越多
这个时候我们基本有两条路选择

- 将图片进行一个懒加载，同时动画也进行也在可视区之外做个暂停
- 做成fullpage，全屏的切换

我们最后决定感觉每个页面其实相互关联不大所以，使用了全屏切换，但是其实这里面又有着很大的坑
说到全屏切换有这几个方案

-  scroll判断
- 交叉观察器 API（Intersection Observer API）
- wheel判断

核心切换的痛点在于他不是简单的全屏切换
整页切换中穿插了一些长的页面所以不能简单的进行一个页面的切换判断，
而这个长页面起初也就是用gsap的一个pin的属性做的，
而这个属性相当于会在外层创建一个长盒子，然后将要pin的元素fixed掉
但是我们的方案核心就是要切换一个盒子，然后gsap默认是不会开启重新计算外层长盒子的高度的
所以我们就会出现问题
然后我们就翻博客，翻文档
然后就发现     
```sql
ScrollTrigger.refresh();
```
解决了这个问题

然后切换我们也想了一些方法一开始用scroll，但是用scroll意味着我们必须要有滚轮，现在又有两条路我们可以选择很长的骨架类似然后遇到就加载，还有一种就是只加载当前可见页面，两种都有试过，但是用很长的页面就无法用scroll.top===0这种方式处理长页面了，那我们就用了Intersection Observer API开始感觉还是不错的，但是我们完全实现完后发现edge和chorme的效果不完全一样，在chorme效果不错但是在edge里寄了，没办法重开

于是就单一加载吧，只加载当前的页面，但是监听scroll事件显然就要有滚轮有些短页面就没有滚轮啊，那我们就少加一点吧，但这样做的话，给用户的体验很差，无法做到很丝滑，我们于是去找其他事件发现了wheel事件
就像他的名字滚轮滚动然后我们判断长页面是否翻页就用了scroll，
解决长页面就是scroll.top===0同时scrollHeight 等于clientHeight+scrollTop一个判断是否到底，
一个判断是否到顶
```
const bootomFlag =
            document.documentElement.scrollHeight -
                document.documentElement.clientHeight -
                document.documentElement.scrollTop <
            1;
```
然后完成了切换页面我们还要处理一个点就是延迟销毁组件，然后又一个过度的效果
这个transition-react可以做
但是当时觉得会有一些冲突或者其他不可控的问题
我们就直接自己简单做了一个延迟销毁的组件
也很简单就是两个索引
一个是之前的一个是现在的，然后一定时间后就将之前和现在的一样了，就销毁了之前的组件
然后针对这些页面切换写了一个pageWrapper统一处理简化了代码
## 路由切换
路由的优化就很简单
就是一个suspense和lazy去实现一个路由懒加载减少了初始的包体积
## 总结
由于我们将页面切分成了一个一个的模块所以保证了最小资源的加载也保证了图片资源的尽可能的小
所以性能提升也很明显lighthouse也取得了一个不错的成绩
