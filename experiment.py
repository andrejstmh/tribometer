import numpy as np
import datetime
import collections
import platform
import base64
import copy

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
    sensorDataVecLength = 5#time,load, friction, rpm, temperatura
    sensorVoltageVecLength = 2
    targetVecLength = program.ProgrCol.size
    def __init__(self):
        self.Settings = exp_settings.ExperimentSettings()
        self.DataFile = exp_datafile.ExperimentDataFile(self.Settings)
        self.Program = program.Program(self.Settings)
        self.Sensors = sensor_data.SensorData()
        self.status = exp_settings.ExpState()
        self.prevStatus = copy.deepcopy(self.status);
        self.StopReasonStatus = None
        self.currentAverageData = np.full(shape=(Experiment.sensorDataVecLength), fill_value=np.nan, dtype=np.float)
        self.currentAverageVoltage = np.full(shape=(Experiment.sensorVoltageVecLength), fill_value=np.nan, dtype=np.float)
        self.currentTargetData = np.full(shape=(Experiment.targetVecLength), fill_value=np.nan, dtype=np.float)
        self.prevTargetData = np.full(shape=(Experiment.targetVecLength), fill_value=np.nan, dtype=np.float)

        self.DataBufferPointer = 0;
        self.SensorVoltageBuffer = np.full(shape=(self.Settings.avgBufferSize,Experiment.sensorVoltageVecLength),
                                           fill_value=np.nan,dtype=np.float)
        self.SensorDataBuffer = np.full(shape=(self.Settings.avgBufferSize,Experiment.sensorDataVecLength),
                                        fill_value=np.nan, dtype=np.float)
        self.SensorDataBuffer[:,0] = 0.0
    
    def get_currentSensorVoltage(self):
        return self.SensorVoltageBuffer[self.DataBufferPointer]
    currentRecordVoltage = property(get_currentSensorVoltage)

    def get_currentRecordData(self):
        return self.SensorDataBuffer[self.DataBufferPointer]
    currentRecordData = property(get_currentRecordData)

    #time[s], load[N], FrictionForce[N], RPM[rotation per minute],temperature,
    #Acoustic[??]
    def GetSensorData(self):
        self.DataBufferPointer+=1
        if self.DataBufferPointer>=self.Settings.avgBufferSize:
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
        #self.currentAverageVoltage = np.nanmean(self.SensorVoltageBuffer, axis=0)
        #self.currentAverageData = np.nanmean(self.SensorDataBuffer, axis=0)
        self.currentAverageVoltage = np.nanpercentile(self.SensorVoltageBuffer, 50, axis=0)
        self.currentAverageData = np.nanpercentile(self.SensorDataBuffer,50, axis=0)
        self.prevTargetData = self.currentTargetData
        self.currentTargetData = self.Program.getTargetValues(time);
        self.CheckTribometerState()
    
    def CheckTribometerState(self):
        #Data:time:0, load:1, fr:2, rpm:3, t:4
        #TargetData:"time:0", "load:1","RPM:2", "maxFfr:3","maxT:4"
        self.prevStatus = copy.deepcopy(self.status);
        self.status.load_on = (self.currentAverageData[2]>0.1)and(self.currentAverageData[1]>0.1)
        self.status.VFD_on=self.currentAverageData[3]>0.1
        time = self.currentRecordData[0]
        self.status.stopTime = time>self.currentTargetData[0]
        self.status.stopTlim = self.currentAverageData[4]>self.currentTargetData[4]
        self.status.stopFlim = self.currentAverageData[2]>self.currentTargetData[3]

    def CheckStateAndSendComand(self):
        if not self.status.isContentEqual( self.prevStatus):
            # send state message 
            pass

        if self.Program.programmStarted:
            if self.status.stopTime or self.status.stopTlim or self.status.stopTime or (not self.status.load_on) or (not self.status.VFD_on):
                # stop programm
                pass

        if not self.Program.LoadAutoRegulation:
            # stop load regulator
            pass
        else:
            if self.currentTargetData[1]!=self.prevTargetData[1]:
                # restart load regulator
                pass
        if not self.Program.RPMAutoRegulation:
            # stop RPM regulator
            pass
        else:
            if self.currentTargetData[2]!=self.prevTargetData[2]:
                # restart RPM regulator
                pass


    @classmethod
    def ConvertDataTob64String(sls,data):
        return '"'+base64.b64encode(data).decode("utf-8")+'"'

    def ConvertTob64String(self):
        #testar =np.array([1.1,2.2,0,np.nan, 1], dtype=np.float)
        #s = np.fromstring( testar.tobytes(),dtype=np.dtype('B'));
        #db = '"'+base64.b64encode(testar).decode("utf-8")+'"'
        db = Experiment.ConvertDataTob64String(self.currentRecordData)
        vb = Experiment.ConvertDataTob64String(self.currentRecordVoltage)
        adb = Experiment.ConvertDataTob64String(self.currentAverageData)
        avb = Experiment.ConvertDataTob64String(self.currentAverageVoltage)
        tb = Experiment.ConvertDataTob64String(self.currentTargetData)
        s = '{"db":'+db +',"vb":'+vb+',"adb":'+adb+',"avb":'+avb+',"tb":'+tb+'}'
        return s;

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
