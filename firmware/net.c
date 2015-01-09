#include <avr/pgmspace.h>
#include <util/delay.h>
#include <stdlib.h>
#include <string.h>

#include "lib/enc28j60.h"
#include "lib/ethernet.h"

#include "config.h"
#include "net.h"

/**
 * Note: Network Packets Headers (Ethernet II)
 * Basics:
 * [14 bytes] Ethernet II header
 * [20 bytes] IPv4 header
 * [.. bytes] TCP / UDP / .. packet
 *
 * For UDP and IPv4 that is:
 * ------------ Ethernet ------------
 * [ 6 bytes] [ 0 -  5] Destination MAC
 * [ 6 bytes] [ 6 - 11] Source MAC
 * [ 2 bytes] [12 - 13] Layer 3 Type (IPv4)
 * -------------- IPv4 --------------
 * [ 1 byte ] [13 - 13] Version + Header Length
 * [ 1 byte ] [14 - 14] Type of service
 * [ 2 bytes] [15 - 16] Total length
 * [ 2 bytes] [17 - 18] Identification
 * [ 2 bytes] [19 - 20] Flags + Fragment Offset
 * [ 1 byte ] [21 - 21] Time to Live
 * [ 1 byte ] [22 - 22] Protocol (0x11 for UDP)
 * [ 2 bytes] [23 - 24] Header checksum
 * [ 4 bytes] [25 - 28] Source IPv4 address
 * [ 4 bytes] [29 - 32] Destination IPv4 address
 * --------------- UDP --------------
 * [ 2 bytes] [33 - 34] Source Port
 * [ 2 bytes] [35 - 36] Destination Port
 */

// Handles default packets and returns others
// Return value: length of packet or 0 if none available
// buf = pointer to data storage of packet
uint16_t getpacket(uint8_t *buf, uint16_t maxsize)
{
	// Retrieve packet from ENC28J60
	uint16_t len = enc28j60_receivePacket(maxsize, buf);
	if(len == 0) return 0;

	// Answer ARP packets
	if(eth_is_arp(buf, len))
		arp_reply(buf);

	// Answer ICMP pings
	else if (buf[IP_PROTO]==IP_ICMP && buf[ICMP_TYPE]==ICMP_REQUEST)
		icmp_reply(buf, len);

	// Ignore non-IP packets other than ARP
	else if (eth_is_ip(buf, len))
		return len;

	return 0;
}

// Returns true if buf is a UDP packet
// Sets port to UDP destination port
bool decode_udp(uint8_t *buf, uint16_t *port)
{
	if (buf[IP_PROTO] != IP_UDP) return false;

	*port = (buf[UDP_DST_PORT] << 8) + buf[UDP_DST_PORT+1];
	return true;
}

// Initializes ENC28J60 with IP
void network_init(uint8_t *mac, uint8_t *ip)
{
	enc28j60_init(mac);
	enc28j60_clk(2);
	_delay_us(10);

	// LED configuration
	enc28j60_writePhy(PHLCON, 0x3742);
	_delay_us(10);

	network_set(mac, ip);
}
