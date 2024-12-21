# glob 语法

## 基础语法

分隔符和片段
概念：分隔符是 /，通过 split('/') 得到的数组每一项是片段。
示例：

src/index.js 有两个片段，分别是 src 和 index.js
src/\*\*/\*.js 有三个片段，分别是 src、\*\* 和 \*.js

## 单个星号

概念：单个星号 \* 用于匹配单个片段中的零个或多个字符。
示例：

src/_.js 表示 src 目录下所有以 js 结尾的文件，但是不能匹配 src 子目录中的文件，例如 src/login/login.js
/home/_/.bashrc 匹配所有用户的 .bashrc 文件

需要注意的是，\* 不能匹配分隔符 /，也就是说不能跨片段匹配字符。

## 问号

概念：问号 ? 匹配单个片段中的单个字符。
示例：

test/?at.js 匹配形如 test/cat.js、test/bat.js 等所有 3 个字符且后两位是 at 的 js 文件，但是不能匹配 test/flat.js
src/index.?? 匹配 src 目录下以 index 打头，后缀名是两个字符的文件，例如可以匹配 src/index.js 和 src/index.md，但不能匹配 src/index.jsx

## 中括号

概念：同样是匹配单个片段中的单个字符，但是字符集只能从括号内选择，如果字符集内有 -，表示范围。
示例：

test/[bc]at.js 只能匹配 test/bat.js 和 test/cat.js
test/[c-f]at.js 能匹配 test/cat.js、test/dat.js、test/eat.js 和 test/fat.js

## 惊叹号

概念：表示取反，即排除那些去掉惊叹号之后能够匹配到的文件。
示例：

test/[!bc]at.js 不能匹配 test/bat.js 和 test/cat.js，但是可以匹配 test/fat.js
!test/tmp/\*\*' 排除 test/tmp 目录下的所有目录和文件

## 扩展语法

基础语法非常简单好记，但是功能非常局限，为了丰富 glob 的功能，衍生了下面三种扩展语法：
两个星号
概念：两个星号 ** 可以跨片段匹配零个或多个字符，也就是说 ** 是递归匹配所有文件和目录的，如果后面有分隔符，即 \*\*/ 的话，则表示只递归匹配所有目录（不含隐藏目录）。
示例：

/var/log/\*\* 匹配 /var/log 目录下所有文件和文件夹，以及文件夹里面所有子文件和子文件夹

/var/log/\*\*/\_.log 匹配 /var/log 及其子目录下的所有以 .log 结尾的文件

/home/_/.ssh/\*_/\_.key 匹配所有用户的 .ssh 目录及其子目录内的以 .key 结尾的文件

## 大括号

概念：匹配大括号内的所有模式，模式之间用逗号进行分隔，支持大括号嵌套，支持用 .. 匹配连续的字符，即 {start..end} 语法。
示例：

a.{png,jp{,e}g} 匹配 a.png、a.jpg、a.jpeg
{a..c}{1..2} 匹配 a1 a2 b1 b2 c1 c2

注意：{} 与 [] 有一个很重要的区别：如果匹配的文件不存在，[] 会失去模式的功能，变成一个单纯的字符串，而 {} 依然可以展开。

## 小括号

概念：小括号必须跟在 ?、_、+、@、! 后面使用，且小括号里面的内容是一组以 | 分隔符的模式集合，例如：abc|a?c|ac_。
示例：

?(pattern|pattern|pattern)：匹配 0 次或 1 次给定的模式

\*(pattern|pattern|pattern)：匹配 0 次或多次给定的模式

+(pattern|pattern|pattern)：匹配 1 次或多次给定的模式

@(pattern|pattern|pattern)：严格匹配给定的模式

!(pattern|pattern|pattern)：匹配非给定的模式

来自掘金引用一下
作者：乔珂力
链接：https://juejin.cn/post/6876363718578405384
