import network
import socket
import machine
import time

# Configurar Wi-Fi
wlan = network.WLAN(network.STA_IF)
wlan.active(True)
wlan.connect('SSID', 'PASS')
while not wlan.isconnected():
    time.sleep(1)
print('Wi-Fi conectado:', wlan.ifconfig())

# Configurar el LED
led = machine.Pin("LED", machine.Pin.OUT)

# Cliente TCP
def start_client():
    client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    client_socket.connect(('IP', 3001))
    print('Conectado al servidor')

    while True:
        command = client_socket.recv(1024).decode()
        if command == 'on':
            led.value(1)
        elif command == 'off':
            led.value(0)

start_client()
