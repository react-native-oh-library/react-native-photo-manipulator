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

import { FlipMode } from "./RegionItem";
import { BusinessError } from "@kit.BasicServicesKit";
import image from '@ohos.multimedia.image';
import { RNImageSRC } from "./RNImageSRC";

export async function flip(imageSRC: RNImageSRC, model: string): Promise<image.PixelMap> {
  let horizontal: boolean = false;
  let vertical: boolean = false;
  if (model == FlipMode.Both) {
    horizontal = true;
    vertical = true;
  }
  if (model == FlipMode.Horizontal) {
    horizontal = true;
    vertical = false;
  }
  if (model == FlipMode.Vertical) {
    horizontal = false;
    vertical = true;
  }
  let pixelMap: image.PixelMap;
  if (imageSRC.imageSource != undefined) {
    pixelMap = await imageSRC.imageSource.createPixelMap();
    await pixelMap.flip(horizontal, vertical).then(() => {
      console.info('Succeeded flip pixelmap');
    }).catch((err: BusinessError) => {
      console.error(`Failed to flip pixelmap. code is ${err.code}, message is ${err.message}`);
    })
  }
  return new Promise((resolve) => {resolve(pixelMap)});
}