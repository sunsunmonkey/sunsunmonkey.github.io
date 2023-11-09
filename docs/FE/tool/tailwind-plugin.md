# tailwind 插件

## tailwind-merge

![tailwind-merge](/imgs/tool/tailwind-plugin/tailwind-merge.png)

```js
import { twMerge } from "tailwind-merge";

twMerge("px-2 py-1 bg-red hover:bg-dark-red", "p-3 bg-[#B91C1C]");
// → 'hover:bg-dark-red p-3 bg-[#B91C1C]'
```

你在写一个组件时想要从外层覆盖里面的组件的类
就像这样

```js
import React from "react";

function MyGenericInput(props) {
  const className = `border rounded px-2 py-1 ${props.className || ""}`;
  return <input {...props} className={className} />;
}

function MySlightlyModifiedInput(props) {
  return (
    <MyGenericInput
      {...props}
      className="p-3" // ← Only want to change some padding
    />
  );
}
```

在呈现 MyOneOffInput 时，将创建一个圆角为 px-2 py-1 p-3 的 className 边框的输入。但是由于 CSS 级联的工作方式，p-3 类的样式被忽略了。ClassName 字符串中类的顺序根本不重要，应用 p-3 样式的唯一方法是删除 px-2 和 py-1。
这时这个插件就有用了

```js
function MyGenericInput(props) {
  // ↓ Now `props.className` can override conflicting classes
  const className = twMerge("border rounded px-2 py-1", props.className);
  return <input {...props} className={className} />;
}
```

## tailwind Sorting with Prettier

![tailwind-prettier](/imgs/tool/tailwind-plugin/tailwind-prettier.png)

官方直接说执行，就好

``` shell
npm install -D prettier prettier-plugin-tailwindcss
```
但还要在.prettierrc配个plugins才会生效

``` json

{
    "plugins": ["prettier-plugin-tailwindcss"]
}
```