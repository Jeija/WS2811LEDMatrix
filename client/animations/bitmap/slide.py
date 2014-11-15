#!/usr/bin/env python
import time
import math
import mxp
import sys
from PIL import Image

IMAGEFILE = sys.argv[1]

mtx = mxp.Matrix()

pic = Image.open(IMAGEFILE)
pix = pic.load()
while True:
	for offset in range (0, pic.size[0] - 9):
		for x in range(0, 10):
			for y in range(0, 10):
				mtx.setPixel(x, y, pix[x + offset, y])
		mtx.flip()
		time.sleep(0.08)
		if (offset == 0): time.sleep(0.5)
	time.sleep(0.5)
