#!/usr/bin/env python
import random
import time
import mxp
import os

mtx = mxp.Matrix()

while True:
	for x in range(0, 10):
		for y in range(0, 10):
			#col = random.randint(0, 1)
			col = int(random.random() * 255)
			mtx.setPixel(x, y, [col, col, col])
			#mtx.setPixel(x, y, [int(random.random() * 255),
			#	int(random.random() * 255),
			#	int(random.random() * 255)])
	mtx.flip()
	time.sleep(0.02)
