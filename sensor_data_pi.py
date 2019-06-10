import numpy as np


import Adafruit_ADS1x15                #ADC
adc = Adafruit_ADS1x15.ADS1115()

import sys          
import time
import datetime
import SDL_Pi_HDC1000

hdc1000 = SDL_Pi_HDC1000.SDL_Pi_HDC1000()
hdc1000.setHumidityResolution(SDL_Pi_HDC1000.HDC1000_CONFIG_HUMIDITY_RESOLUTION_14BIT)   #TEMP

import time
import pigpio #motor
import motor3
import read_RPM

GAIN=2/3
RPM_GPIO = 6
RUN_TIME = 60.0
SAMPLE_TIME = 2.0
step= 6.144/(2**15)

class SensorData:
    #def __init__(self):
	#	self.
    p = read_RPM.RPM_reader(pigpio.pi(), RPM_GPIO,1,30)
    def readRPM(self):
        return SensorData.p.RPM()

    def readFriction(self):
        return adc.read_adc_difference(3, gain=GAIN)*step

    def readLoad(self):
        return adc.read_adc_difference(0, gain=GAIN)*step

    def readTemperature(self):
        return hdc1000.readTemperature()

    def readVibration(self):
        return 1.0

if __name__ == "__main__":
    sd=SensorData()
    for i in range(1000000):
        time.sleep(1)
        #print(sd.readRPM())
        print('friction',sd.readFriction())
        print('load',sd.readLoad())
        #print(sd.readTemperature())
        
    
    
    