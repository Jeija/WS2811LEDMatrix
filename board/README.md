# Warning!
The PCB design works just fine, but contains a small flaw that makes PCB assembly quite hard: The ENC28J60 SOIC-28-Chip uses a **wide** package. The PCB however uses the normal, narrow package.

The issue can easily be fixed by changing the package to the wide version in Pcbnew. With good soldering skills wide SOIC-Chips can also be soldered on narrow footprints, but it is a lot of unneccesary work.
