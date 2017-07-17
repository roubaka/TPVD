# TPVD - Readme
*TPVD v 1.0*

*Lucas Martinez - Nicolas Vallotton*  

Projet dans le cadre du cours : Visualisation de données de Isaac Pante
Faculté des Lettres - Université de Lausanne - Juillet 2017
Lien Github : https://github.com/roubaka/TPVD
Version en ligne : https://roubaka.github.io/

Description
------------
TPVD (pour transports Vaud) est une application de cartographie interactive qui permet de visualisation de la desserte des arrêts de transport en commun du canton de Vaud (Suisse).

Chaque arrêt de transport donne d'indication de la population desservie selon différents rayons de 100 à 1000 mètres et affiche cette distance sous forme de zone tampon en temps réel. Il est possible de moduler la taille des rayons selon le type d'arrêt de transport, qu'il soit un arrêt de bus, de métro ou d'une gare de chemin de fer. Une indication rapide de la population sous la forme d'une *heatmap* ou carte de chaleur permet de cibler l'analyse à des zones avec une faible ou une forte densité de population.
Si l'on s'intéresse particulièrement à un arrêt de transport en commun, il est possible d'afficher l'évolution de sa desserte en terme de population selon la distance à l'aide d'un graphique.

Le public cible d'une telle application sont des profesionnels dans le domaine des transports, de l'aménagement du territoire ou des décideurs politiques. Il est probable que ces derniers pourraient avoir besoin de croiser des données sur les transports publics et de la population desservie relative à différentes distances rapidement et de manière simple afin d'apprécier la la desserte globale des arrêts de transport.

Utilisation
------------
L'application TPVD est découpée en deux grandes parties :

Sur la gauche se trouve la carte composée d'un fond de carte "light" *openstreetmap*, d'une *heatmap* représentant la densité de population et des arrêts de transport en commun.
- Le fond de carte permet de se répérer géographiquement sur la carte.
- La *heatmap* donne une indication globale sur la densité de population pour permettre de cibler les zones densément peuplées.
- Les arrrêts de transport divisés en trois catégories permettent d'apprécier leur répartition selon différentes zones tampons circulaires.

Sur la droite, trois *sliders* permettent de faire varier la taille des zones tampons des arrêts de transport de 100 à 1000 mètres de rayon. Il est possible de modifier les zones tampons selon le mode de tansport (train, métro, bus).

Lorsque l'on passe la souris sur un des arrêts de transport, sa taille va augmenter en fonction de la taille de la zone tampon choisie. Une indication sur le nom de l'arrêt et de la population habitant à l'intérieur de la zone prédéfinie va s'afficher.

Si l'arrêt de transport est cliqué, un graphique va apparaître en bas à droite de page et va indiquer l'évolution de la population en fonction de la zone tampon choisie tout en indiquant le nombre d'habitants que l'arrêt de transport dessert.


Ressources
------------
Les données de la population proviennent du "nouveau recensement, population, ménages privés: géodonnées" sont disponibles en ligne sur la site de l'office fédéral de la statisqtiques (OFS) : https://www.bfs.admin.ch/bfs/fr/home/actualites/quoi-de-neuf.assetdetail.1442443.html

Les données concernant les arrêts de transport publics proviennent des géodonnées de l'Office fédéral des transports (OFT) disponibles en ligne :
https://www.bav.admin.ch/bav/fr/home/themes/liste-alphabetique-des-sujets/geoinformation/geodonnees-de-base/arrets-des-transports-publics.html

Les principales étapes accomplies sur les données :
- Suppression des données inutiles
- Sélection par attribut des données concernant le canton de Vaud (trop de données pour la la Suisse entière)
- Optimisation des données sous forme de csv (réduire le temps de chargement)
- Synthétiser l'information de la population (*heatmap*) pour éviter en temps de rafraîchissement trop lent
- Calculer la population dans la zone pour chaque rayon des arrêts de transport (Postgis):
```
CREATE TABLE buffer100 AS SELECT pts_wgs.numero, sum(hect.b14btot) FROM pts_wgs LEFT JOIN hect ON ST_DWithin(pts_wgs.geom::geography, hect.geom::geography, 100) GROUP BY pts_wgs.numero;
```

Licence
------------
Ce programme est un logiciel gratuit.

TPVD a été développé avec les librairies suivantes :
- Leaflet 0.7.7
- Jquerry 3.2.1
- D3 3.5.17
- Bootstrap 3.3.7
- D3SvgOverlay
- Leaflet-heat

Le fond de carte utilisé provient de https://cartodb-basemaps

Certaines libraries et données utilisées pour le développement sont parfois soumis à un copyright par leurs auteurs respectifs.

Copyright © 2017 - l'équipe de développement de TPVD : Lucas Martinez - Nicolas Vallotton

---------
