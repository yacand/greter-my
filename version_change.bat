@echo off
set /p counter=<version_counter.txt
set /a counter=%COUNTER%+1
@echo %COUNTER%>version_counter.txt

set datelocal=%date%
set timelocal=%time%

echo REVISION:%COUNTER%
echo DATE:%DATELOCAL% %TIMELOCAL%

@echo	class Version >src\ts\version.ts
@echo	{ >>src\ts\version.ts
@echo		public VERSION:number = 1; //-- Public launch >>src\ts\version.ts
@echo		public MAJOR:number = 0; //-- Milestone >>src\ts\version.ts
@echo		public MINOR:number = 0; //-- Sprints / intermediate releases >>src\ts\version.ts
@echo		public REVISION:number = %COUNTER%; //-- build increment >>src\ts\version.ts
@echo		public DATE:string = "%DATELOCAL% %TIMELOCAL%" >>src\ts\version.ts
@echo	} >>src\ts\version.ts