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

import { util } from '@kit.ArkTS';
import { image } from '@kit.ImageKit';
import { http } from '@kit.NetworkKit'
import { fileIo, fileUri } from '@kit.CoreFileKit';
import resourceManager from '@ohos.resourceManager';
import { BusinessError } from '@kit.BasicServicesKit';
import { AnyThreadTurboModuleContext } from '@rnoh/react-native-openharmony/ts';

import { ErrorCode } from './ErrorCode';
import { RNImageSRC } from './RNImageSRC';
import { SaveFormat } from './RegionItem';
import { PhotoManipulatorError } from './PhotoManipulatorError';

export function isCoilImg(uri: string | null): boolean {
  if (!uri) {
    return false;
  }
  return uri.startsWith("http://") || uri.startsWith("https://") || uri.startsWith("file://")
    || (uri.startsWith("data:") && uri.includes("base64") && (uri.includes("img")
      || uri.includes("image"))) || !uri.startsWith("asset:");
}

export function getImageUri(url: string): string {
  if(url.startsWith("file")){
    let realUrl = url.substring(url.indexOf("/data/"));
    url =  realUrl;
  }
  if (url.indexOf("//") > 0) {
    let realUrl = url.substring(url.indexOf("//") + 2);
    url = "assets/" + realUrl;
  }
  return url;
}

export function getFileExtension(format: string): string {
  switch (format) {
    case "image/jpeg":
      return SaveFormat.jpg;
    case "image/png":
      return SaveFormat.png;
    default:
      return SaveFormat.jpg;
  }
}

export function handleDynamicToString(d): string {
  if (!d) {
    return "0";
  }
  switch (typeof d) {
    case "string":
      return d.toString();
    case "number":
      return d.toString();
    default:
      return "0";
  }
}

export function convertHexToArgb(hex: string) {
  hex = hex.replace(/^#/, '');
  if (hex.length === 6) {
    hex = 'FF' + hex;
  }
  const alpha = parseInt(hex.slice(0, 2), 16);
  const red = parseInt(hex.slice(2, 4), 16);
  const green = parseInt(hex.slice(4, 6), 16);
  const blue = parseInt(hex.slice(6, 8), 16);
  return {
    "alpha": alpha,
    "red": red,
    "green": green,
    "blue": blue
  };
}

export enum TextAlign {
  CENTER = "center",
  START = "start",
  END = "end",
}



/**
 * 将 PixelMap 保存为图片文件并返回 URL
 * @param pixelMap PixelMap 对象
 * @param fileName 保存的文件名（可选）
 * @param format 图片格式（默认：image.ImageFormat.JPEG）
 * @param quality 图片质量（0-100，默认：90）
 */
export async function pixelMapToUrl(ctx: AnyThreadTurboModuleContext, pixelMap: image.PixelMap, mimeType: string,
  fileName?: string, quality: number = 100): Promise<string> {
  try {
    //创建 ImagePacker
    let imagePacker = image.createImagePacker();
    //获取mimeType
    if (!mimeType && pixelMap != undefined) {
      pixelMap.getImageInfo().then((imageInfo: image.ImageInfo) => {
        if (imageInfo != undefined) {
          mimeType = imageInfo.mimeType;
        }
      }).catch((error: BusinessError) => {
        console.error(`Failed to obtain the image pixel map information. code is ${error.code}, message is ${error.message}`);
      })
    }
    //设置打包选项
    let packOptions: image.PackingOption = {
      format: mimeType,
      quality: quality
    };
    //将 PixelMap 打包为 ArrayBuffer
    let filesDir = ctx.uiAbilityContext.filesDir;
    let finalFileName = fileName + `_${Date.now()}.${getFileExtension(mimeType)}`;
    let filePath = `${filesDir}/${finalFileName}`;
    let uri: string = "";
    await imagePacker.packToData(pixelMap, packOptions).then((data: ArrayBuffer) => {
        //将ArrayBuffer 写入文件
        let file = fileIo.openSync(filePath, fileIo.OpenMode.READ_WRITE | fileIo.OpenMode.CREATE);
        fileIo.writeSync(file.fd, data);
        fileIo.closeSync(file.fd);
        //释放资源
        uri = fileUri.getUriFromPath(filePath);
        imagePacker.release();
      }).catch((error: BusinessError) => {
        imagePacker.release();
        console.error(`Failed to pack the image.code ${error.code},message is ${error.message}`);
    })
    return uri;
  } catch (error) {
    console.error('Failed to convert PixelMap to URL:', error);
    throw error;
  }
}

/**
 * handle src.
 */
export async function obtainImageInfoFromPath(resourceManager: resourceManager.ResourceManager, src: string): Promise<RNImageSRC> {
  // write the image to system
  let rn8mage:RNImageSRC;
  //处理require类型图片
  if (!isCoilImg(src)) {
    let imageSource: image.ImageSource
    let sourceOptions: image.SourceOptions =
      {
        sourceDensity: 120,
      };
    let resource = resourceManager.getRawFileContentSync(getImageUri(src));
    let arrayBuffer = resource.buffer.slice(resource.byteOffset, resource.byteLength + resource.byteOffset)
    // arrayBuffer.
    imageSource = image.createImageSource(arrayBuffer, sourceOptions)
    let imageInfo = imageSource.getImageInfoSync().size;
    rn8mage = new RNImageSRC(imageInfo.width, imageInfo.height, getImageUri(src), imageSource );
    return rn8mage;
  } else {
    //处理http、https类型图片
    if (src.startsWith("http://") || src.startsWith("https://")) {
      let dir = globalThis.context.cacheDir
      let filePath = dir + "/" + util.generateRandomUUID(true).toString() + src.substring(src.lastIndexOf("/") + 1, src.length)
      let httpRequest: http.HttpRequest = http.createHttp();
      let options: http.HttpRequestOptions = {
        expectDataType: http.HttpDataType.ARRAY_BUFFER, // 可选，指定返回数据的类型。
        priority: 1, // 可选，默认为1。
        readTimeout: 60000, // 可选，默认为60000ms。
        connectTimeout: 60000, // 可选，默认为60000ms。
        usingCache: true
      };
      await httpRequest.request(src, options).then((dataHttpResponse: http.HttpResponse) => {
        if (dataHttpResponse.responseCode === http.ResponseCode.OK) {
          let imageSource: image.ImageSource = image.createImageSource(dataHttpResponse.result as ArrayBuffer);
          let file = fileIo.openSync(filePath, fileIo.OpenMode.READ_WRITE | fileIo.OpenMode.CREATE);
          // 写入文件
          fileIo.writeSync(file.fd, dataHttpResponse.result as ArrayBuffer);
          // 关闭文件
          fileIo.closeSync(file.fd);
          let imageInfo = imageSource.getImageInfoSync(0);
          rn8mage = new RNImageSRC(imageInfo.size.width, imageInfo.size.height, filePath, imageSource)
          httpRequest.destroy();

        } else {
          httpRequest.destroy();
          throw new PhotoManipulatorError(ErrorCode.LOAD_IMAGE_FAILED, "image url is INVALID")
        }
      })
      return rn8mage;
    } else {//处理file类型图片
      let url: string = getImageUri(src);
      let imageSource = image.createImageSource(url);
      if (imageSource === undefined) {
        throw new PhotoManipulatorError(ErrorCode.LOAD_IMAGE_FAILED, "image url is INVALID")
      }
      let imageInfo = imageSource.getImageInfoSync();
      rn8mage = new RNImageSRC(imageInfo.size.width, imageInfo.size.height, src, imageSource);
      return rn8mage;
    }
  }
}




