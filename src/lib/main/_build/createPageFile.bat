set /p CreateName=System name:
md ..\%CreateName%
xcopy createPage ..\%CreateName% /s
set CreateName=
PAUSE
EXIT