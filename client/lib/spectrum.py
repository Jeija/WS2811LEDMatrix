#!/usr/bin/env python

# Configuration:
PERIODSIZE = 100
SAMPLINGRATE = 44100

import threading
import alsaaudio
import audioop
import struct
import exitok
import numpy
import time
import math

class AudioSpectrum:
	def __init__(self):
		self.spectrum = {}
		self.spectrum_max = 0
		self.volume = 0
		self.spectrum_lock = threading.Lock()

		# Open the audio device in nonblocking capture mode
		self.alsain = alsaaudio.PCM(alsaaudio.PCM_CAPTURE,alsaaudio.PCM_NONBLOCK)

		# Set attributes: Mono, SAMPLINGRATE Hz, 16 bit signed little endian samples
		self.alsain.setchannels(1)
		self.alsain.setrate(SAMPLINGRATE)
		self.alsain.setformat(alsaaudio.PCM_FORMAT_S16_LE)

		# Frame size (each frame has two bytes)
		self.alsain.setperiodsize(PERIODSIZE)

		# Start capturing and analyzing
		self.stop = threading.Event()
		self.inputThread = threading.Thread(target=self.inputLoop)
		self.inputThread.start()

		exitok.register(self.exithandler)

	# Audio Input + Processing Thread
	def inputLoop(self):
		while not self.stop.isSet():
			data = b""
			# Collect enough PCM audio data from device
			while (int(len(data)) / 2 < 2000):
				l, nd = self.alsain.read()
				data += nd
				time.sleep(0.001)

			# Make the fast fourier transformation on the PCM values
			analog = []
			for i in range (int(len(data) / 2)):
				analog.append(struct.unpack("<h", data[(i*2):(i*2+2)])[0])
			analog = analog * numpy.hamming(len(analog))
			window = numpy.fft.fft(analog)
			freqs = numpy.fft.fftfreq(len(window))

			# Save data to spectrum
			begin = time.time()
			while not self.spectrum_lock.acquire(False):
				if (time.time() - begin > 0.2):
					# Something went from (program exited), just return
					return
			self.spectrum.clear()
			window = numpy.abs(window**2)
			for i, f in enumerate(freqs):
				self.spectrum[abs(f*SAMPLINGRATE)] = window[i]

			# Save maximum value of PCM data as volume
			self.volume = (audioop.max(data, 2))

			# Calculate spectrum maximum value
			maxval = 0
			for _, val in self.spectrum.items():
				if (val > maxval): maxval = val
			self.spectrum_max = maxval
			self.spectrum_lock.release()

	def getBand(self, minfreq, maxfreq):
		value = 0 # Average amplitude value in band
		nFreq = 0 # Number of detected frequencies in band

		self.spectrum_lock.acquire()
		for f, val in self.spectrum.items():
			if (f > minfreq and f < maxfreq):
				value += val
				nFreq += 1
		self.spectrum_lock.release()

		if (nFreq == 0): return 0
		if (value == 0): return 0
		if (self.volume == 0): return 0
		if (self.spectrum_max == 0): return 0

		# Incredibly dumb but working calculation to map the magnitude on a
		# float scale from 0-1
		return (value / nFreq / self.spectrum_max * (self.volume / 0x8000))

	def getVolume(self):
		return self.volume

	def exithandler(self, *args):
		self.stop.set()
		self.inputThread.join()
		self.alsain.close()
