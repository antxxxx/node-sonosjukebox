This is a program designed to be run on a raspberry pi connected to an old style jukebox controller.
When buttons are pressed on the controller, it starts playing tracks on a sonos system

This provides 

1) a database for storing track selections against letter/number combinations

2) a web interface for viewing and updating tracks

3) a rest api for interacting with the database and the sonos system

It also needs https://github.com/antxxxx/raspberry-pi-seeburg-wallbox running which is the code that interfaces with the jukebox controller and converts button presses to a number and letter which can be received by this
