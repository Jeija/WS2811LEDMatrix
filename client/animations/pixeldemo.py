#!/usr/bin/env python
import time
import math
import mxp
from noise import snoise3

mtx = mxp.Matrix()

t = 0
while True:
	for x in range(0, 10):
		for y in range(0, 10):
			mtx.setPixel(x, y, [255, 0, 0])
			mtx.setPixel(y, x, [0, 255, 0])
			mtx.setPixel(9-x, y, [0, 0, 255])
			mtx.setPixel(x, 9-y, [255, 255, 255])
			mtx.setPixel(9-y, x, [255, 255, 0])
			mtx.setPixel(y, 9-x, [0, 255, 255])
			mtx.setPixel(9-y, 9-x, [255, 0, 255])
			mtx.setPixel(9-x, 9-y, [255, 127, 0])
			mtx.flip()
			time.sleep(0.04)
