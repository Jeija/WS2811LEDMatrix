#!/usr/bin/env python
import spectrum
import time
import math
import mxp

mtx = mxp.Matrix()
s = spectrum.AudioSpectrum()
band = [0 for x in range(10)]

while True:
	band[0] = band[0] * 0.9 + 0.1 * s.getBand(10, 60) * 0.1
	band[1] = band[1] * 0.9 + 0.1 * s.getBand(40, 90)
	band[2] = band[2] * 0.9 + 0.1 * s.getBand(70, 140)
	band[3] = band[3] * 0.9 + 0.1 * s.getBand(120, 210)
	band[4] = band[4] * 0.9 + 0.1 * s.getBand(190, 320)
	band[5] = band[5] * 0.9 + 0.1 * s.getBand(280, 480)
	band[6] = band[6] * 0.9 + 0.1 * s.getBand(420, 660)
	band[7] = band[7] * 0.9 + 0.1 * s.getBand(540, 1100)
	band[8] = band[8] * 0.9 + 0.1 * s.getBand(900, 2200)
	band[9] = band[9] * 0.9 + 0.1 * s.getBand(1800, 3000)

	for n in range(10):
		print(band[n])
		for i in range(int(math.sqrt(band[n] * 1000) * 1)):
			if (i > 9): break
			color = [0, 255, 0]
			if (i > 4): color = [255, 255, 0]
			if (i > 7): color = [255, 0, 0]
			mtx.setPixel(n, 9-i, color)
	mtx.flip()
	time.sleep(0.01)
