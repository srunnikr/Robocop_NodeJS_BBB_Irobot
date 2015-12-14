import serial
import time
import sys

START = chr(128) 
WAITDIST = chr(156)
WAITANGLE = chr(157)
DRIVE = chr(137)
SENSORS = chr(142)
ser = serial.Serial(port='/dev/ttyO4', baudrate=57600)

def turn_left():
	ser.write(chr(0))
	ser.write(chr(1))
	
def turn_right():
	ser.write(chr(255))
	ser.write(chr(255))

def compute( value ):
	if value < 0:
		value = (1<<16) + value
	
	print 'higher byte', (value >> 8) & 0xFF
	print 'lower byte', (value & 0xFF )
	
	return ( (value >> 8) & 0xFF, value & 0xFF )

def turn(dir, angle):
	ser.write(DRIVE)
	ser.write(chr(1))
	ser.write(chr(44))
	
	if dir == 'left':		
		turn_left()
	elif dir == 'right':
		turn_right()
	
	ser.write(WAITANGLE)		

	highByte, lowByte = compute( angle )
	ser.write( chr(highByte) )
	ser.write( chr(lowByte) )
	
	

def drive(velocity, radius):

	#Velocity in mm/s
	#Radius in mm
	
	if radius == 32768 or radius == 32767:
		radius_H = 128
		radius_L = 0
	elif radius >= -2000 and radius <= 2000:
		radius_H, radius_L = compute( radius )
	
	
	if velocity >= -500 and velocity <= 500:
		velocity_H, velocity_L = compute( velocity )
	
	print 'VEL', velocity_H, velocity_L, 'RADIUS', radius_H, radius_L
	
	ser.write( DRIVE )
	ser.write( chr(velocity_H) )
	ser.write( chr(velocity_L) )
	ser.write( chr(radius_H) )
	ser.write( chr(radius_L) )


		
def stop():
	ser.write(DRIVE)
	ser.write(chr(0))
	ser.write(chr(0))
	ser.write(chr(0))
	ser.write(chr(0))	

	
## Main ##


def main():
		# Open a serial connection to Roomba

	ser.close()
	ser.open()

	if ser.isOpen():
        	print "Serial port is open"
	else:
        	print "Error opening serial port"

	ser.write(START)
	#Safe Mode
	ser.write('\x83')
	time.sleep(.1)

	function = int(sys.argv[1])

	#DRIVE STRAIGHT
	if function == 1:
		#Straight
		drive(300,32768)
		ser.write(WAITDIST)
		ser.write(chr(0))
		ser.write(chr(150))		
		stop()
		
	#LEFT	
	elif function ==3:
		#Turn Left 90 degrees
		turn('left', 90)
		stop()
		
	#RIGHT		
	elif function ==4:
		#Turn Right 90 degrees
		turn('right', -90)	
		stop()
		
	#BACKWARDS
	elif function ==2:
		#Turn Left 180 degrees
		turn('left', 180)
		drive(300,32768)
		ser.write(WAITDIST)
		ser.write(chr(0))
		ser.write(chr(150))		
		stop()
		

	#Passive Mode
	ser.write('\x80')

	ser.close()	

if __name__ == "__main__":
		main()
