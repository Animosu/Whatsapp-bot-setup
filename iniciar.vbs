Set WshShell = CreateObject("WScript.Shell")
currentDirectory = WshShell.CurrentDirectory
batFilePath = currentDirectory & "\start.bat"
WshShell.Run Chr(34) & batFilePath & Chr(34), 0
Set WshShell = Nothing
