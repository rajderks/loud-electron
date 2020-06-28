# Todo

- [x] Log file setup
- [x] [Folder check](#folder-check)
- [x] [Test write](#test-write)
- [x] [File Attributes](#set-file-attr) **(wont-fix-until-actually-a-problem)**
- [x] [User Directories](#user-directories)
- [x] [Toggle user maps](#toggle-user-maps)
- [x] [Toggle user mods](#toggle-user-mods)
- [x] [Old files cleanup](#old-files-cleanup) **(wont-fix)**
- [x] [Run game](#run-game)
- [x] [Help file](#help-file)
- [x] [Updater log](#updater-log)
- [x] [Game log](#game-log)
- [x] [IconsMod](#iconsmod)
- [x] [Info File](#infofile)
- [x] [Discord invite](#discord-invite)
- [x] [Desktop Shortcuts](#desktop-shortcuts) **(wont-fix)**
- [x] [List updates](#list-updates)
- [x] [Open maps folder](#open-maps-folder)
- [x] [Open mods folder](#open-mods-folder)
- [x] [Open replays folder](#open-replays-folder)
- [x] [Cleanup](#cleanup) **(wont-fix)**
- [x] [Game data cleanup](#game-data-cleanup)
- [x] [Maps cleanup](#maps-cleanup)
- [x] [Mods cleanup](#mods-cleanup)
- [x] [GameOptions](#gameoptions)
- [x] set updater color according to update status
- [x] Check for update
- [x] Download out of sync files
- [x] disable gui buttons during update
- [x] User maps enabled (UI, save to config file)
- [x] User mods enabled (UI, save to config file)
- [x] if LoudDataPath.lua doesn't exist ("LoudDataPath.lua file does not exist, unable to enable/disable UserMaps and UserMods")
- [x] if loud\gamedata missing show warning loud not install, should use updater. (disable run)
- [x] check github api for new version
- [ ] cache server CRC and only download out of sync server CRC entries.

## Test Write

_Func testWrite()_

```
Local $TestFile, $TestFileData, $TestFilePath = @ScriptDir & "\test.txt"
	LogInfo("Running testWrite")
	If FileExists($TestFilePath) = 1 Then
		FileSetAttrib($TestFilePath, "-R-S-H-N-O-T")
		FileDelete($TestFilePath)
	EndIf
	$TestFile = FileOpen($TestFilePath, 2)
	FileWriteLine($TestFile, "test")
	FileClose($TestFile)
	$TestFile = FileOpen($TestFilePath, 0)
	$TestFileData = FileReadLine($TestFile)
	FileClose($TestFile)
	If FileExists($TestFilePath) = 1 Then FileDelete($TestFilePath)
	If $TestFileData <> "test" Then
		LogInfo("This updater program must be run with administrative rights")
		MsgBox(0, "Error", "This updater program must be run with administrative rights")
		Exit
	EndIf
	LogInfo("testWrite completed")
```

## Set file attr

_Func SetFileAttributes() ;Sets all file attributes recursively to -R-A-S-H-N-O-T_

```
	LogInfo("Running SetFileAttributes")
	If Not FileSetAttrib($LoudDir & "*.*", "-R-S-H-N-O-T", $FT_RECURSIVE) Then LogInfo("Error setting file attributes in game directory structure")
	LogInfo("SetFileAttributes completed")
```

## Folder check

_Func FolderCheck() ;Check if program is run from the game's root folder_

```
	LogInfo("Running FolderCheck")
	If Not ((FileExists(@ScriptDir & "\bin\ForgedAlliance.exe") Or FileExists(@ScriptDir & "\bin\SupremeCommander.exe")) And FileExists(@ScriptDir & "\gamedata\moholua.scd")) Then
		MsgBox(0, "Error", "This updater program must be run from the Supreme Commander Forged Alliance root folder")
		LogInfo("Updater program must be run from the SCFA root folder")
		FileClose($LogFile)
		Exit
	EndIf
	LogInfo("FolderCheck completed")
```

## User Directories

_Func CreateUserDirectories() ;Creates directories for user maps & mods_

```
	LogInfo("Running CreateUserDirectories")
	Local $folder1 = $LoudDir & "usermaps", $folder2 = $LoudDir & "usermods", $sizefolder
	If Not FileExists($folder1) Then DirCreate($folder1)
	If Not FileExists($folder2) Then DirCreate($folder2)
	$sizefolder = DirGetSize($folder1, 1)
	If Not (Not @error And Not $sizefolder[1] And Not $sizefolder[2]) Then LogInfo("*** Warning *** Files found in 'usermaps' directory and will be loaded as maps")
	$sizefolder = DirGetSize($folder2, 1)
	If Not (Not @error And Not $sizefolder[1] And Not $sizefolder[2]) Then LogInfo("*** Warning *** Files found in 'usermods' directory and will be loaded as mods")
	LogInfo("CreateUserDirectories completed")
```

## Old files cleanup

_Func OldFilesCleanUp() ;Cleans up removed & old files from SCFA Updater v3 configuration switching_

```
	LogInfo("Running OldFilesCleanUp")
	If FileExists(@ScriptDir & "\gamedata.save\loud.txt") Then DirRemove(@ScriptDir & "\gamedata.save", $DIR_REMOVE)
	If FileExists(@ScriptDir & "\maps.save\loud.txt") Then DirRemove(@ScriptDir & "\maps.save", $DIR_REMOVE)
	If FileExists(@ScriptDir & "\bin.save\loud.txt") Then DirRemove(@ScriptDir & "\bin.save", $DIR_REMOVE)
	If FileExists(@ScriptDir & "\gamedata\loud.txt") And FileExists(@ScriptDir & "\gamedata.save") Then
		DirRemove(@ScriptDir & "\gamedata", $DIR_REMOVE)
		DirMove(@ScriptDir & "\gamedata.save", @ScriptDir & "\gamedata", $FC_OVERWRITE)
	EndIf
	If FileExists(@ScriptDir & "\maps\loud.txt") And FileExists(@ScriptDir & "\maps.save") Then
		DirRemove(@ScriptDir & "\maps", $DIR_REMOVE)
		DirMove(@ScriptDir & "\maps.save", @ScriptDir & "\maps", $FC_OVERWRITE)
	EndIf
	If FileExists(@ScriptDir & "\bin\loud.txt") And FileExists(@ScriptDir & "\bin.save") Then
		DirRemove(@ScriptDir & "\bin", $DIR_REMOVE)
		DirMove(@ScriptDir & "\bin.save", @ScriptDir & "\bin", $FC_OVERWRITE)
	EndIf
	If FileExists(@ScriptDir & "\bin\LOUD.log") Then FileDelete(@ScriptDir & "\bin\LOUD.log")
	If FileExists(@ScriptDir & "\SCFA_CRCs.txt") Then FileDelete(@ScriptDir & "\SCFA_CRCs.txt")
	If FileExists(@ScriptDir & "\bin\SupremeCommander.exe") And FileExists(@ScriptDir & "\bin\ForgedAlliance.exe") Then FileDelete(@ScriptDir & "\bin\ForgedAlliance.exe")
	If FileExists(@ScriptDir & "\bin\LoudDataPath.lua") Then FileDelete(@ScriptDir & "\bin\LoudDataPath.lua")
	If FileExists(@ScriptDir & "\bin\Advanced Strategic Icons Mod Installer.exe") Then FileDelete(@ScriptDir & "\bin\Advanced Strategic Icons Mod Installer.exe")
	If FileExists($LoudDir & "bin\LOUD.bmp") Then FileDelete($LoudDir & "bin\LOUD.bmp")
	If FileExists($LoudDir & "bin\Loud.jpg") Then FileDelete($LoudDir & "bin\Loud.jpg")
	If FileExists($LoudDir & "bin\PayPal.jpg") Then FileDelete($LoudDir & "bin\PayPal.jpg")
	LogInfo("OldFilesCleanUp completed")
```

## Help file

_Func HelpFile() ;Show help file_

Note: Check if exists, else disable menu item.

```
LogInfo("--'Help' selected")
	If FileExists($LoudDir & "doc\Help.txt") Then Run("notepad.exe " & $LoudDir & "doc\Help.txt")
	UpdateGUI()
```

## Run game

_Func RunGame() ; Run game_

```
	Local $Exec1 = '"' & @ScriptDir & "\bin\SupremeCommander.exe" & '"'
	Local $Exec2 = '"' & @ScriptDir & "\bin\ForgedAlliance.exe" & '"'
	LogInfo("--'Run Game' selected")
	btnDisable()
	If FileExists(@ScriptDir & "\bin\SupremeCommander.exe") Then
		LogInfo("Game launched via 'SupremeCommander.exe'")
		RunWait($Exec1 & $GameMount & $GameLog, @ScriptDir & "\bin")
	ElseIf FileExists(@ScriptDir & "\bin\ForgedAlliance.exe") Then
		LogInfo("Game launched via 'ForgedAlliance.exe'")
		RunWait($Exec2 & $GameMount & $GameLog, @ScriptDir & "\bin")
	Else
		LogInfo("Unable to find executable to launch the game")
	EndIf
	UpdateGUI()
```

## Updater log

_Func ViewUpdaterLog() ; View updater log_
Note: \SCFA_Updater.log missng then disable log button

```
	LogInfo("--'View Updater Log' selected")
	If FileExists(@ScriptDir & "\SCFA_Updater.log") Then Run("notepad.exe " & @ScriptDir & "\SCFA_Updater.log")
	UpdateGUI()
```

## Game log

_Func ViewGameLog() ;View game log_

```
LogInfo("--'View Game Log' selected")
	If FileExists($LoudDir & "bin\LOUD.log") Then Run("notepad.exe " & $LoudDir & "bin\LOUD.log")
	UpdateGUI()
```

## Toggle user maps

_Func UserMapsToggle ; Toggle user maps_

```
	Local $iRetval, $ButtonValue
	LogInfo("--'Toggle User Maps' selected")
	btnDisable()
	If $UserMaps = "Enabled" Then
		$iRetval = _ReplaceStringInFile($LuaFile, $MapsMountEnable, $MapsMountDisable)
		If $iRetval > 0 Then
			$UserMaps = "Disabled"
			LogInfo("'UserMaps' set to 'Disabled'")
		Else
			LogInfo("Error changing 'UserMaps' to 'Disabled' in 'LoudDataPath.lua'")
			MsgBox(0, "Error", "Error changing 'UserMaps' to 'Disabled' in 'LoudDataPath.lua'")
		EndIf
	ElseIf $UserMaps = "Disabled" Then
		$ButtonValue = MsgBox(308, "Warning", "Enabling untested maps can cause game problems, continue?")
		If $ButtonValue = $IDNO Then
			UpdateGUI()
			Return
		EndIf
		$iRetval = _ReplaceStringInFile($LuaFile, $MapsMountDisable, $MapsMountEnable)
		If $iRetval > 0 Then
			$UserMaps = "Enabled"
			LogInfo("'UserMaps' set to 'Enabled'")
		Else
			LogInfo("Error changing 'UserMaps' to 'Enabled' in 'LoudDataPath.lua'")
			MsgBox(0, "Error", "Error changing 'UserMaps' to 'Enabled' in 'LoudDataPath.lua'")
		EndIf
	EndIf
	UpdateGUI()
```

## Toggle user mods

_Func UserModsToggle() ;Toggle user mods_

```
Local $iRetval, $ButtonValue
LogInfo("--'Toggle User Mods' selected")
btnDisable()
If $UserMods = "Enabled" Then
	$iRetval = _ReplaceStringInFile($LuaFile, $ModsMountEnable, $ModsMountDisable)
	If $iRetval > 0 Then
		$UserMods = "Disabled"
		LogInfo("'UserMods' set to 'Disabled'")
	Else
		LogInfo("Error changing 'UserMods' to 'Disabled' in 'LoudDataPath.lua'")
		MsgBox(0, "Error", "Error changing 'UserMods' to 'Disabled' in 'LoudDataPath.lua'")
	EndIf
ElseIf $UserMods = "Disabled" Then
	$ButtonValue = MsgBox(308, "Warning", "Enabling untested mods can cause game problems, continue?")
	If $ButtonValue = $IDNO Then
		UpdateGUI()
		Return
	EndIf
	$iRetval = _ReplaceStringInFile($LuaFile, $ModsMountDisable, $ModsMountEnable)
	If $iRetval > 0 Then
		$UserMods = "Enabled"
		LogInfo("'UserMods' set to 'Enabled'")
	Else
		LogInfo("Error changing 'UserMods' to 'Enabled' in 'LoudDataPath.lua'")
		MsgBox(0, "Error", "Error changing 'UserMods' to 'Enabled' in 'LoudDataPath.lua'")
	EndIf
EndIf
UpdateGUI()
```

## IconsMod

_Func IconsMod() ;Run icons mod installer program_

```
LogInfo("--'Icons Mod Installer' selected")
ShellExecute($LoudDir & "bin\Advanced Strategic Icons Mod Installer.exe")
UpdateGUI()
```

## InfoFile

_Func InfoFile() ;Show info file_

```
LogInfo("--'Info' selected")
If FileExists($LoudDir & "doc\Info.txt") Then Run("notepad.exe " & $LoudDir & "doc\Info.txt")
UpdateGUI()
```

## Discord invite

_Func Discord ;Discord invite_

```
LogInfo("--'Discord Invite' selected")
ShellExecute("https://discord.gg/QfmdKKn")
UpdateGUI()
```

## Desktop shortcuts

_Func Shortcuts() ;Create desktop shortcuts_

```
Local $NotepadArg = @ScriptDir & "\SCFA_Updater.log"
LogInfo("--'Create Shortcuts' selected")
If FileExists(@ScriptDir & "\bin\SupremeCommander.exe") And FileExists($LoudDir & "bin\LOUD.ico") Then
	FileCreateShortcut(@ScriptDir & "\bin\SupremeCommander.exe", @DesktopDir & "\LOUD Forged Alliance.lnk", @ScriptDir & "\bin", $GameLog & $GameMount, "LOUD Forged Alliance", $LoudDir & "bin\LOUD.ico")
	LogInfo("Desktop icon created for 'LOUD Forged Alliance'")
ElseIf FileExists(@ScriptDir & "\bin\ForgedAlliance.exe") And FileExists($LoudDir & "bin\LOUD.ico") Then
	FileCreateShortcut(@ScriptDir & "\bin\ForgedAlliance.exe", @DesktopDir & "\LOUD Forged Alliance.lnk", @ScriptDir & "\bin", $GameLog & $GameMount, "LOUD Forged Alliance", $LoudDir & "bin\LOUD.ico")
	LogInfo("Desktop icon created for 'LOUD Forged Alliance'")
Else
	LogInfo("Unable to create desktop shortcut for 'LOUD Forged Alliance'")
EndIf
If FileExists(@ScriptDir & "\SCFA_Updater.exe") And FileExists($LoudDir & "bin\LOUD.ico") Then
	FileCreateShortcut(@ScriptDir & "\SCFA_Updater.exe", @DesktopDir & "\LOUD Updater.lnk", @ScriptDir, "", "LOUD Updater", $LoudDir & "bin\LOUD.ico")
	LogInfo("Desktop icon created for 'LOUD Updater'")
Else
	LogInfo("Unable to create desktop shortcut for 'LOUD Updater'")
EndIf
If FileExists(@ScriptDir & "\SCFA_Updater.log") And FileExists($LoudDir & "bin\LOUD.ico") Then
	FileCreateShortcut("notepad.exe", @DesktopDir & "\LOUD Updater log.lnk", @ScriptDir, $NotepadArg, "LOUD Updater Log", $LoudDir & "bin\LOUD.ico")
	LogInfo("Desktop icon created for 'LOUD Updater Log'")
Else
	LogInfo("Unable to create desktop shortcut for 'LOUD Updater Log'")
EndIf
UpdateGUI()
```

## List Updates

_Func ListUpdates()_

```
LogInfo("Running ListUpdates")
Local $iAlgorithm = $CALG_SHA1, $NumDownloads = 0, $UpdatesFile, $FileArray, $LDPCRCArray, $dHash, $LFile, $LCPos1, $LCPos2, $LCRC, $LSize, $LDPCRCFlag, $i, $j
btnDisable()
GetFileCRCs()
$ErrorMessageCount = 0
If $DLStatus <> 1 Then
	LogInfo("Unable to download CRC file, update check aborted")
	MsgBox(0, "Error", "Unable to download CRC file, update check aborted")
	UpdateGUI()
	Return
EndIf
If FileExists(@ScriptDir & "\UpdateList.txt") Then
	FileSetAttrib(@ScriptDir & "\UpdateList.txt", "-R-A-S-H-N-O-T")
	FileDelete(@ScriptDir & "\UpdateList.txt")
EndIf
$UpdatesFile = FileOpen(@ScriptDir & "\UpdateList.txt", 2)
If $UpdatesFile = -1 Then
	LogInfo("Unable to create 'UpdatesList' file, update check aborted")
	MsgBox(0, "Error", "Unable to create 'UpdatesList' file, update check aborted")
	UpdateGUI()
	Return
EndIf
$FileArray = FileReadToArray($LoudDir & "SCFA_FileInfo.txt")
GUICtrlSetData($labelStatusBar, "Checking local LOUD files, this may take a few minutes")
GUICtrlSetColor($labelStatusBar, $COLOR_WHITE)
GUICtrlSetState($labelStatusBar, $GUI_SHOW)
For $i = 0 To UBound($FileArray) - 1
	$LCPos1 = StringInStr($FileArray[$i], ",", 0, 1)
	$LCPos2 = StringInStr($FileArray[$i], ",", 0, 2)
	$LFile = StringLeft($FileArray[$i], $LCPos1 - 1)
	$LCRC = StringMid($FileArray[$i], $LCPos1 + 1, $LCPos2 - $LCPos1 - 1)
	$LSize = StringRight($FileArray[$i], StringLen($FileArray[$i]) - $LCPos2)
	If Not FileExists($LoudDir & $LFile) Then
		FileWriteLine($UpdatesFile, "File = " & $LFile & "   Size = " & $LSize & " Bytes")
		$NumDownloads = $NumDownloads + 1
	ElseIf $LFile = "bin\LoudDataPath.lua" And FileExists($LoudDir & "bin\LoudDataPathCRCs.txt") Then
		$LDPCRCFlag = "no"
		$dHash = _Crypt_HashFile($LoudDir & $LFile, $iAlgorithm)
		$LDPCRCArray = FileReadToArray($LoudDir & "bin\LoudDataPathCRCs.txt")
		For $j = 0 To UBound($LDPCRCArray) - 1
			If $LDPCRCArray[$j] = $dHash Then $LDPCRCFlag = "yes"
		Next
		If $LDPCRCFlag <> "yes" Then
			FileWriteLine($UpdatesFile, "File = " & $LFile & "   Size = " & $LSize & " Bytes")
			$NumDownloads = $NumDownloads + 1
		EndIf
	Else
		$dHash = _Crypt_HashFile($LoudDir & $LFile, $iAlgorithm)
		If $LCRC <> $dHash Then
			FileWriteLine($UpdatesFile, "File = " & $LFile & "   Size = " & $LSize & " Bytes")
			$NumDownloads = $NumDownloads + 1
		EndIf
	EndIf
Next
If $NumDownloads = 0 Then FileWriteLine($UpdatesFile, "No missing or out of date files found during scan")
FileClose($UpdatesFile)
GUICtrlSetState($labelStatusBar, $GUI_HIDE)
UpdateGUI()
LogInfo("ListUpdates completed")
If FileExists(@ScriptDir & "\UpdateList.txt") Then Run("notepad.exe " & @ScriptDir & "\UpdateList.txt")
```

## Open maps folder

_MapsFolder() ;Open maps folder_

```
LogInfo("--'Open Maps Folder' selected")
Local $path = @MyDocumentsDir & "\My Games\Gas Powered Games\Supreme Commander Forged Alliance\maps"
If Not FileExists($path) Then DirCreate($path)
Run("C:\WINDOWS\EXPLORER.EXE /n,/e," & $path)
UpdateGUI()
```

## Open mods folder

_ModsFolder() ;Open mods folder_

```
LogInfo("--'Open Mods Folder' selected")
Local $path = @MyDocumentsDir & "\My Games\Gas Powered Games\Supreme Commander Forged Alliance\mods"
If Not FileExists($path) Then DirCreate($path)
Run("C:\WINDOWS\EXPLORER.EXE /n,/e," & $path)
UpdateGUI()
```

## Open replays folder

_ReplaysFolder() ;Open replays folder_

```
LogInfo("--'Open Replays Folder' selected")
Local $path = @MyDocumentsDir & "\My Games\Gas Powered Games\Supreme Commander Forged Alliance\replays"
If Not FileExists($path) Then DirCreate($path)
Run("C:\WINDOWS\EXPLORER.EXE /n,/e," & $path)
UpdateGUI()
```

## Cleanup

_Func Cleanup()_

```
LogInfo("Running Cleanup")
If FileExists($LoudDir & "SCFA_FileInfo.txt") = 1 Then FileDelete($LoudDir & "SCFA_FileInfo.txt")
If FileExists(@ScriptDir & "\SCFA_UpdVer.txt") = 1 Then FileDelete(@ScriptDir & "\SCFA_UpdVer.txt")
If FileExists(@ScriptDir & "\SCFA_UpdVer.exe") = 1 Then FileDelete(@ScriptDir & "\SCFA_UpdVer.exe")
If FileExists(@ScriptDir & "\SCFA_Updater.update") = 1 Then FileDelete(@ScriptDir & "\SCFA_Updater.update")
LogInfo("Cleanup completed")
```

## Game Data Cleanup

_Func gamedataCleanup() ;Remove extra files & directories in gamedata directory_

```
Local $FileArray, $lFilelist, $lDirlist, $LFile, $lFileOnly, $LCPos1, $FileMatch, $i, $j, $k
Local $ExemptMod = "advanced strategic icons.scd"
LogInfo("Running gamedataCleanup")
GUICtrlSetData($labelStatusBar, "Cleaning up files in 'gamedata' directory")
GUICtrlSetColor($labelStatusBar, $COLOR_WHITE)
GUICtrlSetState($labelStatusBar, $GUI_SHOW)
$FileArray = FileReadToArray($LoudDir & "SCFA_FileInfo.txt")
$lFilelist = _FileListToArray($LoudDir & "gamedata", "*", $FLTA_FILES)
If UBound($lFilelist) > 1 And UBound($FileArray) > 1 Then
	For $i = 1 To UBound($lFilelist) - 1
		$FileMatch = 0
		For $j = 0 To UBound($FileArray) - 1
			$LCPos1 = StringInStr($FileArray[$j], ",", 0, 1)
			$LFile = StringLeft($FileArray[$j], $LCPos1 - 1)
			$lFileOnly = $LFile
			For $k = StringLen($LFile) To 1 Step -1
				If StringMid($LFile, $k, 1) = "\" Then
					$lFileOnly = StringRight($LFile, StringLen($LFile) - $k)
					ExitLoop
				EndIf
			Next
			If StringLower($lFilelist[$i]) = StringLower($lFileOnly) Then
				$FileMatch = 1
				ExitLoop
			EndIf
		Next
		If $FileMatch = 0 And StringLower($lFilelist[$i]) <> $ExemptMod Then
			LogInfo("Extra file '" & $lFilelist[$i] & "' found in 'gamedata' directory, moving to 'gamedata.unsupported'")
			FileMove($LoudDir & "gamedata\" & $lFilelist[$i], $LoudDir & "gamedata.unsupported\" & $lFilelist[$i], 9)
		EndIf
	Next
EndIf
$lDirlist = _FileListToArray($LoudDir & "gamedata", "*", $FLTA_FOLDERS)
If UBound($lDirlist) > 1 Then
	For $j = 1 To UBound($lDirlist) - 1
		LogInfo("Extra folder '" & $lDirlist[$j] & "' found in 'gamedata' directory, moving to 'gamedata.unsupported'")
		DirMove($LoudDir & "gamedata\" & $lDirlist[$j], $LoudDir & "gamedata.unsupported", 9)
	Next
EndIf
GUICtrlSetState($labelStatusBar, $GUI_HIDE)
LogInfo("gamedataCleanup completed")
```

## Maps cleanup

_Func mapsCleanup() ;Remove extra files & directories in maps dir_

```
Local $lFilelist, $lFilelist2, $lDirlist, $lDirlist2, $FileArray, $DirMatch, $FileMatch, $i, $j, $k, $l, $LCPos, $LSPos, $LSPos1, $LSPos2
LogInfo("Running mapsCleanup")
GUICtrlSetData($labelStatusBar, "Cleaning up files in 'maps' directory")
GUICtrlSetColor($labelStatusBar, $COLOR_WHITE)
GUICtrlSetState($labelStatusBar, $GUI_SHOW)
$FileArray = FileReadToArray($LoudDir & "SCFA_FileInfo.txt")
$lDirlist = _FileListToArray($LoudDir & "maps", "*", $FLTA_FOLDERS)
If UBound($lDirlist) > 1 And UBound($FileArray) > 1 Then
	For $i = 1 To UBound($lDirlist) - 1
		$DirMatch = 0
		For $j = 1 To UBound($FileArray) - 1
			$LSPos1 = StringInStr($FileArray[$j], "\", 0, 1)
			$LSPos2 = StringInStr($FileArray[$j], "\", 0, 2)
			If $LSPos1 = 0 Or $LSPos2 = 0 Then ContinueLoop
			If StringLower($lDirlist[$i]) = StringLower(StringMid($FileArray[$j], $LSPos1 + 1, $LSPos2 - $LSPos1 - 1)) Then
				$DirMatch = 1
				$lDirlist2 = _FileListToArray($LoudDir & "maps\" & $lDirlist[$i], "*", $FLTA_FOLDERS)
				If UBound($lDirlist2) > 1 Then
					For $k = 1 To UBound($lDirlist2) - 1
						LogInfo("Extra folder '" & $lDirlist[$i] & "\" & $lDirlist2[$k] & "' found in 'maps' directory, moving to 'maps.unsupported'")
						DirMove($LoudDir & "maps\" & $lDirlist[$i] & "\" & $lDirlist2[$k], $LoudDir & "maps.unsupported\" & $lDirlist[$i] & "\" & $lDirlist2[$k], 9)
					Next
				EndIf
				$lFilelist2 = _FileListToArray($LoudDir & "maps\" & $lDirlist[$i], "*", $FLTA_FILES)
				If UBound($lFilelist2) > 1 Then
					For $k = 1 To UBound($lFilelist2) - 1
						$FileMatch = 0
						For $l = 1 To UBound($FileArray) - 1
							$LCPos = StringInStr($FileArray[$l], ",", 0, 1)
							$LSPos = StringInStr($FileArray[$l], "\", 0, 2)
							If $LCPos = 0 Or $LSPos = 0 Then ContinueLoop
							If StringLower($lFilelist2[$k]) = StringLower(StringMid($FileArray[$l], $LSPos + 1, $LCPos - $LSPos - 1)) Then
								$FileMatch = 1
								ExitLoop
							EndIf
						Next
						If $FileMatch = 0 Then
							LogInfo("Extra file '" & $lFilelist2[$k] & "' found in 'maps\" & $lDirlist[$i] & "' directory, moving to 'maps.unsupported'")
							FileMove($LoudDir & "maps\" & $lDirlist[$i] & "\" & $lFilelist2[$k], $LoudDir & "maps.unsupported\" & $lDirlist[$i] & "\" & $lFilelist2[$k], 9)
						EndIf
					Next
				EndIf
			EndIf
		Next
		If $DirMatch <> 1 Then
			LogInfo("Extra folder '" & $lDirlist[$i] & "' found in 'maps' directory, moving to 'maps.unsupported'")
			DirMove($LoudDir & "maps\" & $lDirlist[$i], $LoudDir & "maps.unsupported\" & $lDirlist[$i], 9)
		EndIf
	Next
EndIf
$lFilelist = _FileListToArray($LoudDir & "maps", "*", $FLTA_FILES)
If UBound($lFilelist) > 1 Then
	For $i = 1 To UBound($lFilelist) - 1
		LogInfo("Extra file '" & $lFilelist[$i] & "' found in 'maps' directory, moving to 'maps.unsupported'")
		FileMove($LoudDir & "maps\" & $lFilelist[$i], $LoudDir & "maps.unsupported\" & $lFilelist[$i], 9)
	Next
EndIf
GUICtrlSetState($labelStatusBar, $GUI_HIDE)
LogInfo("mapsCleanup completed")
```

## Mods cleanup

_Func modsCleanup() ;Move mods directory_

```
LogInfo("Running modsCleanup")
	GUICtrlSetData($labelStatusBar, "Cleaning up files in 'mods' directory")
	GUICtrlSetColor($labelStatusBar, $COLOR_WHITE)
	GUICtrlSetState($labelStatusBar, $GUI_SHOW)
	If FileExists($LoudDir & "mods") Then
		LogInfo("Mods folder is not part of Loud configuration, moving to 'mods.unsupported'")
		DirMove($LoudDir & "mods", $LoudDir & "mods.unsupported", 9)
		GUICtrlSetState($labelStatusBar, $GUI_HIDE)
	EndIf
	LogInfo("modsCleanup completed")
```

## GameOptions

_Func GameOptions ;Check 'game.prefs' file for required options and update as needed_

```
	Local $GamePrefs, $GamePrefsNew, $GamePrefsSave, $UpdateCount, $curline, $nextline, $rFileOpen, $wFileOpen
	Local $Fidelity, $ShadowQuality, $OriginalString, $ReplaceString, $TextureLevel, $LevelOfDetail
	LogInfo("Running GameOptions")
	GUICtrlSetData($labelStatusBar, "Checking & updating game options")
	GUICtrlSetColor($labelStatusBar, $COLOR_WHITE)
	GUICtrlSetState($labelStatusBar, $GUI_SHOW)
	$GamePrefs = EnvGet("USERPROFILE") & "\AppData\Local\Gas Powered Games\Supreme Commander Forged Alliance\Game.prefs"
	$GamePrefsNew = $GamePrefs & ".new"
	$GamePrefsSave = $GamePrefs & ".save"
	$UpdateCount = 0
	If FileExists($GamePrefs) = 1 Then
		FileSetAttrib($GamePrefs, "-R-S-H-N-O-T")
		$rFileOpen = FileOpen($GamePrefs, 0)
		$wFileOpen = FileOpen($GamePrefsNew, 2)
		$curline = FileReadLine($rFileOpen)
		$nextline = FileReadLine($rFileOpen)
		While 1
			$Fidelity = StringInStr($curline, "fidelity = ")
			If $Fidelity > 0 And StringMid($curline, $Fidelity + 11, 1) <> "2" And StringMid($curline, $Fidelity + 11, 1) <> "{" Then
				$OriginalString = StringMid($curline, $Fidelity, 12)
				$ReplaceString = StringMid($curline, $Fidelity, 11) & "2"
				$curline = StringReplace($curline, $OriginalString, $ReplaceString)
				$UpdateCount = $UpdateCount + 1
				LogInfo("Video option 'Fidelity' set to 'High'")
			EndIf
			$ShadowQuality = StringInStr($curline, "shadow_quality = ")
			If $ShadowQuality > 0 And StringMid($curline, $ShadowQuality + 17, 1) <> "3" And StringMid($curline, $ShadowQuality + 17, 1) <> "{" Then
				$OriginalString = StringMid($curline, $ShadowQuality, 18)
				$ReplaceString = StringMid($curline, $ShadowQuality, 17) & "3"
				$curline = StringReplace($curline, $OriginalString, $ReplaceString)
				$UpdateCount = $UpdateCount + 1
				LogInfo("Video option 'Shadow Fidelity' set to 'High'")
			EndIf
			$TextureLevel = StringInStr($curline, "texture_level = ")
			If $TextureLevel > 0 And StringMid($curline, $TextureLevel + 16, 1) <> "2" And StringMid($curline, $TextureLevel + 16, 1) <> "{" Then
				$OriginalString = StringMid($curline, $TextureLevel, 17)
				$ReplaceString = StringMid($curline, $TextureLevel, 16) & "2"
				$curline = StringReplace($curline, $OriginalString, $ReplaceString)
				$UpdateCount = $UpdateCount + 1
				LogInfo("Video option 'Texture Detail' set to 'Low'")
			EndIf
			$LevelOfDetail = StringInStr($curline, "level_of_detail = ")
			If $LevelOfDetail > 0 And StringMid($curline, $LevelOfDetail + 18, 1) <> "2" And StringMid($curline, $LevelOfDetail + 18, 1) <> "{" Then
				$OriginalString = StringMid($curline, $LevelOfDetail, 19)
				$ReplaceString = StringMid($curline, $LevelOfDetail, 18) & "2"
				$curline = StringReplace($curline, $OriginalString, $ReplaceString)
				$UpdateCount = $UpdateCount + 1
				LogInfo("Video option 'Level of Detail' set to 'High'")
			EndIf
			FileWriteLine($wFileOpen, $curline)
			$curline = $nextline
			$nextline = FileReadLine($rFileOpen)
			If @error = -1 Then ExitLoop
		WEnd
		FileWriteLine($wFileOpen, $curline)
		FileClose($rFileOpen)
		FileClose($wFileOpen)
	Else
		LogInfo("'Game.Prefs' file does not exist, unable to check/update GameOptions")
		LogInfo("Please run the game and create a profile, then 'Check for Updates' again")
		$ErrorMessageCount = $ErrorMessageCount + 1
	EndIf
	If $UpdateCount > 0 Then
		If FileExists($GamePrefsSave) = 1 Then
			FileSetAttrib($GamePrefsSave, "-R-S-H-N-O-T")
			FileDelete($GamePrefsSave)
		EndIf
		FileCopy($GamePrefs, $GamePrefsSave, 1)
		FileSetAttrib($GamePrefs, "-R-S-H-N-O-T")
		FileDelete($GamePrefs)
		FileMove($GamePrefsNew, $GamePrefs, 1)
	Else
		If FileExists($GamePrefsNew) = 1 Then
			FileSetAttrib($GamePrefsNew, "-R-S-H-N-O-T")
			FileDelete($GamePrefsNew)
		EndIf
	EndIf
	GUICtrlSetState($labelStatusBar, $GUI_HIDE)
	LogInfo("GameOptions completed")
```
