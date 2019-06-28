import time
import platform

if platform.system()!='Windows':
    import pigpio
    #pigpio.pi().write(11, 0)# potenciometer / manual mode on
    #pigpio.pi().write(11, 1)# Rpi           / manual mode off
    #pigpio.pi().write(9, 0) #off      / engine off/ threshold
    #pigpio.pi().write(9, 1) #on       / engine on
    picontrol = pigpio.pi()
    def setReleyState(engine_on=True, manual_mode=True):
        if manual_mode is not None:
            if manual_mode:
                picontrol.write(11, 0)
            else:
                picontrol.write(11, 1)
        if engine_on is not None:
            if engine_on:
                picontrol.write(9, 1)
            else:
                picontrol.write(9, 0)
else:
    import trib_emulator
    def setReleyState(engine_on=False, manual_mode=True):
        if engine_on is not None:
            if not engine_on:
                trib_emulator.tribometer_Emul.set_WFD(0)

if __name__ == '__main__':
    while True:
        set_state(engine_on=None,manual_mode=True)# potenciometer / manual mode on
        set_state(engine_on=None,manual_mode=False)# Rpi           / manual mode off

        #set_state(engine_on=False,manual_mode=None) #off      / engine off/ threshold
        #set_state(engine_on=True,manual_mode=None) #on       / engine on
        time.sleep(1)
        #bb.write(11, 0)
        #b.write(9, 1)
        time.sleep(100)
