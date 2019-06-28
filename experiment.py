import numpy as np
import datetime
import collections
import platform

import exp_settings
import exp_datafile
import program

if platform.system() != 'Windows':
    try:
        import sensor_data_pi as sensor_data
        print("sensor_data_pi imported")
    except ImportError:
        import sensor_data
else:
    import sensor_data

class Experiment:
    avgBuffreSize = 20;
    sensorDataVecLength = 5#time,load, friction, rpm, temperatura
    sensorVoltageVecLength = 2
    def __init__(self):
        self.Settings = exp_settings.ExperimentSettings()
        self.DataFile = exp_datafile.ExperimentDataFile(self.Settings)
        self.Program = program.Program(self.Settings)
        self.Sensors = sensor_data.SensorData()
        self.status = exp_settings.ExpState()
        #self.currentSensorData = None
        #self.currentRecordData = None
        self.currentAverageData = None
        self.currentAverageVoltage = None
        self.currentTargetData = None

        self.DataBufferPointer = 0;
        self.SensorVoltageBuffer = np.full(shape=(Experiment.avgBuffreSize,Experiment.sensorVoltageVecLength),
                                           fill_value=np.nan,dtype=np.float);
        self.SensorDataBuffer = np.full(shape=(Experiment.avgBuffreSize,Experiment.sensorDataVecLength),
                                        fill_value=np.nan, dtype=np.float);
        self.SensorDataBuffer[:,0] = 0.0
    
    def get_currentSensorData(self):
        return self.SensorVoltageBuffer[self.DataBufferPointer]
    currentRecordData = property(get_currentSensorData)

    def get_currentRecordData(self):
        return self.SensorDataBuffer[self.DataBufferPointer]
    currentRecordData = property(get_currentRecordData)

    #time[s], load[N], FrictionForce[N], RPM[rotation per minute],temperature,
    #Acoustic[??]
    def GetSensorData(self):
        self.DataBufferPointer+=1
        if self.DataBufferPointer>=Experiment.avgBuffreSize:
            self.DataBufferPointer = 0;

        load = self.Sensors.readLoad()
        fr = self.Sensors.readFriction()
        rpm = self.Sensors.readRPM()
        t = self.Sensors.readTemperature()
        time = self.DataFile.RecordTimeInSeconds()
        self.SensorVoltageBuffer[self.DataBufferPointer,:] = np.array([load, fr], dtype=np.float);
        cd = self.Settings.calibrationData
        if not np.isnan(load):
            load = cd.load.getCalibratedValue(load)
        if not np.isnan(fr):
            fr = cd.friction.getCalibratedValue(fr)
        self.SensorDataBuffer[self.DataBufferPointer,:] = np.array([time, load, fr, rpm, t], dtype=np.float);
        self.currentAverageVoltage = np.nanmean(self.SensorVoltageBuffer, axis=0)
        self.currentAverageData = np.nanmean(self.SensorDataBuffer, axis=0)

        self.currentTargetData = None

        return self.currentRecordData;
    
    def SetRotationFrequency(FrInHz):
        return 0

    def SetLoad(LoadinN):
        return 0




def test():
    e = Experiment()
    e.Settings.SaveCalibrationCurves()
    e.DataFile.MakeHdf5File()
    e.DataFile.StartRecording(e.GetSensorData())
    for i in range(50):
        sd = e.GetSensorData()
        sd = e.DataFile.write(sd)
        print(sd)
    e.DataFile.StopRecording()

if __name__ == '__main__':
    test()
