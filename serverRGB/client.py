import network
import socket
import machine
import time
import json

# Configurar Wi-Fi
SSID = 'Tenda_73E5E0'
PASSWORD = 'b6ksnu2YNd'

# Conectar a la red Wi-Fi
wlan = network.WLAN(network.STA_IF)
wlan.active(True)
wlan.connect(SSID, PASSWORD)

while not wlan.isconnected():
    time.sleep(1)

print('Conectado a la red:', wlan.ifconfig())

# Configuración del LED RGB
red_pin = machine.PWM(machine.Pin(0))    # Ajusta los pines según tu conexión
green_pin = machine.PWM(machine.Pin(1))
blue_pin = machine.PWM(machine.Pin(2))

red_pin.freq(1000)
green_pin.freq(1000)
blue_pin.freq(1000)

# Cliente TCP
TCP_IP = '192.168.0.223'  # Reemplaza con la dirección IP de tu Raspberry Pi
TCP_PORT = 3001

def set_rgb(r, g, b):
    red_pin.duty_u16(int(r * 65535 / 255))
    green_pin.duty_u16(int(g * 65535 / 255))
    blue_pin.duty_u16(int(b * 65535 / 255))

def receive_rgb():
    client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    client_socket.connect((TCP_IP, TCP_PORT))

    while True:
        data = client_socket.recv(1024)
        if data:
            try:
                rgb = json.loads(data.decode())
                set_rgb(rgb['r'], rgb['g'], rgb['b'])
                print('Valores RGB recibidos:', rgb)
            except Exception as e:
                print('Error al procesar datos:', e)

    client_socket.close()

# Iniciar la recepción de valores RGB
receive_rgb()