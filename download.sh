#!/bin/sh

printf "\rDownloading Selenium ... "

curl -sL http://selenium.googlecode.com/files/selenium-server-standalone-2.39.0.jar > selenium-server.jar

echo 'OK'
