# TPVD - Readme
*TPVD v 1.0*

*Lucas Martinez - Nicolas Vallotton*  

Projet dans le cadre du cours : Visualisation de données de Isaac Pante
Faculté des Lettres - Université de Lausanne - Juillet 2017
Lien Github : https://github.com/roubaka/TPVD
Version en ligne : https://roubaka.github.io/

Description
------------
TPVD est une application de cartographie interactive qui permet de visualisation de la desserte des arrêtes de transport du canton de Vaud (Suisse).

Sur la gauche se trouve la carte composée d'un fond de carte "light" *openstreetmap*, d'une *heatmap* représentant la densité de population et des arrêts de transport en commun.
- Le fond de carte permet de se répérer géographiquement sur la carte.
- La *heatmap* donne une indication globale sur la densité de population pour permettre de cibler les zones densément peuplées.
- Les arrrêts de transport divisés en trois catégories permettent d'apprécier leur répartition selon différentes zones tampons circulaires.

Sur la droite, trois *sliders* permettent de faire varier la taille des zones tampons des arrêts de transport de 100 à 1000 mètres de rayon. Il est possible de modifier les zones tampons selon le mode de tansport (train, métro, bus).

Lorsque l'on passe la souris sur un des arrêts de transport, sa taille va augmenter en fonction de la taille de la zone tampon choisie. Une indication sur le nom de l'arrêt et de la population vivant à l'intérieur de la zone prédéfinie va s'afficher.

Si l'arrêt de transport est cliqué, un graphique va apparaître en bas à droite de page et va indiquer l'évolution de la population en fonction de la zone tampon choisie tout en indiquant le nombre d'habitants que l'arrêt de transport dessert.

Le public cible d'une telle application sont potentiellement des profesionnels dans le domaine des transports ou des décideurs qui ont besoin de croiser des données sur les transports publics et de la population desservie relative à différentes distances rapidement et de manière simple.

Interface
------------
Ci dessous les différentes étapes d'une utilisation de base de TPVD :


Ressources
------------
shape de pop
shape des arrets de transport
étapes des manipulations des données
script postgis

Licence
------------
Ce programme est un logiciel gratuit.

TPVD a été développé avec 


Certaines libraries utilisés pour le développement sont parfois soumis à un copyright par leurs auteurs respectifs.

Copyright © 2017 - l'équipe de développement de TPVD : Lucas Martinez - Nicolas Vallotton





---------
