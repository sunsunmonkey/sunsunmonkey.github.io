# 子传父的Ref

## forwardRef

如果我们想要将子元素dom传递给父元素那么forwardRef

``` jsx
const SomeComponent = forwardRef(render)
```

``` jsx
import { forwardRef } from 'react';

const MyInput = forwardRef(function MyInput(props, ref) {
  const { label, ...otherProps } = props;
  return (
    <label>
      {label}
      <input {...otherProps} ref={ref} />
    </label>
  );
});


function Form() {
  const ref = useRef(null);

  function handleClick() {
    ref.current.focus();
  }

  return (
    <form>
      <MyInput label="Enter your name:" ref={ref} />
      <button type="button" onClick={handleClick}>
        编辑
      </button>
    </form>
  );
}
```
然后父元素就可以拿到子元素的dom了

##  useImperativeHandle

**useImperativeHandle** 是 React 中的一个 Hook，它能让你自定义由 ref 暴露出来的句柄。

参数 
- ref：该 ref 是你从 forwardRef 渲染函数 中获得的第二个参数。

- createHandle：该函数无需参数，它返回你想要暴露的 ref 的句柄。该句柄可以包含任何类型。通常，你会返回一个包含你想暴露的方法的对象。

可选的 dependencies：函数 createHandle 代码中所用到的所有反应式的值的列表。反应式的值包含 props、状态和其他所有直接在你组件体内声明的变量和函数。倘若你的代码检查器已 为 React 配置好，它会验证每一个反应式的值是否被正确指定为依赖项。该列表的长度必须是一个常数项，并且必须按照 [dep1, dep2, dep3] 的形式罗列各依赖项。React 会使用 Object.is 来比较每一个依赖项与其对应的之前值。如果一次重新渲染导致某些依赖项发生了改变，或你没有提供这个参数列表，你的函数 createHandle 将会被重新执行，而新生成的句柄则会被分配给 ref。

``` jsx
import { forwardRef, useRef, useImperativeHandle } from 'react';

const MyInput = forwardRef(function MyInput(props, ref) {
  const inputRef = useRef(null);

  useImperativeHandle(ref, () => {
    return {
      focus() {
        inputRef.current.focus();
      },
      scrollIntoView() {
        inputRef.current.scrollIntoView();
      },
    };
  }, []);

  return <input {...props} ref={inputRef} />;
});
```

useImperativeHandle 就是限制版的forwardRef