import numpy as np
import pandas as pnd
import datetime
import h5py
import os
import json

import exp_settings

class ExperimentDataFile:
    ChunkSize = 600
    RecordSize = 5 #self.hdf5f['variables'].shape[0]
    ColumnsDescription="time[s], Load[N], FrictionForce[N], RPM[rotation per minute], temperature[°C]"#, Acoustic[??]"
    def __init__(self, expSettings:exp_settings.ExperimentSettings):
        self.settings = expSettings
        self.hdf5f = None
        self.readers = set();
        self.dataset = None
        self.StartTime= None #np.datetime64(datetime.datetime.utcnow())
        self.OneSecond=np.timedelta64(1, 's')
        self.CurrentRecord = 0
        self.ChunkRecord = ExperimentDataFile.ChunkSize
        self.Recording = False
        self.LastRecord = None

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
            self.dataset = self.hdf5f.create_dataset("data", (ExperimentDataFile.ChunkSize,ExperimentDataFile.RecordSize),
                                                        chunks=(60, ExperimentDataFile.RecordSize), 
                                                        maxshape=(None,ExperimentDataFile.RecordSize), 
                                                        dtype=np.float32)
            #self.dataset.dims[0].label = 'timerecords'
            #self.dataset.dims[1].label = 'variable'
            #self.dataset.dims.create_scale(self.hdf5f['variables'])
            #self.dataset.dims[1].attach_scale(self.hdf5f['variables'])
            self.dataset.attrs["user"] = bytes(self.settings.settings["user"],'utf-8')
            self.dataset.attrs['bearing'] = bytes(self.settings.settings["bearing"],'utf-8')
            #self.dataset.attrs['allsettings'] = bytes( json.dumps(self.settings.settings),'utf-8')
            self.dataset.attrs['columns'] = bytes(ExperimentDataFile.ColumnsDescription,'utf-8')
    
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
        if self.StartTime is not None:
            dt = np.datetime64(datetime.datetime.utcnow())
            dt = (dt-self.StartTime)/self.OneSecond
            return (dt).astype(np.float32)
        else:
            return np.around(0.0).astype(np.float32)
    
    def StartRecording(self,data:np.ndarray=None):
        dt = datetime.datetime.utcnow()
        self.dataset.attrs['StartTime'] = np.string_(str(dt))
        self.StartTime = np.datetime64(dt)
        self.CurrentRecord = 0;
        self.ChunkRecord = ExperimentDataFile.ChunkSize
        self.hdf5f.swmr_mode = True
        self.Recording = True;
        if data is not None:
            self.write(data)

    def StopRecording(self):
        if self.Recording:
            self.Recording = False;
            self.dataset.resize( (self.CurrentRecord, ExperimentDataFile.RecordSize) )
            self.dataset.flush()
            self.CloseReaders()
            self.hdf5f.close()
            self.hdf5f = None
    
    def write(self,data:np.ndarray)->np.ndarray:
        self.LastRecord = np.array(data).astype(np.float32)
        if self.Recording:
            self.LastRecord[0] = self.RecordTimeInSeconds()
            if (self.ChunkRecord==self.CurrentRecord):
                self.ChunkRecord += ExperimentDataFile.ChunkSize
                self.dataset.resize( (self.ChunkRecord, ExperimentDataFile.RecordSize) )
            self.dataset[self.CurrentRecord,:] = self.LastRecord;
            self.dataset.flush()
            self.CurrentRecord += 1
        return self.LastRecord
