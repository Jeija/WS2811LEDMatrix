#include <inttypes.h>
#include <stdbool.h>

#ifndef _NET_H
#define _NET_H

uint16_t getpacket(uint8_t *buf, uint16_t maxsize);
bool decode_udp(uint8_t *buf, uint16_t *port);
void network_init(uint8_t *mac, uint8_t *ip);

#endif
