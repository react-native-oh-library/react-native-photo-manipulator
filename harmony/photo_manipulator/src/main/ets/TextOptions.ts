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

import { drawing, common2D } from '@kit.ArkGraphics2D';
import { TextStyle } from './TextStyle';
import { PhotoManipulatorError } from './PhotoManipulatorError'
import { ErrorCode } from './ErrorCode'
import { OverlayTextStyle, TextPosition } from './RegionItem';
import { TextAlign } from './Utils';
import { i18n } from '@kit.LocalizationKit';

export class TextOptions {
  private text: string | null;
  private x: number | null;
  private y: number | null;
  public setText(value: string | null) {
    this.text = value;
  }
  public getText(): string | null {
    return this.text;
  }
  public setX(value: number | null) {
    this.x = value;
  }
  public getX(): number | null {
    return this.x;
  }
  public setY(value: number | null) {
    this.y = value;
  }
  public getY(): number | null {
    return this.y;
  }

  private style: TextStyle;
  public setStyle(value: TextStyle) {
    this.style = value;
  }
  public getStyle(): TextStyle {
    return this.style;
  }
  private maxWidth: number;
  public setMaxWidth(value: number) {
    this.maxWidth = value;
  }
  public getMaxWidth(): number {
    return this.maxWidth;
  }
  private maxHeight: number;
  public setMaxHeight(value: number) {
    this.maxHeight = value;
  }
  public getMaxHeight(): number {
    return this.maxHeight;
  }
  private lines: string[] = [];
  private fontHeight: number;
  private textPositionOptions: TextPosition | null;

  constructor(overlayTextStyle: OverlayTextStyle) {
    this.text = overlayTextStyle.text;
    if (!this.text) {
      throw new PhotoManipulatorError(ErrorCode.PARAMS_REQUIRED, "mark text is required");
    }
    this.textPositionOptions = overlayTextStyle.position || null;
    this.x = this.textPositionOptions?.x ? this.textPositionOptions?.x : null;
    this.y = this.textPositionOptions?.y ? this.textPositionOptions.y : null;

    this.style = new TextStyle(overlayTextStyle)
  }

   applyStyle(canvas: drawing.Canvas, typeFace: drawing.Typeface | undefined, imageWidth: number, imageHeight: number) {
    if (this.text?.length == 0) return
    let font = new drawing.Font();
    if (typeFace) {
      font.setTypeface(typeFace)
    }
    const textSize = this.style.getTextSize();
    font.setSize(textSize);
    let metrics = font.getMetrics();
    //todo 可删除
    //descent基线到文字最低处之间的距离，浮点数。 ascent文字最高处到基线之间的距离，浮点数。
    this.fontHeight = metrics.descent - metrics.ascent;
    this.lines = this.text.split("\n");
    this.drawTextWithStyle(canvas, font, imageWidth, imageHeight);
  }

  private drawTextWithStyle(canvas: drawing.Canvas, font: drawing.Font, imageWidth: number, imageHeight: number) {
    let fontBrush = new drawing.Brush();
    let fontPen = new drawing.Pen();
    fontBrush.setAntiAlias(true);
    fontPen.setAntiAlias(true);
    if (this.style.getShadowLayerStyle()?.radius > 0 &&
      this.style.getShadowLayerStyle()?.dx, this.style.getShadowLayerStyle()?.dy) {
      const shadow = this.style.getShadowLayerStyle();
      const shadowLayer = drawing.ShadowLayer.create(shadow?.radius, shadow?.dx, shadow?.dy, shadow?.color);
      fontBrush.setShadowLayer(shadowLayer);
      fontPen.setShadowLayer(shadowLayer);
    }
    canvas.save()

    let strokeWidth = this.style.getStrokeWidth();

    fontPen.setStrokeWidth(strokeWidth);
    if (this.style.getColor()) {
      fontBrush.setColor(this.style.getColor());
      fontPen.setColor(this.style.getColor());
    }
    canvas.attachPen(fontPen);
    canvas.attachBrush(fontBrush);
    for (let index = 0; index < this.lines.length; index++) {
      this.drawText(font, this.lines[index], index * this.fontHeight, canvas, imageWidth, imageHeight);
    }
    canvas.detachPen();
    canvas.detachBrush();
    canvas.restore();
  }

  private drawText(font: drawing.Font, text: string, indexFontHeight: number, canvas: drawing.Canvas, imageWidth: number, imageHeight: number) {
    let textWidths = font.measureText(text, drawing.TextEncoding.TEXT_ENCODING_UTF8);
    let textAlign = this.style.getTextAlign();
    let anchorPointX = this.textPositionOptions?.x;
    if (this.style.getDirection() == "rtl") {
      if (textAlign == TextAlign.CENTER) {
        anchorPointX = anchorPointX - textWidths / 2;
      } else if (textAlign == TextAlign.START) {
        anchorPointX = anchorPointX - textWidths;
      } else if (textAlign == TextAlign.END) {
        anchorPointX = anchorPointX;
      } else {
        anchorPointX = imageWidth - (anchorPointX + textWidths);
      }
    } else if (this.style.getDirection() == "ltr") {
      if (textAlign == TextAlign.CENTER) {
        anchorPointX = anchorPointX - textWidths / 2;
      } else if (textAlign == TextAlign.START) {
        anchorPointX = anchorPointX;
      } else if (textAlign == TextAlign.END) {
        anchorPointX = anchorPointX - textWidths;
      }
    }

    //将string类型的值转化成TextBlob对象
    if (i18n.Unicode.isRTL(text)) {
      text = text.split('').reverse().join('');
    }
    if (this.style.getRotate() != 0) {
      canvas.rotate(-this.style.getRotate(), anchorPointX, (this.textPositionOptions?.y + font.getSize() / 2 + indexFontHeight));
    }
    const textBlob: drawing.TextBlob = drawing.TextBlob.makeFromString(text, font, drawing.TextEncoding.TEXT_ENCODING_UTF8);
    canvas.drawTextBlob(textBlob, anchorPointX, (this.textPositionOptions?.y + font.getSize() / 2 + indexFontHeight));
  }
}

