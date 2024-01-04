# 工具类型

## 属性修饰工具类型

```ts
type Partial<T> = {
  [P in keyof T]?: T[P];
};

type Required<T> = {
  [P in keyof T]-?: T[P];
};

type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};
```

其中，Partial 与 Required 可以认为是一对工具类型，它们的功能是相反的，而在实现上，它们的唯一差异是在索引类型签名处的可选修饰符，Partial 是 `?`，即标记属性为可选，而 Required 则是 `-?`，相当于在原本属性上如果有 `?` 这个标记，则移除它。

## 结构工具类型

```ts
type Record<K extends keyof any, T> = {
  [P in K]: T;
};
```

其中，`Record<string, unknown>` 和 `Record<string, any>` 是日常使用较多的形式，通常我们使用这两者来代替 object 。

```ts
type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
```

首先来看 Pick，它接受两个泛型参数，T 即是我们会进行结构处理的原类型（一般是对象类型），而 K 则被约束为 T 类型的键名联合类型。由于泛型约束是立即填充推导的，即你为第一个泛型参数传入 Foo 类型以后，K 的约束条件会立刻被填充，因此在你输入 K 时会获得代码提示：

```ts
interface Foo {
  name: string;
  age: number;
  job: JobUnionType;
}

type PickedFoo = Pick<Foo, "name" | "age">;
```

## 集合工具类型

```ts
// 差集
type Exclude<T, U> = T extends U ? never : T;

// 并集
export type Concurrence<A, B> = A | B;

// 交集
export type Intersection<A, B> = A extends B ? A : never;

// 差集
export type Difference<A, B> = A extends B ? never : A;

// 补集
export type Complement<A, B extends A> = Difference<A, B>;
```

## 模式匹配工具类型

对函数类型签名的模式匹配：

```ts
type FunctionType = (...args: any) => any;

type Parameters<T extends FunctionType> = T extends (...args: infer P) => any
  ? P
  : never;

type ReturnType<T extends FunctionType> = T extends (...args: any) => infer R
  ? R
  : any;

type FirstParameter<T extends FunctionType> = T extends (
  arg: infer P,
  ...args: any
) => any
  ? P
  : never;

type FuncFoo = (arg: number) => void;
type FuncBar = (...args: string[]) => void;

type FooFirstParameter = FirstParameter<FuncFoo>; // number

type BarFirstParameter = FirstParameter<FuncBar>; // string
```

对 Class 进行模式匹配的工具类型：

```ts
type ClassType = abstract new (...args: any) => any;

type ConstructorParameters<T extends ClassType> = T extends abstract new (
  ...args: infer P
) => any
  ? P
  : never;

type InstanceType<T extends ClassType> = T extends abstract new (
  ...args: any
) => infer R
  ? R
  : any;
```

Class 的通用类型签名可能看起来比较奇怪，但实际上它就是声明了可实例化（new）与可抽象（abstract）罢了。我们也可以使用接口来进行声明：

```ts
export interface ClassType<TInstanceType = any> {
  new (...args: any[]): TInstanceType;
}
```

对 Class 的模式匹配思路类似于函数，或者说这是一个通用的思路，即基于放置位置的匹配。放在参数部分，那就是构造函数的参数类型，放在返回值部分，那当然就是 Class 的实例类型了。
