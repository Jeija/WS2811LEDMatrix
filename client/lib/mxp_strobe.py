#!/usr/bin/env python
import time
import math
import mxp

mtx = mxp.Matrix()

while True:
	for n in range(100):
		x = n%mtx.getWidth()
		y = int((n-x)/mtx.getWidth())
		mtx.setPixel(x, y, [255, 0, 0])
	mtx.flip()
	time.sleep(0.08)

	for n in range(100):
		x = n%mtx.getWidth()
		y = int((n-x)/mtx.getWidth())
		mtx.setPixel(x, y, [0, 255, 0])
	mtx.flip()
	time.sleep(0.08)

	for n in range(100):
		x = n%mtx.getWidth()
		y = int((n-x)/mtx.getWidth())
		mtx.setPixel(x, y, [0, 0, 255])
	mtx.flip()
	time.sleep(0.08)

	mtx.clear()
	mtx.flip()
	time.sleep(0.08)
