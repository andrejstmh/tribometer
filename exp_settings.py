import numpy as np
import pandas as pnd
import datetime
import os
import json

import calibration
import default_settings

class ExpStatus:
    invalid = 0
    valid = 1
    started = 2
    completed = 3

class ExpState:
    def __init__(self,stString=None):
        if stString is None:
            self.stateList = ["0","0","0",  "0","0","0",  "0","0","0", "0","0","0"]
        else:
            self.FromStateString(stString)
        #self.status = ExpStatus.invalid #0
        #self.VFD_on=False               #1
        #self.load_on = False            #2
        #self.stopTime = False           #3
        #self.stopTlim =False            #4
        #self.stopFlim =False            #5
        #self.rpmReg =False              #6
        #self.loadReg =False             #7
        #self.rpmRegTimedOut=False       #8
        #self.loadRegTimedOut=False      #9
        #self.rpmRegAuto=False          #10
        #self.loadRegAuto=False         #11
    def FromStateString(self, stString):
        self.stateList = []
        for ch in stString:
            self.stateList.append(ch)

    @property
    def stateString(self): return "".join(self.stateList)

    @property
    def status(self):
        return int(self.stateString[0])
    @status.setter
    def status(self, value):
        self.stateList[0] = str(value)

    @property
    def VFD_on(self): return self.stateList[1]!="0"
    @VFD_on.setter
    def VFD_on(self, value): self.stateList[1] = "1" if value else "0"

    @property
    def load_on(self): return self.stateList[2]!="0"
    @load_on.setter
    def load_on(self, value): self.stateList[2] = "1" if value else "0"

    @property
    def stopTime(self): return self.stateList[3]!="0"
    @stopTime.setter
    def stopTime(self, value): self.stateList[3] = "1" if value else "0"

    @property
    def stopTlim(self): return self.stateList[4]!="0"
    @stopTlim.setter
    def stopTlim(self, value): self.stateList[4] = "1" if value else "0"

    @property
    def stopFlim(self): return self.stateList[5]!="0"
    @stopFlim.setter
    def stopFlim(self, value): self.stateList[5] = "1" if value else "0"

    @property
    def rpmReg(self): return self.stateList[6]!="0"
    @rpmReg.setter
    def rpmReg(self, value): self.stateList[6] = "1" if value else "0"

    @property
    def loadReg(self): return self.stateList[7]!="0"
    @loadReg.setter
    def loadReg(self, value): self.stateList[7] = "1" if value else "0"

    @property
    def rpmRegTimedOut(self): return self.stateList[8]!="0"
    @rpmRegTimedOut.setter
    def rpmRegTimedOut(self, value): self.stateList[8] = "1" if value else "0"

    @property
    def loadRegTimedOut(self): return self.stateList[9]!="0"
    @loadRegTimedOut.setter
    def loadRegTimedOut(self, value): self.stateList[9] = "1" if value else "0"

    @property
    def rpmRegAuto(self): return self.stateList[10]!="0"
    @rpmRegAuto.setter
    def rpmRegAuto(self, value): self.stateList[10] = "1" if value else "0"

    @property
    def loadRegAuto(self): return self.stateList[11]!="0"
    @loadRegAuto.setter
    def loadRegAuto(self, value): self.stateList[11] = "1" if value else "0"

    def isContentEqual(self, other):
        return self.stateString==other.stateString

    def getJson(self):
        return '"'+self.stateString+'"'

class ExperimentSettings:
    resultsFolder = "ExperimentalData/"
    def __init__(self):
        self.rpmMaxRegTime=2*60 # 2 minutes
        self.loadMaxRegTime=5*60 # 3 minutes
        self.avgBufferSize = 10 # 
        self.rpmRegCikleSize=40
        self.loadRegCikleSize=25
        self.loadRegualtionDiffStart=50
        self.loadRegualtionDiffStop=10
        self.RPMRegualtionDiffStart=5
        self.RPMRegualtionDiffStop=2

        self.settings = default_settings.DefaultSettings
        self.SettingsFileName=self.getFilePath(ExperimentSettings.resultsFolder+"settings.json")
        self.calibrationData = None
        if os.path.exists(self.SettingsFileName):
            with open(self.SettingsFileName,"r") as f:
                self.settings = json.load(f);
        else:
            print("Warning:Setting file not exists");

        err = self.checkSettings();
        if len(err)==0:
            self.MakeCalibrationData()

        self.operators = [];
        if os.path.exists(self.operatorsFileName):
            with open(self.operatorsFileName,"r") as f:
                for l in f.readlines():
                    ll = l.strip()
                    if ll:
                        self.operators.append(ll);
        self.user = self.user
        self.SaveOperatorsToFile();


    def MakeCalibrationData(self):
        self.calibrationData = calibration.CalibrationData(
                self.loadCalibrFileName,self.frictionCalibrFileName)#,self.rpmCalibrFileName

    def SaveOperatorsToFile(self):
        with open(self.operatorsFileName,"w") as f:
            for l in self.operators:
                ll = l.strip()
                if ll:
                    f.write(ll+"\n");

    def get_user(self): return self.settings["user"];
    def set_user(self, value): 
        v = value.strip()
        if v:
            try:
                i=self.operators.index(v)
            except:
                i=-1
            if i<0:
                self.operators.append(v)
                self.SaveOperatorsToFile()
        self.settings["user"] = v
    user = property(get_user,set_user)

    def get_operatorsFN(self): return self.getFilePath(ExperimentSettings.resultsFolder+self.settings["operatorsFileName"]);
    def set_operatorsFN(self, value): self.settings["operatorsFileName"] = value
    operatorsFileName = property(get_operatorsFN,set_operatorsFN)

    def MakeOutputFile(self,fileName):
        return ExperimentSettings.resultsFolder+fileName+".h5"


    def get_outputFileName(self): return self.getFilePath( self.MakeOutputFile(self.settings["output_file"]));
    def set_outputFileName(self, value): self.settings["output_file"] = value
    outputFileName = property(get_outputFileName,set_outputFileName)


    def outputFileExists(self, fileName=None):
        if fileName is not None:
            fn = self.getFilePath( self.MakeOutputFile(fileName))
        else:
            fn = self.outputFileName
        return os.path.exists(fn)

    def get_frictionCalibrFileName(self): return self.getFilePath(ExperimentSettings.resultsFolder+self.settings["friction_force_calibration_curve_file"]);
    def set_frictionCalibrFileName(self, value): self.settings["friction_force_calibration_curve_file"] = value
    frictionCalibrFileName = property(get_frictionCalibrFileName,set_frictionCalibrFileName)

    def get_loadCalibrFileName(self): return self.getFilePath(ExperimentSettings.resultsFolder+self.settings["load_calibration_curve_file"]);
    def set_loadCalibrFileName(self, value): self.settings["load_calibration_curve_file"] = value
    loadCalibrFileName = property(get_loadCalibrFileName,set_loadCalibrFileName)

    #def get_rpmCalibrFileName(self): return self.getFilePath(self.settings["rpm_calibration_curve_file"]);
    #def set_rpmCalibrFileName(self, value): self.settings["rpm_calibration_curve_file"] = value
    #rpmCalibrFileName = property(get_rpmCalibrFileName,set_rpmCalibrFileName)

    def get_listening_interval(self):return self.settings["listening_interval"]
    def set_listening_interval(self, value):self.settings["listening_interval"] = value
    listening_interval = property(get_listening_interval,set_listening_interval)

    def get_recording_cycle(self):return self.settings["recording_cycle"]
    def set_recording_cycle(self, value):self.settings["recording_cycle"] = self.listening_interval#np.around(value*1000/self.listening_interval).astype(np.int)
    recording_cycle = property(get_recording_cycle,set_recording_cycle)

    def get_visualisation_cycle(self):return self.settings["visualisation_cycle"]
    def set_visualisation_cycle(self, value):self.settings["visualisation_cycle"] = value
    visualisation_cycle = property(get_visualisation_cycle,set_visualisation_cycle)

    def get_total_duration(self):return self.settings["total_duration"]
    def set_total_duration(self, value):self.settings["total_duration"] = value
    total_duration = property(get_total_duration,set_total_duration)

    def get_target_load(self):return self.settings["load"]
    def set_target_load(self, value):self.settings["load"] = value
    target_load = property(get_target_load,set_target_load)

    def get_target_rpm(self):return self.settings["rpm"]
    def set_target_rpm(self, value):self.settings["rpm"] = value
    target_rpm= property(get_target_rpm,set_target_rpm)

    def get_manual_mode(self):return self.settings["manual_mode"]
    def set_manual_mode(self, value):self.settings["manual_mode"] = value
    manual_mode = property(get_manual_mode,set_manual_mode)

    def get_program(self):return self.settings["program"]
    def set_program(self, value):self.settings["program"] = value
    program = property(get_program,set_program)    



    def get_friction_force_threshold(self):return self.settings["friction_force_threshold"]
    def set_friction_force_threshold(self, value):self.settings["friction_force_threshold"] = value
    friction_force_threshold = property(get_friction_force_threshold,set_friction_force_threshold)
    
    def get_temperature_threshold(self):return self.settings["temperature_threshold"]
    def set_temperature_threshold(self, value):self.settings["temperature_threshold"] = value
    temperature_threshold = property(get_temperature_threshold,set_temperature_threshold)

    #def get_vibration_threshold(self):return self.settings["vibration_threshold"]
    #def set_vibration_threshold(self, value):self.settings["vibration_threshold"] = value
    #vibration_threshold = property(get_vibration_threshold,set_vibration_threshold)
    
    def SaveSettings(self,fn=None):
        if fn is None:
            with open(self.SettingsFileName, "w") as f:
                f.write(json.dumps(self.settings,indent=4))
        else:
            with open(fn, "w") as f:
                f.write(json.dumps(self.settings,indent=4))

    def SaveCalibrationCurves(self):
        pnd.DataFrame(data=self.calibrationData.load.curve1d,columns = ["U","F"]).to_csv(self.loadCalibrFileName,sep=" ",index=False)
        pnd.DataFrame(data=self.calibrationData.friction.curve1d,columns = ["U","F"]).to_csv(self.frictionCalibrFileName,sep=" ",index=False)
        #pnd.DataFrame(data=self.calibrationData.RPM.curve1d,columns = ["f","RPM"]).to_csv(self.rpmCalibrFileName,sep=" ",index=False)

    def checkFileSettings(self,settingName):
        res = {}
        val = self.settings.get(settingName)
        if (val is None) or (strip(val)=="") or (not os.path.isfile(self.getFilePath(val))):
                res.update({settingName:"File not exists"})
                print("File not exists: [{0}:{1}]".format(settingName,val))
        return res

    def checkPathSettings(self,settingName):
        res = {}
        val = self.settings.get(settingName)
        if not((val is None) or (val.strip()=="")):
            if not os.path.exists(val.strip()):
                res.update({settingName:"Path not exists"})
                print("Path not exists: [{0}:{1}]".format(settingName,val))
        return res

    def checkSettings(self):
        res = dict()
        res.update(self.checkPathSettings("working_directory"));
        return res

    def getFilePath(self,relFilename):
        val = self.settings["working_directory"]
        if (val is None)or(val.strip()==""):
            return relFilename
        else:
            return os.path.join(val.strip(),relFilename)

    def overwriteSettings(self,OverwriteDefault=False):
        fn = "default." if OverwriteDefault else "current."
        fn = fn + SettingsFileName
        with open(fn,"w") as f:
            f.write(json.dumps(self.settings,indent=4))
    
    def overwriteCalibrationCurve(self,OverwriteDefault=False):
        fn = "default." if OverwriteDefault else "current."
        fn = fn + LoadCalibrationCurveFile
        with open(fn,"w") as f:
            f.write(json.dumps(self.settings,indent=4))

    def SetOutputFileName(self, fn):
        ffp =self.getFilePath()
        if os.path.exists(ffn):
            return ""
        else:
            self.settings["outputFileName"] = fn;
            return fn

def test():
    es = ExperimentSettings()
    es.SaveSettings()

if __name__ == '__main__':
    test()
