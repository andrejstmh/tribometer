# tribometer

## Software
rasberian 2018-11-26-rpd-x86-stretch
### HDF5
sudo apt-get update
sudo apt-get install libhdf5-dev
sudo apt-get update
sudo apt-get install libhdf5-serial-dev

### python libraries
sudo pip3 install ???gipio
sudo pip3 install sensor 
sudo pip3 install --upgrade pyserial
sudo pip3 install numpy --upgrade
sudo pip3 install pandas
sudo pip3 install h5py
sudo pip3 install matplotlib
sudo pip3 install rx


Sensors/get
Time
Temperature
Rotation count
Friction force
Vibration/ Acoustic emission sensor
Pressure
Pressure applied
Engine on

Current project settings
	T,Ffr,P,AE, sensor calibration constants


Commands/post
Project file name
Writing frequency

Virtualbox config
mount -t vboxsf [-o OPTIONS] rspbr /mnt/rspbr
mount -t vboxsf rspbr /mnt/rspbr
