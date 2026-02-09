@echo off
title RALPH - AMBITIA Builder
echo ==========================================
echo   Lancement de RALPH pour AMBITIA
echo   Ne ferme pas cette fenetre !
echo ==========================================
echo.

start /wait "" "C:\Program Files\Git\bin\bash.exe" --login -c "cd '/c/Users/FD/Desktop/RecruitForge' && chmod +x ralph.sh && ./ralph.sh 50; echo 'Ralph termine. Appuie sur une touche.'; read"
