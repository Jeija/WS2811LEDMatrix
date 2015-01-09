#include <avr/pgmspace.h>
#include <stdbool.h>
#include <avr/io.h>

#include "enc28j60.h"
#include "ethernet.h"

static uint8_t macaddr[6];
static uint8_t ipaddr[4];

void network_set(uint8_t *mymac,uint8_t *myip)
{
	uint8_t i;
	for(i=0; i<4; i++) ipaddr[i] = myip[i];
	for(i=0; i<6; i++) macaddr[i] = mymac[i];
}

uint16_t checksum(uint8_t *buf, uint16_t len,uint8_t type)
{
	uint32_t sum = 0;
	if(type==1)
	{
		sum += IP_UDP;
		sum += len-8;
	}
	if(type==2)
	{
		sum+=IP_TCP;
		sum+=len-8;
	}
	while(len>1)
	{
		sum += 0xFFFF & (((uint32_t)*buf<<8)|*(buf+1));
		buf+=2;
		len-=2;
	}
	if(len) sum += ((uint32_t)(0xFF & *buf))<<8;
	while(sum>>16) sum = (sum & 0xFFFF)+(sum >> 16);
	return( (uint16_t) sum ^ 0xFFFF);
}

uint8_t eth_is_arp(uint8_t *buf,uint16_t len)
{
	uint8_t i=0;
	if (len<41) return(0);
	if(buf[ETH_TYPE] != ETH_ARP_H) return(0);
	if(buf[ETH_TYPE+1] != ETH_ARP_L) return(0);
	for(i=0; i<4; i++) if(buf[ARP_DST_IP+i] != ipaddr[i]) return(0);
	return(1);
}

uint8_t eth_is_ip(uint8_t *buf,uint16_t len)
{
	uint8_t i=0;
	if(len<42) return(0);
	if(buf[ETH_TYPE] != ETH_IP_H) return(0);
	if(buf[ETH_TYPE+1] != ETH_IP_L) return(0);
	if(buf[IP_VERSION] != 0x45) return(0);
	for(i=0; i<4; i++) if(buf[IP_DST+i]!=ipaddr[i]) return(0);
	return(1);
}

void make_eth_hdr(uint8_t *buf)
{
	uint8_t i=0;
	for(i=0; i<6; i++)
	{
		buf[ETH_DST_MAC+i]=buf[ETH_SRC_MAC+i];
		buf[ETH_SRC_MAC+i]=macaddr[i];
	}
}

void make_ip_checksum(uint8_t *buf)
{
	uint16_t ck;
	buf[IP_CHECKSUM]=0;
	buf[IP_CHECKSUM+1]=0;
	buf[IP_FLAGS]=0x40;
	buf[IP_FLAGS+1]=0;
	buf[IP_TTL]=64;
	ck = checksum(&buf[0x0E],IP_HEADER_LEN,0);
	buf[IP_CHECKSUM] = ck >> 8;
	buf[IP_CHECKSUM+1] = ck & 0xFF;
}

void make_ip_hdr(uint8_t *buf)
{
	uint8_t i=0;
	while(i<4)
	{
		buf[IP_DST+i]=buf[IP_SRC+i];
		buf[IP_SRC+i]=ipaddr[i];
		i++;
	}
	make_ip_checksum(buf);
}

void arp_reply(uint8_t *buf)
{
	uint8_t i=0;
	make_eth_hdr(buf);
	buf[ARP_OPCODE] = ARP_REPLY_H;
	buf[ARP_OPCODE+1] = ARP_REPLY_L;
	for(i=0; i<6; i++)
	{
		buf[ARP_DST_MAC+i] = buf[ARP_SRC_MAC+i];
		buf[ARP_SRC_MAC+i] = macaddr[i];
	}
	for(i=0; i<4; i++)
	{
		buf[ARP_DST_IP+i]=buf[ARP_SRC_IP+i];
		buf[ARP_SRC_IP+i]=ipaddr[i];
	}
	enc28j60_sendPacket(42,buf);
}

void icmp_reply(uint8_t *buf,uint16_t len)
{
	make_eth_hdr(buf);
	make_ip_hdr(buf);
	buf[ICMP_TYPE] = ICMP_REPLY;
	if(buf[ICMP_CHECKSUM] > (0xFF-0x08)) buf[ICMP_CHECKSUM+1]++;
	buf[ICMP_CHECKSUM] += 0x08;
	enc28j60_sendPacket(len,buf);
}
