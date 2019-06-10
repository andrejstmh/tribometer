import numpy as np
import datetime
import collections
import platform

import exp_settings
import exp_datafile
import program;

if platform.system()!='Windows':
	try:
		import sensor_data_pi as sensor_data
		print("sensor_data_pi imported")
	except ImportError:
		import sensor_data
else:
	import sensor_data

class Experiment:
	def __init__(self):
		self.Settings = exp_settings.ExperimentSettings()
		self.DataFile = exp_datafile.ExperimentDataFile(self.Settings)
		self.Program = program.Program(self.Settings)
		self.Sensors = sensor_data.SensorData()
		self.status = exp_settings.ExpState()
		self.currentSensorData = None
		self.currentRecordData = None
		self.currentTargetData = None
		

	#time[s], load[N], FrictionForce[N], RPM[rotation per minute],temperature, Acoustic[??]
	def GetSensorData(self):
		load = self.Sensors.readLoad()
		fr = self.Sensors.readFriction()
		rpm = self.Sensors.readRPM()
		t = self.Sensors.readTemperature()
		a = self.Sensors.readVibration()
		self.currentSensorData = np.array([0,load, fr, rpm, t,a], dtype=np.float)
		cd = self.Settings.calibrationData;
		load = cd.load.getCalibratedValue(load)
		fr = cd.friction.getCalibratedValue(fr)
		#rpm = cd.RPM.getCalibratedValue(rpm)
		self.currentRecordData = np.array([0,load, fr, rpm, t,a], dtype=np.float)
		return self.currentRecordData;
	
	def SetRotationFrequency(FrInHz):
		return 0;

	def SetLoad(LoadinN):
		return 0;




def test():
	e = Experiment()
	e.Settings.SaveCalibrationCurves()
	e.DataFile.MakeHdf5File();
	e.DataFile.StartRecording(e.GetSensorData())
	for i in range(50):
		sd = e.GetSensorData()
		sd = e.DataFile.write(sd)
		print(sd)
	e.DataFile.StopRecording()

if __name__ == '__main__':
	test()
