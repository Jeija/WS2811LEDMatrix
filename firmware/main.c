// System
#include <avr/pgmspace.h>
#include <util/delay.h>
#include <stdbool.h>
#include <avr/io.h>

// Project
#include "lib/ethernet.h"
#include "config.h"
#include "util.h"
#include "net.h"

#define BUFFER_SIZE 400
#define MXP_PORT 2711
#define LED_NUM 100

// Network Configuration
#if defined(MATRIX_TOPLEFT)
	uint8_t mac[6] = {0x4c, 0x45, 0x4d, 0x48, 0x51, 0x01};
	uint8_t ip[4] = {192, 168, 0, 90};
#elif defined(MATRIX_LEFT)
	uint8_t mac[6] = {0x4c, 0x45, 0x4d, 0x48, 0x52, 0x02};
	uint8_t ip[4] = {192, 168, 0, 91};
#elif defined(MATRIX_RIGHT)
	uint8_t mac[6] = {0x4c, 0x45, 0x4d, 0x48, 0x53, 0x03};
	uint8_t ip[4] = {192, 168, 0, 92};
#elif defined(MATRIX_TOPRIGHT)
	uint8_t mac[6] = {0x4c, 0x45, 0x4d, 0x48, 0x54, 0x04};
	uint8_t ip[4] = {192, 168, 0, 93};
#endif

#if F_CPU != 16000000
#error "F_CPU must be 16000000 as the timing is adapted to a 16MHz crystal"
#endif

/**
 * ############################
 * LED Matrix UDP Data Protocol
 * ############################
 * [ 1 byte ] [ 0 -  0] Packet type
 *	- 0x00 = [MXP_FRM] Frame data from PC
 *
 * In case of frame data:
 * [ 2 bytes] [ 1 -     2] Offset (nth LED in string); MUST BE 0 IN THIS IMPLEMENTATION
 * [ 2 bytes] [ 3 -     4] Length of data in LEDs (number n of bytes / 3), must be <= LED_NUM
 * [ n bytes] [ 5 - n + 5] Frame data, which consists of:
 * ----------- Frame data -----------
 * [ 1 byte] Red from 0-255
 * [ 1 byte] Green from 0-255
 * [ 1 byte] Blue from 0-255
 * This 3-byte Order is repeated for each LED pixel (so Length / 3 times)
 * --> There are Length * 3 bytes of color data in total
 */

bool check_mxp(uint8_t *buf, uint16_t port)
{
	// Ignore any request on different ports
	if (port != MXP_PORT) return false;

	// Is frame data packet (no control data or invalid data)
	if (buf[UDP_DATA] != 0x00) return false;

	// Ignore requests with length > LED_NUM or offset != 0
	uint16_t offset = (buf[UDP_DATA+1] << 8) + buf[UDP_DATA+2];
	uint16_t length = (buf[UDP_DATA+3] << 8) + buf[UDP_DATA+4];
	if (offset != 0 || length > LED_NUM) return false;

	return true;
}

// With F_CPU 16000000, WS2811_delay250 delays exactly 250 ns
#define nop()  __asm__ __volatile__("nop")
#define WS2811_reset() _delay_us(50)
#define WS2811_delay250() nop(); nop(); nop(); nop();

void WS2811_putbit(bool bit)
{
	if (bit)
	{
		// Code for 1
		sbi(WS2811_PORT, WS2811_BIT);
		WS2811_delay250();
		WS2811_delay250();
		nop();
		nop();
		cbi(WS2811_PORT, WS2811_BIT);
		WS2811_delay250();
		nop();
		nop();
		nop();
	}
	else
	{
		// Code for 0
		sbi(WS2811_PORT, WS2811_BIT);
		WS2811_delay250();
		cbi(WS2811_PORT, WS2811_BIT);
		WS2811_delay250();
		WS2811_delay250();
	}
}

void WS2811_putbyte(uint8_t byte)
{
	WS2811_putbit(gbi(byte, 7));
	WS2811_putbit(gbi(byte, 6));
	WS2811_putbit(gbi(byte, 5));
	WS2811_putbit(gbi(byte, 4));
	WS2811_putbit(gbi(byte, 3));
	WS2811_putbit(gbi(byte, 2));
	WS2811_putbit(gbi(byte, 1));
	WS2811_putbit(gbi(byte, 0));
}

inline void WS2811_putcolor(uint8_t *color)
{
	WS2811_putbyte(color[0]);
	WS2811_putbyte(color[1]);
	WS2811_putbyte(color[2]);
}

int main(void)
{
	uint8_t buf[BUFFER_SIZE + 1];
	uint8_t noframes_count = 0;
	uint8_t toggle_count = 0;
	uint16_t port;

	/**
	 * LEDs:
	 * Constants <--> Port I/O mapping in config.h
	 * LED_ERROR:	Glows when no new frames are incoming, red
	 * LED_OK:	Glows while frames are incoming, green
	 * LED_ACT:	Toggles ever LED_ACT_FREQ (50 by default) new packets, blue
	 */
	sbi(LED_DDR, LED_ERROR);
	sbi(LED_DDR, LED_ACT);
	sbi(LED_DDR, LED_OK);

	network_init(mac, ip);
	sbi(WS2811_DDR, WS2811_BIT);

	for(;;)
	{
		// Error: no new frames
		if (noframes_count > 200)
		{
			sbi(LED_PORT, LED_ERROR);
			cbi(LED_PORT, LED_ACT);
			cbi(LED_PORT, LED_OK);
		}

		// OK, all systems operational
		else
		{
			cbi(LED_PORT, LED_ERROR);
			sbi(LED_PORT, LED_OK);
		}

		/** READ DATA FROM MASTER **/
		if (!getpacket(buf, BUFFER_SIZE))
		{
			if (noframes_count < 0xff) noframes_count++;
			_delay_us(200);
			continue;
		}

		if (decode_udp(buf, &port) && check_mxp(buf, port))
		{
			/** SEND DATA TO MATRIX **/
			uint8_t led;
			for (led = 0; led < LED_NUM;)
				WS2811_putcolor(&buf[UDP_DATA + 5 + led++ * 3]);

			WS2811_reset();
			noframes_count = 0;
		}

		// Toggle activity LED every 50 frames
		if (toggle_count++ > 50)
		{
			tbi(LED_PORT, LED_ACT);
			toggle_count = 0;
		}
	}

	return 0;
}
