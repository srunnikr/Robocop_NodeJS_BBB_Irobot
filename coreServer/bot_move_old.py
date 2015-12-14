import serial
import time
import sys
import subprocess

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


def goTo(x, y):

	ser.write(DRIVE)  			#Rotate
	ser.write(chr(1))
	ser.write(chr(44))
	
	if x > 0:
		turn_right()
		ser.write(WAITANGLE)
		# 90 degrees
		ser.write(chr(255))
		ser.write(chr(166))
	else:
		turn_left()
		ser.write(WAITANGLE)
		# 90 degrees
		ser.write(chr(0))
		ser.write(chr(90))
		x_new = 0 - x
	
	drive(300,32768)			#Drive Straight	
	ser.write(WAITDIST)
	if x > 0:
		dist_H, dist_L = compute( x )
	else:
		dist_H, dist_L = compute( x_new )
	ser.write( chr(dist_H) )
	ser.write( chr(dist_L) )
	
	ser.write(DRIVE) 			 #Rotate
	ser.write(chr(1))
	ser.write(chr(44))
	
	if y < 0:
		if x > 0:				#4th quadrant
			turn_right()
			ser.write(WAITANGLE)
			# 90 degrees
			ser.write(chr(255))
			ser.write(chr(166))
		else:					#3rd quadrant
			turn_left()
			ser.write(WAITANGLE)
			# 90 degrees
			ser.write(chr(0))
			ser.write(chr(90))
		y = 0 - y
	else:
		if x > 0:				#1st quadrant
			turn_left()
			ser.write(WAITANGLE)
			# 90 degrees
			ser.write(chr(0))
			ser.write(chr(90))
		else:					#2nd quadrant
			turn_right()
			ser.write(WAITANGLE)
			# 90 degrees
			ser.write(chr(255))
			ser.write(chr(166))	
					
	drive(300,32768)			#Drive Straight	
	ser.write(WAITDIST)
	dist_H, dist_L = compute( y )
	ser.write( chr(dist_H) )
	ser.write( chr(dist_L) )

def return_func(type, value_1, value_2):
	#DRIVE
	if type == 1:
		turn('right', -180)
		drive(300,32768)
		ser.write(WAITDIST)
		high_byte, low_byte = compute( 500 )
		ser.write(chr(high_byte))
		ser.write(chr(low_byte))		
		turn('left', 135)
	
	elif type == 2:
		turn('left', 180)
		drive(300,32768)
		ser.write(WAITDIST)
		high_byte, low_byte = compute( 500 )
		ser.write(chr(high_byte))
		ser.write(chr(low_byte))		
		turn('right', -135)
				
		
def stop():
	ser.write(DRIVE)
	ser.write(chr(0))
	ser.write(chr(0))
	ser.write(chr(0))
	ser.write(chr(0))	

def writeFile(funct, x, y):
 f = open('coordinate', 'w')
 f.write(str(funct)+'\n');
 f.write(str(x)+'\n');
 f.write(str(y)+'\n');
 f.close()
 
def readFile():
 f = open('coordinate', 'r')
 funct = f.readline()
 x = f.readline()
 y = f.readline()
 return funct,x,y	
	
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

	function = sys.argv[1]

	#SENSOR1
	if function == 'sensor1':
		#Alert! Drive towards vibration sensor 1!
		turn('left', 45)
		drive(300,32768)
		ser.write(WAITDIST)
		high_byte, low_byte = compute( 500 )
		ser.write(chr(high_byte))
		ser.write(chr(low_byte))		
		stop()
		writeFile(1,0,0)
	        subprocess.call( ["fswebcam", "-r", "1024x768", "bbimage.jpg"] )	
	        a,b,c=readFile()
                time.sleep(5)
		a = int(a)
                b = int(b)
                c = int(c)

                if a==1:
                        return_func(1, 0, 0)

                elif a==2:
                        return_func(2, 0, 0)

	#SENSOR2	
	elif function == 'sensor2':
		#Alert! Drive towards vibration sensor 2!
		turn('right', -45)
		drive(300,32768)
		ser.write(WAITDIST)
		high_byte, low_byte = compute( 500 )
		ser.write(chr(high_byte))
		ser.write(chr(low_byte))		
		stop()
		writeFile(2,0,0)
	    	subprocess.call( ["fswebcam", "-r", "1024x768", "bbimage.jpg"] )
                time.sleep(5)
		a,b,c=readFile()
                a = int(a)
                b = int(b)
                c = int(c)

                if a==1:
                        return_func(1, 0, 0)

                elif a==2:
                        return_func(2, 0, 0)

	#RETURN TO BASE 		
	elif function =='returnToBase':  
		a,b,c=readFile()
		a = int(a)
		b = int(b)
		c = int(c)

		if a==1:
			return_func(1, 0, 0)
		
		elif a==2:
			return_func(2, 0, 0)


	#RESET POSITION  
	elif function =='reset':
	       writeFile(0,0,0)
			
	#Passive Mode
	ser.write('\x80')

	ser.close()	

if __name__ == "__main__":
		main()
