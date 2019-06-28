import experiment
import datetime
import default_settings
import numpy as np

class TibometerEmulator:
    def __init__(self):
        #0<Load_rot_pos<20*360
        self.WFD = 0 # Hz
        self.Load_volt = 0.615
        self.Load_rot_pos = 0.5;#np.random.random() #0..1 = > 0 .. 40 * Pi
        self.rot_delta = 0.0
        self.press_reduct = self.Load_rot_pos
        self.Frict_coeff = 0.06
        self.Temperature = 25.0

    def set_WFD(self,val):
        self.WFD = val

    def get_WFD(self):
        return self.WFD + 1.0 + np.sin(datetime.datetime.now().minute / 60.0 * 2 * np.pi) if self.WFD > 0.1 else 0.0

    def get_RPM(self):
        return np.power(4 / 5,self.WFD * 60) + np.random.normal(0, 2) if self.WFD>0.1 else 0.0

    def get_Temp(self):
        return self.Temperature + np.random.normal(0, 0.5)

    def get_LoadVolts(self):
        return 0.615 + self.press_reduct * (2.37125 - 0.615)+ np.random.normal(0, 0.05)

    def get_FrVolts(self):
        v=0.59+np.random.normal(0, 0.03)
        if (self.WFD>0):
            force = self.Frict_coeff * default_settings.Pressure_2_Force(
                            3.1341 * self.get_LoadVolts() - 1.4728) + np.random.normal(0, 2)
            v =(force - 7.7186) / 20.738
        return v

    def setLoad(self,rotation_deg):
        c = 0.5 if rotation_deg > 0 else 1.0
        delta = 0.4 * (1.1 - self.Load_rot_pos) * rotation_deg * c
        #if delta * self.rot_delta < 0:
        #    self.rot_delta = 0
        self.Load_rot_pos += delta/360/2
        if self.Load_rot_pos < 0:self.Load_rot_pos = 0
        if self.Load_rot_pos > 1:self.Load_rot_pos = 1
        self.rot_delta+= np.abs(np.random.normal(0, 30))*rotation_deg/90.0
        if np.abs(self.rot_delta)>120:
            self.rot_delta = 0.0
            self.press_reduct = self.Load_rot_pos

tribometer_Emul = TibometerEmulator()

if __name__ == '__main__':
    test()
