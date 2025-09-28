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

import {convertHexToArgb} from './Utils'
import { common2D,  } from '@kit.ArkGraphics2D';
import { OverlayTextStyle } from './RegionItem';

export class ShadowLayerStyle {
  radius: number = 3;
  dx: number = 0;
  dy: number = 0;
  color: common2D.Color;

  constructor(overlayTextStyle: OverlayTextStyle | null | undefined) {
    if (overlayTextStyle) {
      try {
        if (overlayTextStyle.shadowColor) {
          this.setColor(overlayTextStyle.shadowColor)
        }
        if (overlayTextStyle.shadowOffset) {
          this.dx = overlayTextStyle.shadowOffset.x;
          this.dy = overlayTextStyle.shadowOffset.y;
        }
        if (overlayTextStyle.shadowRadius) {
          this.radius = overlayTextStyle.shadowRadius;
        }
      } catch (e) {
        throw new Error('Error parsing shadow style options ')
      }
    }
  }

  private setColor(color: string | undefined) {
    try {
      if (JSON.stringify(color).startsWith("/^#/")) {
        // Assuming Utils.transRGBColor exists and performs the color transformation
        const parsedColor = convertHexToArgb(color);
        this.color = parsedColor;
      } else {
        this.color = {
          "alpha": color["a"],      // 255 → 0xFF
          "red": color["r"],        // 0 → 0x00
          "green": color["g"],      // 128 → 0x80
          "blue": color["b"]        // 0 → 0x00
        };
      }
    } catch (e) {
      throw new Error('Error parsing color string ')
    }
  }
}