# WS2811 LED Matrix with ATMega16 and Pyhton Client
Our setup consists of the following:
* 4 LED matrix panels at the size of 0.5m * 0.5m and 10x10 pixels. That makes for 20x20 pixels and 1m x 1m display area in total. Also includes 8x 3A-PSUs at 5V to provide the total required maximum 120W. The panel uses [fairly cheap LED pixels from china](http://www.aliexpress.com/item/Diameter-12mm-500pcs-WS2811-LED-pixel-module-IP68-waterproof-DC5V-full-color-christmas-tree-decration/1234045959.html).
* A controller PCB that translates frames sent to it from the client over LAN to signals for the LED matrix using simple bit-banging
* A client software that generates the images to display on the LED matrix. It can run standalone from it and just provide a simulation or stream the simulation to the matrix.

## Build the Controller Board
Each 10x10 LED matrix segment is controlled by an ATMega16 microcontroller with ENC28J60 ethernet chip. That way, LED matrix data can simply be streamed over the LAN from one client to multiple LED matrices at a framerate of more than 200fps.

You can use the [Pollin AVR-NET-IO](http://www.pollin.de/shop/dt/MTQ5OTgxOTk-/Bausaetze_Module/Bausaetze/Bausatz_AVR_NET_IO.html) with an ATMega16 or - for a cheaper and smaller alternative - build a dedicated LED Matrix controller from the schematic + PCB files in the `board` subdirectory.

Make sure to connect the WS2811 LED matrix input to PORTD 2, or edit config.h
Make sure to arrange the LEDs and the matrices as configured in `client/config/lookup.csv` or edit that file to fit your requirements.

## Flash the Firmware
You can either just flash the prebuilt firmware in `firmware/build/main.hex` onto the ATMega16 and accept the following default values:
* IP Address: 192.168.0.91
* MAC Address: 4c:45:4d:41:54:52
* LED Matrix Protocol UDP Port: 2711
* Number of LEDs per controller board: 100
* Maximum ethernet packet size: 400 bytes

... or edit these values and flash your own firmware, from within `firmware`, execute:
* `make` to compile the firmware
* `make flash` to flash the firmware to the microcontroller, make sure to adjust your programmer settings in the Makefile
* `make clean` to remove unneccesary files

You should then be able to `ping` and `arping` your board when connected to the LAN.

## Run the Client / Emulator
The LED Matrix Emulator displays a live image of the LED Matrix in a window on a regular screen.In order to run the Emulator, execute `launch` in the client directory. `launch` will then give a list of installed animations and instructions on how to execute them.

Depending on the animation,you may need to install the following dependencies:
* Python3 (mandatory)
* pygame for Python3 (for the emulator)
* PIL (for animations that display images)
* python-noise (for noise animations)
* Numpy and alsaaudio (for animations including sound analysis)

