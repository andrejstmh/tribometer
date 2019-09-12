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
    #    pass

    @classmethod
    def getValues(cls,i):
        sd = cls.Experiment.GetSensorData()
        stop_reason = cls.Experiment.StopCriteria()
        if stop_reason is not None:
            if cls.Experiment.status.status == ExpStatus.started:
                cls.EndWriteing(stop_reason)
        return sd


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
            autoMode = not cls.Experiment.Settings.manual_mode
            cls.Experiment.Program.LoadAutoRegulation=cls.Experiment.Program.RPMAutoRegulation=autoMode
            cls.Experiment.status.loadRegAuto = cls.Experiment.status.rpmRegAuto = autoMode
        else:
            print("Writing error!")

    @classmethod
    def EndWriteing(cls, stop_reason):
        if cls.subscriptWrite is not None:
            cls.subscriptWrite.dispose()
            cls.subscriptWrite = None
            cls.Write_obs = None
            cls.Experiment.DataFile.StopRecording(stop_reason)
            cls.Experiment.status.status = ExpStatus.completed
            cls.Experiment.Program.LoadAutoRegulation=cls.Experiment.Program.RPMAutoRegulation=False
            cls.Experiment.SetStopRotationsManual()
            cls.Experiment.status.loadRegAuto = cls.Experiment.status.rpmRegAuto = False

    #@classmethod
    #def BeginProgram(cls):
    #    if (cls.subscriptRead is not None) and (cls.Experiment.Program.programStartTime is None):
    #        cls.Experiment.Program.BeginProgram()
    
    #@classmethod
    #def EndProgram(cls):
    #    if cls.Experiment.Program.programStartTime is not None:
    #        cls.Experiment.Program.EndProgram()



