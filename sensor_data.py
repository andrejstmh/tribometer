import numpy as np

class SensorData:
	#def __init__(self):
	#	self
	def readRPM(self):
		return 50+(np.random.random()-0.5)*2

	def readFriction(self):
		return 1.5+(np.random.random()-0.5)*2

	def readLoad(self):
		return 0.5+(np.random.random()-0.5)*2

	def readTemperature(self):
		return 25.0+2*(np.random.random()-0.5)

	def readVibration(self):
		return np.random.random()