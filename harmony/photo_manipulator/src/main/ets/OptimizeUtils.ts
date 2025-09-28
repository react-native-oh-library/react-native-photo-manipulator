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
import { getFileExtension } from './Utils';
import { util } from '@kit.ArkTS';
import { fileUri } from '@kit.CoreFileKit';
import fs from '@ohos.file.fs';

export async function setOptimize(backgroundPixelMap: image.PixelMap, filename, format, quality: number) {
  const imagePacker = image.createImagePacker();
  let opts = {
    format: 'image/jpeg',
    quality: !!quality ? quality : 100
  }
  let uri = generateCacheFilePath(format);
  const mode = fs.OpenMode.READ_WRITE | fs.OpenMode.CREATE;
  let fd = (await fs.open(uri, mode)).fd;
  await imagePacker.packToFile(backgroundPixelMap, fd, opts)
  imagePacker.release();
  // change to real path
  let real = fileUri.getUriFromPath(uri)
  return real;
}

function generateCacheFilePath(saveFormat: string | null): string {
  const cacheDir = globalThis.context.cacheDir;
  let ext = ".jpg";
  if (saveFormat) {
    ext = getFileExtension(saveFormat);
  }
  const name = `optimize_${util.generateRandomUUID()}`;
  return `${cacheDir}/${name}.${ext}`;
}