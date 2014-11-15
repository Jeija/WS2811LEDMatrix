# Work In Progress

There is a working 10x10 LED matrix prototype with an ATmega 16 Microcontroller and an enc28j60 ethernet chip. More stuff will be uploaded after finishing work on dedicated controller PCBs and a 20x20 pixel panel. ATmega 16 firmware with source code, instructions, schematics, documentation and more animations to come...

## Run the Emulator
The LED Matrix Emulator displays a live image of the LED Matrix in a window on a regular screen.In order to run the Emulator, execute `launch` in the client directory. `launch` will then give a list of installed animations and instructions on how to execute them.

Depending on the animation,you may need to install the following dependencies:
* Python3 (mandatory)
* pygame for Python3 (for the emulator)
* PIL (for animations that display images)
* python-noise (for noise animations)
* Numpy and alsaaudio (for animations including sound analysis)

