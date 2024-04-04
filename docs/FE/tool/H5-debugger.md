# H5的真机调试

## 访问电脑上的开发环境
其实就是电脑本机的服务器，然后让手机去访问
然后我们只需在一个网络里就可以
然后再vite加一个 --host
```
vite dev --host
```
![](https://cdn.nlark.com/yuque/0/2024/png/33634946/1712205350863-8e5ff4da-f4c8-4516-9a13-9c20b04457e4.png#averageHue=%231f1f1f&clientId=ue64de280-851b-4&from=paste&id=ue0f0d6dc&originHeight=213&originWidth=1033&originalType=url&ratio=1.5&rotation=0&showTitle=false&status=done&style=none&taskId=u931e0a9d-eea5-4a5d-b594-1513be38e64&title=)
然后出现这个一般这个是172开头的，或者cmd里ipconfig查看Ipv4地址
![](https://cdn.nlark.com/yuque/0/2024/png/33634946/1712205350872-c4092834-01d1-41aa-8921-8dbfc2a3ca90.png#averageHue=%2312100f&clientId=ue64de280-851b-4&from=paste&id=u358475ba&originHeight=171&originWidth=696&originalType=url&ratio=1.5&rotation=0&showTitle=false&status=done&style=none&taskId=ub5d5e1f4-c750-4d8e-b865-28e99eadce3&title=)
然后就可以在手机上查看了

## usb接手机进行调试
这里主要讲安卓因为我手机是安卓🤫
用数据线插好（我遇到过有些数据线识别不了的）
然后打开开发者选项 -> usb调试
插上线打开chrome://inspect/这个地址就可以了，同时记得给手机授权
![](https://cdn.nlark.com/yuque/0/2024/png/33634946/1712205350863-f1d944b0-afef-4755-8873-e30e047712c5.png#averageHue=%23b9bcb6&clientId=ue64de280-851b-4&from=paste&id=u734001cf&originHeight=588&originWidth=740&originalType=url&ratio=1.5&rotation=0&showTitle=false&status=done&style=none&taskId=u6306b6d5-2dd0-4587-90a5-4c5043f57f5&title=)
然后在chrome://inspect/
![](https://cdn.nlark.com/yuque/0/2024/png/33634946/1712205350811-ace37b0f-e2c2-4428-89ce-5a8591825954.png#averageHue=%23fbfcfb&clientId=ue64de280-851b-4&from=paste&id=ue3f30bae&originHeight=583&originWidth=758&originalType=url&ratio=1.5&rotation=0&showTitle=false&status=done&style=none&taskId=u8ff3f06d-4f46-4b92-8c27-90a3cbc3e38&title=)
浏览器⾥的网页，或者 APP 调试包的 webview 的⽹⻚都会列出来。 点击 inspect 就可以调试了： 可以审查元素：
![](https://cdn.nlark.com/yuque/0/2024/png/33634946/1712205350788-f9030fdc-46ee-44d5-a7d9-de605b10814f.png#averageHue=%23d9c69f&clientId=ue64de280-851b-4&from=paste&id=u31e8a82d&originHeight=484&originWidth=709&originalType=url&ratio=1.5&rotation=0&showTitle=false&status=done&style=none&taskId=u02bd4ec8-938b-43dc-82f0-1a912cf003d&title=)
