import numpy as np

import platform
if platform.system()!='Windows':
    import pigpio

#from importlib import reload  # Python 3.4+ only.
#import foo
#while True:
#    # Do some things.
#    if is_changed(foo):
#        foo = reload(foo)

class RPM_reader:
    def __init__(self, pi, gpio, pulses_per_rev=1.0, avgCount=30):
        self.pi = pi
        self.gpio = gpio
        self.tick_t0 = None
        self.pulses_per_rev = pulses_per_rev
        self.avgCount = np.max((avgCount+1,3))
        self._cb = None #pi callback function
        self.init_counters()

    def __del__(self):
        self.stop()

    def init_counters(self):
        self.ticks = np.zeros(self.avgCount, dtype=np.int)
        self.ticks_pow2 = np.zeros(self.avgCount, dtype=np.float)
        self.mask = np.zeros(self.avgCount, dtype=np.uint8)
        self.cum_count = 0
        self.cum_period = 0
        self.cum_period_pow2 = 0
        self.cur_position = 0
        self.prev_position = 1
        if self._cb is not None:
            self._cb.cancel()
        if self.gpio is not None:
            self.pi.set_mode(self.gpio, pigpio.INPUT)
            self._cb = self.pi.callback(self.gpio, pigpio.RISING_EDGE, self._cbf)

    def stop(self):
        if self._cb is not None:
            self._cb.cancel()

    def _update_position(self):
        self.cur_position+=1
        self.prev_position +=1
        if self.cur_position>=self.avgCount:
            self.cur_position=0
        if self.prev_position>=self.avgCount:
            self.prev_position=0

    def addPeriod(self,t):
        # t in microseconds
        self.mask[self.cur_position] = 1
        self.ticks[self.cur_position] = t
        self.ticks_pow2[self.cur_position] = t*t
        self.cum_count += self.mask[self.cur_position]-self.mask[self.prev_position]
        self.cum_period += self.ticks[self.cur_position] - self.ticks[self.prev_position]
        self.cum_period_pow2 += self.ticks_pow2[self.cur_position] - self.ticks_pow2[self.prev_position]
        self._update_position()

    def _cbf(self, gpio, level, tick):
        if level == 1: # Rising edge.
            if self.tick_t0 is not None:
                t = pigpio.tickDiff(self.tick_t0, tick)
                self.addPeriod(t)
            self.tick_t0 = tick
        #elif level == 2: # Watchdog timeout.

    def PeriodStd(self):
        if self.cum_count>0:
            period = self.cum_period/self.cum_count
            std = self.cum_period_pow2 - period*self.cum_period
            std /= self.cum_count
            std = np.sqrt(std)
            return (period,std)
        else:
            return (np.nan, np.nan)

    def RPM(self):
        RPM = np.nan
        if self.cum_period >0:
            RPM = 60000000.0*self.cum_count / (self.cum_period * self.pulses_per_rev)
        return RPM

    def cancel(self):
        """
        Cancels the reader and releases resources.
        """
        self._cb.cancel()

if __name__ == "__main__":
    if platform.system()!='Windows':
        import pigpio
        import time
        pi = pigpio.pi()
        #pi = None
        RPM_GPIO = 6
        RUN_TIME = 6000.0
        SAMPLE_TIME = 1.0

        rpm_reader = RPM_reader(pi, RPM_GPIO,1,30)
        def xxx():
            tar = 500+np.arange(300)
            i=0
            while i<110:
                    #time.sleep(SAMPLE_TIME)
                    t = tar[i]
                    rpm_reader.addPeriod(t)
                    #if i%25==0:
                    RPM = rpm_reader.RPM()
                    T,STD = rpm_reader.PeriodStd()
                    print("{3} {4} RPM:{0},T:{1},STD:{2}".format(RPM,T,STD,i,t))
                    i+=1

        for i in range(1000000):
            time.sleep(1)
            RPM = rpm_reader.RPM()
            T,STD = rpm_reader.PeriodStd()
            print("{3} RPM:{0},T:{1},STD:{2}".format(RPM,T,STD,i))



