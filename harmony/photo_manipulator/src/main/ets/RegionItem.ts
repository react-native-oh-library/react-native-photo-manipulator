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

export class OverlayTextStyle {
  text: string;
  fontName: string;
  color: string;
  textSize: number;
  align: string;
  position: TextPosition;
  thickness: number;
  shadowRadius: number;
  shadowOffset: textShadowStyle;
  shadowColor: string;
  rotation: number;
  direction: string;
}
export class textShadowStyle {
  x: number
  y: number;
}

export class TextPosition{
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

export class DefaultConstants {
  static DEFAULT_FONT_SIZE: number = 14;
  static DEFAULT_MAX_SIZE: number = 2048;
  static DEFAULT_QUALITY: number = 100;
  static DEFAULT_SCALE: number = 1.0;
  static DEFAULT_ROTATE: number = 0;
  static DEFAULT_ALPHA: number = 1;
  static DEFAULT_UNDERLINE_DIATANCE: number = 2;
  static DEFAULT_BACKGROUP_BOTTOM_PADDING: number = 8;
  static DEFAULT_ITALIC: number = -0.5;
  static IMAGE_MARKER_TAG: string = "[ImageMarker]";
  static BASE64: string = "base64";
}


//overlay
export enum SaveFormat {
  png = 'png',
  jpg = 'jpg',
}

export class ImagePosition{
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}
//Rotation
export enum RotationMode {
  R90 = 'R90',
  R180 = 'R180',
  R270 = 'R270',
}


//Flip
export enum FlipMode {
  Both = 'Both',
  Horizontal = 'Horizontal',
  Vertical = 'Vertical',
}

//crop 裁剪
export class CropRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class TargetSize {
  width: number;
  height: number;
}

export enum mimeType {
  'image/jpeg',
  'image/png'
}

//缩放
export class RegionItem {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}