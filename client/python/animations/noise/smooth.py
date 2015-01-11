#!/usr/bin/env python
import time
import math
import mxp
from noise import snoise3

mtx = mxp.Matrix()

t = 0
while True:
	t = t + 0.02
	for x in range(10):
		for y in range(10):
			color = [0, 0, 0]
			newx = x / 8 + math.sin(t / 2)
			newy = y / 8 + math.cos(t / 2)
			color[2] = int(snoise3(newx,		newy, t/3) * 127 + 128)
			color[0] = int(snoise3(newx + 15,	newy, t/5) * 127 + 128)
			color[1] = int(snoise3(newx + 30,	newy, t/7) * 127 + 128)
			mtx.setPixel(x, y, color)
	mtx.flip()
	time.sleep(0.01)
