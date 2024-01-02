# kmp 算法

KMP 的主要思想是当出现字符串不匹配时，可以知道一部分之前已经匹配的文本内容，可以利用这些信息避免从头再去做匹配了。

通俗点就是你前面和后面有一样的那你就可以说让后面当前面的来匹配

就比如"aabaabaafa"是 haystack 字符串

"aabaaf"是 needle 字符串

在匹配时我们依次遍历前面的**aabaa**和**aabaa**肯定匹配当我们遇到后面不匹配我们该如何处理

在之前的 bf 算法我们会直接让 haystack 字符串向后一位然后 needle 字符串从头开始

而在 kmp 算法中我们可以利用**aabaa**首位首尾相同的特性让后面的这个 aa 去当头然后进行匹配

但当头要注意此时我们 haystack 字符串指在**aabaa**后面的 b 你只有向前移到也是 aab 的形式才有意义所以

在下面你会看到类似这样的代码

这一块就是

```js
while (j >= 0 && haystack[i] != needle[j + 1]) {
  // 不匹配
  j = next[j]; // j 寻找之前匹配的位置
}
```

看不懂？别急，我们之前只是一个总领。我们梳理一下
我们该做啥

- 找到那个前后首位有规律的字符串
- 进行指针移动操作
- 遍历匹配

由此我们引入管理我们前后相同东西的一个玩意

## next 数组 ——前缀表

这里借用一下代码随想录的图

![next](/imgs/algorithm/KMP.gif)

这个 next 数组就时用来记录有多大长度的相同前缀后缀。

![next](/imgs/algorithm/KMP-next.png)

就像这样，不过我们之后具体实现一般会将该值减一操作

简单理解 next 数组其实就是记录字符串首尾有多少一样的字母数

比如"aabbccaa"就是 2，"aba"就是 1，"abc"就是 0，只不过你需要依次累加到完整记录他的子串所有的个数就是 next 数组了

## 实现 next 数组

```ts
function getNext(needle: string): number[] {
  const next: number[] = [];
  const strArr = needle.split("");
  let j = -1;
  next[0] = j;
  for (let i = 1; i < strArr.length; i++) {
    while (j >= 0 && strArr[i] != strArr[j + 1]) {
      j = next[j];
    }

    if (strArr[i] == strArr[j + 1]) {
      j++;
    }

    next[i] = j;
  }
  return next;
}
```

下面附上完整代码

```ts
function strStr(haystack: string, needle: string): number {
  if (needle.length == 0) {
    return 0;
  }

  const next = getNext(needle);
  const haystackArr = haystack.split("");
  let j = -1;
  for (let i = 0; i < haystackArr.length; i++) {
    while (j >= 0 && haystackArr[i] !== needle[j + 1]) {
      j = next[j];
    }
    if (haystack[i] == needle[j + 1]) {
      j++;
    }
    if (j === needle.length - 1) {
      return i - needle.length + 1;
    }
  }
  return -1;
}

function getNext(needle: string): number[] {
  const next: number[] = [];
  const strArr = needle.split("");
  let j = -1;
  next[0] = j;
  for (let i = 1; i < strArr.length; i++) {
    while (j >= 0 && strArr[i] != strArr[j + 1]) {
      j = next[j];
    }

    if (strArr[i] == strArr[j + 1]) {
      j++;
    }

    next[i] = j;
  }
  return next;
}
```

核心就是前后缀相等那你的后缀就可以作为前缀
 kmp算法太精彩辣👾