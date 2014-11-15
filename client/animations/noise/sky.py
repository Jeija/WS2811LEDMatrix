#!/usr/bin/env python
import time
import math
import mxp
from noise import snoise3

mtx = mxp.Matrix()

t = 0
while True:
	t = t + 0.03
	for x in range(10):
		for y in range(10):
			color = [0, 0, 0]
			color[2] = int(snoise3(x / 8 + t, y / 8 + t, t/3) * 127 + 128)
			color[0] = 255 - color[2]
			color[1] = 255 - color[2]
			mtx.setPixel(x, y, color)
	mtx.flip()
	time.sleep(0.05)
