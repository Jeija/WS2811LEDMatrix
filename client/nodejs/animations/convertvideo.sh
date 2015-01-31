#!/bin/bash
# This script converts a video so that the video animation can play it, using ffmpeg

set -e
if ( [ -n "$1"] || [ -n "$2" ] ); then
	echo "Usage: convertvideo.sh <inputvideo> <outputdir>"
fi
mkdir -p "$2"

echo "Converting Video"
ffmpeg -i "$1" -vf scale=20:10 "$2/%07d.png"

echo "Converting Audio"
ffmpeg -i "$1" -vn "$2/audio.wav"

ABSOLUTE_PATH=$(readlink -f $2)
echo "Done!"
echo "Use the following string for the path URL: $ABSOLUTE_PATH"
