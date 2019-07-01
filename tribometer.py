from rx import config,Observable
from rx.subjects import Subject

import experiment
from exp_settings import ExpStatus

class Tibometer:
    Experiment = experiment.Experiment()
    Read_obs = None
    Write_obs = None
    subscriptRead = None
    subscriptWrite = None
    #def __init__(self):
    #    self.a=""
    #    #for i in range(50):
    #    #    sd = self.Experiment.GetSensorData()
    #    #    sd = self.Experiment.DataFile.write(sd)
    #    #    print(sd)
    #    #self.Experiment.DataFile.StopRecording()
    @classmethod
    def getValues(cls,i):
        sd = cls.Experiment.GetSensorData()
        #cls.Experiment.currentTargetData = cls.Experiment.Program.MoveToTarget(sd)
        return (sd,cls.Experiment.currentTargetData)

    @classmethod
    def BeginReading(cls,send_updates_function):
        def send_response(i):
            #print(i)
            Tibometer.getValues(i)
            send_updates_function(i)
        def on_error(e):
            print(e)
        if cls.subscriptRead is None:
            cls.Read_obs = Observable.interval(cls.Experiment.Settings.listening_interval).publish()
            cls.subscriptRead = cls.Read_obs.subscribe(send_response, on_error)
            cls.Read_obs.connect()
        else:
            print("uzhe zapuschen!")

    @classmethod
    def EndReading(cls):
        if cls.subscriptRead is not None:
            cls.EndWriteing()
            cls.EndProgram()
            cls.subscriptRead.dispose()
            cls.subscriptRead = None
            cls.Read_obs = None

    @classmethod
    def BeginWriteing(cls):
        def send_write(i):
            sd =Tibometer.Experiment.currentRecordData
            sd = Tibometer.Experiment.DataFile.write(sd)
        def on_errorW(e):
            print("WRITE:{0}".format(e))
        if (cls.subscriptRead is not None) and (cls.subscriptWrite is None):
            cls.Experiment.DataFile.MakeHdf5File();
            cls.Experiment.DataFile.StartRecording(cls.Experiment.currentRecordData)
            cls.Write_obs = cls.Read_obs.filter(lambda i: i%cls.Experiment.Settings.recording_cycle==0)
            cls.subscriptWrite = cls.Write_obs.subscribe(send_write, on_errorW)
            cls.Experiment.status.status = ExpStatus.started
        else:
            print("Writing error!")

    @classmethod
    def EndWriteing(cls):
        if cls.subscriptWrite is not None:
            cls.subscriptWrite.dispose()
            cls.subscriptWrite = None
            cls.Write_obs = None
            cls.Experiment.DataFile.StopRecording()
            cls.Experiment.status.status = ExpStatus.completed

    @classmethod
    def BeginProgram(cls):
        if (cls.subscriptRead is not None) and (cls.Experiment.Program.programStartTime is None):
            cls.Experiment.Program.BeginProgram()
    
    @classmethod
    def EndProgram(cls):
        if cls.Experiment.Program.programStartTime is not None:
            cls.Experiment.Program.EndProgram()



