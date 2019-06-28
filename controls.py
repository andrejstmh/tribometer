import platform
if platform.system()!='Windows':
    from motor3 import P_motor;
    from VFD import set_speed,start,stop
else:
    import trib_emulator
    import numpy
    def P_motor(steps,direction):
        delta = 1.8*steps*(steps*2-1)
        trib_emulator.tribometer_Emul.setLoad(delta);

    def set_speed(speed):
        trib_emulator.tribometer_Emul.set_WFD(-speed)
    def start():
        trib_emulator.tribometer_Emul.set_WFD(numpy.abs( trib_emulator.tribometer_Emul.WFD))

    def stop():
        trib_emulator.tribometer_Emul.set_WFD(0)

from relay_control import setReleyState;

if __name__ == '__main__':
    #P_motor(100,1)  #(first) number of steps (second) dirrection (0 or 1) one step 1,8 degree
    #P_motor(90/1.8,0)
    #P_motor(90/1.8,0)
    set_speed(20)
    start()
    stop()
