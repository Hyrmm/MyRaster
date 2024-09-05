### 1、前言

​	本项目是一个基于`TypeScript`、浏览器`Canvas`，完全软光栅器实现。当然现实其实已经有很多非常出色的软光栅的项目，但难于这些项目依赖`C++`或一些图形库(`GLFW`)的支撑，学习成本较大,尤其我这样很少接触这些。如果基于浏览器`Canvas`渲染反馈，`JavaScript`实现光栅逻辑，基本上不需要配置复杂的环境。而且在调试上也有着巨大的优势，如利用浏览器的`Devtools`。

​	当然本项目适用于拥有一定的图形学基础、线代基础，因为在本文后部分，基于此项目会粗略详解重要实现的部分，所以关于图形学、线代不会提及。但是，此项目也是我本人在入门完图形学(`Games101`)、以及拜读另一个软光栅项目`tinyrender`有感而发，用自己擅长的技术栈也去实现一个软光栅，在后面我也会分享一下我的学习路线，以及我的参考文章。

​	关于上面分别提到了`TypeScript`和`JavaScript`，原因是本项目是遵循工程化、模块化标准的一个Web前端项目，所以本质上最好打包后得到还是一个`Html`文件以及引用了一些`JavaScript`脚本文件，具体描述参考下方关于项目描述的介绍

### 2、项目描述

​	基于`TypeScript`，`ESM`模块化标准，最后使用第三方库`rollup`等周边工具构建最终JavaScript单脚本文件，使用准备模板`Html`文件引入该脚本文件，当然静态文件`Html`已提前包含`Cavans`元素，因为此后渲染反馈载体都使用的是`Cavans`元素

 	此外为了提高开发便利性，如观察反馈效果、源码调试，使用`nodemon` 做热重载刷新，且构建后`JavaScript`带持有源码`TypeScript`映射的`SourceMap`文件

​	本项目尽可能的不使用第三方库，唯一的模型解析除外，本项目模型文件使用的是.obj格式，所以采用了是`webgl-obj-loader`第三方库

#### 2.1项目依赖

```json
{
  "dependencies": {
    "webgl-obj-loader": "^2.0.8"
  },
  "devDependencies": {
    "@rollup/plugin-commonjs": "^26.0.1",
    "@rollup/plugin-node-resolve": "^15.2.3",
    "@rollup/plugin-typescript": "^11.1.6",
    "nodemon": "^3.1.4",
    "rollup": "^4.21.0",
    "typescript": "^5.5.4"
  }
}
```

#### 2.2项目结构

```
├── dist			//工程化打包后输出的目录,用浏览器打开.html静态文件，即可看到效果
├── src				//工程化入库
│   ├── core		//核心的模块，如camera、raster、shader等
│   ├── math		//数学计算相关模块vector、matrix等
│   ├── model		//模型源文件
│   ├── utils		//工具函数、相关数据结构等
│   ├── app.ts		//主入口
```

### 3、项目解析

#### 3.1 渲染载体

​	渲染的最终目标是视觉反馈，也就是图形显示的载体，在`Html`中 `Canvas`元素提供了一种渲染上下文`CanvasRenderingContext2D`，通过 `canvas.getContext("2d")`获取。随后将要渲染的帧数属于通过`context.putImageData(frameData)`提交即可显示此次帧数据，`frameData`是一个`ImageData`对象，该对象可以理解成是一个w*h分辨率的二维数组，数组每连续**四位**元素记录坐标x,y像素上的的`RGBA`值。每个元素占用1字节8位，也就是我们常用的纹理格式`RGBA8888`。

​	通过`new ImageData(width, height)`即可得到一个`width`X`height`的数据,`ImageData`通过数组形式下标访问或修改元素值，如下例，生成的一个 100 * 100 ，颜色为红色的帧数据

​	具体使用以及详解可在`MDN`官网查询

```typescript
const frameData  = new ImageData(100, 100)
for (let offset = 0; offset < frameData.data.length; offset += 4) {
	const [rIdx, gIdx, bIdx, aIdx] = [offset + 0, offset + 1, offset + 2, offset + 3]
	frameData.data[rIdx] = 255
	frameData.data[gIdx] = 0
	frameData.data[bIdx] = 0
	frameData.data[aIdx] = 255
}
const context = canvas.getContext("2d")
context.putImageData(frameData)
```

#### 3.2 渲染主循环

​	有了渲染载体，只需要在渲染主循环中变化帧数据，然后每次渲染将该数据提交给渲染上下文即可达到渲染效果。关于渲染主循环实现方式很多计时器、定时器都可以，但是本项目采用的是浏览器提供方法`window.requestAnimationFrame`，好处在于此方法执行频率可以匹配我们显示器刷新频率,且很方便我们统计当前帧数信息，参考下面代码，位于项目`App.ts`文件

```typescript
class App {

    private static raster: Raster
    private static isMouseMoving: boolean = false

    public static init(canvas: HTMLCanvasElement) {
        const context = canvas.getContext("2d") as CanvasRenderingContext2D
        this.raster = new Raster(canvas.width, canvas.height, context)
    }

    public static start() {

        let last = 0

        const loop = (timestamp: number) => {
            const delt = timestamp - last
            document.getElementById("fps")!.innerText = `FPS:${(1000 / delt).toFixed(0)}`
            this.mainLoop()
            last = timestamp
            requestAnimationFrame(loop)
        }

        loop(0)
    }
    
    public static mainLoop() {
        this.raster.render()
    }
}
```

​	通过`requestAnimationFrame`每帧数执行我们的渲染主循环，执行完此次渲染逻辑后，随机注册下一帧的渲染逻辑，这样保证每帧渲染是连续性，且是有次序的，这也意味着若某一帧渲染耗时太久也会影响下一帧渲染时机，这也是我必须要保证的逻辑

​	此后，每帧循环执行的Raster的render方法，也是我们渲染的方法，看如下render 的实现：

```typescript
export class FrameBuffer {

    private data: ImageData

    constructor(width: number, height: number) {
        this.data = new ImageData(width, height)
    }

    public get frameData(): ImageData {
        return this.data
    }
}

export class Raster {

    private width: number
    private height: number

    private frameBuffer: FrameBuffer
    
    private context: CanvasRenderingContext2D

    constructor(w: number, h: number, context: CanvasRenderingContext2D) {

        this.width = w
        this.height = h

        this.context = context
        this.frameBuffer = new FrameBuffer(w, h)
    }


    public clear() {
        for (let offset = 0; offset < this.frameBuffer.frameData.data.length; offset += 4) {
            const [rIdx, gIdx, bIdx, aIdx] = [offset + 0, offset + 1, offset + 2, offset + 3]
            this.frameBuffer.frameData.data[rIdx] = 0
            this.frameBuffer.frameData.data[gIdx] = 0
            this.frameBuffer.frameData.data[bIdx] = 0
            this.frameBuffer.frameData.data[aIdx] = 255
        }
    }

    public render() {
        // 清理帧缓冲区
        this.clear()
	
        // 提交帧数据
        this.context.putImageData(this.frameBuffer.frameData, 0, 0)
    }

}
```

> 注意对帧数据用类FrameBuffer进行包装，方便后续提供一些其他操作方法

如上，Raster每帧在用黑色填充当前帧数据，然后将当前帧数据提交，因为目前在此中间比没有其他操作，所以目前我们看到`Cavans`一直处于黑色，且页面左上方会事实显示我们当前渲染的帧数
