# 类型层次

我们从小往大来看

## never

啥也没有永不出现为 never，所以 never 是所有类型的子类型

## 字面量类型

你可以理解字面量类型为具体的一个值（比如 Boolean 的字面量值 **true**），只不过这个值是以类型的身份出

## 联合类型

```ts
type Result7 = 1 extends 1 | 2 | 3 ? 1 : 2; // 1
type Result8 = "lin" extends "lin" | "bu" | "du" ? 1 : 2; // 1
type Result9 = true extends true | false ? 1 : 2; // 1
```

可以看出来就是一个简单的包含关系

::: tip
而如果一个联合类型由同一个基础类型的类型字面量组成，那这个时候情况又有点不一样了。
:::

```ts
type Result11 = "lin" | "bu" | "budu" extends string ? 1 : 2; // 1
type Result12 = {} | (() => void) | [] extends object ? 1 : 2; // 1
```

这也很好理解，你这些"lin","bu"都是字符串所以自然继承 string

## 原始类型

像我们平时最常用的 number，string 都是原始类型他们是对应字面量类型的父类型，也是对应相同字面量联合类型的父类型

## 装箱类型

```ts
type Result14 = string extends String ? 1 : 2; // 1
type Result15 = String extends {} ? 1 : 2; // 1
type Result16 = {} extends object ? 1 : 2; // 1
type Result18 = object extends Object ? 1 : 2; // 1

type Result16 = {} extends object ? 1 : 2; // 1
type Result18 = object extends {} ? 1 : 2; // 1

type Result17 = object extends Object ? 1 : 2; // 1
type Result20 = Object extends object ? 1 : 2; // 1

type Result19 = Object extends {} ? 1 : 2; // 1
type Result21 = {} extends Object ? 1 : 2; // 1
```

16-18 和 19-21 这两对，为什么无论如何判断都成立？难道说明 `{}` 和 object 类型相等，也和 `Object` 类型一致？

当然不，这里的 `{} extends `和 `extends {}` 实际上是两种完全不同的比较方式。`{} extends object` 和 `{} extends Object` 意味着， `{}` 是 object 和 Object 的字面量类型，是从**类型信息的层面**出发的，即**字面量类型在基础类型之上提供了更详细的类型信息**。`object extends {}` 和 `Object extends {}` 则是从**结构化类型系统的比较**出发的，即 `{}` 作为一个一无所有的空对象，几乎可以被视作是所有类型的基类，万物的起源。如果混淆了这两种类型比较的方式，就可能会得到 `string extends object` 这样的错误结论。

而 `object extends Object` 和 `Object extends object` 这两者的情况就要特殊一些，它们是因为“系统设定”的问题，Object 包含了所有除 Top Type 以外的类型（基础类型、函数类型等），object 包含了所有非原始类型的类型，即数组、对象与函数类型，这就导致了你中有我、我中有你的神奇现象。

在这里，我们暂时只关注从类型信息层面出发的部分，即结论为：**原始类型 < 原始类型对应的装箱类型 < Object 类型。**

现在，我们关注的类型为 Object 。

## any 和 unknown

这俩哥就是顶层

```ts
type Result24 = any extends Object ? 1 : 2; // 1 | 2
type Result25 = unknown extends Object ? 1 : 2; // 2
```

any 代表了任何可能的类型，当我们使用 `any extends` 时，它包含了“**让条件成立的一部分**”，以及“**让条件不成立的一部分**”。而从实现上说，在 TypeScript 内部代码的条件类型处理中，如果接受判断的是 any，那么会直接**返回条件类型结果组成的联合类型**。

## 串联所有

```ts
//never < 字面量
type VerboseTypeChain = never extends "linbudu"
  ? //字面量 < 包含他的字面量联合类型
    "linbudu" extends "linbudu" | "budulin"
    ? //包含他的字面量联合类型 < 原始类型
      "linbudu" | "budulin" extends string
      ? // 原始类型 < {}(一个一无所有的空对象,对象是万物起源)
        string extends {}
        ? // 原始类型 < 其装箱类型
          string extends String
          ? // 装箱类型 <{}(一个一无所有的空对象,对象是万物起源)
            String extends {}
            ? // {}(字面量空对象) < object（包含了所有非原始类型的类型）
              {} extends object
              ? //  object<{}(一个一无所有的空对象,对象是万物起源)
                object extends {}
                ? // {}(字面量空对象)< Object(包含了所有除 Top Type 以外的类型（基础类型、函数类型等)
                  {} extends Object
                  ? //  Object <{}(一个一无所有的空对象,对象是万物起源)
                    Object extends {}
                    ? // object<Object(包含了所有除 Top Type 以外的类型（基础类型、函数类型等)
                      object extends Object
                      ? //Object < object（包含了所有非原始类型的类型）
                        Object extends object
                        ? // any 任意值都行
                          Object extends any
                          ? // unknown 谁来我都要
                            Object extends unknown
                            ? // unknown 谁来我都要
                              any extends unknown
                              ? // any 任意值都行
                                unknown extends any
                                ? 8
                                : 7
                              : 6
                            : 5
                          : 4
                        : 3
                      : 2
                    : 1
                  : 0
                : -1
              : -2
            : -3
          : -4
        : -5
      : -6
    : -7
  : -8;
```

所以输出 8

![layer](/imgs/typescript/layer.awebp)
