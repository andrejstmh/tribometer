# tribometer

## Software
rasberian 2018-11-26-rpd-x86-stretch
### Editors and repositories
1. Visual studio code
	1. wget https://packagecloud.io/headmelted/codebuilds/gpgkey -O - | sudo apt-key add -
	1. curl -L https://code.headmelted.com/installers/apt.sh | sudo bash
1. Git
	1. git clone https://github.com/schacon/

	1. git config --global user.name "andrejstmh"
	1. git config --global user.email "andrejstmh@gmail.com"

### HDF5
1. sudo apt-get update
1. sudo apt-get install libhdf5-dev
1. sudo apt-get update
1. sudo apt-get install libhdf5-serial-dev

### python libraries
1. sudo pip3 install tornado
1. sudo pip3 install --upgrade pyserial
1. sudo pip3 install numpy --upgrade
1. sudo pip3 install pandas
1. sudo pip3 install h5py
1. sudo pip3 install matplotlib
1. sudo pip3 install rx

## Other
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
1. mount -t vboxsf [-o OPTIONS] rspbr /mnt/rspbr
1. mount -t vboxsf rspbr /mnt/rspbr
