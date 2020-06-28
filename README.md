# LOUD Client

![Client](client.PNG?raw=true)

## General

Welcome to the repository of the LOUD Client, which is the shiny new client for the [LOUD Project mod](https://www.moddb.com/mods/loud-ai-supreme-commander-forged-alliance).

Still not sure what the LOUD Project is? Find out [here](https://www.moddb.com/mods/loud-ai-supreme-commander-forged-alliance/features/what-is-the-loud-ai-project)

In the releases tab you can find the latest public release of the client.

## Table Of Contents

1. [Installation](#installation)
2. [Features](#features)
3. [Known Issues](#known-issues)

## Installation

1. Navigate to the latest releases in the [releases tab](https://github.com/rajderks/loud-electron/releases);
2. Download either the .exe file or the .deb file, depending on your platform;
3. Place the **LOUD_Client** into the root of the Supreme Commander: Forged Alliance folder \*(i.e. C:\SteamLibrary\steamapps\common\Supreme Commander Forged Alliance)\_
4. Make sure you have started Supreme Commander at least once in order to create a profile;
5. Start **LOUD_Client** and press the update button; (this can take up to 45 minutes on the first tun, it needs to pull in a lot of (big) files);
6. Once the indicator under the Update button becomes green and says "Up to date" you are ready to run the LOUD Project mod using the run game button!

## Features

These are the primary features of the client:

- Using the update button, you can update your local mod installation with the latest version
- Using the run button button, you can run Supreme Commander with the LOUD Project Mod active
- Several buttons to locate all the logging that goes on (usefull for bug reports)
- A [Discord invitation](https://discord.gg/8CsTDq2), you're absolutely welcome to join the community over there!
- Toggle options for loading in Maps/Mods from the C:\Users\%username%\My Games\Gas Powered Games\Maps / Mods folders (do not put any additional content in the LOUD folder, it will be removed!)
- A handy popup whenever an update to the client is available

## Known issues

### Shortcuts

If you have the old client installed (_SCFA_Updater.exe_) and used it to creat shortcuts on your desktop, these will still work.
However, the LOUD Updater shortcut will point to the old client. Either create new shortcuts to the LOUD_Client.{exe|deb} or adjust the existing shortcuts to target LOUD_Client.exe instead

#### Game Shortcut

If you decide to create new shortcuts or have not used the old client to do this for you, you can create a shortcut to `<root supcome dir>/bin/SupremeCommander.exe`, drag this to your desktop and add some arguments to target. `/log "..\LOUD\bin\Loud.log" /init "..\LOUD\bin\LoudDataPath.lua`

The result should look like so:

`"C:\SteamLibrary\steamapps\common\Supreme Commander Forged Alliance\bin\SupremeCommander.exe" /log "..\LOUD\bin\Loud.log" /init "..\LOUD\bin\LoudDataPath.lua"`

![createshortcut](createshortcut.PNG?raw=true)
![shortcut](shortcut.PNG?raw=true)

#### Linux

Although the **LOUD_Client** is primarily to be used on the Windows OS, Linux should be able to update the mod using this client.
Feel free to hang in our Discord of it doesn't, as there is no way for myself to test this right now.

## Contributing

If you want to contribute to this Client or the Mod itself, feel free to post a message in our Discord.
