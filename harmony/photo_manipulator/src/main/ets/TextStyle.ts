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

import { DefaultConstants, OverlayTextStyle } from './RegionItem'
import { ShadowLayerStyle } from './ShadowLayerStyle'
import { common2D } from '@kit.ArkGraphics2D'

export class TextStyle {
  private color: common2D.Color | null
  private fontName: string | null
  private textSize: number
  private shadowLayerStyle: ShadowLayerStyle | null
  private textAlign: string
  private bold: boolean
  private rotate: number
  private strokeWidth: number
  private direction: string
  constructor(overlayTextStyle: OverlayTextStyle) {
    if (overlayTextStyle.color) {
      this.color = {
        "alpha": overlayTextStyle.color["a"],
        "red": overlayTextStyle.color["r"],
        "green": overlayTextStyle.color["g"],
        "blue": overlayTextStyle.color["b"]
      };
    }
    this.fontName = overlayTextStyle.fontName ?? null;
    this.textSize = overlayTextStyle.textSize ? overlayTextStyle.textSize : DefaultConstants.DEFAULT_FONT_SIZE;
    this.textAlign = overlayTextStyle.align;
    this.shadowLayerStyle = new ShadowLayerStyle(overlayTextStyle);
    this.shadowLayerStyle = this.shadowLayerStyle ? this.shadowLayerStyle : null;
    this.rotate = overlayTextStyle.rotation ? overlayTextStyle.rotation : 0;
    this.direction = overlayTextStyle.direction;
    this.strokeWidth = overlayTextStyle.thickness;
  }

  public setDirection(value: string | null) {
    this.direction = value
  }

  public getDirection(): string | null {
    return this.direction
  }

  public setStrokeWidth(value: number | null) {
    this.strokeWidth = value
  }

  public getStrokeWidth(): number | null {
    return this.strokeWidth
  }

  public setColor(value: common2D.Color | null) {
    this.color = value
  }

  public getColor(): common2D.Color | null {
    return this.color
  }

  public setFontName(value: string | null) {
    this.fontName = value
  }

  public getFontName(): string | null {
    return this.fontName
  }

  public setTextSize(value: number) {
    this.textSize = value
  }

  public getTextSize(): number {
    return this.textSize
  }

  public setShadowLayerStyle(value: ShadowLayerStyle | null) {
    this.shadowLayerStyle = value
  }

  public getShadowLayerStyle(): ShadowLayerStyle | null {
    return this.shadowLayerStyle
  }

  public setTextAlign(value: string) {
    this.textAlign = value
  }

  public getTextAlign(): string {
    return this.textAlign
  }

  public setBold(value: boolean) {
    this.bold = value
  }

  public getBold(): boolean {
    return this.bold
  }

  public setRotate(value: number) {
    this.rotate = value
  }

  public getRotate(): number {
    return this.rotate
  }

}