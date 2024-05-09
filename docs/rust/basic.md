# 基础知识随笔

## 基础类型
### 数值类型

``` rust
fn main() {
  // 编译器会进行自动推导，给予twenty i32的类型
  let twenty = 20;
  // 类型标注
  let twenty_one: i32 = 21;
  // 通过类型后缀的方式进行类型标注：22是i32类型
  let twenty_two = 22i32;

  // 只有同样类型，才能运算
  let addition = twenty + twenty_one + twenty_two;
  println!("{} + {} + {} = {}", twenty, twenty_one, twenty_two, addition);

  // 对于较长的数字，可以用_进行分割，提升可读性
  let one_million: i64 = 1_000_000;
  println!("{}", one_million.pow(2));

  // 定义一个f32数组，其中42.0会自动被推导为f32类型
  let forty_twos = [
    42.0,
    42f32,
    42.0_f32,
  ];

  // 打印数组中第一个值，并控制小数位为2位
  println!("{:.2}", forty_twos[0]);
}
```

## 语句和表达式
Rust 的函数体是由一系列语句组成，最后由一个表达式来返回值，例如：

``` rust
fn add_with_extra(x: i32, y: i32) -> i32 {
    let x = x + 1; // 语句
    let y = y + 5; // 语句
    x + y // 表达式
}
```

语句会执行一些操作但是不会返回一个值，而表达式会在求值后返回一个值，因此在上述函数体的三行代码中，前两行是语句，最后一行是表达式。

对于 Rust 语言而言，这种基于语句（statement）和表达式（expression）的方式是非常重要的，你需要能明确的区分这两个概念, 但是对于很多其它语言而言，这两个往往无需区分。基于表达式是函数式语言的重要特征，表达式总要返回值。

其实，在此之前，我们已经多次使用过语句和表达式。

## 所有权原则

- Rust 中每一个值都被一个变量所拥有，该变量被称为值的所有者
- 一个值同时只能被一个变量所拥有，或者说一个值只能拥有一个所有者
- 当所有者(变量)离开作用域范围时，这个值将被丢弃(drop)

### 转移所有权

然后再来看一段代码：

``` rust
let s1 = String::from("hello");
let s2 = s1;
```

此时，可能某个大聪明( 善意昵称 )已经想到了：嗯，上面一样，把 s1 的内容拷贝一份赋值给 s2，实际上，并不是这样。之前也提到了，对于基本类型（存储在栈上），Rust 会自动拷贝，但是 String 不是基本类型，而且是存储在堆上的，因此不能自动拷贝。

实际上， String 类型是一个复杂类型，由存储在栈中的堆指针、字符串长度、字符串容量共同组成，其中堆指针是最重要的，它指向了真实存储字符串内容的堆内存，至于长度和容量，如果你有 Go 语言的经验，这里就很好理解：容量是堆内存分配空间的大小，长度是目前已经使用的大小。

总之 String 类型指向了一个堆上的空间，这里存储着它的真实数据，下面对上面代码中的 let s2 = s1 分成两种情况讨论：

拷贝 String 和存储在堆上的字节数组 如果该语句是拷贝所有数据(深拷贝)，那么无论是 String 本身还是底层的堆上数据，都会被全部拷贝，这对于性能而言会造成非常大的影响

只拷贝 String 本身 这样的拷贝非常快，因为在 64 位机器上就拷贝了 8字节的指针、8字节的长度、8字节的容量，总计 24 字节，但是带来了新的问题，还记得我们之前提到的所有权规则吧？其中有一条就是：一个值只允许有一个所有者，而现在这个值（堆上的真实字符串数据）有了两个所有者：s1 和 s2。

好吧，就假定一个值可以拥有两个所有者，会发生什么呢？

当变量离开作用域后，Rust 会自动调用 drop 函数并清理变量的堆内存。不过由于两个 String 变量指向了同一位置。这就有了一个问题：当 s1 和 s2 离开作用域，它们都会尝试释放相同的内存。这是一个叫做 二次释放（double free） 的错误，也是之前提到过的内存安全性 BUG 之一。两次释放（相同）内存会导致内存污染，它可能会导致潜在的安全漏洞。

如果你在其他语言中听说过术语 浅拷贝(shallow copy) 和 深拷贝(deep copy)，那么拷贝指针、长度和容量而不拷贝数据听起来就像浅拷贝，但是又因为 Rust 同时使第一个变量 s1 无效了，因此这个操作被称为 移动(move)，而不是浅拷贝。上面的例子可以解读为 s1 被移动到了 s2 中。那么具体发生了什么，用一张图简单说明：

那么什么类型是可 Copy 的呢？可以查看给定类型的文档来确认，这里可以给出一个通用的规则： 任何基本类型的组合可以 Copy ，不需要分配内存或某种形式资源的类型是可以 Copy 的。如下是一些 Copy 的类型：

- 所有整数类型，比如 u32
- 布尔类型，bool，它的值是 true 和 false
- 所有浮点数类型，比如 f64
- 字符类型，char
- 元组，当且仅当其包含的类型也都是 Copy 的时候。比如，(i32, i32) 是 Copy 的，但 (i32, String) 就不是
- 不可变引用 &T ，例如转移所有权中的最后一个例子，但是注意: 可变引用 &mut T 是不可以 Copy的

## 引用与借用

Rust 通过 借用(Borrowing) 这个概念来达成上述的目的，获取变量的引用，称之为借用(borrowing)。正如现实生活中，如果一个人拥有某样东西，你可以从他那里借来，当使用完毕后，也必须要物归原主。


**可变引用同时只能存在一个**

不过可变引用并不是随心所欲、想用就用的，它有一个很大的限制： 同一作用域，特定数据只能有一个可变引用：

### 借用规则总结

总的来说，借用规则如下：

- 同一时刻，你只能拥有要么一个可变引用, 要么任意多个不可变引用
- 引用必须总是有效的

## 字符串深度剖析

那么问题来了，为啥 String 可变，而字符串字面值 str 却不可以？

就字符串字面值来说，我们在编译时就知道其内容，最终字面值文本被直接硬编码进可执行文件中，这使得字符串字面值快速且高效，这主要得益于字符串字面值的不可变性。不幸的是，我们不能为了获得这种性能，而把每一个在编译时大小未知的文本都放进内存中（你也做不到！），因为有的字符串是在程序运行的过程中动态生成的。

对于 String 类型，为了支持一个可变、可增长的文本片段，需要在堆上分配一块在编译时未知大小的内存来存放内容，这些都是在程序运行时完成的：

- 首先向操作系统请求内存来存放 String 对象
- 在使用完成后，将内存释放，归还给操作系统

其中第一部分由 String::from 完成，它创建了一个全新的 String。

重点来了，到了第二部分，就是百家齐放的环节，在有**垃圾回收 GC** 的语言中，GC 来负责标记并清除这些不再使用的内存对象，这个过程都是自动完成，无需开发者关心，非常简单好用；但是在无 GC 的语言中，需要开发者手动去释放这些内存对象，就像创建对象需要通过编写代码来完成一样，未能正确释放对象造成的后果简直不可估量。

对于 Rust 而言，安全和性能是写到骨子里的核心特性，如果使用 GC，那么会牺牲性能；如果使用手动管理内存，那么会牺牲安全，这该怎么办？为此，Rust 的开发者想出了一个无比惊艳的办法：变量在离开作用域后，就自动释放其占用的内存：

``` rust
{
    let s = String::from("hello"); // 从此处起，s 是有效的

    // 使用 s
}                                  // 此作用域已结束，
                                   // s 不再有效，内存被释放
```

与其它系统编程语言的 free 函数相同，Rust 也提供了一个释放内存的函数： drop，但是不同的是，其它语言要手动调用 free 来释放每一个变量占用的内存，而 Rust 则在变量离开作用域时，自动调用 drop 函数: 上面代码中，Rust 在结尾的 } 处自动调用 drop。

其实，在 C++ 中，也有这种概念: Resource Acquisition Is Initialization (RAII)。如果你使用过 RAII 模式的话应该对 Rust 的 drop 函数并不陌生。

这个模式对编写 Rust 代码的方式有着深远的影响，在后面章节我们会进行更深入的介绍。

## 结构体

有几点值得注意:

- 初始化实例时，每个字段都需要进行初始化
- 初始化时的字段顺序不需要和结构体定义时的顺序一致

### 结构体更新语法

在实际场景中，有一种情况很常见：根据已有的结构体实例，创建新的结构体实例，例如根据已有的 user1 实例来构建 user2：

``` rust
  let user2 = User {
        active: user1.active,
        username: user1.username,
        email: String::from("another@example.com"),
        sign_in_count: user1.sign_in_count,
    };
```

老话重提，如果你从 TypeScript 过来，肯定觉得啰嗦爆了：竟然手动把 user1 的三个字段逐个赋值给 user2，好在 Rust 为我们提供了 结构体更新语法：

``` rust
  let user2 = User {
        email: String::from("another@example.com"),
        ..user1
    };
```

因为 user2 仅仅在 email 上与 user1 不同，因此我们只需要对 email 进行赋值，剩下的通过结构体更新语法 ..user1 即可完成。

.. 语法表明凡是我们没有显式声明的字段，全部从 user1 中自动获取。需要注意的是 ..user1 必须在结构体的尾部使用。

结构体更新语法跟赋值语句 = 非常相像，因此在上面代码中，user1 的部分字段所有权被转移到 user2 中：username 字段发生了所有权转移，作为结果，user1 无法再被使用。

聪明的读者肯定要发问了：明明有三个字段进行了自动赋值，为何只有 username 发生了所有权转移？

仔细回想一下所有权那一节的内容，我们提到了 Copy 特征：实现了 Copy 特征的类型无需所有权转移，可以直接在赋值时进行 数据拷贝，其中 bool 和 u64 类型就实现了 Copy 特征，因此 active 和 sign_in_count 字段在赋值给 user2 时，仅仅发生了拷贝，而不是所有权转移。

值得注意的是：username 所有权被转移给了 user2，导致了 user1 无法再被使用，但是并不代表 user1 内部的其它字段不能被继续使用，例如：

``` rust
let user1 = User {
    email: String::from("someone@example.com"),
    username: String::from("someusername123"),
    active: true,
    sign_in_count: 1,
};
let user2 = User {
    active: user1.active,
    username: user1.username,
    email: String::from("another@example.com"),
    sign_in_count: user1.sign_in_count,
};

println!("{}", user1.active);
// 下面这行会报错
println!("{:?}", user1);
```

### 单元结构体(Unit-like Struct)

还记得之前讲过的基本没啥用的单元类型吧？单元结构体就跟它很像，没有任何字段和属性，但是好在，它还挺有用。

如果你定义一个类型，但是不关心该类型的内容, 只关心它的行为时，就可以使用 单元结构体：

``` rust
struct AlwaysEqual;

let subject = AlwaysEqual;

// 我们不关心 AlwaysEqual 的字段数据，只关心它的行为，因此将它声明为单元结构体，然后再为它实现某个特征
impl SomeTrait for AlwaysEqual {

}
```


## 枚举

从这些例子可以看出，任何类型的数据都可以放入枚举成员中: 例如字符串、数值、结构体甚至另一个枚举。

增加一些挑战？先看以下代码：

``` rust
enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(i32, i32, i32),
}

fn main() {
    let m1 = Message::Quit;
    let m2 = Message::Move{x:1,y:1};
    let m3 = Message::ChangeColor(255,255,0);
}
```


该枚举类型代表一条消息，它包含四个不同的成员：

- Quit 没有任何关联数据
- Move 包含一个匿名结构体
- Write 包含一个 String 字符串
- ChangeColor 包含三个 i32
  

当然，我们也可以用结构体的方式来定义这些消息：

``` rust
struct QuitMessage; // 单元结构体
struct MoveMessage {
    x: i32,
    y: i32,
}
struct WriteMessage(String); // 元组结构体
struct ChangeColorMessage(i32, i32, i32); // 元组结构体

```

由于每个结构体都有自己的类型，因此我们无法在需要同一类型的地方进行使用，例如某个函数它的功能是接受消息并进行发送，那么用枚举的方式，就可以接收不同的消息，但是用结构体，该函数无法接受 4 个不同的结构体作为参数。

而且从代码规范角度来看，枚举的实现更简洁，代码内聚性更强，不像结构体的实现，分散在各个地方


## loop 循环

对于循环而言，loop 循环毋庸置疑，是适用面最高的，它可以适用于所有循环场景（虽然能用，但是在很多场景下， for 和 while 才是最优选择），因为 loop 就是一个简单的无限循环，你可以在内部实现逻辑通过 break 关键字来控制循环何时结束。

使用 loop 循环一定要打起精神，否则你会写出下面的跑满你一个 CPU 核心的疯子代码：

``` rust
fn main() {
    loop {
        println!("again!");
    }
}
```

该循环会不停的在终端打印输出，直到你使用 Ctrl-C 结束程序：

again!
again!
again!
again!
^Cagain!

注意，不要轻易尝试上述代码，如果你电脑配置不行，可能会死机！！！

因此，当使用 loop 时，必不可少的伙伴是 break 关键字，它能让循环在满足某个条件时跳出：

``` rust
fn main() {
    let mut counter = 0;

    let result = loop {
        counter += 1;

        if counter == 10 {
            break counter * 2;
        }
    };

    println!("The result is {}", result);
}
```
以上代码当 counter 递增到 10 时，就会通过 break 返回一个 counter * 2 的值，最后赋给 result 并打印出来。

这里有几点值得注意：

- break 可以单独使用，也可以带一个返回值，有些类似 return
- loop 是一个表达式，因此可以返回一个值

## 解构 Option

在枚举那章，提到过 Option 枚举，它用来解决 Rust 中变量是否有值的问题，定义如下：

``` rust
enum Option<T> {
    Some(T),
    None,
}
```

简单解释就是：一个变量要么有值：Some(T), 要么为空：None。

那么现在的问题就是该如何去使用这个 Option 枚举类型，根据我们上一节的经验，可以通过 match 来实现。

因为 Option，Some，None 都包含在 prelude 中，因此你可以直接通过名称来使用它们，而无需以 Option::Some 这种形式去使用，总之，千万不要因为调用路径变短了，就忘记 Some 和 None 也是 Option 底下的枚举成员！


## 方法 Method

### self、&self 和 &mut self

接下来的内容非常重要，请大家仔细看。在 area 的签名中，我们使用 &self 替代 rectangle: &Rectangle，&self 其实是 self: &Self 的简写（注意大小写）。在一个 impl 块内，Self 指代被实现方法的结构体类型，self 指代此类型的实例，换句话说，self 指代的是 Rectangle 结构体实例，这样的写法会让我们的代码简洁很多，而且非常便于理解：我们为哪个结构体实现方法，那么 self 就是指代哪个结构体的实例。

需要注意的是，self 依然有所有权的概念：

- self 表示 Rectangle 的所有权转移到该方法中，这种形式用的较少
- &self 表示该方法对 Rectangle 的不可变借用
- &mut self 表示可变借用
  
总之，self 的使用就跟函数参数一样，要严格遵守 Rust 的所有权规则。

回到上面的例子中，选择 &self 的理由跟在函数中使用 &Rectangle 是相同的：我们并不想获取所有权，也无需去改变它，只是希望能够读取结构体中的数据。如果想要在方法中去改变当前的结构体，需要将第一个参数改为 &mut self。仅仅通过使用 self 作为第一个参数来使方法获取实例的所有权是很少见的，这种使用方式往往用于把当前的对象转成另外一个对象时使用，转换完后，就不再关注之前的对象，且可以防止对之前对象的误调用。

简单总结下，使用方法代替函数有以下好处：

- 不用在函数签名中重复书写 self 对应的类型
- 代码的组织性和内聚性更强，对于代码维护和阅读来说，好处巨大

## 泛型

方法中使用泛型
上一章中，我们讲到什么是方法以及如何在结构体和枚举上定义方法。方法上也可以使用泛型：
``` rust
struct Point<T> {
    x: T,
    y: T,
}

impl<T> Point<T> {
    fn x(&self) -> &T {
        &self.x
    }
}

fn main() {
    let p = Point { x: 5, y: 10 };

    println!("p.x = {}", p.x());
}
```

使用泛型参数前，依然需要提前声明：`impl<T>`，只有提前声明了，我们才能在`Point<T>`中使用它，这样 Rust 就知道 Point 的尖括号中的类型是泛型而不是具体类型。需要注意的是，这里的 `Point<T>` 不再是泛型声明，而是一个完整的结构体类型，因为我们定义的结构体就是 `Point<T>` 而不再是 Point。

除了结构体中的泛型参数，我们还能在该结构体的方法中定义额外的泛型参数，就跟泛型函数一样：

``` rust
struct Point<T, U> {
    x: T,
    y: U,
}

impl<T, U> Point<T, U> {
    fn mixup<V, W>(self, other: Point<V, W>) -> Point<T, W> {
        Point {
            x: self.x,
            y: other.y,
        }
    }
}

fn main() {
    let p1 = Point { x: 5, y: 10.4 };
    let p2 = Point { x: "Hello", y: 'c'};

    let p3 = p1.mixup(p2);

    println!("p3.x = {}, p3.y = {}", p3.x, p3.y);
}
```

这个例子中，T,U 是定义在结构体 Point 上的泛型参数，V,W 是单独定义在方法 mixup 上的泛型参数，它们并不冲突，说白了，你可以理解为，一个是结构体泛型，一个是函数泛型。

为具体的泛型类型实现方法
对于`Point<T>` 类型，你不仅能定义基于 T 的方法，还能针对特定的具体类型，进行方法定义：

``` rust
impl Point<f32> {
    fn distance_from_origin(&self) -> f32 {
        (self.x.powi(2) + self.y.powi(2)).sqrt()
    }
}
```

这段代码意味着 `Point<f32>` 类型会有一个方法 distance_from_origin，而其他 T 不是 f32 类型的 `Point<T>` 实例则没有定义此方法。这个方法计算点实例与坐标(0.0, 0.0) 之间的距离，并使用了只能用于浮点型的数学运算符。

这样我们就能针对特定的泛型类型实现某个特定的方法，对于其它泛型类型则没有定义该方法。

## 特征

特征定义与实现的位置 **孤儿规则**
上面我们将 Summary 定义成了 pub 公开的。这样，如果他人想要使用我们的 Summary 特征，则可以引入到他们的包中，然后再进行实现。

关于特征实现与定义的位置，有一条非常重要的原则：如果你想要为类型 A 实现特征 T，那么 A 或者 T 至少有一个是在当前作用域中定义的！ 例如我们可以为上面的 Post 类型实现标准库中的 Display 特征，这是因为 Post 类型定义在当前的作用域中。同时，我们也可以在当前包中为 String 类型实现 Summary 特征，因为 Summary 定义在当前作用域中。

但是你无法在当前作用域中，为 String 类型实现 Display 特征，因为它们俩都定义在标准库中，其定义所在的位置都不在当前作用域，跟你半毛钱关系都没有，看看就行了。

该规则被称为孤儿规则，可以确保其它人编写的代码不会破坏你的代码，也确保了你不会莫名其妙就破坏了风马牛不相及的代码

### 默认实现

``` rust
impl Summary for Post {}

impl Summary for Weibo {
    fn summarize(&self) -> String {
        format!("{}发表了微博{}", self.username, self.content)
    }
}
```

### 特征约束(trait bound)

虽然 impl Trait 这种语法非常好理解，但是实际上它只是一个语法糖：

``` rust
pub fn notify<T: Summary>(item: &T) {
    println!("Breaking news! {}", item.summarize());
}
```
真正的完整书写形式如上所述，形如 T: Summary 被称为特征约束。

在简单的场景下 impl Trait 这种语法糖就足够使用，但是对于复杂的场景，特征约束可以让我们拥有更大的灵活性和语法表现能力，例如一个函数接受两个 impl Summary 的参数：
``` rust
pub fn notify(item1: &impl Summary, item2: &impl Summary) {}
如果函数两个参数是不同的类型，那么上面的方法很好，只要这两个类型都实现了 Summary 特征即可。但是如果我们想要强制函数的两个参数是同一类型呢？上面的语法就无法做到这种限制，此时我们只能使特征约束来实现：
``` rust
pub fn notify<T: Summary>(item1: &T, item2: &T) {}
泛型类型 T 说明了 item1 和 item2 必须拥有同样的类型，同时 T: Summary 说明了 T 必须实现 Summary 特征。

多重约束
除了单个约束条件，我们还可以指定多个约束条件，例如除了让参数实现 Summary 特征外，还可以让参数实现 Display 特征以控制它的格式化输出：
``` rust
pub fn notify(item: &(impl Summary + Display)) {}
```

除了上述的语法糖形式，还能使用特征约束的形式：

``` rust
pub fn notify<T: Summary + Display>(item: &T) {}
```

通过这两个特征，就可以使用 item.summarize 方法，以及通过 println!("{}", item) 来格式化输出 item。

Where 约束
当特征约束变得很多时，函数的签名将变得很复杂：

``` rust
fn some_function<T: Display + Clone, U: Clone + Debug>(t: &T, u: &U) -> i32 {}
```

严格来说，上面的例子还是不够复杂，但是我们还是能对其做一些形式上的改进，通过 where：

``` rust
fn some_function<T, U>(t: &T, u: &U) -> i32
    where T: Display + Clone,
          U: Clone + Debug
{}
```

![image.png](https://cdn.nlark.com/yuque/0/2024/png/33634946/1715002817719-4adf050f-0d53-4bd4-b04f-9499bfbcf76a.png#averageHue=%23f0efed&clientId=u308d6a38-b6cf-4&from=paste&height=138&id=uc1d862c6&originHeight=207&originWidth=796&originalType=binary&ratio=1.5&rotation=0&showTitle=false&size=17233&status=done&style=none&taskId=u84f59eb8-e2f0-458c-90db-d52a1f418f8&title=&width=530.6666666666666)


## 特征对象

**特征对象**指向实现了 Draw 特征的类型的实例，也就是指向了 Button 或者 SelectBox 的实例，这种映射关系是存储在一张表中，可以在运行时通过特征对象找到具体调用的类型方法。

可以通过 & 引用或者` Box<T> `智能指针的方式来创建特征对象。


``` rust
trait Draw {
    fn draw(&self) -> String;
}

impl Draw for u8 {
    fn draw(&self) -> String {
        format!("u8: {}", *self)
    }
}

impl Draw for f64 {
    fn draw(&self) -> String {
        format!("f64: {}", *self)
    }
}

// 若 T 实现了 Draw 特征， 则调用该函数时传入的 Box<T> 可以被隐式转换成函数参数签名中的 Box<dyn Draw>
fn draw1(x: Box<dyn Draw>) {
    // 由于实现了 Deref 特征，Box 智能指针会自动解引用为它所包裹的值，然后调用该值对应的类型上定义的 `draw` 方法
    x.draw();
}

fn draw2(x: &dyn Draw) {
    x.draw();
}

fn main() {
    let x = 1.1f64;
    // do_something(&x);
    let y = 8u8;

    // x 和 y 的类型 T 都实现了 `Draw` 特征，因为 Box<T> 可以在函数调用时隐式地被转换为特征对象 Box<dyn Draw> 
    // 基于 x 的值创建一个 Box<f64> 类型的智能指针，指针指向的数据被放置在了堆上
    draw1(Box::new(x));
    // 基于 y 的值创建一个 Box<u8> 类型的智能指针
    draw1(Box::new(y));
    draw2(&x);
    draw2(&y);
}
```

### 特征对象的限制
不是所有特征都能拥有特征对象，只有对象安全的特征才行。当一个特征的所有方法都有如下属性时，它的对象才是安全的：

- 方法的返回类型不能是 Self
- 方法没有任何泛型参数
对象安全对于特征对象是必须的，因为一旦有了特征对象，就不再需要知道实现该特征的具体类型是什么了。如果特征方法返回了具体的 Self 类型，但是特征对象忘记了其真正的类型，那这个 Self 就非常尴尬，因为没人知道它是谁了。但是对于泛型类型参数来说，当使用特征时其会放入具体的类型参数：此具体类型变成了实现该特征的类型的一部分。而当使用特征对象时其具体类型被抹去了，故而无从得知放入泛型参数类型到底是什么。

标准库中的 Clone 特征就不符合对象安全的要求：
``` rust
pub trait Clone {
    fn clone(&self) -> Self;
}
```

因为它的其中一个方法，返回了 Self 类型，因此它是对象不安全的。

String 类型实现了 Clone 特征， String 实例上调用 clone 方法时会得到一个 String 实例。类似的，当调用 `Vec<T>` 实例的 clone 方法会得到一个 `Vec<T>` 实例。clone 的签名需要知道什么类型会代替 Self，因为这是它的返回值。

如果违反了对象安全的规则，编译器会提示你。例如，如果尝试使用之前的 Screen 结构体来存放实现了 Clone 特征的类型：

``` rust
pub struct Screen {
    pub components: Vec<Box<dyn Clone>>,
}

```

将会得到如下错误：
``` shell
error[E0038]: the trait `std::clone::Clone` cannot be made into an object
 --> src/lib.rs:2:5
  |
2 |     pub components: Vec<Box<dyn Clone>>,
  |     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ the trait `std::clone::Clone`
  cannot be made into an object
  |
  = note: the trait cannot require that `Self : Sized`
```

这意味着不能以这种方式使用此特征作为特征对象。

### 关联类型

在方法一章中，我们讲到了关联函数，但是实际上关联类型和关联函数并没有任何交集，虽然它们的名字有一半的交集。

关联类型是在特征定义的语句块中，申明一个自定义类型，这样就可以在特征的方法签名中使用该类型：
``` rust
pub trait Iterator {
    type Item;

    fn next(&mut self) -> Option<Self::Item>;
}
```
以上是标准库中的迭代器特征 Iterator，它有一个 Item 关联类型，用于替代遍历的值的类型。

同时，next 方法也返回了一个 Item 类型，不过使用 Option 枚举进行了包裹，假如迭代器中的值是 i32 类型，那么调用 next 方法就将获取一个 `Option<i32>` 的值。

还记得 Self 吧？在之前的章节提到过， Self 用来指代当前调用者的具体类型，那么 Self::Item 就用来指代该类型实现中定义的 Item 类型：
``` rust
impl Iterator for Counter {
    type Item = u32;

    fn next(&mut self) -> Option<Self::Item> {
        // --snip--
    }
}

fn main() {
    let c = Counter{..}
    c.next()
}
```

在上述代码中，我们为 Counter 类型实现了 Iterator 特征，变量 c 是特征 Iterator 的实例，也是 next 方法的调用者。 结合之前的黑体内容可以得出：对于 next 方法而言，Self 是调用者 c 的具体类型： Counter，而 Self::Item 是 Counter 中定义的 Item 类型: u32。

聪明的读者之所以聪明，是因为你们喜欢联想和举一反三，同时你们也喜欢提问：为何不用泛型，例如如下代码：
``` rust
pub trait Iterator<Item> {
    fn next(&mut self) -> Option<Item>;
}
```
答案其实很简单，为了代码的可读性，当你使用了泛型后，你需要在所有地方都写 `Iterator<Item>`，而使用了关联类型，你只需要写 Iterator，当类型定义复杂时，这种写法可以极大的增加可读性：

``` rust
pub trait CacheableItem: Clone + Default + fmt::Debug + Decodable + Encodable {
  type Address: AsRef<[u8]> + Clone + fmt::Debug + Eq + Hash;
  fn is_null(&self) -> bool;
}
```

例如上面的代码，Address 的写法自然远比 `AsRef<[u8]> + Clone + fmt::Debug + Eq + Hash` 要简单的多，而且含义清晰。

``` rust
再例如，如果使用泛型，你将得到以下的代码：

trait Container<A,B> {
    fn contains(&self,a: A,b: B) -> bool;
}

fn difference<A,B,C>(container: &C) -> i32
  where
    C : Container<A,B> {...}
```

可以看到，由于使用了泛型，导致函数头部也必须增加泛型的声明，而使用关联类型，将得到可读性好得多的代码：
``` rust
trait Container{
    type A;
    type B;
    fn contains(&self, a: &Self::A, b: &Self::B) -> bool;
}

fn difference<C: Container>(container: &C) {}
```

### 在外部类型上实现外部特征(newtype)
在特征章节中，有提到孤儿规则，简单来说，就是特征或者类型必需至少有一个是本地的，才能在此类型上定义特征。

这里提供一个办法来绕过孤儿规则，那就是使用newtype 模式，简而言之：就是为一个元组结构体创建新类型。该元组结构体封装有一个字段，该字段就是希望实现特征的具体类型。

该封装类型是本地的，因此我们可以为此类型实现外部的特征。

newtype 不仅仅能实现以上的功能，而且它在运行时没有任何性能损耗，因为在编译期，该类型会被自动忽略。

下面来看一个例子，我们有一个动态数组类型：` Vec<T>`，它定义在标准库中，还有一个特征 Display，它也定义在标准库中，如果没有 newtype，我们是无法为`Vec<T>` 实现 Display 的：

``` shell
error[E0117]: only traits defined in the current crate can be implemented for arbitrary types
--> src/main.rs:5:1
|
5 | impl<T> std::fmt::Display for Vec<T> {
| ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^------
| |                             |
| |                             Vec is not defined in the current crate
| impl doesn't use only types from inside the current crate
|
= note: define and implement a trait or new type instead
```

编译器给了我们提示： define and implement a trait or new type instead，重新定义一个特征，或者使用 new type，前者当然不可行，那么来试试后者：

``` rust
use std::fmt;

struct Wrapper(Vec<String>);

impl fmt::Display for Wrapper {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "[{}]", self.0.join(", "))
    }
}

fn main() {
    let w = Wrapper(vec![String::from("hello"), String::from("world")]);
    println!("w = {}", w);
}
```

其中，`struct Wrapper(Vec<String>)` 就是一个元组结构体，它定义了一个新类型 Wrapper，代码很简单，相信大家也很容易看懂。

既然 new type 有这么多好处，它有没有不好的地方呢？答案是肯定的。注意到我们怎么访问里面的数组吗？self.0.join(", ")，是的，很啰嗦，因为需要先从 Wrapper 中取出数组: self.0，然后才能执行 join 方法。

类似的，任何数组上的方法，你都无法直接调用，需要先用 self.0 取出数组，然后再进行调用。

当然，解决办法还是有的，要不怎么说 Rust 是极其强大灵活的编程语言！Rust 提供了一个特征叫 Deref，实现该特征后，可以自动做一层类似类型转换的操作，可以将 Wrapper 变成 `Vec<String>` 来使用。这样就会像直接使用数组那样去使用 Wrapper，而无需为每一个操作都添加上 self.0。

同时，如果不想 Wrapper 暴露底层数组的所有方法，我们还可以为 Wrapper 去重载这些方法，实现隐藏的目的。

## 动态数组 Vector

动态数组类型用 `Vec<T>` 表示，事实上，在之前的章节，它的身影多次出现，我们一直没有细讲，只是简单的把它当作数组处理。

动态数组允许你存储多个值，这些值在内存中一个紧挨着另一个排列，因此访问其中某个元素的成本非常低。动态数组只能存储相同类型的元素，如果你想存储不同类型的元素，可以使用之前讲过的枚举类型或者特征对象。

总之，当我们想拥有一个列表，里面都是相同类型的数据时，动态数组将会非常有用。

### 从 Vector 中读取元素
读取指定位置的元素有两种方式可选：

通过下标索引访问。
使用 get 方法。


``` rust
let v = vec![1, 2, 3, 4, 5];
let third: &i32 = &v[2];
println!("第三个元素是 {}", third);

match v.get(2) {
    Some(third) => println!("第三个元素是 {third}"),
    None => println!("去你的第三个元素，根本没有！"),
}
```

和其它语言一样，集合类型的索引下标都是从 0 开始，&v[2] 表示借用 v 中的第三个元素，最终会获得该元素的引用。而 v.get(2) 也是访问第三个元素，但是有所不同的是，它返回了 `Option<&T>`，因此还需要额外的 match 来匹配解构出具体的值。

细心的同学会注意到这里使用了两种格式化输出的方式，其中第一种我们在之前已经见过，而第二种是后续新版本中引入的写法，也是更推荐的用法，具体介绍请参见格式化输出章节。

## KV 存储 HashMap

更新 HashMap 中的值
更新值的时候，涉及多种情况，咱们在代码中一一进行说明：

``` rust
fn main() {
    use std::collections::HashMap;

    let mut scores = HashMap::new();

    scores.insert("Blue", 10);

    // 覆盖已有的值
    let old = scores.insert("Blue", 20);
    assert_eq!(old, Some(10));

    // 查询新插入的值
    let new = scores.get("Blue");
    assert_eq!(new, Some(&20));

    // 查询Yellow对应的值，若不存在则插入新值
    let v = scores.entry("Yellow").or_insert(5);
    assert_eq!(*v, 5); // 不存在，插入5

    // 查询Yellow对应的值，若不存在则插入新值
    let v = scores.entry("Yellow").or_insert(50);
    assert_eq!(*v, 5); // 已经存在，因此50没有插入
}
```

具体的解释在代码注释中已有，这里不再进行赘述


## 生命周期

### 生命周期标注语法

生命周期标注并不会改变任何引用的实际作用域 -- 鲁迅

### 结构体中的生命周期

不仅仅函数具有生命周期，结构体其实也有这个概念，只不过我们之前对结构体的使用都停留在非引用类型字段上。细心的同学应该能回想起来，之前为什么不在结构体中使用字符串字面量或者字符串切片，而是统一使用 String 类型？原因很简单，后者在结构体初始化时，只要转移所有权即可，而前者，抱歉，它们是引用，它们不能为所欲为。

既然之前已经理解了生命周期，那么意味着在结构体中使用引用也变得可能：只要为结构体中的每一个引用标注上生命周期即可：
``` rust
struct ImportantExcerpt<'a> {
    part: &'a str,
}

fn main() {
    let novel = String::from("Call me Ishmael. Some years ago...");
    let first_sentence = novel.split('.').next().expect("Could not find a '.'");
    let i = ImportantExcerpt {
        part: first_sentence,
    };
}
```

ImportantExcerpt 结构体中有一个引用类型的字段 part，因此需要为它标注上生命周期。结构体的生命周期标注语法跟泛型参数语法很像，需要对生命周期参数进行声明` <'a>`。该生命周期标注说明，结构体 ImportantExcerpt 所引用的字符串 str 生命周期需要大于等于该结构体的生命周期。

从 main 函数实现来看，ImportantExcerpt 的生命周期从第 4 行开始，到 main 函数末尾结束，而该结构体引用的字符串从第一行开始，也是到 main 函数末尾结束，可以得出结论结构体引用的字符串生命周期大于等于结构体，这符合了编译器对生命周期的要求，因此编译通过。

与之相反，下面的代码就无法通过编译：

``` rust
#[derive(Debug)]
struct ImportantExcerpt<'a> {
    part: &'a str,
}

fn main() {
    let i;
    {
        let novel = String::from("Call me Ishmael. Some years ago...");
        let first_sentence = novel.split('.').next().expect("Could not find a '.'");
        i = ImportantExcerpt {
            part: first_sentence,
        };
    }
    println!("{:?}",i);
}
```

观察代码，可以看出结构体比它引用的字符串活得更久，引用字符串在内部语句块末尾 `}` 被释放后，println! 依然在外面使用了该结构体，因此会导致无效的引用，不出所料，编译报错：

``` shell
error[E0597]: `novel` does not live long enough
  --> src/main.rs:10:30
   |
10 |         let first_sentence = novel.split('.').next().expect("Could not find a '.'");
   |                              ^^^^^^^^^^^^^^^^ borrowed value does not live long enough
...
14 |     }
   |     - `novel` dropped here while still borrowed
15 |     println!("{:?}",i);
   |                     - borrow later used here
```

三条消除规则
编译器使用三条消除规则来确定哪些场景不需要显式地去标注生命周期。其中第一条规则应用在输入生命周期上，第二、三条应用在输出生命周期上。若编译器发现三条规则都不适用时，就会报错，提示你需要手动标注生命周期。

1. 每一个引用参数都会获得独自的生命周期

例如一个引用参数的函数就有一个生命周期标注: fn foo<'a>(x: &'a i32)，两个引用参数的有两个生命周期标注:fn foo<'a, 'b>(x: &'a i32, y: &'b i32), 依此类推。

2. 若只有一个输入生命周期(函数参数中只有一个引用类型)，那么该生命周期会被赋给所有的输出生命周期，也就是所有返回值的生命周期都等于该输入生命周期

例如函数 fn foo(x: &i32) -> &i32，x 参数的生命周期会被自动赋给返回值 &i32，因此该函数等同于 fn foo<'a>(x: &'a i32) -> &'a i32

3. 若存在多个输入生命周期，且其中一个是 &self 或 &mut self，则 &self 的生命周期被赋给所有的输出生命周期

拥有 &self 形式的参数，说明该函数是一个 方法，该规则让方法的使用便利度大幅提升。


## panic 深入剖析

### 主动调用

在某些特殊场景中，开发者想要主动抛出一个异常，例如开头提到的在系统启动阶段读取文件失败。

对此，Rust 为我们提供了 panic! 宏，当调用执行该宏时，程序会打印出一个错误信息，展开报错点往前的函数调用堆栈，最后退出程序。

切记，一定是不可恢复的错误，才调用 panic! 处理，你总不想系统仅仅因为用户随便传入一个非法参数就崩溃吧？所以，只有当你不知道该如何处理时，再去调用 panic!.

首先，来调用一下 panic!，这里使用了最简单的代码实现，实际上你在程序的任何地方都可以这样调用：

``` rust
fn main() {
    panic!("crash and burn");
}
```

运行后输出:

thread 'main' panicked at 'crash and burn', src/main.rs:2:5
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace
以上信息包含了两条重要信息：

main 函数所在的线程崩溃了，发生的代码位置是 src/main.rs 中的第 2 行第 5 个字符（包含该行前面的空字符）
在使用时加上一个环境变量可以获取更详细的栈展开信息：
Linux/macOS 等 UNIX 系统： RUST_BACKTRACE=1 cargo run
Windows 系统（PowerShell）： $env:RUST_BACKTRACE=1 ; cargo run
下面让我们针对第二点进行详细展开讲解。

### 何时该使用 panic!

下面让我们大概罗列下何时适合使用 panic，也许经过之前的学习，你已经能够对 panic 的使用有了自己的看法，但是我们还是会罗列一些常见的用法来加深你的理解。

先来一点背景知识，在前面章节我们粗略讲过` Result<T, E>` 这个枚举类型，它是用来表示函数的返回结果：

``` rust
enum Result<T, E> {
    Ok(T),
    Err(E),
}
```
当没有错误发生时，函数返回一个用 Result 类型包裹的值 Ok(T)，当错误时，返回一个 Err(E)。对于 Result 返回我们有很多处理方法，最简单粗暴的就是 unwrap 和 expect，这两个函数非常类似，我们以 unwrap 举例：

``` rust
use std::net::IpAddr;
let home: IpAddr = "127.0.0.1".parse().unwrap();
```

上面的 parse 方法试图将字符串 "127.0.0.1" 解析为一个 IP 地址类型 IpAddr，它返回一个 `Result<IpAddr, E>` 类型，如果解析成功，则把 Ok(IpAddr) 中的值赋给 home，如果失败，则不处理 Err(E)，而是直接 panic。

因此 unwrap 简而言之：成功则返回值，失败则 panic，总之不进行任何错误处理。

### 失败就 panic: unwrap 和 expect

上一节中，已经看到过这两兄弟的简单介绍，这里再来回顾下。

在不需要处理错误的场景，例如写原型、示例时，我们不想使用 match 去匹配` Result<T, E> `以获取其中的 T 值，因为 match 的穷尽匹配特性，你总要去处理下 Err 分支。那么有没有办法简化这个过程？有，答案就是 unwrap 和 expect。

它们的作用就是，如果返回成功，就将 Ok(T) 中的值取出来，如果失败，就直接 panic，真的勇士绝不多 BB，直接崩溃。

``` rust
use std::fs::File;

fn main() {
    let f = File::open("hello.txt").unwrap();
}
```
如果调用这段代码时 hello.txt 文件不存在，那么 unwrap 就将直接 panic：

``` shell
thread 'main' panicked at 'called `Result::unwrap()` on an `Err` value: Os { code: 2, kind: NotFound, message: "No such file or directory" }', src/main.rs:4:37
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace
```

expect 跟 unwrap 很像，也是遇到错误直接 panic, 但是会带上自定义的错误提示信息，相当于重载了错误打印的函数：

``` rust
use std::fs::File;

fn main() {
    let f = File::open("hello.txt").expect("Failed to open hello.txt");
}
```
报错如下：

``` shell
thread 'main' panicked at 'Failed to open hello.txt: Os { code: 2, kind: NotFound, message: "No such file or directory" }', src/main.rs:4:37
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace
```

可以看出，expect 相比 unwrap 能提供更精确的错误信息，在有些场景也会更加实用。

## 传播界的大明星: ?

大明星出场，必须得有排面，来看看 ? 的排面：

``` rust
use std::fs::File;
use std::io;
use std::io::Read;

fn read_username_from_file() -> Result<String, io::Error> {
    let mut f = File::open("hello.txt")?;
    let mut s = String::new();
    f.read_to_string(&mut s)?;
    Ok(s)
}
```

看到没，这就是排面，相比前面的 match 处理错误的函数，代码直接减少了一半不止，但是，一山更比一山难，看不懂啊！

其实 ? 就是一个宏，它的作用跟上面的 match 几乎一模一样：

``` rust
let mut f = match f {
    // 打开文件成功，将file句柄赋值给f
    Ok(file) => file,
    // 打开文件失败，将错误返回(向上传播)
    Err(e) => return Err(e),
};
```

如果结果是 Ok(T)，则把 T 赋值给 f，如果结果是 Err(E)，则返回该错误，所以 ? 特别适合用来传播错误。

虽然 ? 和 match 功能一致，但是事实上 ? 会更胜一筹。何解？

想象一下，一个设计良好的系统中，肯定有自定义的错误特征，错误之间很可能会存在上下级关系，例如标准库中的 std::io::Error 和 std::error::Error，前者是 IO 相关的错误结构体，后者是一个最最通用的标准错误特征，同时前者实现了后者，因此 std::io::Error 可以转换为 std:error::Error。

明白了以上的错误转换，? 的更胜一筹就很好理解了，它可以自动进行类型提升（转换）：

``` rust
fn open_file() -> Result<File, Box<dyn std::error::Error>> {
    let mut f = File::open("hello.txt")?;
    Ok(f)
}
```
上面代码中 File::open 报错时返回的错误是 std::io::Error 类型，但是 open_file 函数返回的错误类型是 std::error::Error 的特征对象，可以看到一个错误类型通过 ? 返回后，变成了另一个错误类型，这就是 ? 的神奇之处。

根本原因是在于标准库中定义的 From 特征，该特征有一个方法 from，用于把一个类型转成另外一个类型，? 可以自动调用该方法，然后进行隐式类型转换。因此只要函数返回的错误 ReturnError 实现了 `From<OtherError>` 特征，那么 ? 就会自动把 OtherError 转换为 ReturnError。

这种转换非常好用，意味着你可以用一个大而全的 ReturnError 来覆盖所有错误类型，只需要为各种子错误类型实现这种转换即可。

强中自有强中手，一码更比一码短：

``` rust
use std::fs::File;
use std::io;
use std::io::Read;

fn read_username_from_file() -> Result<String, io::Error> {
    let mut s = String::new();

    File::open("hello.txt")?.read_to_string(&mut s)?;

    Ok(s)
}
```

瞧见没？ ? 还能实现链式调用，File::open 遇到错误就返回，没有错误就将 Ok 中的值取出来用于下一个方法调用，简直太精妙了，从 Go 语言过来的我，内心狂喜（其实学 Rust 的苦和痛我才不会告诉你们）。

不仅有更强，还要有最强，我不信还有人比我更短(不要误解)：

``` rust
use std::fs;
use std::io;

fn read_username_from_file() -> Result<String, io::Error> {
    // read_to_string是定义在std::io中的方法，因此需要在上面进行引用
    fs::read_to_string("hello.txt")
}
```

从文件读取数据到字符串中，是比较常见的操作，因此 Rust 标准库为我们提供了 fs::read_to_string 函数，该函数内部会打开一个文件、创建 String、读取文件内容最后写入字符串并返回，因为该函数其实与本章讲的内容关系不大，因此放在最后来讲，其实只是我想震你们一下 `:)`

? 用于 Option 的返回
? 不仅仅可以用于 Result 的传播，还能用于 Option 的传播，再来回忆下 Option 的定义：

``` rust
pub enum Option<T> {
    Some(T),
    None
}
Result 通过 ? 返回错误，那么 Option 就通过 ? 返回 None：

fn first(arr: &[i32]) -> Option<&i32> {
   let v = arr.get(0)?;
 
   Some(v)
}
```

上面的函数中，arr.get 返回一个` Option<&i32>` 类型，因为 ? 的使用，如果 get 的结果是 None，则直接返回 None，如果是 Some(&i32)，则把里面的值赋给 v。

其实这个函数有些画蛇添足，我们完全可以写出更简单的版本：

``` rust
fn first(arr: &[i32]) -> Option<&i32> {
   arr.get(0)
}
```


有一句话怎么说？没有需求，制造需求也要上……大家别跟我学习，这是软件开发大忌。只能用代码洗洗眼了：

``` rust
fn last_char_of_first_line(text: &str) -> Option<char> {
    text.lines().next()?.chars().last()
}
```

上面代码展示了在链式调用中使用 ? 提前返回 None 的用法， .next 方法返回的是 Option 类型：如果返回 Some(&str)，那么继续调用 chars 方法,如果返回 None，则直接从整个函数中返回 None，不再继续进行链式调用。

新手用 ? 常会犯的错误
初学者在用 ? 时，老是会犯错，例如写出这样的代码：

``` rust
fn first(arr: &[i32]) -> Option<&i32> {
   arr.get(0)?
}
```

这段代码无法通过编译，切记：? 操作符需要一个变量来承载正确的值，这个函数只会返回 Some(&i32) 或者 None，只有错误值能直接返回，正确的值不行，所以如果数组中存在 0 号元素，那么函数第二行使用 ? 后的返回类型为 &i32 而不是 Some(&i32)。因此 ? 只能用于以下形式：

``` rust
let v = xxx()?;
xxx()?.yyy()?;
```

带返回值的 main 函数
在了解了 ? 的使用限制后，这段代码你很容易看出它无法编译：

``` rust
use std::fs::File;

fn main() {
    let f = File::open("hello.txt")?;
}
```

运行后会报错:

``` shell  
$ cargo run
   ...
   the `?` operator can only be used in a function that returns `Result` or `Option` (or another type that implements `FromResidual`)
 --> src/main.rs:4:48
  |
3 | fn main() {
  | --------- this function should return `Result` or `Option` to accept `?`
4 |     let greeting_file = File::open("hello.txt")?;
  |                                                ^ cannot use the `?` operator in a function that returns `()`
  |
  = help: the trait `FromResidual<Result<Infallible, std::io::Error>>` is not implemented for `()
```

因为 ? 要求 `Result<T, E>` 形式的返回值，而 main 函数的返回是 ()，因此无法满足，那是不是就无解了呢？

实际上 Rust 还支持另外一种形式的 main 函数：

``` rust
use std::error::Error;
use std::fs::File;

fn main() -> Result<(), Box<dyn Error>> {
    let f = File::open("hello.txt")?;

    Ok(())
}
```

这样就能使用 ? 提前返回了，同时我们又一次看到了`Box<dyn Error>` 特征对象，因为 std::error:Error 是 Rust 中抽象层次最高的错误，其它标准库中的错误都实现了该特征，因此我们可以用该特征对象代表一切错误，就算 main 函数中调用任何标准库函数发生错误，都可以通过 `Box<dyn Error>` 这个特征对象进行返回。

至于 main 函数可以有多种返回值，那是因为实现了 std::process::Termination 特征，目前为止该特征还没进入稳定版 Rust 中，也许未来你可以为自己的类型实现该特征！

## 代码可见性

让我们运行下面(之前)的代码：

``` rust
mod front_of_house {
    mod hosting {
        fn add_to_waitlist() {}
    }
}

pub fn eat_at_restaurant() {
    // 绝对路径
    crate::front_of_house::hosting::add_to_waitlist();

    // 相对路径
    front_of_house::hosting::add_to_waitlist();
}
```

意料之外的报错了，毕竟看上去确实很简单且没有任何问题：

``` shell
error[E0603]: module `hosting` is private
 --> src/lib.rs:9:28
  |
9 |     crate::front_of_house::hosting::add_to_waitlist();
  |                            ^^^^^^^ private module
```

错误信息很清晰：hosting 模块是私有的，无法在包根进行访问，那么为何 front_of_house 模块就可以访问？因为它和 eat_at_restaurant 同属于一个包根作用域内，同一个模块内的代码自然不存在私有化问题(所以我们之前章节的代码都没有报过这个错误！)。

模块不仅仅对于组织代码很有用，它还能定义代码的私有化边界：在这个边界内，什么内容能让外界看到，什么内容不能，都有很明确的定义。因此，如果希望让函数或者结构体等类型变成私有化的，可以使用模块。

Rust 出于安全的考虑，默认情况下，所有的类型都是私有化的，包括函数、方法、结构体、枚举、常量，是的，就连模块本身也是私有化的。在中国，父亲往往不希望孩子拥有小秘密，但是在 Rust 中，**父模块完全无法访问子模块中的私有项，但是子模块却可以访问父模块、父父..模块的私有项。**

### pub 关键字

类似其它语言的 public 或者 Go 语言中的首字母大写，Rust 提供了 pub 关键字，通过它你可以控制模块和模块中指定项的可见性。

由于之前的解释，我们知道了只需要将 hosting 模块标记为对外可见即可：
``` rust
mod front_of_house {
    pub mod hosting {
        fn add_to_waitlist() {}
    }
}

/*--- snip ----*/
```
但是不幸的是，又报错了：

``` shell
error[E0603]: function `add_to_waitlist` is private
  --> src/lib.rs:12:30
   |
12 |     front_of_house::hosting::add_to_waitlist();
   |                           ^^^^^^^^^^^^^^^ private function
```

哦？难道模块可见还不够，还需要将函数 add_to_waitlist 标记为可见的吗？ 是的，没错，模块可见性不代表模块内部项的可见性，模块的可见性仅仅是允许其它模块去引用它，但是想要引用它内部的项，还得继续将对应的项标记为 pub。

在实际项目中，一个模块需要对外暴露的数据和 API 往往就寥寥数个，如果将模块标记为可见代表着内部项也全部对外可见，那你是不是还得把那些不可见的，一个一个标记为 private？反而是更麻烦的多。

既然知道了如何解决，那么我们为函数也标记上 pub：

``` rust
mod front_of_house {
    pub mod hosting {
        pub fn add_to_waitlist() {}
    }
}

/*--- snip ----*/
```

Bang，顺利通过编译，感觉自己又变强了。

结构体和枚举的可见性
为何要把结构体和枚举的可见性单独拎出来讲呢？因为这两个家伙的成员字段拥有完全不同的可见性：

- 将结构体设置为 pub，但它的所有字段依然是私有的
- 将枚举设置为 pub，它的所有字段也将对外可见
原因在于，枚举和结构体的使用方式不一样。如果枚举的成员对外不可见，那该枚举将一点用都没有，因此枚举成员的可见性自动跟枚举可见性保持一致，这样可以简化用户的使用。

而结构体的应用场景比较复杂，其中的字段也往往部分在 A 处被使用，部分在 B 处被使用，因此无法确定成员的可见性，那索性就设置为全部不可见，将选择权交给程序员。

## 在格式化字符串时捕获环境中的值（Rust 1.58 新增）

在以前，想要输出一个函数的返回值，你需要这么做：

``` rust
fn get_person() -> String {
    String::from("sunface")
}
fn main() {
    let p = get_person();
    println!("Hello, {}!", p);                // implicit position
    println!("Hello, {0}!", p);               // explicit index
    println!("Hello, {person}!", person = p);
}
```

问题倒也不大，但是一旦格式化字符串长了后，就会非常冗余，而在 1.58 后，我们可以这么写：

``` rust
fn get_person() -> String {
    String::from("sunface")
}
fn main() {
    let person = get_person();
    println!("Hello, {person}!");
}
```

是不是清晰、简洁了很多？甚至还可以将环境中的值用于格式化参数:

``` rust
let (width, precision) = get_format();
for (name, score) in get_scores() {
  println!("{name}: {score:width$.precision$}");
}
```


但也有局限，它只能捕获普通的变量，对于更复杂的类型（例如表达式），可以先将它赋值给一个变量或使用以前的 name = expression 形式的格式化参数。 目前除了 panic! 外，其它接收格式化参数的宏，都可以使用新的特性。对于 panic! 而言，如果还在使用 2015版本 或 2018版本，那 panic!("{ident}") 依然会被当成 正常的字符串来处理，同时编译器会给予 warn 提示。而对于 2021版本 ，则可以正常使用:

``` rust
fn get_person() -> String {
    String::from("sunface")
}
fn main() {
    let person = get_person();
    panic!("Hello, {person}!");
}
```
输出:

``` shell
thread 'main' panicked at 'Hello, sunface!', src/main.rs:6:5
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace

```