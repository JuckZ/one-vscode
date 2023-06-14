# TimeSavior  

This is the README for All-in-One VScode Extension.

## Features

It's a demo now.

<!-- 
1. **Auto-Complete**  
    Auto-complete for all languages.  
    ![Auto-Complete](images/auto-complete.gif)
2. **Theme**
    Theme for all languages.  
    ![Theme](images/theme.gif)
3. **Icon**  
    Icon for all languages.  
    ![Icon](images/icon.gif)
4. **Code Snippets**  
    Code snippets for all languages.  
    ![Code Snippets](images/code-snippets.gif)
5. **Code Runner**  
    Run code in the editor.  
    ![Code Runner](images/code-runner.gif)
6. **Code Formatter**  
    Format code in the editor.  
    ![Code Formatter](images/code-formatter.gif)
7. **Code Linter**
    Code linter for all languages.
    ![Code Linter](images/code-linter.gif)
8. **Code Debugger**
    Code debugger for all languages.
    ![Code Debugger](images/code-debugger.gif)
9. **Code Beautifier**
    Code beautifier for all languages.
    ![Code Beautifier](images/code-beautifier.gif)
10. **Code Minifier**
    Code minifier for all languages.
    ![Code Minifier](images/code-minifier.gif) -->

## Extension Settings

* `myExtension.enable`: Enable/disable this extension.
* `myExtension.thing`: Set to `blah` to do something.

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](https://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

## TODO

下面有几个npmjs的Node.js 模块，可以帮你实现VS Code插件。你可以在插件的dependencies部分包含进去。
可以先调研这些库是否已经在新版中有替代方案，比如 import * as vscode from 'vscode'，可能已经包含了某些功能。

vscode-nls - 支持插件的国际化和本地化。
vscode-uri - 使用VS Code实现的URI。
jsonc-parser - 允许带注释的JSON检查器。
request-light - 带代理支持的轻量级Node.js请求库。
vscode-extension - 提供VS Code 插件的持续遥测监控报告。
vscode-languageclient - 轻松地将语言服务器
语言服务器
插件模式中使用C/S结构的的服务器端，用于高消耗的特殊插件场景，如语言解析、智能提示等。与之相对，客户端则是普通的插件，两者通过VSCode的API进行通信。
绑定到语言服务器
语言服务器
插件模式中使用C/S结构的的服务器端，用于高消耗的特殊插件场景，如语言解析、智能提示等。与之相对，客户端则是普通的插件，两者通过VSCode的API进行通信。
协议上。

* [ ] 拆分插件，将本插件作为Extension Packs

### yo code

New Web Extension (TypeScript)
New Notebook Renderer (TypeScript)
New Language Pack (Localization)  暂时不研究

**Enjoy!**
