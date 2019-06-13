import pigpio
import time


b= pigpio.pi()
while True:
    b.write(11, 0)# potenciometer / manual mode on
    b.write(11, 1)# Rpi           / manual mode off
    
    #b.write(9, 0) #off      / enfine off/ treshold
    #b.write(9, 1) #on       / enfine on
    time.sleep(1)
    #bb.write(11, 0)
    #b.write(9, 1)
    time.sleep(100)
