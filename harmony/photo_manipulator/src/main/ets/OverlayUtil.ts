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

import image from '@ohos.multimedia.image';
import { fileUri } from '@kit.CoreFileKit';
import util from '@ohos.util';
import fs from '@ohos.file.fs';
import { ImagePosition } from './RegionItem';

import drawing from '@ohos.graphics.drawing';
import { obtainImageInfoFromPath, getFileExtension} from "./Utils"
import { RNImageSRC } from './RNImageSRC';
import resourceManager from '@ohos.resourceManager';


export async function overlayImage(backgroundImageUrl: string, overlayImageUrl: string, position: ImagePosition,
  resourceManager: resourceManager.ResourceManager, mimeType?: string): Promise<string> {
  try {
    let backgroundImageInfo: RNImageSRC = await obtainImageInfoFromPath(resourceManager, backgroundImageUrl)
    let overlayImageInfo: RNImageSRC = await obtainImageInfoFromPath(resourceManager, overlayImageUrl)
    let imageWidth: number = backgroundImageInfo.width;
    let imageHeight: number = backgroundImageInfo.height;
    const emptyArrayBuffer: ArrayBuffer = new ArrayBuffer(imageWidth * imageHeight * 4);
    let opts: image.InitializationOptions = { size: { width: imageWidth, height: imageHeight} }
    let backgroundPixelMap = await image.createPixelMap(emptyArrayBuffer, opts);
    let canvas = new drawing.Canvas(backgroundPixelMap);
    let backgroundPosition: ImagePosition = new ImagePosition(0,0);
    await getPixelMap(backgroundImageInfo, canvas, backgroundPosition);
    canvas.save()
    await applyStyle(canvas, overlayImageInfo, position)
    let uri = await saveImage(backgroundPixelMap, mimeType, 100);
    return new Promise((resolve, reject) => {
      resolve(uri);
    })
  } catch (err) {
    return new Promise((resolve, reject) => {
      reject(err);
    })
  }
}

export async function applyStyle(canvas: drawing.Canvas, overlayImageInfo: RNImageSRC, position: ImagePosition) {
  canvas.save()
  await getPixelMap(overlayImageInfo, canvas, position)
  canvas.restore()
}

export async function saveImage(backgroundPixelMap: image.PixelMap, format: string, quality: number) {
  const imagePacker = image.createImagePacker();
  let opts = {
    format: format ? format : 'image/png',
    quality: quality ? quality : 100
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
  const name = `overlay_${util.generateRandomUUID()}`;
  return `${cacheDir}/${name}` + `_${Date.now()}.${ext}`;
}

export async function getPixelMap( imageInfo: RNImageSRC, canvas: drawing.Canvas, position: ImagePosition) {
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




