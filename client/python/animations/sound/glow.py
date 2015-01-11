#!/usr/bin/env python
import spectrum
import time
import math
import mxp

mtx = mxp.Matrix()
s = spectrum.AudioSpectrum()

maxbass = 0.01
intens = 0

while True:
	beat = s.getBand(2, 45)

	print(str(int(beat * 1000)) + "/" + str(int(maxbass * 1000)))
	maxbass = maxbass * 0.9999 + beat * 0.0001

	if (beat / maxbass > 1.7):
		intens += 50 * beat / maxbass
		if (intens > 255): intens = 255
	intens = intens * 0.7

	for n in range(100):
		x = n%mtx.getWidth()
		y = int((n-x)/mtx.getWidth())
		mtx.setPixel(x, y, [int(intens), 0, 0])

	mtx.flip()
	time.sleep(0.01)
