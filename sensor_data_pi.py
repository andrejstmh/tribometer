import numpy as np


import Adafruit_ADS1x15                #ADC
adc = Adafruit_ADS1x15.ADS1115()

import sys
import SDL_Pi_HDC1000
import pigpio #motor
import motor3
import read_RPM

GAIN=2/3
RPM_GPIO = 6
RUN_TIME = 60.0
SAMPLE_TIME = 2.0
step= 6.144/(2**15)

hdc1000 = None
while hdc1000 is None:
    try:
        hdc1000 = SDL_Pi_HDC1000.SDL_Pi_HDC1000()
    except:
        hdc1000 = None

hdc1000init = False
while not hdc1000init:
    try:
        hdc1000.setHumidityResolution(SDL_Pi_HDC1000.HDC1000_CONFIG_HUMIDITY_RESOLUTION_14BIT)   #TEMP
        hdc1000init = True
    except:
        hdc1000init = False


class SensorData:
    #def __init__(self):
    #   self.
    p = read_RPM.RPM_reader(pigpio.pi(), RPM_GPIO,1,30)
    def readRPM(self):
        res = np.nan
        try:
            res = SensorData.p.RPM()
        except:
            res = np.nan
        return res

    def readFriction(self):
        res = np.nan
        try:
            res = adc.read_adc_difference(3, gain=GAIN)*step
        except:
            res = np.nan
        return res

    def readLoad(self):
        res = np.nan
        try:
            res = adc.read_adc_difference(0, gain=GAIN)*step
        except:
            res = np.nan
        return res

    def readTemperature(self):
        res = np.nan
        try:
            res = hdc1000.readTemperature()
        except:
            res = np.nan
        return res

    def readVibration(self):
        return 1.0

if __name__ == "__main__":
    import time
    import datetime
    sd=SensorData()
    for i in range(1000000):
        time.sleep(1)
        #print(sd.readRPM())
        print('friction',sd.readFriction())
        print('load',sd.readLoad())
        #print(sd.readTemperature())
        