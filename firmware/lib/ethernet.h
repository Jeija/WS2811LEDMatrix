#include <inttypes.h>
#include <stdbool.h>

#ifndef NETWORK_H
#define NETWORK_H

#define ETH_HEADER_LEN 0x0E
#define ETH_DST_MAC    0x00
#define ETH_SRC_MAC    0x06
#define ETH_TYPE       0x0C
#define ETH_ARP_H      0x08
#define ETH_ARP_L      0x06
#define ETH_IP_H       0x08
#define ETH_IP_L       0x00

#define ARP_OPCODE     0x14
#define ARP_SRC_MAC    0x16
#define ARP_SRC_IP     0x1C
#define ARP_DST_MAC    0x20
#define ARP_DST_IP     0x26
#define ARP_REPLY_H    0x00
#define ARP_REPLY_L    0x02
#define ARP_DST_IP     0x26

#define IP_HEADER_LEN  0x14
#define IP_VERSION     0x0E
#define IP_TOTLEN      0x10
#define IP_FLAGS       0x14
#define IP_TTL         0x16
#define IP_PROTO       0x17
#define IP_CHECKSUM    0x18
#define IP_SRC         0x1A
#define IP_DST         0x1E
#define IP_ICMP        0x01
#define IP_TCP         0x06
#define IP_UDP         0x11

#define ICMP_TYPE      0x22
#define ICMP_CHECKSUM  0x24
#define ICMP_REQUEST   0x08
#define ICMP_REPLY     0x00

/* TCP */
#define TCP_SRC_PORT   0x22
#define TCP_DST_PORT   0x24
#define TCP_SEQ        0x26
#define TCP_SEQACK     0x2A
#define TCP_HEADER_LEN 0x2E
#define TCP_FLAGS      0x2F
#define TCP_CHECKSUM   0x32
#define TCP_OPTIONS    0x36
#define TCP_URG        0x20
#define TCP_ACK        0x10
#define TCP_PSH        0x08
#define TCP_RST        0x04
#define TCP_SYN        0x02
#define TCP_FIN        0x01
#define TCP_LEN_PLAIN  0x14

/* UDP */
#define UDP_SRC_PORT   0x22
#define UDP_DST_PORT   0x24
#define UDP_LEN        0x26
#define UDP_CKSUM      0x28
#define UDP_DATA       0x2a
#define UDP_HEADER_LEN 0x08

void network_set(uint8_t *mymac,uint8_t *myip);
uint8_t eth_is_arp(uint8_t *buf,uint16_t len);
uint8_t eth_is_ip(uint8_t *buf,uint16_t len);
void arp_reply(uint8_t *buf);
void icmp_reply(uint8_t *buf,uint16_t len);

#endif
