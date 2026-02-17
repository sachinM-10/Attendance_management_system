@echo off
set "MAVEN_HOME=C:\Users\sachi\.m2\wrapper\dists\apache-maven-3.9.16\0daed3be3ebd1c706f0e69e8b07c6b73f5cc4ea3dfce72a8d0ec2e849ca2ddb0"
java -classpath "%MAVEN_HOME%\boot\plexus-classworlds-2.11.0.jar" "-Dclassworlds.conf=%MAVEN_HOME%\bin\m2.conf" "-Dmaven.home=%MAVEN_HOME%" "-Dmaven.multiModuleProjectDirectory=%CD%" org.codehaus.plexus.classworlds.launcher.Launcher %*
