import numpy as np
import pandas as pnd
import os
import default_settings
import json

class CalibrationCurve:
    def __init__(self,fileName,defData):
        if os.path.isfile(fileName):
            print("Calibration data file:{0}".format(fileName))
            cft = pnd.read_csv(fileName,sep=" ")
            cft = np.array(cft).astype(np.float32)
            #self.curve1d = cft
            self.initFromArray(cft)
        else:
            #self.curve1d = defData
            print("Warning: calibration file not exists =>{0}!".format(fileName))
            self.initFromArray(defData)
            self.SaveToCSV(fileName);
            print("Warning: calibration file created =>{0}!".format(fileName))
        #self.x, self.y = self.curve1d[:,0], self.curve1d[:,1]
    
    def initJSON(self,JSONdata:str):
        v = json.loads(JSONdata)
        cft = np.array([v.get("x"),v.get("y")]).T.astype(np.float32)
        self.initFromArray(cft)

    def SaveToCSV(self,fileName, columnsName=["U","F"]):
        pnd.DataFrame(data=self.curve1d,columns = columnsName).to_csv(fileName,sep=" ",index=False)

    def initFromArray(self,data:np.ndarray):
        self.curve1d = data
        self.x, self.y = self.curve1d[:,0], self.curve1d[:,1]

    def getCalibratedValue(self,sensorData):
        return np.interp(sensorData, self.x, self.y, right=np.nan)#left=None,
    
    def getSensorValue(self,value):
        return np.interp(value, self.y, self.x)

    def numberToString(self,x):
        return "{0:.4f}".format(x)

    def get_json_string(self):
        x=",".join( map(self.numberToString,self.x))
        y=",".join( map(self.numberToString,self.y))
        s = '{"x":['+x+'], "y":['+y+']}'
        return s


class CalibrationData:
    def __init__(self, loadCCurveFileName,frictionForceCCurveFileName):#,RPMCCurveFileName):
        self.load = CalibrationCurve(loadCCurveFileName, default_settings.DefaultCalibration_Load)
        self.friction = CalibrationCurve(frictionForceCCurveFileName, default_settings.DefaultCalibration_Friction)
        #self.RPM = CalibrationCurve(RPMCCurveFileName, default_settings.DefaultCalibration_RPM)


def test():
    cd = CalibrationData("aaa","bbb","ccc")
    for i in range(15):
        x = i*i/10.0
        print( "load :{0}=>{1}".format(x,cd.load.getCalibratedValue(x)))
        print( "friction :{0}=>{1}".format(x,cd.friction.getCalibratedValue(x)))
        print( "RPM :{0}=>{1}".format(x,cd.RPM.getCalibratedValue(x)))

if __name__ == '__main__':
    test()