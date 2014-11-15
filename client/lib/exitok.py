#!/usr/bin/env python

import signal
import sys

exit_handlers = []

def register(handler):
	exit_handlers.append(handler)

def _exitok_onsignal(*args):
	for handler in exit_handlers:
		handler()
	sys.exit(0)

def exit():
	_exitok_onsignal()

signal.signal(signal.SIGINT, _exitok_onsignal)
signal.signal(signal.SIGTERM, _exitok_onsignal)
