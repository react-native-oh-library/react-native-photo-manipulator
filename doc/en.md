> Template version: v0.3.0

<p align="center">
  <h1 align="center"> <code>react-native-photo-manipulator</code> </h1>
</p>

This project is based on [react-native-photo-manipulator@1.9.2](https://github.com/guhungry/react-native-photo-manipulator/tree/v1.9.2).

Please go to the Releases release address of the third-party library to view the supporting version information: [@eact-native-ohos/react-native-photo-manipulator Releases](https://github.com/react-native-oh-library/react-native-photo-manipulator/releases). For older versions that are not published to npm, install the tgz package by referring to the [Installation Guide](/tgz-usage-en.md).

| Version                   | Releases info                                      |  Support RN version                    |
| ------------------------- | ------------------------------------------------- |  -------------------------- |
| 1.9.3                 | [@react-native-ohos/react-native-photo-manipulator Releases](https://github.com/react-native-oh-library/react-native-photo-manipulator/releases)  | 0.72/0.77 |

## 1. Installation and Usage

Go to the project directory and execute the following instruction:

#### **npm**

```bash
npm install @react-native-ohos/react-native-photo-manipulator
```

#### **yarn**

```bash
yarn add @react-native-ohos/react-native-photo-manipulator
```

The following code shows the basic use scenario of the repository:

> [!WARNING] The name of the imported repository remains unchanged.

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

This step provides guidance for manually configuring native dependencies.

Open the `harmony` directory of the HarmonyOS project in DevEco Studio.

### 2.1 Overrides RN SDK

To ensure the project relies on the same version of the RN SDK, you need to add an `overrides` field in the project's root `oh-package.json5` file, specifying the RN SDK version to be used. The replacement version can be a specific version number, a semver range, or a locally available HAR package or source directory.

For more information about the purpose of this field, please refer to the [official documentation](https://developer.huawei.com/consumer/en/doc/harmonyos-guides-V5/ide-oh-package-json5-V5#en-us_topic_0000001792256137_overrides).

```json
{
  "overrides": {
    "@rnoh/react-native-openharmony": "^0.72.38" // ohpm version
    // "@rnoh/react-native-openharmony" : "./react_native_openharmony.har" // a locally available HAR package
    // "@rnoh/react-native-openharmony" : "./react_native_openharmony" // source code directory
  }
}
```

### 2.2 Introducing Native Code

Currently, two methods are available:

- Use the HAR file.
- Directly link to the source code。

Method 1 (recommended): Use the HAR file.

> [!TIP] The HAR file is stored in the `harmony` directory in the installation path of the third-party library.

Open `entry/oh-package.json5` file and add the following dependencies:

```json
"dependencies": {
    "@react-native-ohos/react-native-photo-manipulator": "file:../../node_modules/@react-native-ohos/react-native-photo-manipulator/harmony/photo_manipulator.har"
  }
```

Click the `sync` button in the upper right corner.

Alternatively, run the following instruction on the terminal:

```bash
cd entry
ohpm install
```

Method 2: Directly link to the source code.

> [!TIP] For details, see [Directly Linking Source Code](/link-source-code.md).

### 2.3 Configuring CMakeLists and Introducing RNPhotoManipulatorPackage

Open `entry/src/main/cpp/CMakeLists.txt` and add the following code:

```diff
+ set(OH_MODULES "${CMAKE_CURRENT_SOURCE_DIR}/../../../oh_modules")

# RNOH_BEGIN: manual_package_linking_1
+ add_subdirectory("${OH_MODULES}/@react-native-ohos/react-native-photo-manipulator/src/main/cpp" ./photo-manipulator)
# RNOH_END: manual_package_linking_1

# RNOH_BEGIN: manual_package_linking_2
+ target_link_libraries(rnoh_app PUBLIC rnoh_photo_manipulator)
# RNOH_END: manual_package_linking_2
```

Open `entry/src/main/cpp/PackageProvider.cpp` and add the following code:

```diff
#include "RNOH/PackageProvider.h"
#include "generated/RNOHGeneratedPackage.h"
+ #include "RNPhotoManipulatorPackage.h"

using namespace rnoh;

std::vector<std::shared_ptr<Package>> PackageProvider::getPackages(Package::Context ctx) {
    return {
        std::make_shared<RNOHGeneratedPackage>(ctx),
+        std::make_shared<RNPhotoManipulatorPackage>(ctx)
    };
}
```


### 2.4 Introducing RNPhotoManipulatorPackage Package to ArkTS

Open the `entry/src/main/ets/RNPackagesFactory.ts` file and add the following code:

```diff
  ...
+ import {RNPhotoManipulatorPackage} from '@react-native-ohos/react-native-photo-manipulator/ts';

export function createRNPackages(ctx: RNPackageContext): RNPackage[] {
  return [
+   new RNPhotoManipulatorPackage(ctx)
  ];
}
```

### 2.5 Running

Click the `sync` button in the upper right corner.

Alternatively, run the following instruction on the terminal:

```bash
cd entry
ohpm install
```

Then build and run the code.

## 3. Constraints

### 3.1 Compatibility

Check the release version information in the release address of the third-party library: [@react-native-ohos/react-native--photo-manipulator Releases](https://github.com/react-native-oh-library/react-native-photo-manipulator/releases).

> [!TIP] This library needs to be compiled in DevEco Studio 5.0.5 (API13) or later.


## 4. Properties (If Any)

> [!TIP] The **Platform** column indicates the platform where the properties are supported in the original third-party library.

> [!TIP] If the value of **HarmonyOS Support** is **yes**, it means that the HarmonyOS platform supports this property; **no** means the opposite; **partially** means some capabilities of this property are supported. The usage method is the same on different platforms and the effect is the same as that of iOS or Android.

> [!TIP] Supports input image formats: jpg、jpeg、png. Supports exporting image formats:jpeg、png.

| Name        | Description                                       | Type   | Required | Platform | HarmonyOS Support |
| ----------- | ------------------------------------------------- | ------ | -------- | -------- | ----------------- |
| batch | Crop, resize and do operations (overlay and printText) on image. | function | no      | All | yes          |
| crop | Crop image with cropRegion and resize to targetSize if specified. | function | no     | All | yes        |
| flipImage | Flip Image horizontally or vertically. | function | no     | All | yes        |
| rotateImage | rotate Image. | function | no     | All | yes        |
| overlayImage | Overlay image on top of background image. | function | no     | All | yes        |
| printText | Print texts into image. | function | no     | All | yes        |
| optimize | Save result image with specified quality between `0 - 100` in jpeg format. | function | no     | All | yes        |
 

## 5. Known Issues

- [X] The printText interface cannot set the reading direction of Arabic strings due to drawing, resulting in incorrect rendering of Arabic strings.  issue: [issue#6](https://github.com/react-native-oh-library/react-native-photo-manipulator/issues/1)
.

## 6. License

This project is licensed under [MIT License](https://github.com/guhungry/react-native-photo-manipulator/blob/v1.9.2/LICENSE).
