import platform
if platform.system()!='Windows':
    from motor3 import P_motor;
    from VFD import set_speed,start,stop
else:
    def P_motor(steps,direction):
        return 0
    def set_speed(speed):
        return 0;
    def start():
        return 0;
    def stop():
        return 0;


if __name__ == '__main__':
    #P_motor(100,1)  #(first) number of steps (second) dirrection (0 or 1) one step 1,8 degree
    #P_motor(90/1.8,0)
    #P_motor(90/1.8,0)
    set_speed(20)
    start()
    stop()
