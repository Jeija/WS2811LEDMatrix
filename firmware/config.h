#ifndef CONFIG_H
#define CONFIG_H

#include <avr/io.h>

// ENC28J60
#define SPI_DDR		DDRB
#define SPI_PORT	PORTB
#define SPI_CS		4
#define SPI_MOSI	5
#define SPI_MISO	6
#define SPI_SCK		7

// WS2811
#define WS2811_DDR	DDRD
#define WS2811_PORT	PORTD
#define WS2811_BIT	PD2

// LEDs
#define LED_DDR		DDRB
#define LED_PORT	PORTB
#define LED_ERROR	PB1
#define LED_OK		PB2
#define LED_ACT		PB3
#define LED_ACT_FREQ	50

#endif
