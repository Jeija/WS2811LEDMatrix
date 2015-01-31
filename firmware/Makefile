# AVR-GCC Settings
MCU=atmega16
F_CPU = 16000000
CC=avr-gcc
OBJCOPY=avr-objcopy
CFLAGS=-g -mmcu=$(MCU) -Wall -DF_CPU=$(F_CPU) -O1
MATRIXCONF=MATRIX_LEFT
TARGET=main

# AVRDUDE Settings
PROGRAMMER=stk500v2
PORT=/dev/ttyACM0

BUILDDIR=build
LIBDIR=lib

all:
	@echo Compiling
	$(CC) $(CFLAGS) -D$(MATRIXCONF) -c $(LIBDIR)/enc28j60.c
	$(CC) $(CFLAGS) -D$(MATRIXCONF) -c $(LIBDIR)/ethernet.c
	$(CC) $(CFLAGS) -D$(MATRIXCONF) -c $(TARGET).c
	$(CC) $(CFLAGS) -D$(MATRIXCONF) -c net.c
	$(CC) $(CFLAGS) -D$(MATRIXCONF) -o $(TARGET).out main.o ethernet.o enc28j60.o net.o
	$(OBJCOPY) -R .eeprom -O ihex $(TARGET).out $(BUILDDIR)/$(TARGET).hex
	@echo Compilation succesfull. Type \"sudo make flash\" to flash the firmware.

$(BUILDDIR)/$(TARGET).hex: all

clean:
	$(RM) *.map *.o *.out
	$(RM) $(BUILDDIR)/main.hex
	$(RM) $(LIBDIR)/*~
	$(RM) *~
	
flash: $(BUILDDIR)/$(TARGET).hex
	avrdude -c$(PROGRAMMER) -p$(MCU) -U flash:w:$(BUILDDIR)/$(TARGET).hex -P $(PORT)
