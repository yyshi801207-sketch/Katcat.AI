!ifndef KATCAT_INSTALLER_INSTALLATION_INCLUDED
!define KATCAT_INSTALLER_INSTALLATION_INCLUDED

; Each committed installation has its own id, including same-build reinstalls.
!macro katcatWriteInstallationId
  Push $0
  Push $1
  Push $2
  ClearErrors
  System::Call 'ole32::CoCreateGuid(g .r0) i .r1'
  ${If} $1 == 0
    FileOpen $2 "$INSTDIR\katcat-installation-id.txt" w
    ${If} ${Errors}
      StrCpy $1 1
    ${Else}
      FileWrite $2 "$0$\r$\n"
      ${If} ${Errors}
        StrCpy $1 1
      ${EndIf}
      FileClose $2
      ${If} ${Errors}
        StrCpy $1 1
      ${EndIf}
    ${EndIf}
  ${EndIf}
  ClearErrors
  ${If} $1 != 0
    SetErrors
  ${EndIf}
  Pop $2
  Pop $1
  Pop $0
!macroend

!endif
