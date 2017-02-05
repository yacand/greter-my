@echo off
set /p counter=<version_counter.txt
set /a counter=%COUNTER%+1
@echo %COUNTER%>version_counter.txt

set datelocal=%date%
set timelocal=%time%

echo REVISION:%COUNTER%
echo DATE:%DATELOCAL% %TIMELOCAL%

@echo	var Version = >src\ts\Version.ts
@echo	{ >>src\ts\Version.ts
@echo		VERSION:1, //-- Public launch >>src\ts\Version.ts
@echo		MAJOR:0, //-- Milestone >>src\ts\Version.ts
@echo		MINOR:0, //-- Sprints / intermediate releases >>src\ts\Version.ts
@echo		REVISION:%COUNTER%, //-- build increment >>src\ts\Version.ts
@echo		DATE:"%DATELOCAL% %TIMELOCAL%" >>src\ts\Version.ts
@echo	} >>src\ts\Version.ts