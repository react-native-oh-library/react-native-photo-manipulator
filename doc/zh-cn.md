> 模板版本：v0.3.0

<p align="center">
  <h1 align="center"> <code>react-native-photo-manipulator</code> </h1>
</p>


本项目基于 [react-native-photo-manipulator@1.9.2](https://github.com/guhungry/react-native-photo-manipulator/tree/v1.9.2) 开发。

请到三方库的 Releases 发布地址查看配套的版本信息：[@react-native-ohos/react-native-photo-manipulator Releases](https://github.com/react-native-oh-library/react-native-photo-manipulator/releases)。对于未发布到npm的旧版本，请参考[安装指南](/tgz-usage.md)安装tgz包。

| 三方库版本                 | 发布信息                                      |  支持RN版本                 |
| ------------------------- | ------------------------------------------------- |  -------------------------- |
| 1.9.3                 | [@react-native-ohos/react-native-photo-manipulator Releases](https://github.com/react-native-oh-library/react-native-photo-manipulator/releases)  | 0.72/0.77 |

## 1. 安装与使用

进入到工程目录并输入以下命令：

#### **npm**

```bash
npm install @react-native-ohos/react-native-photo-manipulator
```

#### **yarn**

```bash
yarn add @react-native-ohos/react-native-photo-manipulator
```

下面的代码展示了这个库的基本使用场景：

> [!WARNING] 使用时 import 的库名不变。

```js
import * as React from 'react';
import { Image, Text } from 'react-native';
import styles, { ImageResultProps } from '../App.styles';
import { noop } from '../utils';
import PhotoManipulator, {
  FlipMode,
  MimeType,
} from 'react-native-photo-manipulator';
import { IMAGE } from './settings';

export default React.memo(function ExampleFlip() {
  const [imageBoth, setImageBoth] = React.useState<string | null>(null);
  const [imageHorizontal, setImageHorizontal] = React.useState<string | null>(
    null
  );
  const [imageVertical, setImageVertical] = React.useState<string | null>(null);

  React.useEffect(() => {
    const operation = async () => {
      setImageBoth(
        await PhotoManipulator.flipImage(IMAGE, FlipMode.Both, MimeType.PNG)
      );
      setImageHorizontal(
        await PhotoManipulator.flipImage(IMAGE, FlipMode.Horizontal)
      );
      setImageVertical(
        await PhotoManipulator.flipImage(IMAGE, FlipMode.Vertical)
      );
    };

    operation().then(noop).catch(console.log);
  }, []);

  return (
    <>
      {typeof imageHorizontal === 'string' ? (
        <Text style={styles.exampleDescription}>Horizontal</Text>
      ) : null}
      {typeof imageHorizontal === 'string' ? (
        <Image
          testID="flipHorizontalResult"
          {...ImageResultProps}
          source={{ uri: imageHorizontal }}
        />
      ) : null}
      {typeof imageVertical === 'string' ? (
        <Text style={styles.exampleDescription}>Vertical</Text>
      ) : null}
      {typeof imageVertical === 'string' ? (
        <Image
          testID="flipVerticalResult"
          {...ImageResultProps}
          source={{ uri: imageVertical }}
        />
      ) : null}
      {typeof imageBoth === 'string' ? (
        <Text style={styles.exampleDescription}>Both</Text>
      ) : null}
      {typeof imageBoth === 'string' ? (
        <Image
          testID="flipBothResult"
          {...ImageResultProps}
          source={{ uri: imageBoth }}
        />
      ) : null}
    </>
  );
});

```

## 2. Manual Link

此步骤为手动配置原生依赖项的指导。

首先需要使用 DevEco Studio 打开项目里的 HarmonyOS 工程 `harmony`。

### 2.1. Overrides RN SDK

为了让工程依赖同一个版本的 RN SDK，需要在工程根目录的 `oh-package.json5` 添加 overrides 字段，指向工程需要使用的 RN SDK 版本。替换的版本既可以是一个具体的版本号，也可以是一个模糊版本，还可以是本地存在的 HAR 包或源码目录。

关于该字段的作用请阅读[官方说明](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/ide-oh-package-json5-V5#zh-cn_topic_0000001792256137_overrides)：

```json
{
  "overrides": {
    "@rnoh/react-native-openharmony": "^0.72.38" // ohpm 在线版本
    // "@rnoh/react-native-openharmony" : "./react_native_openharmony.har" // 指向本地 har 包的路径
    // "@rnoh/react-native-openharmony" : "./react_native_openharmony" // 指向源码路径
  }
}
```

### 2.2. 引入原生端代码

目前有两种方法：

- 通过 har 包引入；
- 直接链接源码。

方法一：通过 har 包引入（推荐）

> [!TIP] har 包位于三方库安装路径的 `harmony` 文件夹下。

打开`entry/oh-package.json5`，添加以下依赖：

```json
"dependencies": {
    "@react-native-ohos/react-native-photo-manipulator": "file:../../node_modules/@react-native-ohos/react-native-photo-manipulator/harmony/photo_manipulator.har"
  }
```

点击右上角的 `sync` 按钮，

或者在命令行终端执行：

```bash
cd entry
ohpm install
```

方法二：直接链接源码

> [!TIP] 如需使用直接链接源码，请参考[直接链接源码说明](/link-source-code.md)。

### 2.3. 配置 CMakeLists 和引入 RNPhotoManipulatorPackage

打开 `entry/src/main/cpp/CMakeLists.txt`，添加：

```diff
+ set(OH_MODULES "${CMAKE_CURRENT_SOURCE_DIR}/../../../oh_modules")

# RNOH_BEGIN: manual_package_linking_1
+ add_subdirectory("${OH_MODULES}/@react-native-ohos/react-native-photo-manipulator/src/main/cpp" ./photo-manipulator)
# RNOH_END: manual_package_linking_1

# RNOH_BEGIN: manual_package_linking_2
+ target_link_libraries(rnoh_app PUBLIC rnoh_photo_manipulator)
# RNOH_END: manual_package_linking_2
```

打开 `entry/src/main/cpp/PackageProvider.cpp`，添加：

```diff
#include "RNOH/PackageProvider.h"
#include "generated/RNOHGeneratedPackage.h"
+ #include "RNPhotoManipulatorPackage.h"

using namespace rnoh;

std::vector<std::shared_ptr<Package>> PackageProvider::getPackages(Package::Context ctx) {
    return {
      std::make_shared<RNOHGeneratedPackage>(ctx),
+      std::make_shared<RNPhotoManipulatorPackage>(ctx)
    };
}
```

###  2.4. 在 ArkTs 侧引入 RNPhotoManipulatorPackage

打开 `entry/src/main/ets/RNPackagesFactory.ts`，添加：

```diff
  ...
+ import {RNPhotoManipulatorPackage} from '@react-native-ohos/react-native-photo-manipulator/ts';

export function createRNPackages(ctx: RNPackageContext): RNPackage[] {
  return [
+   new RNPhotoManipulatorPackage(ctx)
  ];
}
```

### 2.5. 运行

点击右上角的 `sync` 按钮，

或者在命令行终端执行：

```bash
cd entry
ohpm install
```

然后编译、运行即可。

## 3. 约束与限制

### 3.1. 兼容性

请到三方库相应的 Releases 发布地址查看 Release 配套的版本信息：[@react-native-ohos/react-native--photo-manipulator Releases](https://github.com/react-native-oh-library/react-native-photo-manipulator/releases)。

> [!TIP] 本库需要在DevEco Studio 5.0.5(API13)及以上版本编译。

## 4. 属性

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "HarmonyOS Support"列为 yes 表示 HarmonyOS 平台支持该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

> [!TIP] 支持输入图片格式: jpg、jpeg、png。 支持输出图片格式:jpeg、png。

| Name        | Description                                       | Type   | Required | Platform | HarmonyOS Support |
| ----------- | ------------------------------------------------- | ------ | -------- | -------- | ----------------- |
| batch | 对图像进行裁剪、调整大小以及操作（覆盖和打印文本）。 | function | no      | All | yes          |
| crop | 使用 cropRegion 裁剪图像，并在指定时调整到 targetSize。 | function | no     | All | yes        |
| flipImage | 水平或垂直翻转图像。 | function | no     | All | yes        |
| rotateImage | 旋转图像。 | function | no     | All | yes        |
| overlayImage | 将图像叠加在背景图像上。 | function | no     | All | yes        |
| printText | 将文本打印到图像中。 | function | no     | All | yes        |
| optimize | 以指定的质量（0-100）将结果图像保存为 JPEG 格式。 | function | no     | All | yes        |
      
## 5. 遗留问题
- [X] printText接口因drawing无法设置阿拉伯字符串的读取方向，导致绘制的阿拉伯字符串错误。 问题：[issue#6](https://github.com/react-native-oh-library/react-native-photo-manipulator/issues/1)。

## 6. 开源协议

本项目基于 [The MIT License (MIT)](https://github.com/guhungry/react-native-photo-manipulator/blob/v1.9.2/LICENSE)，请自由地享受和参与开源。