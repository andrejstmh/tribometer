import numpy as np
import trib_emulator
class SensorData:
    #def __init__(self):
    #  self
    def readRPM(self):
        res = np.nan if np.random.random()<0.02 else trib_emulator.tribometer_Emul.get_RPM()
        return res

    def readFriction(self):
        res = np.nan if np.random.random()<0.02 else trib_emulator.tribometer_Emul.get_FrVolts()
        return res

    def readLoad(self):
        res = np.nan if np.random.random()<0.02 else trib_emulator.tribometer_Emul.get_LoadVolts()
        return res

    def readTemperature(self):
        res = np.nan if np.random.random()<0.02 else trib_emulator.tribometer_Emul.get_Temp()
        return res

    def readVibration(self):
        return np.random.random()