import time
import pigpio
pigpio.exceptions = False
pi = pigpio.pi()
pi.set_mode(20, pigpio.OUTPUT)
pi.set_mode(21, pigpio.OUTPUT)

#(steps) number of steps one step=>1.8 degree;(direction) dirrection (0 or 1)
def P_motor(steps,direction):
    pi.write(19, 0)  #enable
    pi.write(20, direction)
    pi.set_PWM_dutycycle(21, 128)
    pi.set_PWM_frequency(21, 600) #pulse frequency
    time.sleep(1/600*steps)
    pi.set_PWM_dutycycle(21, 0)
    pi.write(19, 1) #enable

if __name__ == '__main__':
  P_motor(100,1)  #(first) number of steps (second) dirrection (0 or 1) one step 1,8 degree
  #P_motor(90/1.8,0)
