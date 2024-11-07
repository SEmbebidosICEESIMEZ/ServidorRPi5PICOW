import network
import socket
import machine
import time
from sh1106 import SH1106_I2C  # Asegúrate de que esta biblioteca esté disponible

# Configurar Wi-Fi
SSID = 'Tenda_73E5E0'  # Reemplaza con tu SSID
PASSWORD = 'b6ksnu2YNd'  # Reemplaza con tu contraseña

# Conectar a la red Wi-Fi
wlan = network.WLAN(network.STA_IF)
wlan.active(True)
wlan.connect(SSID, PASSWORD)

# Esperar a que se conecte
while not wlan.isconnected():
    time.sleep(1)

print('Conectado a la red:', wlan.ifconfig())

# Configuración del botón
button_pin = machine.Pin(15, machine.Pin.IN, machine.Pin.PULL_UP)  # Cambia el número de pin según tu conexión
count = 0  # Inicializar el contador

# Cliente TCP
TCP_IP = '192.168.0.223'  # Reemplaza con la dirección IP de tu servidor
TCP_PORT = 3001  # Puerto del servidor TCP

# Configuración de la pantalla I2C
i2c = machine.I2C(0, scl=machine.Pin(1), sda=machine.Pin(0))  # Ajusta los pines SCL y SDA según tu conexión
oled = SH1106_I2C(128, 64, i2c)  # Inicializa la pantalla SH1106

# Función de interrupción
def button_handler(pin):
    global count
    count += 1  # Incrementar el conteo
    print('Botón presionado, conteo:', count)

# Configurar la interrupción
button_pin.irq(trigger=machine.Pin.IRQ_FALLING, handler=button_handler)

# Función para enviar el conteo al servidor
def send_count():
    client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)  # Crear el socket
    client_socket.connect((TCP_IP, TCP_PORT))  # Conectar al servidor TCP

    while True:
        client_socket.send(str(count).encode())  # Enviar el conteo como string
        
        # Mostrar el conteo en la pantalla
        oled.fill(0)  # Limpiar la pantalla
        oled.text('Conteo:', 0, 0)  # Mostrar texto
        oled.text(str(count), 0, 10)  # Mostrar el conteo
        oled.show()  # Actualizar la pantalla
        
        time.sleep(1)  # Enviar cada segundo

    client_socket.close()  # Cerrar el socket al final (aunque este código no se alcanzará)

# Iniciar el envío de conteos
send_count()
