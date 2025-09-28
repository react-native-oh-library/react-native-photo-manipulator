/**
 * MIT License
 *
 * Copyright (C) 2025 Huawei Device Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import font from '@ohos.font';
import image from '@ohos.multimedia.image';
import { Context } from '@kit.AbilityKit';
import resourceManager from '@ohos.resourceManager';
import { AnyThreadTurboModule, AnyThreadTurboModuleContext } from '@rnoh/react-native-openharmony/ts';

import { ErrorCode } from './ErrorCode';
import { RNImageSRC } from './RNImageSRC';
import { TextOptions } from './TextOptions';
import { PhotoManipulatorError } from './PhotoManipulatorError';
import { obtainImageInfoFromPath, pixelMapToUrl } from './Utils';
import { CropRegion, TargetSize, ImagePosition, OverlayTextStyle } from './RegionItem'

import { flip } from './FlipImageUtils';
import { setOptimize } from './OptimizeUtils'
import { overlayImage } from './OverlayUtil';
import { rotateImage } from './RotateImageUtil';
import { handleCropRegionAndTargetSize } from './CropUtil';
import { printTextByStyle, registerFonts } from './PrintTextUtils';

export class PhotoManipulatorTurboModule extends AnyThreadTurboModule{
  private resourceManager: resourceManager.ResourceManager;
  private context: Context;
  private fonts: font.FontOptions[] = Array<font.FontOptions>()
  
  constructor(ctx: AnyThreadTurboModuleContext) {
    super(ctx)
    this.context = this.ctx.uiAbilityContext;
    globalThis.context = this.context
    this.resourceManager = this.context.resourceManager;
    //初始化加载字体文件
    this.fonts = registerFonts(this.resourceManager, this.context);
  }

  async crop(imageUrl: string, cropRegion: CropRegion, targetSize?: TargetSize, mimeType?: string): Promise<string> {
    let imageSRC: RNImageSRC = await obtainImageInfoFromPath(this.resourceManager, imageUrl);
    let decodingOptions: image.DecodingOptions = {
      editable: true,
      desiredPixelFormat: image.PixelMapFormat.RGBA_8888,
    };
    let dataPixelMap = undefined;
    await imageSRC.imageSource.createPixelMap(decodingOptions).then(async (dataPixelMapParam: image.PixelMap)=>{
      dataPixelMap = dataPixelMapParam;
    });

    let generateImageUrl: string = "";
    if (dataPixelMap) {
      await handleCropRegionAndTargetSize(dataPixelMap, cropRegion, targetSize, mimeType)
        .then(async (cropImagePixelMapResult: image.PixelMap)=>{
          let fileName: string = imageUrl.substring(imageUrl.lastIndexOf('/') + 1, imageUrl.lastIndexOf('.'));
          generateImageUrl = await pixelMapToUrl(this.ctx, cropImagePixelMapResult, mimeType, fileName);
          imageSRC.imageSource.release();
      })
    }
    return generateImageUrl;
  }

  async flipImage(imageUrl: string, mode: string, mimeType?: string ): Promise<string> {
    let imageSRC: RNImageSRC = await obtainImageInfoFromPath(this.resourceManager, imageUrl);
    let generateImageUrl: string = "";
    await flip(imageSRC, mode).then(async (flipImagePixelMap: image.PixelMap) => {
      if (flipImagePixelMap) {
        let fileName: string = imageUrl.substring(imageUrl.lastIndexOf('/') + 1, imageUrl.lastIndexOf('.'));
        generateImageUrl = await pixelMapToUrl(this.ctx, flipImagePixelMap, mimeType, fileName);
        imageSRC.imageSource.release();
      }
    });
    return generateImageUrl;
  }

  async rotateImage(imageUrl: string, mode: string, mimeType?: string): Promise<string> {
    const imageSRC: RNImageSRC = await obtainImageInfoFromPath(this.resourceManager, imageUrl);
    const flipImagePixelMap: image.PixelMap = await rotateImage(imageSRC, mode);
    const fileName: string = imageUrl.substring(imageUrl.lastIndexOf('/') + 1, imageUrl.lastIndexOf('.'));
    const generateImageUrl = await pixelMapToUrl(this.ctx, flipImagePixelMap, mimeType, fileName);
    return generateImageUrl;
  }

  async overlayImage(imageUrl: string, overlay: string, position: Object, mimeType?: string): Promise<string> {
    const flipImagePixelMap: string = await overlayImage(imageUrl, overlay, position as ImagePosition, this.resourceManager, mimeType);
    return flipImagePixelMap;
  }

  async printText(image: string, texts: Object[], mimeType?: string): Promise<string> {
    let TextOptionsArray: TextOptions[] = Array<TextOptions>();
    for (let index = 0; index < texts.length; index++) {
      let overlayTextStyle = texts[index] as OverlayTextStyle;
      let textOptions: TextOptions = new TextOptions(overlayTextStyle)
      TextOptionsArray.push(textOptions);
    }
    const flipImagePixelMap: string = await printTextByStyle(this.resourceManager, this.fonts, image, TextOptionsArray, mimeType);
    return flipImagePixelMap;
  }

  async optimize(imageUrl: string, quality: number): Promise<string> {
    if (imageUrl.endsWith(".jpg") || imageUrl.endsWith(".jpeg")) {
      const fileName: string = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
      const imageSRC: RNImageSRC = await obtainImageInfoFromPath(this.resourceManager, imageUrl);
      const decodingOptions: image.DecodingOptions = {
        editable: true,
        desiredPixelFormat: image.PixelMapFormat.RGBA_8888,
      };
      let dataPixelMap = undefined;
      await imageSRC.imageSource.createPixelMap(decodingOptions).then(async (dataPixelMapParam: image.PixelMap)=>{
        dataPixelMap = dataPixelMapParam;
      });
      let optimizeImagePixelMap: string;
      if (dataPixelMap) {
        optimizeImagePixelMap = await setOptimize(dataPixelMap, fileName, 'image/jpg' , quality);
      }
      return optimizeImagePixelMap;
    } else {
      throw new PhotoManipulatorError(ErrorCode.PARAMS_REQUIRED, "The image format must be jpg format.");
    }
  }

  async batch(image: string, operations: Object[], cropRegion: CropRegion, targetSize?: TargetSize,
    quality?: number, mimeType?: string): Promise<string> {
    image = await this.crop(image, cropRegion, targetSize, mimeType);
    if (operations && operations.length == 0) return image;
    for (let index = 0; index < operations.length; index++) {
      let operation = operations[index];
      switch (operation["operation"] as string) {
        case "text":
          let TextOptionsArray: TextOptions[] = Array<TextOptions>();
          let overlayTextStyle = operation["options"] as OverlayTextStyle;
          let textOptions: TextOptions = new TextOptions(overlayTextStyle);
          TextOptionsArray.push(textOptions);
          image = await printTextByStyle(this.resourceManager, this.fonts, image, TextOptionsArray, mimeType);
          break;
        case "flip":
          image = await this.flipImage(image, operation["mode"], mimeType);
          break;
        case "rotate":
          image = await this.rotateImage(image, operation["mode"], mimeType);
          break;
        case "overlay":
          if (operation["overlay"] && operation["position"]) {
            image = await this.overlayImage(image, operation["overlay"], operation["position"], mimeType);
          }
          break;
        default :
      }
    }
    return image;
  }

}