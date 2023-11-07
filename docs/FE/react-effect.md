# 对 effect 一点理解

## 什么是 effect

有些组件需要与外部系统同步。
例如，你可能希望根据 React state 控制非 React 组件、设置服务器连接或在组件出现在屏幕上时发送分析日志。

Effects 会在渲染后运行一些代码，以便可以将组件与 React 之外的某些系统同步这时候就要用到 effect。

**Effect 允许你指定由渲染本身，而不是特定事件引起的副作用**。
effect 核心就是来和外部进行一定的联系比如：网络请求，
react 官方文章经常区分特定事件比如点击时间和 effect 事件的区别，让两者明确区分是个不错的选择。（当然两者可能会有相互依赖的情况，后文会提到）

在严格模式下的开发环境中，React 会挂载两次组件，以对 Effect 进行压力测试。我们要做的是让两次挂载和卸载和一次的效果相同。
**每次渲染都有它自己的 Effect**
每一个 effect 版本“看到”的 count 值都来自于它属于的那次渲染：

```javascript
function Counter() {
  // ...
  useEffect(
    // Effect function from first render
    () => {
      document.title = `You clicked ${0} times`;
    }
  );
  // ...
}

// After a click, our function is called again
function Counter() {
  // ...
  useEffect(
    // Effect function from second render
    () => {
      document.title = `You clicked ${1} times`;
    }
  );
  // ...
}

// After another click, our function is called again
function Counter() {
  // ...
  useEffect(
    // Effect function from third render
    () => {
      document.title = `You clicked ${2} times`;
    }
  );
  // ..
}
```

## 同步， 而非生命周期

每个 React 组件都经历相同的生命周期：

- 当组件被添加到屏幕上时，它会进行组件的 **挂载**。
- 当组件接收到新的 props 或 state 时，通常是作为对交互的响应，它会进行组件的 **更新**。
- 当组件从屏幕上移除时，它会进行组件的 **卸载**。

**这是一种很好的思考组件的方式，但并不适用于 Effect**。相反，尝试从组件生命周期中跳脱出来，独立思考 Effect。Effect 描述了如何**将外部系统与当前的 props 和 state 同步**。随着传入依赖的变化，同步的频率可能会增加或减少。
组件内部的所有值（包括 props、state 和组件体内的变量）都是响应式的。任何响应式值都可以在重新渲染时发生变化，所以需要将响应式值包括在 Effect 的依赖项中。

## 依赖的传递

如果我们不想要 effect 进行多次同步同步，这时候就要传入依赖

### 关于依赖项不要对 React 撒谎

所以我们一定要听从 lint 的建议来传入依赖，否则会出现一些难以 de 的 bug

### **避免将对象和函数作为依赖项**

effect 依赖的比较是使用 Object.is()的，所以当你传入对象和函数作为依赖项时，会很容易造成无意义的渲染
解决方案

- 将对象改为基础类型
- 用 useMemo 或 useCallback（但这两个 api 要慎用），一般用来相当大的数据来的缓存，一味的滥用只会造成性能的浪费

#### 可变值（包括全局变量）不是响应式的。

例如，像 [location.pathname](https://developer.mozilla.org/zh-CN/docs/Web/API/Location/pathname) 这样的可变值不能作为依赖项。它是可变的，因此可以在 React 渲染数据流之外的任何时间发生变化。更改它不会触发组件的重新渲染。因此，即使在依赖项中指定了它，React 也无法知道在其更改时重新同步 Effect。这也违反了 React 的规则，因为在渲染过程中读取可变数据（即在计算依赖项时）会破坏 [纯粹的渲染](https://zh-hans.react.dev/learn/keeping-components-pure)。相反，应该使用 [useSyncExternalStore](https://zh-hans.react.dev/learn/you-might-not-need-an-effect#subscribing-to-an-external-store) 来读取和订阅外部可变值。
另外，像 [ref.current](https://zh-hans.react.dev/reference/react/useRef#reference) 或从中读取的值也不能作为依赖项。useRef 返回的 ref 对象本身可以作为依赖项，但其 current 属性是有意可变的。它允许 [跟踪某些值而不触发重新渲染](https://zh-hans.react.dev/learn/referencing-values-with-refs)。但由于更改它不会触发重新渲染，它不是响应式值，React 不会知道在其更改时重新运行 Effect。
正如你将在本页面下面学到的那样，检查工具将自动检查这些问题

## 将事件从 Effect 中分开

- **事件处理函数内部的逻辑是非响应式的**。除非用户又执行了同样的操作（例如点击），否则这段逻辑不会再运行。事件处理函数可以在“不响应”他们变化的情况下读取响应式值。
- **Effect 内部的逻辑是响应式的**。如果 Effect 要读取响应式值，[你必须将它指定为依赖项](https://zh-hans.react.dev/learn/lifecycle-of-reactive-effects#effects-react-to-reactive-values)。如果接下来的重新渲染引起那个值变化，React 就会使用新值重新运行 Effect 内的逻辑。
- **在 Effect 内部中逻辑混合使用响应式逻辑和非响应式逻辑时。**例如，假设你想在用户连接到聊天室时展示一个通知。并且通过从 props 中读取当前 theme（dark 或者 light）来展示对应颜色的通知：

```javascript
function ChatRoom({ roomId, theme }) {
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.on('connected', () => {
      showNotification('Connected!', theme);
    });
    connection.connect();
    // ...
```

但是 theme 是一个响应式值（它会由于重新渲染而变化），并且 Effect 读取的每一个响应式值都必须在其依赖项中声明。现在你必须把 theme 作为 Effect 的依赖项之一
你需要一个将这个非响应式逻辑和周围响应式 Effect 隔离开来的方法。

##### 声明一个 Effect Event

使用 useEffectEvent 这个特殊的 Hook 从 Effect 中提取非响应式逻辑：

```javascript
function ChatRoom({ roomId, theme }) {
  const onConnected = useEffectEvent(() => {
    showNotification('Connected!', theme);
  });

  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.on('connected', () => {
      onConnected();
    });
    connection.connect();
    return () => connection.disconnect();
  }, [roomId]); // ✅ 声明所有依赖项
  // ...
```

或者说 useEffectEvent 可以使你拿到最新的响应值而不会使 effect 再执行

```javascript
function ChatRoom({ roomId }) {
  const [messages, setMessages] = useState([]);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const connection = createConnection();
    connection.connect();
    connection.on('message', (receivedMessage) => {
      setMessages(msgs => [...msgs, receivedMessage]);
      if (!isMuted) {
        playSound();
      }
    });
    return () => connection.disconnect();
  }, [roomId, isMuted]); // ✅ 所有依赖已声明
  // ...
```

## 移除 Effect 依赖

#### 要改变依赖，请改变代码

使用 useEffectEvent

#### 让 Effects 自给自足

```javascript
useEffect(() => {
  const id = setInterval(() => {
    setCount(count + 1);
  }, 1000);
  return () => clearInterval(id);
}, [count]);

//自给自足
useEffect(() => {
  const id = setInterval(() => {
    setCount((c) => c + 1);
  }, 1000);
  return () => clearInterval(id);
}, []);
```

推荐阅读

::: tip dan 哥文档
[useEffect 完整指南](https://overreacted.io/zh-hans/a-complete-guide-to-useeffect/)
:::

::: info react 官方文档
[将事件从 Effect 中分开 – React 中文文档](https://zh-hans.react.dev/learn/separating-events-from-effects)

:::
