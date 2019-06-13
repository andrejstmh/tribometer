import pigpio
import time


b= pigpio.pi()
while True:
    b.write(11, 0)# patenciometer
    b.write(11, 1)# Rpi
    
    #b.write(9, 0) #off
    #b.write(9, 1) #on
    time.sleep(1)
    #bb.write(11, 0)
    #b.write(9, 1)
    time.sleep(100)
