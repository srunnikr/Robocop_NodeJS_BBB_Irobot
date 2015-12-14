import Adafruit_BBIO.GPIO as GPIO
import time 
import datetime

pin = "P8_7"

#GPIO.setup(pin, GPIO.IN)
GPIO.setup(pin, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)
#GPIO.output(pin, GPIO.LOW)

lastTrigger = time.time()

def writeTime():
    with open('event.txt','a') as myfile:
        myfile.write("touch")
    myfile.close()
 

print "====== waiting for vibration ======"
 
from time import sleep  

def main():
    t = time.time()
    lastTrigger = time.time()
    while True:
        if not GPIO.input(pin):
	    currTime = time.time()
	    print "Low detected : ",currTime,"Difference ",(currTime - lastTrigger)
	    if (currTime - lastTrigger) > 5:
            	print "Touch that event file here"
                writeTime()
                time.sleep(2)
		lastTrigger = currTime
    GPIO.cleanup()


if __name__ == '__main__':
    main()



   


