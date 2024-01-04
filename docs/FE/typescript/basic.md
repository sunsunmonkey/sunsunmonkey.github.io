# 初级 ts 使用

一些我平时没怎么关注的点的记录

### object、Object 以及 {}

`object`、`Object` 以及`{}`（一个空对象）这三者的使用可能也会让部分同学感到困惑，所以我也专门解释下。

首先是 Object 的使用。被 JavaScript 原型链折磨过的同学应该记得，原型链的顶端是 Object 以及 Function，这也就意味着所有的原始类型与对象类型最终都指向 Object，在 TypeScript 中就表现为 Object 包含了所有的类型：

```typescript
// 对于 undefined、null、void 0 ，需要关闭 strictNullChecks
const tmp1: Object = undefined;
const tmp2: Object = null;
const tmp3: Object = void 0;

const tmp4: Object = "linbudu";
const tmp5: Object = 599;
const tmp6: Object = { name: "linbudu" };
const tmp7: Object = () => {};
const tmp8: Object = [];
```

和 Object 类似的还有 Boolean、Number、String、Symbol，这几个**装箱类型（Boxed Types）** 同样包含了一些超出预期的类型。以 String 为例，它同样包括 undefined、null、void，以及代表的 **拆箱类型（Unboxed Types）** string，但并不包括其他装箱类型对应的拆箱类型，如 boolean 与 基本对象类型，我们看以下的代码：

```typescript
const tmp9: String = undefined;
const tmp10: String = null;
const tmp11: String = void 0;
const tmp12: String = "linbudu";

// 以下不成立，因为不是字符串类型的拆箱类型
const tmp13: String = 599; // X
const tmp14: String = { name: "linbudu" }; // X
const tmp15: String = () => {}; // X
const tmp16: String = []; // X
```

**在任何情况下，你都不应该使用这些装箱类型。**

object 的引入就是为了解决对 Object 类型的错误使用，它代表**所有非原始类型的类型，即数组、对象与函数类型这些**：

```typescript
const tmp17: object = undefined;
const tmp18: object = null;
const tmp19: object = void 0;

const tmp20: object = "linbudu"; // X 不成立，值为原始类型
const tmp21: object = 599; // X 不成立，值为原始类型

const tmp22: object = { name: "linbudu" };
const tmp23: object = () => {};
const tmp24: object = [];
```

最后是`{}`，一个奇奇怪怪的空对象，如果你了解过字面量类型，可以认为`{}`就是一个对象字面量类型（对应到字符串字面量类型这样）。否则，你可以认为使用`{}`作为类型签名就是一个合法的，但**内部无属性定义的空对象**，这类似于 Object（想想 `new Object()`），它意味着任何非 null / undefined 的值：

```typescript
const tmp25: {} = undefined; // 仅在关闭 strictNullChecks 时成立，下同
const tmp26: {} = null;
const tmp27: {} = void 0; // void 0 等价于 undefined

const tmp28: {} = "linbudu";
const tmp29: {} = 599;
const tmp30: {} = { name: "linbudu" };
const tmp31: {} = () => {};
const tmp32: {} = [];
```

虽然能够将其作为变量的类型，但你实际上**无法对这个变量进行任何赋值操作**：

```typescript
const tmp30: {} = { name: "linbudu" };

tmp30.age = 18; // X 类型“{}”上不存在属性“age”。
```

这是因为它就是纯洁的像一张白纸一样的空对象，上面没有任何的属性（除了 toString 这种与生俱来的）。在类型层级一节我们还会再次见到它，不过那个时候它已经被称为“万物的起源”了。

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

## 类型查询操作符

```ts
const str = "linbudu";

const obj = { name: "linbudu" };

const nullVar = null;
const undefinedVar = undefined;

const func = (input: string) => {
  return input.length > 10;
};

type Str = typeof str; // "linbudu"
type Obj = typeof obj; // { name: string; }
type Null = typeof nullVar; // null
type Undefined = typeof undefined; // undefined
type Func = typeof func; // (input: string) => boolean
```

绝大部分情况下，typeof 返回的类型就是当你把鼠标悬浮在变量名上时出现的推导后的类型，并且是**最窄的推导程度（即到字面量类型的级别）**。你也不必担心混用了这两种 typeof，在逻辑代码中使用的 typeof 一定会是 JavaScript 中的 typeof，而类型代码（如类型标注、类型别名中等）中的一定是类型查询的 typeof 。同时，为了更好地避免这种情况，也就是隔离类型层和逻辑层，类型查询操作符后是不允许使用表达式的：

```ts
const isInputValid = (input: string) => {
  return input.length > 10;
}

// 不允许表达式
let isValid: typeof isInputValid("linbudu");
```

## 类型守卫

实际上，将判断逻辑封装起来提取到函数外部进行复用非常常见。为了解决这一类型控制流分析的能力不足， TypeScript 引入了 **is 关键字**来显式地提供类型信息：

```ts
function isString(input: unknown): input is string {
  return typeof input === "string";
}

function foo(input: string | number) {
  if (isString(input)) {
    // 正确了
    input.replace("linbudu", "linbudu599");
  }
  if (typeof input === "number") {
  }
  // ...
}
```

isString 函数称为类型守卫，在它的返回值中，我们不再使用 boolean 作为类型标注，而是使用 `input is string` 这么个奇怪的搭配，拆开来看它是这样的：

- input 函数的某个参数；
- `is string`，即 **is 关键字 + 预期类型**，即如果这个函数成功返回为 true，那么 is 关键字前这个入参的类型，就会**被这个类型守卫调用方后续的类型控制流分析收集到**。

```ts
export type Falsy = false | "" | 0 | null | undefined;

export const isFalsy = (val: unknown): val is Falsy => !val;

// 不包括不常用的 symbol 和 bigint
export type Primitive = string | number | boolean | undefined;

export const isPrimitive = (val: unknown): val is Primitive =>
  ["string", "number", "boolean", "undefined"].includes(typeof val);
```

## 断言守卫

```ts
let name: any = "linbudu";

function assertIsNumber(val: any): asserts val is number {
  if (typeof val !== "number") {
    throw new Error("Not a number!");
  }
}

assertIsNumber(name);

// number 类型！
name.toFixed();
```

在这种情况下，你无需再为断言守卫传入一个表达式，而是可以将这个判断用的表达式放进断言守卫的内部，来获得更独立地代码逻辑。
val 不为 number 时会返回 never,是 never 时就是 number

## 结构化类型系统

结构类型的别称**鸭子类型**，这个名字来源于**鸭子测试**。其核心理念是，如果你看到一只鸟走起来像鸭子，游泳像鸭子，叫得也像鸭子，那么这只鸟就是鸭子。

严格来说，鸭子类型系统和结构化类型系统并不完全一致，结构化类型系统意味着**基于完全的类型结构来判断类型兼容性**，而鸭子类型则只基于**运行时访问的部分**来决定。也就是说，如果我们调用了走、游泳、叫这三个方法，那么传入的类型只需要存在这几个方法即可（而不需要类型结构完全一致）。但由于 TypeScript 本身并不是在运行时进行类型检查（也做不到），同时官方文档中同样认为这两个概念是一致的（**_One of TypeScript’s core principles is that type checking focuses on the shape that values have. This is sometimes called “duck typing” or “structural typing”._**）。因此在这里，我们可以直接认为鸭子类型与结构化类型是同一概念。

除了**基于类型结构进行兼容性判断的结构化类型系统**以外，还有一种**基于类型名进行兼容性判断的类型系统**，标称类型系统。

## 标称类型系统

标称类型系统（**Nominal Typing System**）要求，两个可兼容的类型，**其名称必须是完全一致的**
在 ts 中也可以模拟。

## 条件类型基础

条件类型的语法类似于我们平时常用的三元表达式

```ts
ValueA === ValueB ? Result1 : Result2;
TypeA extends TypeB ? Result1 : Result2;
```

## infer 关键字

TypeScript 中支持通过 infer 关键字来**在条件类型中提取类型的某一部分信息**，比如上面我们要提取函数返回值类型的话

```ts
// 类型“V”不满足约束“string | number | symbol”。
type ReverseKeyValue<T extends Record<string, string>> = T extends Record<
  infer K,
  infer V
>
  ? Record<V, K>
  : never;
```

## 分布式条件类型

```ts
type Condition<T> = T extends 1 | 2 | 3 ? T : never;

// 1 | 2 | 3
type Res1 = Condition<1 | 2 | 3 | 4 | 5>;

// never
type Res2 = 1 | 2 | 3 | 4 | 5 extends 1 | 2 | 3 ? 1 | 2 | 3 | 4 | 5 : never;
```

对于属于裸类型参数的检查类型，条件类型会在实例化时期自动分发到联合类型上。
而这里的裸类型参数，其实指的就是**泛型参数**是否完全裸露

## 协变与逆变

实际上，这就是 TypeScript 中的**协变（** **_covariance_** **）** 与**逆变（** **_contravariance_** **）** 在函数签名类型中的表现形式。这两个单词最初来自于几何学领域中：**随着某一个量的变化，随之变化一致的即称为协变，而变化相反的即称为逆变。**

用 TypeScript 的思路进行转换，即如果有 `A ≼ B` ，协变意味着 `Wrapper<A> ≼ Wrapper<B>`，而逆变意味着 `Wrapper<B> ≼ Wrapper<A>`。

```ts
// 1 成立：(T -> Corgi) ≼ (T -> Dog)
type CheckReturnType = AsFuncReturnType<Corgi> extends AsFuncReturnType<Dog>
  ? 1
  : 2;

// 2 不成立：(Dog -> T) ≼ (Animal -> T)
type CheckArgType = AsFuncArgType<Dog> extends AsFuncArgType<Animal> ? 1 : 2;
```

函数类型的参数类型使用子类型逆变的方式确定是否成立，而返回值类型使用子类型协变的方式确定。

## 双变

禁用了 `strictFunctionTypes` 的情况下，TypeScript 并不会抛出错误。这是因为，在默认情况下，对函数参数的检查采用 **双变（** **_bivariant_** **）** ，**即逆变与协变都被认为是可接受的**。

在 TypeScript ESLint 中，有这么一条规则：[method-signature-style](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/method-signature-style.md)，它的意图是约束在接口中声明方法时，需要使用 **property** 而非 **method** 形式：

```typescript
// method 声明
interface T1 {
  func(arg: string): number;
}

// property 声明
interface T2 {
  func: (arg: string) => number;
}
```

进行如此约束的原因即，对于 property 声明，才能在开启严格函数类型检查的情况下享受到**基于逆变的参数类型检查**。

对于 method 声明（以及构造函数声明），其无法享受到这一更严格的检查的原因则是对于如 Array 这样的内置定义，我们希望它的函数方法就是以协变的方式进行检查，举个栗子，`Dog[] ≼ Animal[]` 是否成立？

- 我们并不能简单的比较 Dog 与 Animal，而是要将它们视为两个完整的类型比较，即 `Dog[]` 的每一个成员（属性、方法）是否都能对应的赋值给 `Animal[]` ？
- `Dog[].push ≼ Animal[].push` 是否成立？
- 由 push 方法的类型签名进一步推导，`Dog -> void ≼ Animal -> void` 是否成立？
- `Dog -> void ≼ Animal -> void`在逆变的情况下意味着 `Animal ≼ Dog`，而这很明显是不对的！
- 简单来说， `Dog -> void ≼ Animal -> void` 是否成立本身就为 `Dog[] ≼ Animal[]` 提供了一个前提答案。

因此，如果 TypeScript 在此时仍然强制使用参数逆变的规则进行检查，那么 `Dog[] ≼ Animal[]` 就无法成立，也就意味着无法将 Dog 赋值给 Animal，这不就前后矛盾了吗？所以在大部分情况下，我们确实希望方法参数类型的检查可以是**双变**的，这也是为什么它们的声明中类型结构使用 method 方式来声明：

```typescript
interface Array<T> {
  push(...items: T[]): number;
}
```
