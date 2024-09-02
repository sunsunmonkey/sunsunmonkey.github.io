# CloudIDE 信息安全

## 水印

### 方案一：

通过主题修改（目前看来可能不太适合，没发改背景图，只能改颜色）

### 方案二：

市面上的改背景的插件：

参考了源码 [vscode-background](https://github.com/shalldie/vscode-background) 和 [vscode-background-cover](https://github.com/AShujiao/vscode-background-cover) 发现他们改背景都是比较 hack 的方式

就是改 vscode 底层源码的 css 文件

![code](/imgs/internship/cloudIDE/code.png)
![finder](/imgs/internship/cloudIDE/finder.png)

但对于我们来说可能就要动 cloudIDE 的 vscode 镜像来做，类似的方案：[市面上的水印方案](https://github.com/Ricbet/blog/blob/master/src/article/13.%E4%BB%8E%E6%B0%B4%E5%8D%B0%E6%8F%92%E4%BB%B6%E5%88%B0%E4%BF%AE%E6%94%B9CloudStudio%E6%9E%84%E5%BB%BA%E6%96%B9%E5%BC%8F.md)

### 方案三

用`vscode.window.createTextEditorDecorationType`

[createTextEditorDecorationType](https://github.com/microsoft/vscode-extension-samples/blob/main/decorator-sample/USAGE.md) 用法

就是每行在后面加东西

就像这样，如果单从插件角度来看这种方式是不错的解法

示例代码

```ts
import \* as vscode from "vscode";

let watermarkDecorationType: vscode.TextEditorDecorationType | undefined;

export function activate(context: vscode.ExtensionContext) {
console.log("Watermark extension is now active!");

const addWatermark = () => {
if (watermarkDecorationType) {
vscode.window.showWarningMessage("Watermark is already added.");
return;
}
console.log(new vscode.ThemeColor("editorHint.foreground"));
watermarkDecorationType = vscode.window.createTextEditorDecorationType({
after: {
contentText: "Watermark",
color: "rgba(0, 0, 0, 1)",
fontStyle: "italic",
margin: "0 10px 0 0",
},
});

    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
      const lineCount = activeEditor.document.lineCount;
      const decorationOptions: vscode.DecorationOptions[] = [];
      for (let i = 0; i < lineCount; i++) {
        const line = activeEditor.document.lineAt(i);
        const decoration = { range: line.range };
        decorationOptions.push(decoration);
      }
      activeEditor.setDecorations(watermarkDecorationType, decorationOptions);
    }

    vscode.window.showInformationMessage("Watermark added successfully!");

};

const removeWatermark = () => {
if (watermarkDecorationType) {
watermarkDecorationType.dispose();
watermarkDecorationType = undefined;
vscode.window.showInformationMessage("Watermark removed successfully!");
} else {
vscode.window.showWarningMessage("No watermark to remove.");
}
};

context.subscriptions.push(
vscode.commands.registerCommand("watermark.addWatermark", addWatermark),
vscode.commands.registerCommand(
"watermark.removeWatermark",
removeWatermark
)
);
addWatermark();
// Automatically add watermark when a new editor is opened
vscode.window.onDidChangeActiveTextEditor((editor) => {
if (editor && watermarkDecorationType) {
const lineCount = editor.document.lineCount;
const decorationOptions: vscode.DecorationOptions[] = [];
for (let i = 0; i < lineCount; i++) {
const line = editor.document.lineAt(i);
const decoration = { range: line.range };
decorationOptions.push(decoration);
}
editor.setDecorations(watermarkDecorationType, decorationOptions);
}
});
}

export function deactivate() {
if (watermarkDecorationType) {
watermarkDecorationType.dispose();
}
}
```

- 发现的 issue 但似乎还没实现

[还在走的 vscode 水印提案](https://github.com/VSCodeTriageBot/testissues/issues/17458)

## 防复制

防复制似乎直接覆写了这个 editor.action.clipboardCopyAction 即可，除了复制可能剪切也要做类似处理

相关事件

```ts
import \* as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
let disposable = vscode.commands.registerCommand('editor.action.clipboardCopyAction', async () => {
const editor = vscode.window.activeTextEditor;

        if (editor) {
            const selection = editor.selection;
            const selectedText = editor.document.getText(selection);

            // 定义文本量的阈值
            const TEXT_LIMIT = 100; // 例如：1000字符

            if (selectedText.length <= TEXT_LIMIT) {
                // 如果文本量小于等于阈值，手动复制文本到剪贴板
                 await vscode.env.clipboard.writeText(selectedText);
                vscode.window.showInformationMessage('Text copied to clipboard.');
            } else {
                // 如果文本量大于阈值，显示警告信息
                vscode.window.showWarningMessage('Text is too large to copy!');
            }
        }
    });

    context.subscriptions.push(disposable);

}

export function deactivate() {}

import \* as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
let disposable = vscode.commands.registerCommand('editor.action.clipboardCutAction', async () => {
const editor = vscode.window.activeTextEditor;

        if (editor) {
            const selection = editor.selection;
            const selectedText = editor.document.getText(selection);

            // 定义文本量的阈值
            const TEXT_LIMIT = 100; // 例如：1000字符

            if (selectedText.length <= TEXT_LIMIT) {
                // 如果文本量小于等于阈值，手动复制文本到剪贴板
                await vscode.env.clipboard.writeText(selectedText);
                await editor.edit(editBuilder => {
                    editBuilder.delete(selection);
                });
                vscode.window.showInformationMessage('Text cut to clipboard.');
            } else {
                // 如果文本量大于阈值，显示警告信息
                vscode.window.showWarningMessage('Text is too large to copy!');
            }
        }
    });

    context.subscriptions.push(disposable);

}

export function deactivate() {}
```

## 隐藏文件

### vscode 侧

文件隐藏目前看来似乎就是通过插件改变 setting.json 来隐藏部分文件，vscode 内部配置使其不可见

```json
"files.exclude": {
	"node_modules": true,
	"test.html": true
 },
```

### linux 侧

linux 的隐藏文件就是在名称前加个 " . " 但 ls -a 仍然可以访问

目前想到就是把.zshrc 或者.bashrc 改个 alias

使用别名覆盖  ls  命令 `alias ls='/usr/local/bin/custom_ls'` 就可以隐藏文件当然 "cat" "cd" 等命令还是可以看到不过都可能都可以按类似方式复写

效果展示（隐藏.hiddenfile）：

云环境是 root 权限

```shell
~ whoami

root
```
