# 简短有力的zustand（从使用到源码）
## 如何使用
先来简单看看如何使用
```javascript
import { create } from 'zustand'

const useStore = create((set) => ({
  count: 1,
  inc: () => set((state) => ({ count: state.count + 1 })),
}))

function Counter() {
  const { count, inc } = useStore()
  return (
    <div>
    <span>{count}</span>
    <button onClick={inc}>one up</button>
    </div>
  )
}
```
这是官网给我们的一个例子
我们可以看到他是用一个create来创建一个store的
之前我已经搭建好了调试环境这里我们直接开看🤫
[zustand调试](https://github.com/sunsunmonkey/debugger/tree/main/debugger-zustand)
为了方便大家看我帮大家剔除了源码中的ts
## 创建store
可以看到create接受一个createState就是我们之前的传入的函数
```javascript
export const create = ((createState) =>
  createState ? createImpl(createState) : createImpl)
```
我们会传这个参到 createImpl(createState)继续看
我们先不关注后面的代码，我们可以看到由于我们传的createState是个function它又调用了createStore这个函数
```javascript
const createImpl = (createState) => {
  const api =
    typeof createState === 'function' ? createStore(createState) : createState

  const useBoundStore: any = (selector?: any, equalityFn?: any) =>
    useStore(api, selector, equalityFn)

  Object.assign(useBoundStore, api)

  return useBoundStore
}

```
createStore如下，很熟悉是不是，感觉和俄罗斯套娃一样🙃
```javascript
export const createStore = ((createState) =>
  createState ? createStoreImpl(createState) : createStoreImpl)
```
继续往下走就看到了createStoreImpl
```javascript
const createStoreImpl: CreateStoreImpl = (createState) => {
  let state;
  const listeners = new Set();

  const setState = (partial, replace) => {
    const nextState =
      typeof partial === 'function'
        ? partial(state)
        : partial
    if (!Object.is(nextState, state)) {
      const previousState = state
      state =
        replace ?? (typeof nextState !== 'object' || nextState === null)
          ? (nextState as TState)
          : Object.assign({}, state, nextState)
      listeners.forEach((listener) => listener(state, previousState))
    }
  }

  const getState = () => state

  const getInitialState= () =>
    initialState

  const subscribe = (listener) => {
    listeners.add(listener)
    // Unsubscribe
    return () => listeners.delete(listener)
  }

  const destroy = () => {
    listeners.clear()
  }

  const api = { setState, getState, getInitialState, subscribe, destroy }
  const initialState = (state = createState(setState, getState, api))
  return api
}
```
好长啊，别急慢慢看
我们可以看到他先创建了一个state，一个listener
然后看一个函数setState，我们好好看看这个函数
```javascript
  const setState = (partial, replace) => {
    const nextState =
      typeof partial === 'function'
        ? partial(state)
        : partial
    if (!Object.is(nextState, state)) {
      const previousState = state
      state =
        replace ?? (typeof nextState !== 'object' || nextState === null)
          ? nextState 
          : Object.assign({}, state, nextState)
      listeners.forEach((listener) => listener(state, previousState))
    }
  }

```
我们看到获取了nextState，也很好理解下一个如果parital是个函数就调用，不是就直接赋值，然后判断nextState，state是否一样是一个浅层比较，如果一样就直接跳过证明没有发生更新，这里的state就是之前的state，因为一直保存在函数闭包里。
然后核心比较如过replace传入true那直接赋值就好，就直接落入了第一个逻辑，否则在看后面的条件
typeof nextState !== 'object' || nextState === null 是不是基础类型，如果是同样直接赋值，如果不是就用Object.assign({}, state, nextState)进行一个浅层赋值，然后再用  listeners 发布订阅消息
继续看下面两个函数，获取当前的状态和初始值，值得注意的是initialState在后面被赋值
```javascript
  const getState = () => state

  const getInitialState = () =>
    initialState

```
然后就是订阅subscribe和取消订阅，也很简单 subscribe就是把它加入set中然后同时返回一个取消订阅的函数，
destroy在后续可能会被舍弃，其实差不多就是一个清空的操作
```javascript
  const subscribe = (listener) => {
    listeners.add(listener)
    // Unsubscribe
    return () => listeners.delete(listener)
  }

  const destroy = () => {
    listeners.clear()
  }
```
最后我们把之前创建的这些函数作为api返回出去
同时初始化一下state和initialState
```javascript
  const api = { setState, getState, getInitialState, subscribe, destroy }
  const initialState = (state = createState(setState, getState, api))
  return api
```
回到之前我们看到我们获取到了api，接着就应该接入react了
```javascript
const createImpl = <T>(createState: StateCreator<T, [], []>) => {

  const api =
    typeof createState === 'function' ? createStore(createState) : createState

  const useBoundStore: any = (selector?: any, equalityFn?: any) =>
    useStore(api, selector, equalityFn)

  Object.assign(useBoundStore, api)

  return useBoundStore
}
```
## 接入react
useBoundStore核心就是在useStore里让我们看看useStore
```javascript

export function useStore(
  api,
  selector,
  equalityFn,
) {
  const slice = useSyncExternalStoreWithSelector(
    api.subscribe,
    api.getState,
    api.getServerState || api.getInitialState,
    selector,
    equalityFn,
  )
  return slice
}
```
看到其实核心就是用了useSyncExternalStoreWithSelector 这个api，是基于官方的useSyncExternalStore做的一个封装，加上了selector 和  equalityFn，这也是为什么zustand如此简洁的原因之一。
```javascript
const createImpl = <T>(createState: StateCreator<T, [], []>) => {
  const api =
    typeof createState === 'function' ? createStore(createState) : createState

  const useBoundStore: any = (selector?: any, equalityFn?: any) =>
    useStore(api, selector, equalityFn)

  Object.assign(useBoundStore, api)

  return useBoundStore
}
```
最终返回一个函数同时该函数上挂载着各种订阅相关的api

## 触发更新
我们可以看到create之后我们就可以调用这个useStore了，取值了count, inc
```javascript
import { create } from "zustand";

const useStore = create((set) => ({
  count: 1,
  inc: () => set((state) => ({ count: state.count + 1 })),
}));

export function Counter() {
  const { count, inc } = useStore();
  return (
    <div>
      <span>{count}</span>
      <button onClick={inc}>one up</button>
    </div>
  );
}

```
点击inc就会触发更新具体会执行之前的
```javascript
const setState: StoreApi<TState>['setState'] = (partial, replace) => {
    // TODO: Remove type assertion once https://github.com/microsoft/TypeScript/issues/37663 is resolved
    // https://github.com/microsoft/TypeScript/issues/37663#issuecomment-759728342
    const nextState =
      typeof partial === 'function'
        ? (partial as (state: TState) => TState)(state)
        : partial
    if (!Object.is(nextState, state)) {
      const previousState = state
      state =
        replace ?? (typeof nextState !== 'object' || nextState === null)
          ? (nextState as TState)
          : Object.assign({}, state, nextState)
      listeners.forEach((listener) => listener(state, previousState))
    }
  }

```
需要注意一点的是listeners里会加上一个函数，可以猜测到这个就是触发react更新的关键，大概率是在调用useSyncExternalStoreWithSelector时加上的，由此就接入到react里可以正常更新了，因为有个函数forceStoreRender，不过本文不太深入useSyncExternalStore也就先略过了

## 使用selector
传入selector，你可选择你需要的state，或者进行一些计算属性
```javascript
import { create } from "zustand";

const useStore = create((set) => ({
  count: 2,
  inc: () => set((state) => ({ count: state.count + 1 })),
}));

export function Counter() {
  const count = useStore((state) => state.count);
    const keys = useStore((state) => Object.keys(state))
  return (
    <div>
      <span>{count}</span>
      <button>one up</button>
    </div>
  );
}

```
这样我们就无需结构直接拿到了count，zustand做的也很简单就是将selector传给useSyncExternalStoreWithSelector
## useShallow
当你需要订阅存储中的一个计算状态时，推荐的方式是使用一个selector
这个计算选择器会在输出发生变化时导致重新渲染，判断变化的方式是使用Object.is。
在这种情况下，你可能希望使用useShallow来避免重新渲染，如果计算出的值始终与先前的值浅相等的话。
一个例子，来自官方文档
```javascript
import { create } from 'zustand'

const useMeals = create(() => ({
  papaBear: 'large porridge-pot',
  mamaBear: 'middle-size porridge pot',
  littleBear: 'A little, small, wee pot',
}))

export const BearNames = () => {
  const names = useMeals((state) => Object.keys(state))

  return <div>{names.join(', ')}</div>
}
```
我们试图更新这个store
```javascript
useMeals.setState({
  papaBear: 'a large pizza',
})
```
 
这个改动导致了BearNames重新渲染，即使根据浅相等的定义，names的实际输出并没有发生变化。
这时候你就可以这样用
```javascript
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

const useMeals = create(() => ({
  papaBear: 'large porridge-pot',
  mamaBear: 'middle-size porridge pot',
  littleBear: 'A little, small, wee pot',
}))

export const BearNames = () => {
  const names = useMeals(useShallow((state) => Object.keys(state)))

  return <div>{names.join(', ')}</div>
}
```
看看如何实现的，就是用一个ref去存储之前的值，然后进行比对yongshallow，如果一样就直接返回prevent.current，如果不一样就更新prev.current
```javascript
import { useRef } from 'react'
import { shallow } from '../vanilla/shallow.ts'

export function useShallow(selector) {
  const prev = useRef<U>()

  return (state) => {
    const next = selector(state)
    return shallow(prev.current, next)
      ? (prev.current)
      : (prev.current = next)
  }
}

```
然后我们再看看shallow

- 首先用Object.is判断
- 排除掉null和基础值,前面已经判断过Object.is不符合说明这些值应该更新
- 遍历Map,Set一个值一个值进行Object.is比较
- 如果是普通的Object的就拿到键然后先比长度,长度不相等自然不相等
- 再遍历对象键值比较,先看有无该键,然后在看该键上值是否相等
```javascript
export function shallow<T>(objA: T, objB: T) {
  //Object.is(objA, objB)相同自然不用说,返回true
  if (Object.is(objA, objB)) {
    return true
  }
  
  //如果不是object或者null就直接返回false,因为这些值我们希望他们直接更新
  if (
    typeof objA !== 'object' ||
    objA === null ||
    typeof objB !== 'object' ||
    objB === null
  ) {
    return false
  }

  //判断Map是否相等,就是一层遍历来看每个值是否相等
  if (objA instanceof Map && objB instanceof Map) {
    if (objA.size !== objB.size) return false

    for (const [key, value] of objA) {
      if (!Object.is(value, objB.get(key))) {
        return false
      }
    }
    return true
  }
  //判断Set是否相等,也是一层遍历来看每个值是否相等
  if (objA instanceof Set && objB instanceof Set) {
    if (objA.size !== objB.size) return false

    for (const value of objA) {
      if (!objB.has(value)) {
        return false
      }
    }
    return true
  }

  //取到对象的键值
  const keysA = Object.keys(objA)
  if (keysA.length !== Object.keys(objB).length) {
    return false
  }
  for (let i = 0; i < keysA.length; i++) {
    if (
      //如果都没有该键就直接返回flase
      !Object.prototype.hasOwnProperty.call(objB, keysA[i] as string) ||
      //值的内容不相等也返回flase
      !Object.is(objA[keysA[i] as keyof T], objB[keysA[i] as keyof T])
    ) {
      return false
    }
  }
  return true
}

```
## 中间件
zustand有几个很好的中间件,我就先只带大家看个immer的,
我们先要下载一下 immer, 然后再从zustand/middleware/immer中引入
```javascript
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

type State = {
  count: number;
};

type Actions = {
  increment: (qty: number) => void;
  decrement: (qty: number) => void;
};

const useCountStore = create<State & Actions>()(
  immer((set) => ({
    count: 0,
    increment: (qty: number) =>
      set((state) => {
        state.count += qty;
      }),
    decrement: (qty: number) =>
      set((state) => {
        state.count -= qty;
      }),
  }))
);
export function Counter() {
  const { count, increment } = useCountStore();
  return (
    <div>
      <span>{count}</span>
      <button
        onClick={() => {
          increment(2);
        }}
      >
        two up
      </button>
    </div>
  );
}

```
导出的这个就是个immerImpl
```javascript
const immerImpl = (initializer) => {
  return (set, get, store) => {
      store.setState = (updater, replace, ...a) => {
        //核心逻辑
        const nextState = (
          typeof updater === 'function' ? produce(updater) : updater
        )
          return set(nextState, replace, ...a)
      }

    return initializer(store.setState, get, store)
  }
}
```
其实就是相当于代理了之前的setState，在之前setState之前用immer的produce处理了nextState，然后正常再set就是之前setState
## 处理异步
在zustand里我们可以很容易处理异步，几乎无感
```javascript
import { create } from "zustand";

const useCountStore = create((set) => ({
  data: {},
  fetch: async () => {
    const res = await fetch("https://jsonplaceholder.typicode.com/todos/1");
    const result = await res.json();
    set({ data: result });
  },
}));
export function Counter() {
  const { data, fetch } = useCountStore();
  return (
    <div>
      <span>{data.id}</span>
      <button
        onClick={() => {
          fetch();
        }}
      >
        fetch
      </button>
    </div>
  );
}

```
## 总结
zustand的设计足够简单，十分灵活，代码也很简洁，充分利用了react的hook，中间件的设计增强了该库的拓展性，十分建议大家通过此文自己去看看zustand的源代码，本文只起一个抛砖引玉的作用
