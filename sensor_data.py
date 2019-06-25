import numpy as np

class SensorData:
    #def __init__(self):
    #	self
    def readRPM(self):
        res = np.nan if np.random.random()<0.01 else 50+(np.random.random()-0.5)*2
        return 50+(np.random.random()-0.5)*2

    def readFriction(self):
        res = np.nan if np.random.random()<0.01 else 1.5+(np.random.random()-0.5)*2
        return 1.5+(np.random.random()-0.5)*2

    def readLoad(self):
        res = np.nan if np.random.random()<0.01 else 0.5+(np.random.random()-0.5)*2
        return 0.5+(np.random.random()-0.5)*2

    def readTemperature(self):
        res = np.nan if np.random.random()<0.01 else 25.0+2*(np.random.random()-0.5)
        return 25.0+2*(np.random.random()-0.5)

    def readVibration(self):
        return np.random.random()