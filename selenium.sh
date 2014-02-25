#!/bin/bash

export DISPLAY=:99.0
sh -e /etc/init.d/xvfb start

curl http://selenium.googlecode.com/files/selenium-server-standalone-2.39.0.jar > selenium-server.jar
java -jar selenium-server.jar &
sleep .5

exit 0
