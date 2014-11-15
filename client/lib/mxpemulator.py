#!/usr/bin/env python3
WINDOW_WIDTH=500
WINDOW_HEIGHT=500

import pygame
import exitok

class Matrix:
	# Parameters: Width & Height of LED Matrix in Pixels (number of LEDs)
	def __init__(self, width, height):
		self.ledw = width
		self.ledh = height

		pygame.init()
		pygame.display.set_caption("WS2811 Emulator")
		self.screen = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))

		self.screen.fill((50,50,50))
		font = pygame.font.SysFont("monospace", 30)
		label = font.render("WS2811 Emulator", 1, (255, 255, 255))
		self.screen.blit(label, (WINDOW_WIDTH / 2 - 120, 100))
		pygame.display.flip()
		pygame.time.delay(200)

		self.fb = [[[[0x00 for x in range(3)]
			for x in range(self.ledw)]
			for x in range(self.ledh)]
			for x in range(2)]
		self.fb_act = 0

	def setPixel(self, x, y, color):
		self.fb[self.fb_act][x][y] = color

	def getWidth():
		return self.ledw

	def getHeight():
		return self.ledh

	def clear(self):
		for x in range(self.ledw):
			for y in range(self.ledh):
				self.fb[self.fb_act][x][y] = [0, 0, 0]

	def flip(self):
		self.screen.fill((0, 0, 0))
		for event in pygame.event.get():
			if (event.type == pygame.QUIT):
				exitok.exit()

			if event.type == pygame.KEYDOWN:
				if event.key == pygame.K_ESCAPE or event.key == 113:
					exitok.exit()			 

		# Draw out the currently active Matrix
		for x in range(self.ledw):
			for y in range(self.ledh):
				color_mtx = self.fb[self.fb_act][x][y]
				color = (color_mtx[0], color_mtx[1], color_mtx[2])
				rect = (x / self.ledw * WINDOW_WIDTH, y / self.ledh * WINDOW_HEIGHT,
					WINDOW_WIDTH / self.ledw - 1, WINDOW_HEIGHT / self.ledh - 1)
				pygame.draw.rect(self.screen, color, rect, 0)
		pygame.display.flip()

		self.fb_act = 1 if self.fb_act == 0 else 0
		self.clear()
