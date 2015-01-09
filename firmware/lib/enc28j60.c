#include <avr/io.h>
#include <util/delay.h>
#include <inttypes.h>
#include <stdbool.h>
#include "enc28j60.h"
#include "../config.h"

static uint8_t enc28j60_bank;
static uint16_t gNextPacketPtr;

#define csactive() SPI_PORT &= ~(1 << SPI_CS)
#define cspassive() SPI_PORT |= (1 << SPI_CS)
#define waitspi() while (!(SPSR&(1 << SPIF)));

uint8_t enc28j60_readOp(uint8_t op, uint8_t address)
{
	csactive();
	SPDR = op | (address & ADDR_MASK);
	waitspi();
	SPDR = 0x00;
	waitspi();
	if (address & 0x80)
	{
		SPDR = 0x00;
		waitspi();
	}
	cspassive();
	return SPDR;
}

void enc28j60_writeOp(uint8_t op, uint8_t address, uint8_t data)
{
	csactive();
	SPDR = op | (address & ADDR_MASK);
	waitspi();
	SPDR = data;
	waitspi();
	cspassive();
}

void enc28j60_readBuffer(uint16_t len, uint8_t* data)
{
	csactive();
	SPDR = RBM;
	waitspi();
	while (len)
	{
		len--;
		SPDR = 0x00;
		waitspi();
		*data = SPDR;
		data++;
	}
	*data='\0';
	cspassive();
}

void enc28j60_writeBuffer(uint16_t len, uint8_t* data)
{
	csactive();
	SPDR = WBM;
	waitspi();
	while (len)
	{
		len--;
		SPDR = *data;
		data++;
		waitspi();
	}
	cspassive();
}

void enc28j60_setBank(uint8_t address)
{
	if ((address & BANK_MASK) != enc28j60_bank)
	{
		enc28j60_writeOp(BFC, ECON1, (BSEL1|BSEL0));
		enc28j60_writeOp(BFS, ECON1, (address & BANK_MASK) >> 5);
		enc28j60_bank = (address & BANK_MASK);
	}
}

uint8_t enc28j60_read(uint8_t address)
{
	enc28j60_setBank(address);
	return enc28j60_readOp(RCR, address);
}

void enc28j60_write(uint8_t address, uint8_t data)
{
	enc28j60_setBank(address);
	enc28j60_writeOp(WCR, address, data);
}

uint16_t enc28j60_readPhy(uint8_t address)
{
	enc28j60_write(MIREGADR, address);
	enc28j60_write(MICMD, MIIRD);
	_delay_us(15);
	while (enc28j60_read(MISTAT) & BUSY);
	enc28j60_write(MICMD, 0x00);
	return enc28j60_read(MIRDH);
}

void enc28j60_writePhy(uint8_t address, uint16_t data)
{
	enc28j60_write(MIREGADR, address);
	enc28j60_write(MIWRL, data);
	enc28j60_write(MIWRH, data >> 8);
	while (enc28j60_read(MISTAT) & BUSY) _delay_us(15);
}

void enc28j60_clk(uint8_t clock)
{
	enc28j60_write(ECOCON, clock & 0x7);
}

void enc28j60_init(uint8_t* macaddr)
{
	SPI_DDR |= (1 << SPI_CS);
	cspassive();
	SPI_DDR |= (1 << SPI_MOSI)|(1 << SPI_SCK);
	SPI_DDR &= ~(1 << SPI_MISO);
	SPI_PORT &= ~(1 << SPI_MOSI);
	SPI_PORT &= ~(1 << SPI_SCK);
	SPCR = (1 << SPE)|(1 << MSTR);
	SPSR |= (1 << SPI2X);
	enc28j60_writeOp(SC, 0, SC);
	_delay_loop_1(205);
	gNextPacketPtr = RXSTART_INIT;
	enc28j60_write(ERXSTL, RXSTART_INIT & 0xFF);
	enc28j60_write(ERXSTH, RXSTART_INIT >> 8);
	enc28j60_write(ERXRDPTL, RXSTART_INIT & 0xFF);
	enc28j60_write(ERXRDPTH, RXSTART_INIT >> 8);
	enc28j60_write(ERXNDL, RXSTOP_INIT & 0xFF);
	enc28j60_write(ERXNDH, RXSTOP_INIT >> 8);
	enc28j60_write(ETXSTL, TXSTART_INIT & 0xFF);
	enc28j60_write(ETXSTH, TXSTART_INIT >> 8);
	enc28j60_write(ETXNDL, TXSTOP_INIT & 0xFF);
	enc28j60_write(ETXNDH, TXSTOP_INIT >> 8);
	enc28j60_write(ERXFCON, UCEN|CRCEN|PMEN);
	enc28j60_write(EPMM0, 0x3f);
	enc28j60_write(EPMM1, 0x30);
	enc28j60_write(EPMCSL, 0xf9);
	enc28j60_write(EPMCSH, 0xf7);
	enc28j60_write(MACON1, (MARXEN|TXPAUS|RXPAUS));
	enc28j60_write(MACON2, 0x00);
	enc28j60_writeOp(BFS, MACON3, (PADCFG0|TXCRCEN|FRMLNEN));
	enc28j60_write(MAIPGL, 0x12);
	enc28j60_write(MAIPGH, 0x0C);
	enc28j60_write(MABBIPG, 0x12);
	enc28j60_write(MAMXFLL, MAX_FRAMELEN & 0xFF);
	enc28j60_write(MAMXFLH, MAX_FRAMELEN >> 8);
	enc28j60_write(MAADR5, macaddr[0]);
	enc28j60_write(MAADR4, macaddr[1]);
	enc28j60_write(MAADR3, macaddr[2]);
	enc28j60_write(MAADR2, macaddr[3]);
	enc28j60_write(MAADR1, macaddr[4]);
	enc28j60_write(MAADR0, macaddr[5]);
	enc28j60_writePhy(PHCON2, HDLDIS);
	enc28j60_setBank(ECON1);
	enc28j60_writeOp(BFS, EIE, (INTIE|PKTIE));
	enc28j60_writeOp(BFS, ECON1, RXEN2);
}

bool enc28j60_incomingPacket(void)
{
	if (enc28j60_read(EPKTCNT) == 0) return false;
	return true;
}

uint16_t enc28j60_receivePacket(uint16_t maxlen, uint8_t* packet)
{
	uint16_t rxstat;
	uint16_t len;
	if (enc28j60_read(EPKTCNT) == 0) return false;
	enc28j60_write(ERDPTL, gNextPacketPtr & 0xFF);
	enc28j60_write(ERDPTH, gNextPacketPtr >> 8);
	gNextPacketPtr = enc28j60_readOp(RBM, 0);
	gNextPacketPtr |= enc28j60_readOp(RBM, 0) << 8;
	len = enc28j60_readOp(RBM, 0);
	len |= enc28j60_readOp(RBM, 0) << 8;
	len -= 4;
	rxstat = enc28j60_readOp(RBM, 0);
	rxstat |= ((uint16_t)enc28j60_readOp(RBM, 0)) << 8;
	if (len>maxlen - 1) len=maxlen - 1;
	if ((rxstat & 0x80) == 0) len=0;
	else enc28j60_readBuffer(len, packet);
	enc28j60_write(ERXRDPTL, (gNextPacketPtr & 0xFF));
	enc28j60_write(ERXRDPTH, (gNextPacketPtr) >> 8);
	if ((gNextPacketPtr - 1 < RXSTART_INIT) || (gNextPacketPtr - 1 > RXSTOP_INIT))
	{
		enc28j60_write(ERXRDPTL, (RXSTOP_INIT) & 0xFF);
		enc28j60_write(ERXRDPTH, (RXSTOP_INIT) >> 8);
	}
	else
	{
		enc28j60_write(ERXRDPTL, (gNextPacketPtr - 1) & 0xFF);
		enc28j60_write(ERXRDPTH, (gNextPacketPtr - 1) >> 8);
	}
	enc28j60_writeOp(BFS, ECON2, PKTDEC);
	return len;
}

void enc28j60_sendPacket(uint16_t len, uint8_t* packet)
{
	while (enc28j60_readOp(RCR, ECON1) & TXRTS)
	{
		if (enc28j60_read(EIR) & TXERIF)
		{
			enc28j60_writeOp(BFS, ECON1, TXRST);
			enc28j60_writeOp(BFC, ECON1, TXRST);
		}
	}
	enc28j60_write(EWRPTL, TXSTART_INIT & 0xFF);
	enc28j60_write(EWRPTH, TXSTART_INIT >> 8);
	enc28j60_write(ETXNDL, (TXSTART_INIT+len) & 0xFF);
	enc28j60_write(ETXNDH, (TXSTART_INIT+len) >> 8);
	enc28j60_writeOp(WBM, 0, 0x00);
	enc28j60_writeBuffer(len, packet);
	enc28j60_writeOp(BFS, ECON1, TXRTS);
}

uint8_t enc28j60_getRev(void)
{
	return enc28j60_read(EREVID);
}

uint8_t enc28j60_linkUp(void)
{
	return (enc28j60_readPhy(PHSTAT2) && 4);
}
