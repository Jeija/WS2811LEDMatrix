#!/usr/bin/env python
import time
import math
import sys
from PIL import Image
import mxp

IMAGEFILE = sys.argv[1]

mtx = mxp.Matrix()

pic = Image.open(IMAGEFILE)
pix = pic.load()
while True:
	for x in range(0, 10):
		for y in range(0, 10):
			mtx.setPixel(x, y, pix[x, y])
	mtx.flip()
	time.sleep(0.05)
