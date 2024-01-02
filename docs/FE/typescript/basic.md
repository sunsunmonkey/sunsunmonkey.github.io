# 初级 ts 使用

一些我平时没怎么关注的点的记录

- 使用 `Record<string, unknown>` 或 `Record<string, any>` 表示对象
- `unknown[]` 或 `any[]` 表示数组，
- `(...args: any[]) => any`表示函数这样

## 函数

### 函数类型签名

方式一

```ts
function foo(name: string): number {
  return name.length;
}
```

方式二

```ts
type FuncFoo = (name: string) => number;

const foo: FuncFoo = (name) => {
  return name.length;
};
```

方式三

这个比较特殊

```ts
interface FuncFooStruct {
  (name: string): number;
}
```

## 双重断言

如果在使用类型断言时，原类型与断言类型之间差异过大，也就是指鹿为马太过离谱，离谱到了指鹿为霸王龙的程度，TypeScript 会给你一个类型报错：

```ts
const str: string = "linbudu";

// 从 X 类型 到 Y 类型的断言可能是错误的，blabla
(str as { handler: () => {} }).handler();
```

此时它会提醒你先断言到 unknown 类型，再断言到预期类型，就像这样：

```ts
const str: string = "linbudu";

(str as unknown as { handler: () => {} }).handler();

// 使用尖括号断言
(<{ handler: () => {} }>(<unknown>str)).handler();
```

而实际上类型断言的工作原理也和类型层级有关，在判断断言是否成立，即差异是否能接受时，实际上判断的即是这两个类型是否能够找到一个公共的父类型。比如 `{ }` 和 `{ name: string }` 其实可以认为拥有公共的父类型 `{}`（一个新的 `{}`！你可以理解为这是一个基类，参与断言的 `{ }` 和 `{ name: string }` 其实是它的派生类）。

如果找不到具有意义的公共父类型呢？这个时候就需要请出 **Top Type** 了，如果我们把它先断言到 **Top Type**，那么就拥有了公共父类型 **Top Type**，再断言到具体的类型也是同理。你可以理解为先向上断言，再向下断言，比如前面的双重断言可以改写成这样：

```ts
const str: string = "linbudu";

(str as string | { handler: () => {} } as { handler: () => {} }).handler();
```

## 联合类型与交叉类型

type 其实是叫类型别名，感觉有点像 c 的 typedef

```ts
type A = string;
type MaybeNull<T> = T | null;
```

type 关键字声明了一个类型别名 A
| 是联合类型，相当于或，就是其中一个任意满足就可以
& 是交叉类型，相当于和，就是要都符合

```ts
type StrAndNum = string & number; // never
```

对于对象类型的交叉类型，其内部的同名属性类型同样会按照交叉类型进行合并：

```typescript
type Struct1 = {
  primitiveProp: string;
  objectProp: {
    name: string;
  };
};

type Struct2 = {
  primitiveProp: number;
  objectProp: {
    age: number;
  };
};

type Composed = Struct1 & Struct2;

type PrimitivePropType = Composed["primitiveProp"]; // never
type ObjectPropType = Composed["objectProp"]; // { name: string; age: number; }
```

## 索引类型

### 索引签名类型

索引签名类型主要指的是在接口或类型别名中，通过以下语法来**快速声明一个键值类型一致的类型结构**：

```ts
interface AllStringTypes {
  [key: string]: string;
}

type AllStringTypes = {
  [key: string]: string;
};
```

但由于 JavaScript 中，对于 `obj[prop]` 形式的访问会将**数字索引访问转换为字符串索引访问**，也就是说， `obj[599]` 和 `obj['599']` 的效果是一致的。因此，在字符串索引签名类型中我们仍然可以声明数字类型的键。类似的，symbol 类型也是如此：

### 索引类型查询

有点像 Object.keys(Foo)

```ts
interface Foo {
  linbudu: 1;
  599: 2;
}

type FooKeys = keyof Foo; // "linbudu" | 599
```

### 索引类型访问

```ts
interface Foo {
  propA: number;
  propB: boolean;
}

type PropAType = Foo["propA"]; // number
type PropBType = Foo["propB"]; // boolean
```

看起来这里就是普通的值访问，但实际上这里的`'propA'`和`'propB'`都是**字符串字面量类型**，**而不是一个 JavaScript 字符串值**。索引类型查询的本质其实就是，**通过键的字面量类型（`'propA'`）访问这个键对应的键值类型（`number`）**。

```ts
type Stringify<T> = {
  [K in keyof T]: string;
};

interface Foo {
  prop1: string;
  prop2: number;
  prop3: boolean;
  prop4: () => void;
}

type StringifiedFoo = Stringify<Foo>;

// 等价于
interface StringifiedFoo {
  prop1: string;
  prop2: string;
  prop3: string;
  prop4: string;
}

type Clone<T> = {
  [K in keyof T]: T[K];
};
```
