; Exercise the shipped installation marker and directory transaction without registry writes.
Unicode true
RequestExecutionLevel user
SilentInstall silent
Name "Katcat installation marker smoke"
OutFile "${OUTPUT_FILE}"
!include LogicLib.nsh

!macro installApplicationFiles
  File /oname=payload.txt "${PAYLOAD_FILE}"
!macroend
!include "..\..\scripts\installer-directories.nsh"
!include "..\..\build\installer-installation.nsh"

Section
  InitPluginsDir
  StrCpy $INSTDIR "${TARGET_DIR}"
  !insertmacro dshStageApplication
  Call dshPromoteDirectories
  IfErrors failed
  !ifdef CANCELLED
    Call dshCleanupDirectories
    SetErrorLevel 1602
    Quit
  !endif
  !ifdef FAIL_MARKER
    CreateDirectory "$INSTDIR\katcat-installation-id.txt"
  !endif
  !insertmacro katcatWriteInstallationId
  IfErrors failed
  !insertmacro dshFinishDirectories
  SetErrorLevel 0
  Quit
  failed:
  Call dshCleanupDirectories
  SetErrorLevel 2
  Quit
SectionEnd
