# WS2811 LED Matrix with ATMega16, Python and node.js Client
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
* LED Matrix Protocol UDP Port: 2711
* Number of LEDs per controller board: 100
* Maximum ethernet packet size: 400 bytes

... or edit these values and flash your own firmware, from within `firmware`, execute:
* `make` to compile the firmware
* `make flash` to flash the firmware to the microcontroller, make sure to adjust your programmer settings in the Makefile
* `make clean` to remove unnecessary files

By default, the firmware for the bottom right LED Matrix (in the constellation as preset in the node.js client) is flashed. The firmwares differ in their MAC and IP address. You can change this behaviour by defining which firmware you are flashing yourself:

`make flash MATRIXCONF=MATRIX_TOPLEFT`

Where available matrix names are:
* MATRIX_TOPLEFT (192.168.0.90)
* MATRIX_LEFT (192.168.0.91)
* MATRIX_RIGHT (192.168.0.92)
* MATRIX_TOPRIGHT (192.168.0.93)
* MATRIX_SPECIAL (192.168.0.80)

You should then be able to `ping` and `arping` your board when connected to the LAN.

## Run the Client / Emulator
### node.js client
The node.js client currently is the full-featured client for the LED Matrix and allows for live input of animation data (e.g. corresponding to music). It has an animation queue that can be put together by multiple people at once and a site for the matrix operator with a live preview of the currently displayed picture.
* Install dependencies: You need to have node.js, `npm` and `bower` installed on your system. Go to the `client/nodejs/` and execute `npm install` to install all dependencies. Then, install the bower dependencies by executing `bower install` in `client/nodejs/site`.
* You can run the node.js server by executing `client/nodejs/server.js`: In the `client/nodejs/` directory, type `node server.js`.
* The server is now available at [localhost:8080](http://localhost:8080) or at any IP of your computer. You can manage the animation queue at [localhost:8080/queue](http://localhost:8080/queue) and execute queue elements and control the animation at [localhost:8080](http://localhost:8080). On that page, press the `n` key to start the next animation, and any of the keys `a`, `s`, `d` or `f` for rhythm input. You can toggle the recording feature that records keypresses with the `r` key and play back your recordings by pressing `p`.

For animations that use the spectrum analyzer, the animation server must get good quality music input from the default microphone or line in device. In order to play a video on the LED Matrix, you may use the script `client/nodejs/animations/convertvideo.sh` to convert the video to 20x10 pixel frames for the matrix, and then supply a path to the frame folder to the video animation settings in the queue. The pong animation is controlled by the the W/S and Up/Down keys. You may also use WiiMotes as controls for that animation, configuration files for wminput are provided in `client/nodejs/animations/pong.wminput`.

### Python client with Emulator
The LED Matrix Emulator displays a live image of the LED Matrix in a window on a regular screen. In order to run the Emulator, execute `launch` in the client/python directory. `launch` will then give a list of installed animations and instructions on how to execute them.

Depending on the animation,you may need to install the following dependencies:
* Python3 (mandatory)
* pygame for Python3 (for the emulator)
* PIL (for animations that display images)
* python-noise (for noise animations)
* Numpy and alsaaudio (for animations including sound analysis)
