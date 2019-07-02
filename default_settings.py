import numpy as np;

# Force[N] => Torque[N*cm]
def Force_2_Torque(force_in_N):
    return 2.9*force_in_N


# Presure[bar]=> Force[N]
def Pressure_2_Force(Presure_in_bar):
    return 192*(Presure_in_bar)- 92 

DefaultCalibration_Pressure_2_Force=np.array([
#Presure[bar], Force[N]
[0,   0],
[1.0,   100.0],
[6,  1060],
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
    "working_directory":"",
    "user":"",
    "operatorsFileName":"operators.csv",
    "bearing":"",
    "output_file":"temp",
    "log_file":"log.txt",
    "friction_force_calibration_curve_file":'calibration_friction.csv',
    "load_calibration_curve_file":'calibration_load.csv',
    # miliseconds
    "listening_interval":500,
    # listening intervals count
    "recording_cycle":2,
    # listening intervals count
    "visualisation_cycle":4,
    # hours (manual mode)
    "total_duration":72,
    "rpm":600,
    "load":10.0,
    "manual_mode":True,
    "program":[
        {"duration":72, "load":10.0,"RPM":1000,"Tmax":100,"Fmax":10,"Vibrmax":10}],
    #=================================================================
    #control parameters
    # [N]
    "friction_force_threshold":10,
    # C
    "temperature_threshold":100,
    # ?
    "vibration_threshold":100,
    # [N]
    "loadRegualtionAccuracy":1,
    # rotation per minute
    "RPMRegualtionAccuracy":1,
    # optional field
    "readme":"UNITS: intervals[second]; duration[hour]; threshold,load[N]"
}

