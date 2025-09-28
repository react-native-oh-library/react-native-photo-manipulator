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

import { RotationMode } from "./RegionItem";
import { image } from "@kit.ImageKit";
import { RNImageSRC } from "./RNImageSRC";

export async function rotateImage(imageSRC: RNImageSRC,  model: string): Promise<image.PixelMap> {
  let angle : number = 0.0;
  if (model == RotationMode.R90) {
    angle = 90.0;
  }
  if (model == RotationMode.R180) {
    angle = 180.0;
  }
  if (model == RotationMode.R270) {
    angle = 270.0;
  }
  let pixelMap: image.PixelMap;
  if (imageSRC.imageSource != undefined) {
    pixelMap = await imageSRC.imageSource.createPixelMap();
    await pixelMap.rotateSync(angle);
  }
  return new Promise((resolve) => {resolve(pixelMap)});
}