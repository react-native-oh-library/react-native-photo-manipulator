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

import { image } from '@kit.ImageKit';
import { CropRegion, TargetSize } from './RegionItem'
import { BusinessError } from '@kit.BasicServicesKit';

//裁剪
export async function handleCropRegionAndTargetSize(imagePixelMap: image.PixelMap,
  cropRegion: CropRegion, targetSize?: TargetSize, mimeType?: string): Promise<image.PixelMap> {
  if (imagePixelMap != undefined) {
    //handle cropRegion Attribute
    let imageSizeInfo = (await imagePixelMap.getImageInfo()).size;
    if ((cropRegion.x + cropRegion.width) <= imageSizeInfo.width
      && (cropRegion.y + cropRegion.height) <= imageSizeInfo.height) {
      await imagePixelMap.crop({
        size: {
          width: cropRegion.width,
          height: cropRegion.height
        },
        x: cropRegion.x,
        y: cropRegion.y
      }).then(() => {
      }).catch((err: BusinessError) => {
        console.error(`Failed to crop pixelmap. code is ${err.code}, message is ${err.message}`);
      });
    } else {
      console.warn(`The range of values exceeds the width and height of the image.`);
    }
    //handle targetSize Attribute
    if ( targetSize && targetSize.width > 0 && targetSize.height > 0) {
      const scaleX = targetSize.width / cropRegion.width;
      const scaleY = targetSize.height / cropRegion.height;
      try {
        await imagePixelMap.scale(scaleX, scaleY)
      } catch (error) {
        console.error(`Failed to create scaledPixelMap. Error code is ${error.code}, error message is ${error.message}`);
      }
    }
  }
  return new Promise((resolve) => {resolve(imagePixelMap)});
}