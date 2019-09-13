import time
import numpy as np
import pandas as pnd 
import h5py

import matplotlib.pyplot as plt  # $ pip install matplotlib
import matplotlib.animation as animation
FileName = "temp.h5"
hdf= h5py.File(FileName, 'r', libver='latest', swmr=True)

print(hdf)

plt.ion()
fig = plt.figure()
ax = fig.add_subplot(111)
x = y = np.arange(200)
line1, = ax.plot(x, y, 'b-')
line2, = ax.plot(x, y, 'r-')
line3, = ax.plot(x, y, 'g-')
plt.legend(('Temperature', 'Friction Forse','RPM'),
           loc='upper right')

prevCount = -1
last_rec=0
print('do cikla')
while prevCount!=last_rec or True:
    #"time[s], Load[Pa], FrictionForce[N], RPM[rotation per minute], temperature[C]"
    prevCount = last_rec
    dt = hdf["data"]
    last_rec = np.argmax(dt[:,0])
    step = last_rec//1000
    if step<1:
        step = 1
    data = dt[:last_rec:step]
    x=data[:,0]
    print('step:{0},{1}'.format(step,last_rec))
    line1.set_xdata(x)
    line2.set_xdata(x)
    line3.set_xdata(x)
    y1= data[:,4]
    y2= data[:,2]
    y3= data[:,3]
    line1.set_ydata(y1)
    line2.set_ydata(y2)
    line3.set_ydata(y3)
    ax.set_xlim(x[0],x[-1])
    yl1,yl2 = np.min((y1[0],y2[0],y3[0])),np.max((y1[-1],y2[-1],y3[-1]))
    print("lim {0} {1}".format(yl1,yl2))
    ax.set_ylim(yl1-5,yl2+5)
    fig.canvas.draw()
    time.sleep(1)
res.close()
