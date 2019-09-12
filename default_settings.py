import numpy as np;

# Force[N] => Torque[N*cm]
def Force_2_Torque(force_in_N):
    return 2.9*force_in_N


# Presure[bar]=> Force[N]
def Pressure_2_Force(Presure_in_bar):
    return 192*(Presure_in_bar)- 92 

DefaultCalibration_Pressure_2_Force=np.array([
#Presure[bar], Force[N]
[0.0,   0],
[1.0,   100.0],
[6.0,   1060],
],dtype=np.float);


DefaultCalibration_Load=np.array([
# voltage,force
[0.615, Pressure_2_Force(0.5)],
[0.76,  Pressure_2_Force(1.0)],
[1.137, Pressure_2_Force(2.0)],
[1.47,  Pressure_2_Force(3.0)],
[1.78,  Pressure_2_Force(4.0)],
[2.0785,  Pressure_2_Force(5.0)],
[2.37125,  Pressure_2_Force(6.0)],
[2.661125,  Pressure_2_Force(7.0)]
],dtype=np.float);


DefaultCalibration_Friction=np.array([
# voltage,force
[0.59,   5.0 - 5.0],
[1.42,   20.0 - 5.0],
[1.93,   30.0 - 5.0],
[3.42,   60.0 - 5.0],
[4.30,   80.0 - 5.0],
[5.16,  100.0 - 5.0],
[6.0,  125.0 - 5.0]
],dtype=np.float); 


DefaultSettings={
    "working_directory":"/home/pi/tribometer/",
    "resultsFolder":"ExperimentalData/",
    "user":"",
    "operatorsFileName":"operators.csv",
    "bearing":"",
    "output_file":"temp",
    "export_result_to_csv":True,
    #"log_file":"log.txt",
    "friction_force_calibration_curve_file":'calibration_friction.csv',
    "load_calibration_curve_file":'calibration_load.csv',
    # miliseconds
    "listening_interval":500,
    # listening intervals count
    "recording_cycle":2,
    # listening intervals count
    #"visualisation_cycle":4,
    # minutes (manual mode, default 20 hours)
    #"total_duration":20*60,
    #"rpm":600,
    #"load":200.0,
    "manual_mode":True,
    "program":[
        {"duration":10, "load":200.0,"RPM":600,"Tmax":100,"Fmax":100}],
    "rpmMaxRegTime":2*60, # 2 minutes
    "loadMaxRegTime":3*60, # 3 minutes
    "avgBufferSize": 10, # 
    "rpmRegCikleSize":20,
    "loadRegCikleSize":15,
    "loadRegualtionDiffStart":50,
    "loadRegualtionDiffStop":10,
    "RPMRegualtionDiffStart":5,
    "RPMRegualtionDiffStop":2,
    #=================================================================
    # optional field
    "readme":"UNITS: intervals[second]; duration[minutes]; threshold,load[N]"
}
import platform
if platform.system() == 'Windows':
    DefaultSettings["working_directory"] = ""

