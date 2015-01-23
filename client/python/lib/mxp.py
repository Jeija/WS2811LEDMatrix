#!/usr/bin/env python

# Configuration
NETIO_IP = "192.168.0.80"
MXP_PORT = 2711
SEND_PER_PACKET = 100
LOOKUP_FILENAME = "config/lookup.csv"
EMULATE = True

import mxpemulator
import threading
import random
import exitok
import socket
import time
import csv

class Matrix:
	lookup = []
	ready = False

	def __init__(self):
		# Read lookup table that maps led number in string <--> matrix
		self.__readLookupTable()

		# Double buffering Framebuffer
		self.fb = [[[0x00 for x in range(3)]
			for x in range(self.totalsize)]
			for x in range(2)]
		self.fb_act = 0

		# Start output
		self.stop = threading.Event()

		# Start output thread
		exitok.register(self.exithandler)
		self.outputThread = threading.Thread(target=self.outputLoop)
		self.outputThread.start()
		if (EMULATE): self.mtx_em = mxpemulator.Matrix(self.width, self.height)

	def __readLookupTable(self):
		self.totalsize = 0
		reader = csv.reader(open(LOOKUP_FILENAME, "r"))
		for rowid, rowcontent in enumerate(reader):
			col = []
			self.width = 0
			for colid, colcontent in enumerate(rowcontent):
				if colid + 1 > self.width: self.width = colid + 1
				if (rowcontent == ""):
					col.append(-1)
				else:
					try:
						col.append(int(colcontent))
						self.totalsize += 1
					except TypeError:
						print("Invalid lookup table content "
							+ colcontent + " at " + colid + ", " + rowid)
			self.lookup.append(col)
		self.height = rowid + 1
			

	def __getLEDByNum(self, num):
		if (num >= self.totalsize): return [0, 0, 0]
		return self.fb[1 if self.fb_act == 0 else 0][num]

	def getWidth(self):
		return self.width

	def getHeight(self):
		return self.height

	def outputLoop(self):
		while not self.ready: pass

		# Write socket
		self.sout = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

		# Set this PC to controller master
		self.sout.sendto(b'\x00', (NETIO_IP, MXP_PORT))

		while not self.stop.isSet():
			for offset in range(0, self.totalsize, SEND_PER_PACKET):
				# Type: Frame packet
				msg = b'\x00'

				# Encode offset
				msg = msg + bytes([offset>>8])
				msg = msg + bytes([offset&0xff])

				# Encode length
				msg = msg + bytes([(SEND_PER_PACKET)>>8])
				msg = msg + bytes([(SEND_PER_PACKET)&0xff])

				# Encode pixel data
				for led in range(offset, offset + SEND_PER_PACKET):
					msg = msg + bytes(self.__getLEDByNum(led))

				# Send frame packet
				self.sout.sendto(msg, (NETIO_IP, MXP_PORT))
				time.sleep(0.02)

	def setPixel(self, x, y, color):
		if (EMULATE): self.mtx_em.setPixel(x, y, color)
		self.fb[self.fb_act][self.lookup[x][y]] = color

	def clear(self):
		if (EMULATE): self.mtx_em.clear()
		for num in range(self.totalsize):
			self.fb[self.fb_act][num] = [0, 0, 0]

	def exithandler(self, *args):
		self.stop.set()
		self.outputThread.join()
		self.sout.close()

	def flip(self):
		if (EMULATE): self.mtx_em.flip()
		self.ready = True
		self.fb_act = 1 if self.fb_act == 0 else 0
		self.clear()

