# 协变与逆变

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

# 双变

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


