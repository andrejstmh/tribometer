import numpy as np;

DefaultCalibration_Load=np.array([
# voltage,force
[-1E6,   -1E6],
[0.5,   0.0],
[0.615, 0.5],
[0.76,  1.0],
[1.137, 2.0],
[1.47,  3.0],
[1.78,  4.0],
[1E6,  1E6]
],dtype=np.float);


DefaultCalibration_Friction=np.array([
# voltage,force
[-1E6,   -1E6],
[0.59,   5.0],
[1.42,   20.0],
[1.93,   30.0],
[3.42,   60.0],
[4.30,   80.0],
[5.16,  100.0],
[1E6,  1E6]
],dtype=np.float); 

DefaultCalibration_RPM=np.array([
#frequency[Hz], RPM
[-1E6,   -1E6],
[1E6,  1E6]
],dtype=np.float);

DefaultSettings={
    "working_directory":"",
    "user":"",
    "bearing":"",
    "output_file":"temp",
    "log_file":"log.txt",
    "friction_force_calibration_curve_file":'calibration_friction.csv',
    "load_calibration_curve_file":'calibration_load.csv',
    #"rpm_calibration_curve_file":'calibration_rpm.csv',
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

