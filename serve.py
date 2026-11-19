import http.server
import socketserver
import socket
import os

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def get_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return '127.0.0.1'

if __name__ == '__main__':
    local_ip = get_ip()
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print("="*60)
        print("  AVEOLOG AI — SERVIDOR LOCAL PWA")
        print("="*60)
        print(f"  Local:    http://localhost:{PORT}")
        print(f"  Red/WiFi: http://{local_ip}:{PORT}")
        print("="*60)
        print("Presiona Ctrl+C para detener el servidor.\n")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServidor detenido.")
