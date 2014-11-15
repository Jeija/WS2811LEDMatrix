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
			seed = snoise3(x / 15 + math.sin(t/3), y / 15 + math.cos(t/3), t/10) * math.pi * 2
			color[0] = int((math.sin(seed) + 1) * 127)
			color[1] = int((math.sin(seed + 2/3 * math.pi) + 1) * 127)
			color[2] = int((math.sin(seed + 4/3 * math.pi) + 1) * 127)
			mtx.setPixel(x, y, color)
	mtx.flip()
	time.sleep(0.01)
