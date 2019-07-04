import numpy as np
import RPM_i2c as rpm

import Adafruit_ADS1x15                #ADC
adc = Adafruit_ADS1x15.ADS1115()

import sys          
import time
import datetime
import SDL_Pi_HDC1000
#sudo leafpad /boot/config.txt 
hdc1000 = None
while hdc1000 is None:
    try:
        hdc1000 = SDL_Pi_HDC1000.SDL_Pi_HDC1000()
    except:
        hdc1000 = None

isSetHumidityResolution=False
while not isSetHumidityResolution:
    try:
        hdc1000.setHumidityResolution(SDL_Pi_HDC1000.HDC1000_CONFIG_HUMIDITY_RESOLUTION_14BIT)   #TEMP
        isSetHumidityResolution = True
    except:
        isSetHumidityResolution = False

import time
import pigpio #motor
import motor3
#import read_RPM

GAIN=2/3
RPM_GPIO = 6
RUN_TIME = 60.0
SAMPLE_TIME = 2.0
step= 6.144/(2**15)

class SensorData:
    #def __init__(self):
    #   self.
    #p = read_RPM.RPM_reader(pigpio.pi(), RPM_GPIO,1,30)    
    def readRPM(self):
        return rpm.RPM()

    def readFriction(self):
        try:
            res=-adc.read_adc_difference(0, gain=GAIN)*step
        except:
              res=np.nan
        return res

    def readLoad(self):
        try:
            res=-adc.read_adc_difference(3, gain=GAIN)*step
        except:
              res=np.nan
        return res

    def readTemperature(self):
        try:
            res=hdc1000.readTemperature()
            if res<10 or res>120:
                res = np.nan
        except:
              res=np.nan
        return res

    def readVibration(self):
        return 1.0
        
    def pressure_motor(self,steps,direction):
        P_motor(steps,direction)
            
      
if __name__ == "__main__":    
    sd=SensorData()
    nancount = 1
    for i in range(1000000):
        time.sleep(0.5)
        #print(sd.readRPM())
        fr,lo,rrpm = sd.readFriction(),sd.readLoad(),sd.readRPM()
        if np.isnan(fr):
            nancount+=1
        if np.isnan(lo):
            nancount+=1
        if np.isnan(rrpm):
            nancount+=1
        print('{4:6d}:fr:{0:.4f}, load:{1:.2f}, rpm:{2:09.1f}, T:{3:04.1f}, nC:{5:6d},nT:{6:08.2f}'.format(
            fr,lo,rrpm,sd.readTemperature(),i,nancount,i*0.5/nancount))
        
    
    
    