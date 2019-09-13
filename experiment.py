import numpy as np
import datetime
import collections
import platform
import base64
import copy

from rx import config,Observable
from rx.subjects import Subject

import exp_settings
import exp_datafile
import program
import controls
from exp_settings import ExpStatus

if platform.system() != 'Windows':
    try:
        import sensor_data_pi as sensor_data
        print("sensor_data_pi imported")
    except ImportError:
        import sensor_data
else:
    import sensor_data

class RPMRegilator:
    def __init__(self):
        pass

    def GetVFDFrequency(self,currentRPM,currentVFDHz,targetRPM):
        #currentRPM = 60*currentVFDHz*coeff
        coeff=1
        if currentVFDHz>1 and currentRPM>60:
            coeff=currentRPM /(60*currentVFDHz)
            if coeff>2.0:
                coeff=2.0
        res = targetRPM/(60*coeff)
        return res

class LoadRegilator:
    #5 rotations => 7 Bar => 1252 N
    def __init__(self):
        self.rotationRange=5
        self.RegStepCount=5
        self.maxLoad=1252 #N
        self.SlipRatioIncCoeff=np.array([0.5,10/self.rotationRange],dtype = np.float)
        self.SlipRatioDecCoeff=np.array([0.5,3/self.rotationRange],dtype = np.float)

    def relLoad(self,loadN):
        return loadN/self.maxLoad

    def rotPosition(self,loadN):
        return self.relLoad(loadN)*self.rotationRange

    def SlipRatioIncreaseLoad(self,loadN):
        return self.rotPosition(loadN)*self.SlipRatioIncCoeff[1]+self.SlipRatioIncCoeff[0]

    def SlipRatioDecreaseLoad(self,loadN):
        return self.rotPosition(loadN)*self.SlipRatioDecCoeff[1]+self.SlipRatioDecCoeff[0]

    def GetSlipRatio(self,loadN,deltaN=1):
        if deltaN>0:
            return self.SlipRatioIncreaseLoad(loadN)
        else:
            return self.SlipRatioDecreaseLoad(loadN)

    def GetRotations(self,loadN,targetN):
        #df'/df = SlipRatio
        maxLoad = 1250 # N !!!!!!!
        if loadN+targetN<0:
            targetN = 0-loadN
        if loadN+targetN>maxLoad:
            targetN = maxLoad-loadN
        def I_SlipRatio_df(rot,coeffs):
            return (coeffs[1]/2.0*rot+coeffs[0])*rot
        f0 = self.rotPosition(loadN)
        f1 = self.rotPosition(targetN)
        if loadN<targetN:
            i0 = I_SlipRatio_df(f0,self.SlipRatioIncCoeff)
            i1 = I_SlipRatio_df(f1,self.SlipRatioIncCoeff)
        else:
            i0 = I_SlipRatio_df(f0,self.SlipRatioDecCoeff)
            i1 = I_SlipRatio_df(f1,self.SlipRatioDecCoeff)
        return (i1-i0)#/self.RegStepCount

class Automation:
    def __init__(self,Experiment):
        self.expr = Experiment
        self.load_started = None
        self.rpm_started = None
        self.load_cikl_counter=0
        self.rpm_cikl_counter=0
        self.loadRegulator = LoadRegilator()
        self.rpmRegulator = RPMRegilator()
        self.subscriptLoadReg = None
    #-----------------------------------RPM---------------------------------------------
    def CurrentAvgRPM(self):
        return self.expr.currentAverageData[3]

    def CurrentTargetRPM(self):
        return self.expr.currentTargetData[2]

    def start_rpm_automation(self):
        self.rpm_cikl_counter=0
        self.expr.status.rpmRegTimedOut = False
        self.expr.status.rpmRegAuto = True
        self.rpm_started = datetime.datetime.now()
        self.GO_rpmToTarget()

    def rpmTargetChanged(self):
        return np.abs(self.expr.currentTargetData[2]-self.expr.prevTargetData[2])>0.1

    def rpmValue_outOfRange(self):
        return np.abs(self.CurrentTargetRPM()-self.CurrentAvgRPM())>self.expr.Settings.RPMRegualtionDiffStart

    def rpmValue_inRange(self):
        return np.abs(self.CurrentTargetRPM()-self.CurrentAvgRPM())<self.expr.Settings.RPMRegualtionDiffStop

    def rpmReg_TimedOut(self,time_s):
        return self.expr.Settings.rpmMaxRegTime<time_s

    def GO_rpmReg_TimedOut(self):
        self.expr.status.rpmRegTimedOut = True
        print("GO_rpmReg_TimedOut!")

    def GO_rpmToTarget(self):
        freq_Hz = self.rpmRegulator.GetVFDFrequency(self.CurrentAvgRPM(),self.expr.WFD_freq,self.CurrentTargetRPM())
        self.setWFD_freq(freq_Hz)
        print("TargetRPM:{0}".format(freq_Hz))

    def GO_ManualRPM(self, deltaRPM):
        newRPM = self.CurrentAvgRPM()+ deltaRPM
        if newRPM<0:
            newRPM=0
        freq_Hz = self.rpmRegulator.GetVFDFrequency(self.CurrentAvgRPM(),self.expr.WFD_freq,newRPM)
        print("ManualRPM:{0}".format(freq_Hz))
        self.setWFD_freq(freq_Hz)
        self.expr.Program.RPMAutoRegulation=False
        self.expr.status.rpmRegTimedOut = False
        self.rpm_started = None
        self.rpm_cikl_counter=0

    def GO_ManualStopRotations(self):
        print("Stop rotations")
        self.setWFD_freq(0)
        self.expr.Program.RPMAutoRegulation=False
        self.expr.status.rpmRegTimedOut = False
        self.rpm_started = None
        self.rpm_cikl_counter=0

    def GO_rpmOk(self):
        self.rpm_started = None
        self.rpm_cikl_counter=0
        print("GO_rpmOk!")

    def setWFD_freq(self,freq):
        if freq>0:
            if freq>60:
                freq=60
            controls.set_speed(freq)
            controls.start()
        else:
            freq = 0;
            controls.stop()
        self.expr.WFD_freq = freq;
        return freq
    #-----------------------------------LOAD--------------------------------------------
    def CurrentAvgLoad(self):
        return self.expr.currentAverageData[1]

    def CurrentTargetLoad(self):
        return self.expr.currentTargetData[1]

    def start_load_automation(self):
        self.load_cikl_counter=0
        self.expr.status.loadRegTimedOut = False
        self.expr.status.loadRegAuto = True
        self.load_started = datetime.datetime.now()

    def loadTargetChanged(self):
        return self.expr.currentTargetData[0]!=self.expr.prevTargetData[0]

    def loadValue_outOfRange(self):
        return np.abs(self.CurrentTargetLoad()-self.CurrentAvgLoad())>self.expr.Settings.loadRegualtionDiffStart

    def loadValue_inRange(self):
        return np.abs(self.CurrentTargetLoad()-self.CurrentAvgLoad())<self.expr.Settings.loadRegualtionDiffStop

    def loadReg_TimedOut(self,time_s):
        return self.expr.Settings.loadMaxRegTime<time_s

    def GO_loadReg_TimedOut(self):
        print("loadReg_TimedOut")
        self.expr.status.loadRegTimedOut = True

    def LoadRegMotor(self,steps,paskageNr=0):
        if steps > 0:
            #print("inc laod:{0}".format(steps))
            controls.P_motor(np.abs(steps),0)
        else:
            #print("dec laod:{0}".format(steps))
            controls.P_motor(np.abs(steps),1)

    def MakeSubscriptionToLoadReg(self,rotations):
        if self.subscriptLoadReg is not None:
            self.subscriptLoadReg.dispose()
            self.subscriptLoadReg=None
        steps = int( 360/1.8*rotations/self.loadRegulator.RegStepCount)
        time_interval_ms = int(1000/600*steps*2.0)
        self.subscriptLoadReg = Observable.interval(time_interval_ms).take(self.loadRegulator.RegStepCount).subscribe(
            lambda value: self.LoadRegMotor(steps,value)#,
            #lambda error: print("Error: {} \t({} ms)".format(error, rotations)),
            #lambda: print("Complete! \t({} ms)".format(rotations))
        )

    def GO_loadToTarget(self):
        rotations = self.loadRegulator.GetRotations(self.CurrentAvgLoad(),self.CurrentTargetLoad())
        print("load2Target {0}".format(rotations))
        self.MakeSubscriptionToLoadReg(rotations)

    def GO_ManualLoad(self, deltaN):
        rotations = self.loadRegulator.GetRotations(self.CurrentAvgLoad(),self.CurrentAvgLoad()+ deltaN)
        print("GO_ManualLoad {0}".format(rotations))
        self.MakeSubscriptionToLoadReg(rotations)
        self.load_started = None
        self.load_cikl_counter=0


    def GO_loadOk(self):
        print("GO_loadOk")
        self.load_started = None
        self.load_cikl_counter=0
        self.subscriptLoadReg = None;
    #----------------------------OnNewSensorData-------------------------------------------
    def OnNewSensorData(self):
        #curT = datetime.datetime.now()
        #load regulator ON
        if self.expr.Program.LoadAutoRegulation:
            if self.loadTargetChanged():
                self.start_load_automation()
            if self.load_started is None and self.loadValue_outOfRange():
                self.start_load_automation()
            # regulation mode 
            if self.load_started is not None:
                dedtaT = self.load_cikl_counter*self.expr.Settings.listening_interval/1000
                if self.loadReg_TimedOut(dedtaT):
                    self.GO_loadReg_TimedOut()
                else:
                    if self.load_cikl_counter%self.expr.Settings.loadRegCikleSize==0:
                        if self.loadValue_inRange():
                            self.GO_loadOk()
                        else:
                            self.GO_loadToTarget()
                self.load_cikl_counter +=1
            self.expr.status.loadReg = self.load_started is not None
        else:
            self.GO_loadOk()
        #WFD regulator ON
        if self.expr.Program.RPMAutoRegulation:
            if self.rpmTargetChanged():
                self.start_rpm_automation()
            if self.rpm_started is None and self.rpmValue_outOfRange():
                self.start_rpm_automation()
            # regulation mode 
            if self.rpm_started is not None:
                dedtaT = self.rpm_cikl_counter*self.expr.Settings.listening_interval/1000
                if self.rpmReg_TimedOut(dedtaT):
                    self.GO_rpmReg_TimedOut()
                else:
                    if self.rpm_cikl_counter%self.expr.Settings.rpmRegCikleSize==0:
                        if self.rpmValue_inRange():
                            self.GO_rpmOk()
                        else:
                            self.GO_rpmToTarget()
                self.rpm_cikl_counter +=1
            self.expr.status.rpmReg = self.rpm_started is not None
        else:
            self.GO_rpmOk()

class Experiment:
    sensorDataVecLength = 5#time,load, friction, rpm, temperatura
    sensorVoltageVecLength = 2
    targetVecLength = program.ProgrCol.size
    def __init__(self):
        self.Settings = exp_settings.ExperimentSettings()
        self.DataFile = exp_datafile.ExperimentDataFile(self.Settings)
        self.status = exp_settings.ExpState()
        self.Program = program.Program(self.Settings, self.status)
        self.Sensors = sensor_data.SensorData()
        self.WFD_freq = 0.0;
        self.prevStatus = copy.deepcopy(self.status);
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
        self.Automation = Automation(self)

    def get_currentSensorVoltage(self):
        return self.SensorVoltageBuffer[self.DataBufferPointer]
    currentRecordVoltage = property(get_currentSensorVoltage)

    def get_currentRecordData(self):
        return self.SensorDataBuffer[self.DataBufferPointer]
    currentRecordData = property(get_currentRecordData)

    def UpdateSettings(self,data_dict):
        self.Settings.settings.update(data_dict)
        self.Program.makeProgramArray()

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
        load, fr, rpm, t = self.sensorDataQalityControl(load, fr, rpm, t)
        self.SensorVoltageBuffer[self.DataBufferPointer,:] = np.array([load, fr], dtype=np.float);
        cd = self.Settings.calibrationData
        if not np.isnan(load):
            load = cd.load.getCalibratedValue(load)
        if not np.isnan(fr):
            fr = cd.friction.getCalibratedValue(fr)
        self.SensorDataBuffer[self.DataBufferPointer,:] = np.array([time, load, fr, rpm, t], dtype=np.float);
        self.currentAverageVoltage = np.nanmean(self.SensorVoltageBuffer, axis=0)
        self.currentAverageData = np.nanmean(self.SensorDataBuffer, axis=0)
        #self.currentAverageVoltage = np.nanpercentile(self.SensorVoltageBuffer, 50, axis=0)
        #self.currentAverageData = np.nanpercentile(self.SensorDataBuffer,50, axis=0)
        self.prevTargetData = self.currentTargetData
        self.currentTargetData = self.Program.getTargetValues(time);
        self.CheckTribometerState()
        self.Automation.OnNewSensorData()
        
    def sensorDataQalityControl(self,load, fr, rpm, temperature):
        load1 = np.nan if ((load<0.6)or(load>2.7)) else load
        fr1 = np.nan if ((fr<0.59)or(fr>6.0)) else fr
        rpm1 = np.nan if ((rpm<0)or(rpm>1500)) else rpm
        temperature1 = np.nan if ((temperature<0)or(temperature>120)) else temperature
        return load1, fr1, rpm1, temperature1


    def CheckTribometerState(self):
        #Data:time:0, load:1, fr:2, rpm:3, t:4
        #TargetData:"time:0", "load:1","RPM:2", "maxFfr:3","maxT:4"
        time,aload, afr,arpm, aT =self.currentRecordData[0],self.currentAverageData[1],self.currentAverageData[2],self.currentAverageData[3],self.currentAverageData[4]
        timeTot, tmaxFfr,tmaxT = self.currentTargetData[0],self.currentTargetData[3],self.currentTargetData[4]
        self.status.VFD_on=arpm>0.1
        self.status.load_on = (aload>0.1)
        self.status.stopTime = time>timeTot
        self.status.stopTlim = aT>tmaxT
        self.status.stopFlim = afr>tmaxFfr

    def UpdatePrevStatuis(self):
        self.prevStatus = copy.deepcopy(self.status)

    def StopCriteria(self):
        stop_reason=None
        if self.status.stopTime:
            stop_reason = "Successfully finished"
        if self.status.stopTlim:
            stop_reason = "Temperature exceed allowed limit"
        if self.status.stopFlim:
            stop_reason = "Friction force exceed allowed limit"
        if stop_reason is not None:
            self.Automation.GO_ManualStopRotations()
            self.Automation.GO_ManualLoad(0)
        #if not self.status.VFD_on:
        #    stopWFD = True
        #if not self.status.load_on:
        #    stopWFD = True

        #if stopWFD and self.WFD_freq>0 and (self.status.status == ExpStatus.started):
        #    self.Automation.GO_ManualRPM(-100000)
        #    self.Automation.GO_ManualLoad(0)
        #    #self.Automation.setWFD_freq(-1)
        return stop_reason


    #def CheckStateAndSendComand(self):
    #    if not self.status.isContentEqual( self.prevStatus):
    #        # send state message 
    #        pass

    #    if self.Program.programmStarted:
    #        if self.status.stopTime or self.status.stopTlim or self.status.stopTime or (not self.status.load_on) or (not self.status.VFD_on):
    #            # stop programm
    #            pass

    #    if not self.Program.LoadAutoRegulation:
    #        # stop load regulator
    #        pass
    #    else:
    #        if self.currentTargetData[1]!=self.prevTargetData[1]:
    #            # restart load regulator
    #            pass
    #    if not self.Program.RPMAutoRegulation:
    #        # stop RPM regulator
    #        pass
    #    else:
    #        if self.currentTargetData[2]!=self.prevTargetData[2]:
    #            # restart RPM regulator
    #            pass

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

    def SetThresholds(self,fr,t):
        self.Program.SetThresholdFriction(fr);
        self.Program.SetThresholdTemp(t);

    def controlDergeesFromForce(self,deltaForce):
        return 0;

    def SetRPM(self,RPM):
        self.Program.SetTargetRPM(RPM)
        self.Program.RPMAutoRegulation = True
        self.Automation.start_rpm_automation()
        return 0

    def SetRPMManual(self,deltaRPM):
        self.Program.RPMAutoRegulation = False
        self.status.rpmRegAuto = False
        self.Automation.GO_ManualRPM(deltaRPM)
        return 0

    def SetLoad(self,LoadinN):
        self.Program.SetTargetLoad(LoadinN)
        self.Program.LoadAutoRegulation = True
        self.Automation.start_load_automation()
        return 0

    def SetLoadManual(self,deltaLoad):
        self.Program.LoadAutoRegulation = False
        self.status.loadRegAuto = False
        self.Automation.GO_ManualLoad(deltaLoad)
        return 0

    def SetStopRotationsManual(self):
        self.Program.RPMAutoRegulation = False
        self.status.rpmRegAuto = False
        self.Automation.GO_ManualStopRotations()
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

def TestLoadRegulator():
    lr = LoadRegilator()
    N0,N1 = 0,lr.maxLoad
    r = lr.GetRotations(N0,N1)
    print("from {0} to {1}=>{2}".format(N0,N1,r))
    
    N0,N1 = lr.maxLoad/2,lr.maxLoad
    r = lr.GetRotations(N0,N1)
    print("from {0} to {1}=>{2}".format(N0,N1,r))

    N0,N1 = 0,lr.maxLoad
    r = lr.GetRotations(N0,N1)
    print("from {0} to {1}=>{2}".format(N0,N1,r))
    
    N0,N1 = 0,lr.maxLoad/2
    r = lr.GetRotations(N0,N1)
    print("from {0} to {1}=>{2}".format(N0,N1,r))

    N1,N0 = 0,lr.maxLoad
    r = lr.GetRotations(N0,N1)
    print("from {0} to {1}=>{2}".format(N0,N1,r))
    
    N1,N0 = lr.maxLoad/2,lr.maxLoad
    r = lr.GetRotations(N0,N1)
    print("from {0} to {1}=>{2}".format(N0,N1,r))

    N1,N0 = 0,lr.maxLoad
    r = lr.GetRotations(N0,N1)
    print("from {0} to {1}=>{2}".format(N0,N1,r))
    
    N1,N0 = 0,lr.maxLoad/2
    r = lr.GetRotations(N0,N1)
    print("from {0} to {1}=>{2}".format(N0,N1,r))

def TestRPMRegilator():
    rpmr = RPMRegilator()
    f = rpmr.GetVFDFrequency(300,5.5,600)
    print(f)

if __name__ == '__main__':
    #test()
    #TestLoadRegulator()
    TestRPMRegilator()
