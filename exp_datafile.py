import numpy as np
import pandas as pnd
import datetime
import h5py
import os
import json

import exp_settings

class ExperimentDataFile:
	def __init__(self, expSettings:exp_settings.ExperimentSettings):
		self.settings = expSettings
		self.hdf5f = None
		self.readers = set();
		self.dataset = None
		self.StartTime= None
		self.OneSecond=np.timedelta64(1, 's')
		self.RecordSize = 5
		self.CurrentRecord = 0
		self.ChunkRecord = 600
		self.Recording = False
		self.ColumnsDescriptionString = "time[s], Load[Pa], FrictionForce[N], RPM[rotation per minute], temperature[°C], Acoustic[??]"
		self.RecordSize = 6#self.hdf5f['variables'].shape[0]

	def __del__(self):
		for r in self.readers:
			r.close();
		if self.hdf5f is not None:
			self.StopRecording;
	
	def MakeHdf5File(self):
		if self.hdf5f is None:
			self.hdf5f = h5py.File(self.settings.outputFileName, 'w', libver='latest')
			#--- calibration curve
			d = self.hdf5f.create_dataset("calibrFr",data=self.settings.calibrationData.friction.curve1d.astype(np.float32))
			d.attrs['calibration'] = b"Friction force calibration curve [volt]=>[newton]"
			#--- calibration curve
			d = self.hdf5f.create_dataset("calibrLoad",data=self.settings.calibrationData.load.curve1d.astype(np.float32))
			d.attrs['calibration'] = b"Load force calibration curve [volt]=>[newton]"
			#--- calibration curve
			#d = self.hdf5f.create_dataset("calibrRPM",data=self.settings.calibrationData.RPM.curve1d.astype(np.float32))
			#d.attrs['calibration'] = b"RPM calibration curve [Hz]=>[RPM]"

			#--- data table
			self.dataset = self.hdf5f.create_dataset("data", (600,self.RecordSize),
														chunks=(60, self.RecordSize), 
														maxshape=(None,self.RecordSize), 
														dtype=np.float32)
			#self.dataset.dims[0].label = 'timerecords'
			#self.dataset.dims[1].label = 'variable'
			#self.dataset.dims.create_scale(self.hdf5f['variables'])
			#self.dataset.dims[1].attach_scale(self.hdf5f['variables'])
			self.dataset.attrs["user"] = bytes(self.settings.settings["user"],'utf-8')
			self.dataset.attrs['bearing'] = bytes(self.settings.settings["bearing"],'utf-8')
			#self.dataset.attrs['allsettings'] = bytes( json.dumps(self.settings.settings),'utf-8')
			self.dataset.attrs['columns'] = bytes(self.ColumnsDescriptionString,'utf-8')
	
	def OpenRead(self):
		res= h5py.File(self.settings.outputFileName, 'r', libver='latest', swmr=True)
		self.readers.add(res)
		return res

	def CloseReaders(self):
		for r in self.readers:
			r.close()
		self.readers.clear()

	def CloseReader(self,reader):
		if reader is not None:
			reader.close()
		self.readers.discard(reader)

	def RecordTimeInSeconds(self):
		dt = np.datetime64(datetime.datetime.utcnow())
		dt = (dt-self.StartTime)/self.OneSecond
		return (dt).astype(np.float32)
	
	def StartRecording(self,data:np.ndarray=None):
		dt = datetime.datetime.utcnow()
		self.dataset.attrs['StartTime'] = np.string_(str(dt))
		self.StartTime = np.datetime64(dt)
		self.CurrentRecord = 0;
		self.ChunkRecord = 600
		self.hdf5f.swmr_mode = True
		self.Recording = True;
		if data is not None:
			self.write(data)

	def StopRecording(self):
		if self.Recording:
			self.Recording = False;
			self.dataset.resize( (self.CurrentRecord, self.RecordSize) )
			self.dataset.flush()
			self.CloseReaders()
			self.hdf5f.close()
			self.hdf5f = None
	
	def write(self,data:np.ndarray)->np.ndarray:
		vals = np.array(data).astype(np.float32)
		if self.Recording:
			ts = self.RecordTimeInSeconds()
			if (self.ChunkRecord==self.CurrentRecord):
				self.ChunkRecord += 600
				self.dataset.resize( (self.ChunkRecord, self.RecordSize) )
			vals[0] = ts
			self.dataset[self.CurrentRecord,:] = vals;
			self.dataset.flush()
			self.CurrentRecord += 1
		return vals
