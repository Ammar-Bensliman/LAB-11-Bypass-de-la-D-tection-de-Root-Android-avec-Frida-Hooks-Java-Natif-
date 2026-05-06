# LAB-11-Bypass-de-la-D-tection-de-Root-Android-avec-Frida-Hooks-Java-Natif-
<img width="1040" height="64" alt="image" src="https://github.com/user-attachments/assets/83cc4736-6f03-42f7-a415-5eaf4adbd3d3" />
<img width="957" height="623" alt="image" src="https://github.com/user-attachments/assets/f1d84b5e-422d-4695-bad5-a61520c34d55" />
<img width="1452" height="473" alt="image" src="https://github.com/user-attachments/assets/02322eff-6fe0-43ab-850e-b4dc26e86b7d" />
<img width="1919" height="1032" alt="image" src="https://github.com/user-attachments/assets/bb5029bd-7b59-4ddc-abde-e48d6cb88770" />

# Compte-Rendu de TP : Contournement de la Détection de Root avec Frida

**Étudiant :** Ammar Bensliman
**Établissement :** École Marocaine des Sciences de l'Ingénieur (EMSI)
**Module :** Sécurité Mobile / Pentesting
**Sujet :** Instrumentation dynamique et contournement des sécurités locales Android

---

## 1. Objectif du Lab
L'objectif de ce travail pratique est de comprendre comment les applications Android détectent le "root" (droits administrateur) et de mettre en pratique des techniques d'instrumentation dynamique pour contourner ces vérifications. L'outil principal utilisé est **Frida**, qui permet d'injecter du code JavaScript directement dans la mémoire d'une application en cours d'exécution pour en modifier le comportement.

## 2. Environnement de Travail
*   **Machine hôte :** Windows (avec Python et `frida-tools` installés).
*   **Appareil cible :** Émulateur Android (via ADB).
*   **Outils utilisés :** Frida, Frida-server, ADB (Android Debug Bridge), Invite de commandes (cmd).

## 3. Méthodologie et Réalisation

### Étape 1 : Mise en place de l'environnement (Frida-Server)
Pour que la machine hôte puisse interagir avec l'application sur le téléphone, un serveur a été déployé sur l'émulateur. 
*   Transfert du fichier `frida-server` vers le dossier `/data/local/tmp/` via ADB.
*   Attribution des droits d'exécution (`chmod 755`).
*   Lancement du serveur avec les privilèges root.

### Étape 2 : Création des scripts d'interception (Hooks)
Afin de neutraliser les mécanismes de sécurité, trois scripts distincts ont été développés sur la machine hôte :

1.  **`bypass_root.js` (Couche Java) :** Ce script cible les méthodes de haut niveau de l'API Android. Il intercepte les fonctions telles que `File.exists()` ou `Runtime.exec()` et les force à renvoyer une valeur "fausse" si l'application recherche des fichiers suspects comme `/system/bin/su` ou `busybox`.
2.  **`bypass_native.js` (Couche C/C++) :** Certaines applications contournent Java et utilisent des bibliothèques natives (NDK). Ce script s'attache directement aux fonctions du système d'exploitation (`libc.so`) telles que `open()`, `access()` et `stat()`, et bloque l'accès aux chemins critiques en simulant une erreur.
3.  **`anti_frida.js` (Couche Anti-Analyse) :** Un script préventif pour empêcher l'application de scanner les ports ouverts (comme les ports 27042/27043 par défaut) afin de détecter la présence de Frida lui-même.

### Étape 3 : Exécution de l'attaque (Spawning)
L'injection des scripts a été réalisée au démarrage même de l'application (méthode de *spawn*) pour s'assurer qu'aucune vérification ne puisse se faire avant la mise en place de nos défenses.

**Commande utilisée :**
```cmd
frida -U -f com.example.nom_de_l_application -l bypass_root.js -l bypass_native.js -l anti_frida.js
