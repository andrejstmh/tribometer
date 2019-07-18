import numpy as np
import pandas as pnd
import datetime
import collections

import exp_settings

class ProgramItem:
    def __init__(self,id,time_start,time_end=None, TargetLoad=None, TargetRPM=None,
    ThresholdMaxFricdtionForce=None, ThresholdMaxTemperature=None):
        self.id=id
        self.StartTime=time_start
        self.EndTime = time_end
        self.TargetLoad = TargetLoad
        self.TargetRPM = TargetRPM
        self.ThresholdMaxFricdtionForce = ThresholdMaxFricdtionForce
        self.ThresholdMaxTemperature = ThresholdMaxTemperature
class ProgrCol:
    time=0
    load=1
    RPM=2
    maxFfr=3
    maxT=4
    size=5
    colNames = ["time", "load","RPM", "maxFfr","maxT"]
    SettFields = ["duration","load","RPM","Tmax","Fmax"]

class Program:
    def __init__(self, settings:exp_settings.ExperimentSettings,state:exp_settings.ExpState):
        self.Settings = settings
        self.ExpState = state
        self.OneSecond = np.timedelta64(1, 's')
        self.programmStarted = False
        self.LoadAutoRegulation = False
        self.RPMAutoRegulation = False
        self.programData = np.array([[0.0,0.0,0.0,0.0,0.0]])#t,load,rpm, maxFriction, maxTemp/5
        self.makeProgramArray()

    def SetTargetLoad(self,load):
        self.Settings.target_load = load
        self.LoadAutoRegulation = True
        self.ExpState.loadRegAuto = True
        self.programData[0,ProgrCol.load] = load

    def SetTargetRPM(self,RPM):
        self.Settings.target_rpm = RPM
        self.RPMAutoRegulation = True
        self.ExpState.rpmRegAuto = True
        self.programData[0,ProgrCol.RPM] = RPM

    def SetThresholdTemp(self,temp):
        self.Settings.temperature_threshold = temp
        self.programData[0,ProgrCol.maxT] = temp

    def SetThresholdFriction(self,frict):
        self.Settings.friction_force_threshold = frict
        self.programData[0,ProgrCol.maxFfr] = frict

    def MakeManualProgramm(self):
        self.programData = np.array([[0,
                            self.Settings.target_load,self.Settings.target_rpm,
                            self.Settings.friction_force_threshold,self.Settings.temperature_threshold],
                                    [self.Settings.total_duration*60,-1,-1,-1,-1]],dtype=np.float)
    def MakeAtoProgramm(self):
        def getFieldValue(it:dict,name:str,defaulV:np.float=None)->np.float:
                v = it.get(name)
                if v is None:
                    v = defaulV
                return np.nan if v is None else np.float(v)
        self.programData = np.full(shape=(len(self.Settings.program)+1,ProgrCol.size),
                                   fill_value=np.nan,dtype=np.float)
        startTime = 0.0;
        for i,it in enumerate(self.Settings.program):
            t = getFieldValue(it,ProgrCol.SettFields[ProgrCol.time])*60
            load = getFieldValue(it,ProgrCol.SettFields[ProgrCol.load],self.Settings.target_load)
            rpm = getFieldValue(it,ProgrCol.SettFields[ProgrCol.RPM],self.Settings.target_rpm)
            F = getFieldValue(it,ProgrCol.SettFields[ProgrCol.maxFfr],self.Settings.friction_force_threshold)
            T = getFieldValue(it,ProgrCol.SettFields[ProgrCol.maxT],self.Settings.temperature_threshold)
            self.programData[i,:] = np.array([startTime,load,rpm,F,T])
            startTime+=t
        self.programData[len(self.Settings.program),:] = np.array([startTime,-1,-1,-1,-1]);


    def getTargetValues(self, exp_time):
        idx = np.searchsorted(self.programData[:,0], exp_time, side='right')-1
        if (idx<0):idx=0
        res = np.array(self.programData[idx],copy=True);
        if not self.LoadAutoRegulation:res[ProgrCol.load]=np.nan
        if not self.RPMAutoRegulation:res[ProgrCol.RPM]=np.nan
        res[ProgrCol.time] = self.programData[-1,ProgrCol.time]
        return res

    def makeProgramArray(self):
        if self.Settings.manual_mode or len(self.Settings.program)<1:
            self.Settings.manual_mode = True
        if self.programmStarted:
            if self.Settings.manual_mode:
                self.MakeManualProgramm()
            else:
                self.MakeAtoProgramm()
        else:
            self.MakeManualProgramm()

    @property
    def ProgramTotalDuration(self):
        return self.programData[-1,ProgrCol.time]

    def BeginProgram(self):
        self.programmStarted= True
        self.makeProgramArray()

    def EndProgram(self):
        self.programmStarted= False

    def StopTimeIsOver(self):
        print("stop initiated:time is over!")
        return None

    def StopHighTemperature(self):
        print("stop initiated:temperature!")
        return None

    def StopHighFrictionForce(self):
        print("stop initiated:friction force!")
        return None

