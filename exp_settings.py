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
    
    def __init__(self):
        self.status = ExpStatus.invalid
        #self.description = False
        self.VFD_on=False
        self.load_on = False
        self.stopTime = False
        self.stopTlim =False
        self.stopFlim =False
        #self.listening =False
        #self.writing =False
        #self.autoMode =False
        #self.manualMode =True
        #self.manualFictionForceThreshold=False
    def getJson(self):
        return json.dumps(dict(vars(self)))

class ExperimentSettings:
    resultsFolder = "ExperimentalData/"
    def __init__(self):
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
    def set_recording_cycle(self, value):self.settings["recording_cycle"] = np.around(value*1000/self.listening_interval).astype(np.int)
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

    def get_vibration_threshold(self):return self.settings["vibration_threshold"]
    def set_vibration_threshold(self, value):self.settings["vibration_threshold"] = value
    vibration_threshold = property(get_vibration_threshold,set_vibration_threshold)
    
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
