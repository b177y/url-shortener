import BaseHTTPServer
import SimpleHTTPServer
import os

class MyHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):
    def do_GET(self):
        path = self.translate_path(self.path)
        if not os.path.exists(path):
            self.path = '404.html'
        SimpleHTTPServer.SimpleHTTPRequestHandler.do_GET(self)

BaseHTTPServer.test(MyHandler, BaseHTTPServer.HTTPServer)
