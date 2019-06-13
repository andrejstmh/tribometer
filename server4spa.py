import urllib.parse
import http.server
import socketserver
import re
from pathlib import Path

HOST = ('0.0.0.0', 8765)
pattern = re.compile('.png|.jpg|.jpeg|.js|.css|.ico|.gif|.svg', re.IGNORECASE)

class Handler(http.server.SimpleHTTPRequestHandler):
	def do_GET(self):
		url_parts = urllib.parse.urlparse(self.path)
		request_file_path = Path(url_parts.path.strip("/"))
		ext = request_file_path.suffix
		if not request_file_path.is_file() and not pattern.match(ext):
			self.path = '/webapp/dist/index.html'
		return http.server.SimpleHTTPRequestHandler.do_GET(self)

if __name__ == '__main__':
	httpd = socketserver.TCPServer(HOST, Handler)
	httpd.serve_forever()



#"""
#Modification of `python -m SimpleHTTPServer` with a fallback to /index.html
#on requests for non-existing files.

#This is useful when serving a static single page application using the HTML5
#history API.
#"""

#import os
#import sys
#import urlparse
#import SimpleHTTPServer
#import BaseHTTPServer


#class Handler(SimpleHTTPServer.SimpleHTTPRequestHandler):
#	def do_GET(self):
#		urlparts = urlparse.urlparse(self.path)
#		request_file_path = urlparts.path.strip('/')
#		if not os.path.exists(request_file_path):
#			self.path = 'index.html'
#		return SimpleHTTPServer.SimpleHTTPRequestHandler.do_GET(self)

#host = '0.0.0.0'
#try:
#	port = int(sys.argv[1])
#except IndexError:
#	port = 8000

#httpd = BaseHTTPServer.HTTPServer((host, port), Handler)
#print ('Serving HTTP on %s port %d ...' % (host, port))
#httpd.serve_forever()