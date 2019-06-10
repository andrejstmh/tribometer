import numpy as np
import pandas as pnd
import datetime
import collections

import exp_settings


class Program:
	def __init__(self, settings:exp_settings.ExperimentSettings):
		self.Settings = settings
		self.OneSecond = np.timedelta64(1, 's')
		self.programStartTime = None
		self.program = None
		self.makeProgramArray()
		# one minute buffer 
		bl = int(np.min([60,60000//self.Settings.listening_interval]))
		self.programHistory = collections.deque(maxlen=bl)

	def makeProgramArray(self):
		colNames = ["time", "load","RPM", "maxFfr","maxT","maxVibr","Nr"]
		maxFfr = np.float(self.Settings.friction_force_treshold)
		maxT = np.float(self.Settings.temperature_treshold)
		maxVibr = np.float(self.Settings.vibration_treshold)
		maxTime = np.float(self.Settings.total_duration)
		if len(self.Settings.program)<1:
			self.Settings.manual_mode = True
		prlist = []
		time = 0.0;
		if self.Settings.manual_mode:
			prlist.append([time,np.nan, np.nan,maxFfr,maxT,maxVibr,0])
			time+=maxTime*3600
			prlist.append([time,np.nan, np.nan,maxFfr,maxT,maxVibr,0])
		else:
			pr = self.Settings.program
			def getFieldValue(it:dict,name:str,defaulV:np.float=None)->np.float:
				v = it.get("duration")
				if v is None:
					v = defaulV
				return np.nan if v is None else np.float(v)
			for i,it in enumerate(pr):
				t = getFieldValue(it,"duration")
				load = getFieldValue(it,"load")
				rpm = getFieldValue(it,"RPM")
				F = getFieldValue(it,"maxFfr",maxFfr)
				T = getFieldValue(it,"maxT",maxT)
				V = getFieldValue(it,"maxVibr",maxVibr)
				prlist.append([time if i==0 else time+1E-3,load,rpm,F,T,V,i])
				time+=t*3600
				prlist.append([time,load,rpm,F,T,V,i])
		df = pnd.DataFrame(data =np.array(prlist,dtype=np.float), columns=colNames).T
		self.program = df;
		return df

	@property
	def ProgramTotalDuration(self):
		return np.array(self.program)[0][-1]

	def ProgrameDurationTimeInSeconds(self):
		dt = np.datetime64(datetime.datetime.utcnow())
		dt = (dt-self.programStartTime)/self.OneSecond
		return dt

	def BeginProgram(self):
		self.makeProgramArray()
		dt = datetime.datetime.utcnow()
		self.programStartTime = np.datetime64(dt)

	def EndProgram(self):
		self.programStartTime = None
		self.programHistory.clear()


	def getTargetValues(self):
		if self.programStartTime is None:
			return (0.0, np.array([0.0,np.nan,np.nan,np.nan,np.nan,np.nan]))
		else:
			t = self.ProgrameDurationTimeInSeconds()
			data = np.array(self.program)
			i = np.int(np.interp(t,data[0],data[-1]))
			return (t, data[:,2*i+1]);

	def MoveToTarget(self,currentVals:np.ndarray):
		if self.programStartTime is None:
			return None
		else:
			t, targetVals = self.getTargetValues()
			#time 0,load 1, fr 2, rpm 3, t 4,a 5  = currentVals
			#"time"0, "load"1,"RPM"2, "maxFfr"3,"maxT"4,"maxVibr"5, "Nr"6 = TargetVals
			self.programHistory.append((t,targetVals,currentVals))
			if t>self.ProgramTotalDuration:
				self.StopTimeIsOver;
				#return self.StopTimeIsOver;
			if currentVals[2]>targetVals[3]:
				self.StopHighFrictionForce();
				#return self.StopHighFrictionForce();
			if currentVals[4]>targetVals[4]:
				self.StopHighTemperature()
				#return self.StopHighTemperature()
			if currentVals[5]>targetVals[5]:
				self.StopHighVibration()
				#return self.StopHighVibration()
			#d_Load = currentVals[1]-targetVals[1]
			#d_RPM = currentVals[3]-targetVals[1]
			print("control: {0} {1}".format(
				"dec(Load)" if currentVals[1]>targetVals[1] else "inc(Load)", 
				"dec(PRM)" if currentVals[3]>targetVals[1] else "inc(PRM)"))
		return targetVals

	def StopTimeIsOver(self):
		print("stop initiated:time is over!")
		return None

	def StopHighTemperature(self):
		print("stop initiated:temperature!")
		return None

	def StopHighFrictionForce(self):
		print("stop initiated:friction force!")
		return None
	
	def StopHighVibration(self):
		print("stop initiated:vibration!")
		return None
