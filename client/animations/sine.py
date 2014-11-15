#!/usr/bin/env python
import time
import math
import mxp
from noise import snoise3

mtx = mxp.Matrix()

t = 0
while True:
	t = t + 0.2
	for x in range (0, 10):
		color = [0, 0, 0]
		color[0] = int((math.sin(t) + 1) * 127)
		color[1] = int((math.sin(t/3 + 2/3 * math.pi) + 1) * 127)
		color[2] = int((math.sin(t/3 + 4/3 * math.pi) + 1) * 127)
		mtx.setPixel(x, int(math.sin(x / 2 + math.sin(t / 8) * 10) * 4 + 5), color)
	mtx.flip()
	time.sleep(0.02)
