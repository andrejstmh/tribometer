import RPi.GPIO as GPIO #Import GPIO library
GPIO.setwarnings(False)
GPIO.setmode(GPIO.BOARD)
GPIO.setup(35, GPIO.OUT)
GPIO.output(35, True) #switch off
 

  
    