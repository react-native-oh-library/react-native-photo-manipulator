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

import { drawing } from "@kit.ArkGraphics2D";
import { image } from "@kit.ImageKit";
import { fileUri } from '@kit.CoreFileKit';
import util from '@ohos.util';
import { RNImageSRC } from "./RNImageSRC";
import { Position } from "@kit.ArkUI";
import font from '@ohos.font';
import { getFileExtension, obtainImageInfoFromPath } from "./Utils";
import fs from '@ohos.file.fs';
import { TextOptions } from "./TextOptions";
import { ImagePosition } from "./RegionItem";
import resourceManager from '@ohos.resourceManager';
import { Context } from "@kit.AbilityKit";
import { BusinessError } from "@kit.BasicServicesKit";
import { i18n } from '@kit.LocalizationKit';

export function registerFonts(resManager: resourceManager.ResourceManager, context: Context): font.FontOptions[] {
  let fonts: font.FontOptions[] = Array<font.FontOptions>()
  let fontUrl: string = "assets/assets/fonts"
  try {
    let fontsUrl: string[] = resManager.getRawFileListSync(fontUrl);
    if (fontsUrl) {
      let fileDir = context.filesDir
      for (let index = 0; index < fontsUrl.length; index++) {
        const element = fontsUrl[index];
        if (element.indexOf(".") > 0) {
          const familyName = element.substring(0, element.indexOf("."))
          // write font files to system
          let filePath: string = fontUrl + "/" + element;
          context.resourceManager.getRawFileContent(filePath, (err: BusinessError, value: Uint8Array) => {
            if (err != null) {
              return
            }
            let systemFileUrl = fileDir + "/" + element
            let file = fs.openSync(systemFileUrl, fs.OpenMode.READ_WRITE | fs.OpenMode.CREATE);
            fs.writeSync(file.fd, value.buffer);
            fs.closeSync(file);
            font.registerFont({ familyName: familyName, familySrc: systemFileUrl })
            fonts.push({ familyName: familyName, familySrc: systemFileUrl })
          })
        }
      }
    }
    return fonts;
  } catch (error) {
    let code = (error as BusinessError).code;
    let message = (error as BusinessError).message;
    console.error(`getRawFileContentSync failed, error code: ${code}, message: ${message}.`);
  }
}

export async function printTextByStyle(resourceManager: resourceManager.ResourceManager, fonts: font.FontOptions[],
  backgroundImageUrl: string, texts: TextOptions[], mimeType?: string): Promise<string> {
  try {
    let backgroundImageInfo: RNImageSRC = await obtainImageInfoFromPath(resourceManager, backgroundImageUrl)
    let imageWidth: number = backgroundImageInfo.width;
    let imageHeight: number = backgroundImageInfo.height;
    let emptyArrayBuffer: ArrayBuffer = new ArrayBuffer(imageWidth * imageHeight * 4);
    let pixelMapOpts: image.InitializationOptions = { size: { width: imageWidth, height: imageHeight } }
    let backgroundPixelMap: image.PixelMap = await image.createPixelMap(emptyArrayBuffer, pixelMapOpts);
    let canvas = new drawing.Canvas(backgroundPixelMap);

    let backgroundPosition: ImagePosition = new ImagePosition(0,0);
    await getPixelMap(backgroundImageInfo, canvas, backgroundPosition)
    for (let index = 0; index < texts.length; index++) {
      canvas.save()
      // font name
      let typeFace: drawing.Typeface;
      let textOptions: TextOptions = texts[index];
      if (textOptions.getStyle() && textOptions.getStyle().getFontName() != null && fonts?.length > 0) {
        let fontName: font.FontOptions | undefined =
          fonts.find(data => data.familyName === textOptions.getStyle().getFontName())
        if (fontName) {
          typeFace = drawing.Typeface.makeFromFile(fontName.familySrc.toString());
        }
      }

      if (!typeFace && i18n.Unicode.isRTL(texts[index].getText())) {
        typeFace = drawing.Typeface.makeFromFile("/system/fonts/HarmonyOS_Sans_Naskh_Arabic.ttf");
      }
      textOptions.applyStyle(canvas, typeFace, imageWidth, imageHeight)
      canvas.restore()
    }
    let url: string = await saveImage(backgroundPixelMap, mimeType, 100);
    return new Promise((resolve: (value: string | PromiseLike<string>) => void) => {
      resolve(url);
    })
  } catch (e) {
    return new Promise((reject: (reason?: any) => void) => {
      reject(e.stack);
    })
  }
}

async function saveImage(backgroundPixelMap: image.PixelMap, format: string, quality: number) {
  const imagePacker = image.createImagePacker();
  let opts = {
    format: format ? format : 'image/png',
    quality: !!quality ? quality : 100
  }
  let uri = generateCacheFilePath(format);
  const mode = fs.OpenMode.READ_WRITE | fs.OpenMode.CREATE;
  let fd = (await fs.open(uri, mode)).fd;
  await imagePacker.packToFile(backgroundPixelMap, fd, opts)
  imagePacker.release();
  // change to real path
  let real = fileUri.getUriFromPath(uri)
  if (fd) {
    fs.closeSync(fd);
  }
  return real;
}

function generateCacheFilePath(saveFormat: string | null): string {
  const cacheDir = globalThis.context.cacheDir;
  let ext = ".jpg";
  if (saveFormat) {
    ext = getFileExtension(saveFormat);
  }
  const name = `printText_${util.generateRandomUUID()}`;
  return `${cacheDir}/${name}.${ext}`;
}

export async function getPixelMap( imageInfo: RNImageSRC, canvas: drawing.Canvas, position: Position) {
  let opts: image.InitializationOptions = {
    editable: true,
    size: {
      height: imageInfo.width,
      width: imageInfo.height
    }
  }
  let imageSource: image.ImageSource = imageInfo.imageSource;
  let pixelMap = await imageSource.createPixelMap(opts);
  const brush = new drawing.Brush();
  let matrix: Array<number> = [
    1, 0, 0, 0, 0,
    0, 1, 0, 0, 0,
    0, 0, 1, 0, 0,
    0, 0, 0, 1, 0,
  ];
  let filter = drawing.ColorFilter.createMatrixColorFilter(matrix);
  brush.setColorFilter(filter);
  canvas.attachBrush(brush);
  canvas.drawImage(pixelMap, position.x, position.y);
  canvas.detachBrush();
}