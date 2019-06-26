import numpy as np

class SensorData:
    #def __init__(self):
    #	self
    def readRPM(self):
        res = np.nan if np.random.random()<0.02 else 50+(np.random.random()-0.5)*2
        return res

    def readFriction(self):
        res = np.nan if np.random.random()<0.02 else 1.5+(np.random.random()-0.5)*2
        return res

    def readLoad(self):
        res = np.nan if np.random.random()<0.02 else 0.5+(np.random.random()-0.5)*2
        return res

    def readTemperature(self):
        res = np.nan if np.random.random()<0.02 else 25.0+2*(np.random.random()-0.5)
        return res

    def readVibration(self):
        return np.random.random()