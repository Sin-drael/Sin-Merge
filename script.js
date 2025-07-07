// script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- NOUVEAU : Éléments de navigation et de section ---
    const navVintedMergeButton = document.getElementById('navVintedMerge');
    const navManhwaFusionButton = document.getElementById('navManhwaFusion');
    const vintedMergerSection = document.getElementById('vintedMergerSection');
    const manhwaMergerSection = document.getElementById('manhwaMergerSection');

    // --- Éléments spécifiques à la section Vinted Merge (existants) ---
    const overlayInput = document.getElementById('overlayInput');
    const selectOverlayButton = document.getElementById('selectOverlayButton');
    const overlayFileName = document.getElementById('overlayFileName');

    const backgroundsInput = document.getElementById('backgroundsInput');
    const selectBackgroundsButton = document.getElementById('selectBackgroundsButton');
    const backgroundsFileNames = document.getElementById('backgroundsFileNames');

    const mergeButton = document.getElementById('mergeButton');
    const overlayPreview = document.getElementById('overlayPreview');
    const backgroundsPreview = document.getElementById('backgroundsPreview');
    const statusMessage = document.getElementById('statusMessage');
    const downloadLinks = document.getElementById('downloadLinks');
    const downloadAllButton = document.getElementById('downloadAllButton');

    // --- Éléments spécifiques à la section Manhwa Fusion ---
    const manhwaImagesInput = document.getElementById('manhwaImagesInput');
    const selectManhwaImagesButton = document.getElementById('selectManhwaImagesButton'); // C'était la ligne manquante !
    const manhwaImagesFileNames = document.getElementById('manhwaImagesFileNames');
    const manhwaImagesPreview = document.getElementById('manhwaImagesPreview');
    const orientationHorizontalButton = document.getElementById('orientationHorizontal');
    const orientationVerticalButton = document.getElementById('orientationVertical');

    // NOUVEAU : Références aux éléments de la barre de chargement SPECIFIQUES à la fusion Manhwa
    const manhwaLoadingBarContainer = document.getElementById('manhwaLoadingBarContainer');
    const manhwaLoadingBar = document.getElementById('manhwaLoadingBar');
    const manhwaZipLoadingMessage = document.getElementById('manhwaZipLoadingMessage');

    // NOUVEAU : Référence au bouton Reset Manhwa
    const resetManhwaButton = document.getElementById('resetManhwaButton');
    const manhwaStatusMessage = document.getElementById('manhwaStatusMessage');
    const manhwaDownloadLinkContainer = document.getElementById('manhwaDownloadLink');

    // DEPLACEMENT DE LA DECLARATION : Assure que mergeManhwaButton est défini dès le début
    const mergeManhwaButton = document.getElementById('mergeManhwaButton');


    let manhwaImageFiles = [];
    let mergeOrientation = 'vertical'; // Par défaut, la fusion est verticale

    // NOUVEAU : Taille maximale des images à fusionner par partie
    const MAX_IMAGES_PER_CHUNK = 50; // Ajustez ce nombre si nécessaire après des tests

    // Références aux éléments de la barre de chargement (pour la section Vinted Merge / Global si Manhwa utilise les mêmes IDs)
    const loadingBarContainer = document.getElementById('loadingBarContainer');
    const loadingBar = document.getElementById('loadingBar');
    const zipLoadingMessage = document.getElementById('zipLoadingMessage');

    let overlayImage = null;
    let backgroundImageFiles = [];
    let mergedImageBlobs = [];

    // --- NOUVEAU : Fonctions de gestion des sections ---

    // Fonction pour masquer toutes les sections
    const hideAllSections = () => {
        vintedMergerSection.classList.add('hidden');
        manhwaMergerSection.classList.add('hidden');
        // Ajoutez ici d'autres sections à masquer si vous en créez
    };

    // Fonction pour afficher une section spécifique
    const showSection = (sectionElement) => {
        hideAllSections();
        sectionElement.classList.remove('hidden');
    };

    // --- NOUVEAU : Initialisation des écouteurs d'événements pour la navigation ---
    navVintedMergeButton.addEventListener('click', () => {
        showSection(vintedMergerSection);
        // Vous pouvez ajouter ici une logique pour réinitialiser l'état de la section Vinted si nécessaire
    });

    navManhwaFusionButton.addEventListener('click', () => {
        showSection(manhwaMergerSection);
        // Vous pouvez ajouter ici une logique pour initialiser la section Manhwa (quand elle sera développée)
    });

    // --- Fin des nouvelles sections de navigation ---


    // Fonction pour mettre à jour l'état du bouton de fusion
    const updateMergeButtonState = () => {
        if (overlayImage && backgroundImageFiles.length > 0) {
            mergeButton.disabled = false;
            mergeButton.classList.remove('bg-green-400', 'cursor-not-allowed');
            mergeButton.classList.add('bg-green-600', 'hover:bg-green-700');
        } else {
            mergeButton.disabled = true;
            mergeButton.classList.remove('bg-green-600', 'hover:bg-green-700');
            mergeButton.classList.add('bg-green-400', 'cursor-not-allowed');
        }
        downloadAllButton.classList.add('hidden');
        // Cacher la barre de chargement et son message si les conditions de fusion changent
        loadingBarContainer.classList.add('hidden');
        zipLoadingMessage.classList.add('hidden');
        loadingBar.style.width = '0%'; // Réinitialise la largeur de la barre
    };

    // --- NOUVEAU : Fonction pour mettre à jour l'état du bouton de fusion Manhwa ---
    const updateManhwaMergeButtonState = () => {
        // Le bouton est activé s'il y a au moins 1 image et qu'une orientation est sélectionnée
        if (manhwaImageFiles.length > 0 && mergeOrientation) {
            mergeManhwaButton.disabled = false;
            mergeManhwaButton.classList.remove('bg-green-400', 'cursor-not-allowed');
            mergeManhwaButton.classList.add('bg-green-600', 'hover:bg-green-700');
        } else {
            mergeManhwaButton.disabled = true;
            mergeManhwaButton.classList.remove('bg-green-600', 'hover:bg-green-700');
            mergeManhwaButton.classList.add('bg-green-400', 'cursor-not-allowed');
        }
        manhwaDownloadLinkContainer.innerHTML = ''; // Cache le lien de téléchargement précédent
        manhwaStatusMessage.textContent = ''; // Efface le message de statut
    };

    // Fonction pour réinitialiser la section Manhwa Fusion
    const resetManhwaImages = () => {
        manhwaImageFiles = []; // Vide le tableau qui contient les fichiers images

        // Réinitialise l'input de fichier (important pour pouvoir re-sélectionner les mêmes fichiers)
        manhwaImagesInput.value = '';

        // Réinitialise le texte affichant les noms des fichiers
        manhwaImagesFileNames.textContent = 'Aucun fichier sélectionné.';

        // Efface tous les aperçus d'images
        manhwaImagesPreview.innerHTML = '<span class="text-gray-400">Aperçu des images</span>';

        // Réinitialise l'orientation visuelle à "Vertical" par défaut (comme au chargement de la page)
        orientationVerticalButton.click();

        // Efface le message de statut et retire toutes les classes de couleur
        manhwaStatusMessage.textContent = '';
        manhwaStatusMessage.classList.remove('text-red-500', 'text-green-600', 'text-blue-600');

        // Efface le lien de téléchargement s'il y en avait un
        manhwaDownloadLinkContainer.innerHTML = '';

        // Cache la barre de chargement et son message si elle était visible
        manhwaLoadingBarContainer.classList.add('hidden'); // Utilisation des IDs Manhwa
        manhwaZipLoadingMessage.classList.add('hidden');    // Utilisation des IDs Manhwa
        manhwaLoadingBar.style.width = '0%';                // Utilisation des IDs Manhwa

        // Met à jour l'état du bouton de fusion (il devrait se désactiver car il n'y a plus d'images)
        updateManhwaMergeButtonState();
    };

    selectOverlayButton.addEventListener('click', () => {
        overlayInput.click();
    });

    overlayInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'image/png') {
            overlayFileName.textContent = file.name;
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    overlayImage = img;
                    overlayPreview.innerHTML = '';
                    overlayPreview.appendChild(img);
                    img.classList.add('max-w-full', 'max-h-full', 'object-contain');
                    updateMergeButtonState();
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        } else {
            overlayImage = null;
            overlayFileName.textContent = 'Aucun fichier sélectionné.';
            overlayPreview.innerHTML = '<span class="text-gray-400">Veuillez sélectionner un fichier PNG valide.</span>';
            updateMergeButtonState();
        }
    });

    selectBackgroundsButton.addEventListener('click', () => {
        backgroundsInput.click();
    });

    backgroundsInput.addEventListener('change', (event) => {
        const newFiles = Array.from(event.target.files).filter(file => file.type.startsWith('image/'));
        const uniqueFiles = new Map();
        backgroundImageFiles.forEach(file => {
            uniqueFiles.set(`${file.name}-${file.size}-${file.lastModified}`, file);
        });
        newFiles.forEach(file => {
            uniqueFiles.set(`${file.name}-${file.size}-${file.lastModified}`, file);
        });
        backgroundImageFiles = Array.from(uniqueFiles.values());

        backgroundsPreview.innerHTML = '';
        if (backgroundImageFiles.length > 0) {
            if (backgroundImageFiles.length === 1) {
                backgroundsFileNames.textContent = backgroundImageFiles[0].name;
            } else {
                backgroundsFileNames.textContent = `${backgroundImageFiles.length} fichiers sélectionnés.`
            }

            backgroundImageFiles.forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.classList.add('w-24', 'h-24', 'object-cover', 'rounded-md', 'shadow-sm');
                    backgroundsPreview.appendChild(img);
                };
                reader.readAsDataURL(file);
            });
        } else {
            backgroundsFileNames.textContent = 'Aucun fichier sélectionné.';
            backgroundsPreview.innerHTML = '<span class="text-gray-400">Aperçu des fonds</span>';
        }
        updateMergeButtonState();
        event.target.value = '';
    });

    mergeButton.addEventListener('click', async () => {
        if (!overlayImage || backgroundImageFiles.length === 0) {
            statusMessage.textContent = "Veuillez sélectionner un calque et au moins une image de fond.";
            statusMessage.classList.add('text-red-500');
            return;
        }

        statusMessage.textContent = "Fusion en cours...";
        statusMessage.classList.remove('text-red-500', 'text-green-600');
        statusMessage.classList.add('text-blue-600');
        downloadLinks.innerHTML = '';
        mergedImageBlobs = [];
        downloadAllButton.classList.add('hidden');
        loadingBarContainer.classList.add('hidden');
        zipLoadingMessage.classList.add('hidden');

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        for (const file of backgroundImageFiles) {
            statusMessage.textContent = `Fusion de ${file.name}...`;

            const img = new Image();
            img.src = URL.createObjectURL(file);

            await new Promise(resolve => {
                img.onload = () => {
                    const imgOriginalWidth = img.naturalWidth;
                    const imgOriginalHeight = img.naturalHeight;
                    const imgAspectRatio = imgOriginalWidth / imgOriginalHeight;

                    const overlayAspectRatio = overlayImage.naturalWidth / overlayImage.naturalHeight;

                    let imgDrawWidth = imgOriginalWidth; // Default to original image size
                    let imgDrawHeight = imgOriginalHeight; // Default to original image size
                    let imgOffsetX = 0;
                    let imgOffsetY = 0;

                    let canvasWidth;
                    let canvasHeight;

                    // Logique conditionnelle basée sur l'orientation de l'IMAGE DE FOND
                    // imgAspectRatio <= 1 signifie que l'image de fond est portrait ou carrée
                    if (imgAspectRatio <= 1) { // L'image de fond est portrait (hauteur >= largeur) ou carrée
                        const MAX_FINAL_HEIGHT = 1020; // Hauteur maximale souhaitée pour l'image fusionnée finale

                        // 1. Déterminer les dimensions de l'image de fond redimensionnée pour qu'elle ne dépasse pas MAX_FINAL_HEIGHT en hauteur
                        // et conserve ses proportions, sans dépasser sa taille originale si elle est plus petite.
                        let scale = 1;
                        if (imgOriginalHeight > MAX_FINAL_HEIGHT) {
                            scale = MAX_FINAL_HEIGHT / imgOriginalHeight;
                        }
                        imgDrawWidth = imgOriginalWidth * scale;
                        imgDrawHeight = imgOriginalHeight * scale;

                        // 2. Le canevas prend les dimensions exactes de l'image de fond redimensionnée.
                        // Cela garantit qu'il n'y a PAS de bandes blanches autour de l'image de fond.
                        canvasWidth = imgDrawWidth;
                        canvasHeight = imgDrawHeight;

                        // 3. L'image de fond est dessinée à l'origine du canevas, car elle le remplit.
                        imgOffsetX = 0;
                        imgOffsetY = 0;

                    } else { // L'image de fond est paysage (largeur > hauteur)
                        const MAX_FINAL_HEIGHT = 1020; // Hauteur maximale souhaitée pour l'image fusionnée finale

                        // La hauteur finale du canvas DOIT être MAX_FINAL_HEIGHT
                        canvasHeight = MAX_FINAL_HEIGHT;
                        // La largeur du canvas est déterminée par cette hauteur et le ratio du CALQUE (overlay)
                        canvasWidth = canvasHeight * overlayAspectRatio;

                        // Calcul des dimensions de l'image de fond pour qu'elle soit CONTENUE dans le nouveau canvas
                        // et conserve ses propres proportions.
                        let scale = Math.min(canvasWidth / imgOriginalWidth, canvasHeight / imgOriginalHeight);
                        imgDrawWidth = imgOriginalWidth * scale;
                        imgDrawHeight = imgOriginalHeight * scale;

                        // Centrage de l'image de fond dans le canevas
                        // Il y aura des bandes blanches si l'image de fond est plus "large" que le canevas final
                        imgOffsetX = (canvasWidth - imgDrawWidth) / 2;
                        imgOffsetY = (canvasHeight - imgDrawHeight) / 2;
                    }

                    // Appliquer les dimensions calculées au canvas
                    canvas.width = canvasWidth;
                    canvas.height = canvasHeight;

                    // Remplir le nouveau canvas avec du blanc avant de dessiner quoi que ce soit
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    // Dessiner l'image de fond avec les dimensions potentiellement ajustées (imgDrawWidth/Height)
                    ctx.drawImage(img, imgOffsetX, imgOffsetY, imgDrawWidth, imgDrawHeight);

                    // Dessiner le calque (overlay) par-dessus, redimensionné pour remplir le nouveau canvas
                    ctx.drawImage(overlayImage, 0, 0, canvas.width, canvas.height);

                    canvas.toBlob((blob) => {
                        mergedImageBlobs.push({ blob: blob, name: `${file.name.substring(0, file.name.lastIndexOf('.')) || file.name}-sinmerge.png` });

                        const url = URL.createObjectURL(blob);
                        const downloadLink = document.createElement('a');
                        downloadLink.href = url;

                        const originalFileName = file.name;
                        const lastDotIndex = originalFileName.lastIndexOf('.');
                        let baseName;

                        if (lastDotIndex > 0) {
                            baseName = originalFileName.substring(0, lastDotIndex);
                        } else {
                            baseName = originalFileName;
                        }

                        downloadLink.download = `${baseName}-sinmerge.png`;
                        downloadLink.textContent = `Télécharger ${downloadLink.download}`;
                        downloadLink.classList.add('bg-blue-500', 'hover:bg-blue-600', 'text-white', 'py-2', 'px-4', 'rounded-md', 'block', 'text-center', 'transition-colors', 'duration-200');
                        downloadLinks.appendChild(downloadLink);
                        resolve();
                    }, 'image/png');
                };
                img.onerror = () => {
                    console.error("Erreur de chargement de l'image de fond:", file.name);
                    statusMessage.textContent = `Erreur de chargement de l'image de fond : ${file.name}.`;
                    statusMessage.classList.add('text-red-500');
                    resolve(); // Important pour que la boucle puisse continuer même en cas d'erreur
                };
            });
            URL.revokeObjectURL(img.src);
        }

        statusMessage.textContent = "Fusion terminée !";
        statusMessage.classList.remove('text-blue-600', 'text-red-500');
        statusMessage.classList.add('text-green-600');

        if (mergedImageBlobs.length > 0) {
            downloadAllButton.classList.remove('hidden');
        }
    });

    // Écouteur pour le bouton de sélection des images Manhwa
    selectManhwaImagesButton.addEventListener('click', () => {
        manhwaImagesInput.click();
    });

    manhwaImagesInput.addEventListener('change', (event) => {
    const newFiles = Array.from(event.target.files).filter(file => file.type.startsWith('image/'));
    const uniqueFiles = new Map();

    // Conserver les fichiers existants et ajouter les nouveaux fichiers uniques
    manhwaImageFiles.forEach(file => {
        uniqueFiles.set(`${file.name}-${file.size}-${file.lastModified}`, file);
    });
    newFiles.forEach(file => {
        uniqueFiles.set(`${file.name}-${file.size}-${file.lastModified}`, file);
    });

    manhwaImageFiles = Array.from(uniqueFiles.values());

    // --- NOUVEAU : Tri des fichiers par nom avant l'affichage ---
    manhwaImageFiles.sort((a, b) => a.name.localeCompare(b.name));

    manhwaImagesPreview.innerHTML = ''; // Nettoie l'aperçu existant

    if (manhwaImageFiles.length > 0) {
        if (manhwaImageFiles.length === 1) {
            manhwaImagesFileNames.textContent = manhwaImageFiles[0].name;
        } else {
            manhwaImagesFileNames.textContent = `${manhwaImageFiles.length} fichiers sélectionnés.`;
        }

        // --- NOUVEAU : Création de la liste d'images ---
        const ul = document.createElement('ul');
        ul.classList.add('space-y-2'); // Espacement entre les éléments de la liste

        manhwaImageFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const li = document.createElement('li');
                li.classList.add('flex', 'items-center', 'space-x-4', 'p-2', 'bg-gray-50', 'rounded-md', 'shadow-sm', 'hover:bg-gray-100', 'transition-colors', 'duration-150');

                const img = document.createElement('img');
                img.src = e.target.result;
                img.classList.add('w-16', 'h-16', 'object-cover', 'rounded-md', 'flex-shrink-0'); // Miniature plus petite
                img.title = file.name; // Garde le tooltip au survol

                const fileNameSpan = document.createElement('span');
                fileNameSpan.textContent = file.name;
                fileNameSpan.classList.add('text-gray-800', 'font-medium', 'break-all'); // Pour gérer les noms longs

                li.appendChild(img);
                li.appendChild(fileNameSpan);
                ul.appendChild(li);

                // Une fois toutes les images chargées et les LI ajoutés, ajoute le UL au preview
                // Cela évite de recalculer le DOM trop souvent
                if (ul.children.length === manhwaImageFiles.length) {
                    manhwaImagesPreview.appendChild(ul);
                }
            };
            reader.readAsDataURL(file);
        });
    } else {
        manhwaImagesFileNames.textContent = 'Aucun fichier sélectionné.';
        manhwaImagesPreview.innerHTML = '<span class="text-gray-400">Aperçu des images</span>';
    }
    updateManhwaMergeButtonState();
    event.target.value = ''; // Réinitialise l'input file pour permettre la re-sélection des mêmes fichiers
});

    // Gestion des boutons d'orientation
    orientationVerticalButton.addEventListener('click', () => {
        mergeOrientation = 'vertical';
        orientationVerticalButton.classList.remove('bg-gray-200', 'text-gray-700');
        orientationVerticalButton.classList.add('bg-blue-600', 'text-white');
        orientationHorizontalButton.classList.remove('bg-blue-600', 'text-white');
        orientationHorizontalButton.classList.add('bg-gray-200', 'text-gray-700');
        updateManhwaMergeButtonState();
    });

    orientationHorizontalButton.addEventListener('click', () => {
        mergeOrientation = 'horizontal';
        orientationHorizontalButton.classList.remove('bg-gray-200', 'text-gray-700');
        orientationHorizontalButton.classList.add('bg-blue-600', 'text-white');
        orientationVerticalButton.classList.remove('bg-blue-600', 'text-white');
        orientationVerticalButton.classList.add('bg-gray-200', 'text-gray-700');
        updateManhwaMergeButtonState();
    });

    resetManhwaButton.addEventListener('click', resetManhwaImages);

    // Gérer le clic sur le bouton "Télécharger tout (Zip)"
    downloadAllButton.addEventListener('click', async () => {
        if (mergedImageBlobs.length === 0) {
            statusMessage.textContent = "Aucune image fusionnée à télécharger.";
            statusMessage.classList.add('text-red-500');
            return;
        }

        statusMessage.textContent = "Préparation du fichier ZIP..."; // Message initial
        statusMessage.classList.remove('text-red-500', 'text-green-600');
        statusMessage.classList.add('text-blue-600');

        // Afficher la barre de chargement et le message
        loadingBarContainer.classList.remove('hidden');
        zipLoadingMessage.classList.remove('hidden');
        loadingBar.style.width = '0%'; // Assurez-vous qu'elle commence à 0%

        const zip = new JSZip();

        for (const item of mergedImageBlobs) {
            zip.file(item.name, item.blob);
        }

        try {
            // Utiliser la fonction onUpdate pour la barre de chargement
            const content = await zip.generateAsync({ type: "blob" }, function updateCallback(metadata) {
                const percent = metadata.percent.toFixed(2); // Pourcentage avec 2 décimales
                loadingBar.style.width = `${percent}%`; // Met à jour la largeur de la barre
                zipLoadingMessage.textContent = `Génération du fichier ZIP : ${percent}%`; // Met à jour le message
            });

            const zipFileName = `images_fusionnees_${Date.now()}.zip`;

            // Crée un lien de téléchargement temporaire (non ajouté au DOM)
            const tempDownloadLink = document.createElement('a');
            tempDownloadLink.href = URL.createObjectURL(content);
            tempDownloadLink.download = zipFileName; // Nom du fichier ZIP

            // Simule un clic sur le lien pour déclencher le téléchargement
            tempDownloadLink.click();

            // Libère la mémoire en révoquant l'URL de l'objet Blob après le téléchargement
            URL.revokeObjectURL(tempDownloadLink.href);

            statusMessage.textContent = "Fichier ZIP téléchargé !"; // Nouveau message de statut
            statusMessage.classList.remove('text-blue-600');
            statusMessage.classList.add('text-green-600');

        } catch (error) {
            console.error("Erreur lors de la création du ZIP :", error);
            statusMessage.textContent = "Erreur lors de la création du fichier ZIP.";
            statusMessage.classList.remove('text-blue-600');
            statusMessage.classList.add('text-red-500');
        } finally {
            // Cacher la barre de chargement et le message quoi qu'il arrive
            loadingBarContainer.classList.add('hidden');
            zipLoadingMessage.classList.add('hidden');
            loadingBar.style.width = '0%'; // Réinitialise la barre pour la prochaine fois
        }
    });

    // --- NOUVEAU : Fonction de fusion des images Manhwa (avec gestion des chunks et ZIP) ---
    async function mergeManhwaImages() {
    if (manhwaImageFiles.length === 0) {
        manhwaStatusMessage.textContent = "Veuillez sélectionner au moins une image.";
        manhwaStatusMessage.classList.add('text-red-500');
        return;
    }

    manhwaStatusMessage.textContent = "Préparation de la fusion...";
    manhwaStatusMessage.classList.remove('text-red-500', 'text-green-600');
    manhwaStatusMessage.classList.add('text-blue-600');
    manhwaDownloadLinkContainer.innerHTML = ''; // Efface tout lien de téléchargement précédent

    // --- Afficher la barre de chargement ZIP et le message (Utilisation des IDs Manhwa) ---
    manhwaLoadingBarContainer.classList.remove('hidden');
    manhwaZipLoadingMessage.classList.remove('hidden');
    manhwaZipLoadingMessage.textContent = "Chargement des images...";
    manhwaLoadingBar.style.width = '0%';

    const allLoadedImages = [];

    // --- Créer une liste de promesses pour charger toutes les images ---
    const imageLoadPromises = manhwaImageFiles.map(file => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                img._objectURL = img.src;
                resolve(img);
            };
            img.onerror = () => {
                console.error("Erreur de chargement de l'image:", file.name);
                URL.revokeObjectURL(img.src);
                resolve(null);
            };
            img.src = URL.createObjectURL(file);
        });
    });

    // Attendre que toutes les promesses de chargement soient résolues (succès ou échec)
    const loadedResults = await Promise.all(imageLoadPromises);

    let loadedCount = 0;
    for (const img of loadedResults) {
        if (img && img.naturalWidth > 0 && img.naturalHeight > 0) {
            allLoadedImages.push(img);
        }
        loadedCount++;
        const percent = (loadedCount / manhwaImageFiles.length) * 100;
        manhwaLoadingBar.style.width = `${percent.toFixed(2)}%`;
        manhwaZipLoadingMessage.textContent = `Chargement des images : ${loadedCount}/${manhwaImageFiles.length} (${percent.toFixed(0)}%)`;
    }

    if (allLoadedImages.length === 0) {
        manhwaStatusMessage.textContent = "Aucune image valide n'a pu être chargée pour la fusion.";
        manhwaStatusMessage.classList.add('text-red-500');
        manhwaLoadingBarContainer.classList.add('hidden');
        manhwaZipLoadingMessage.classList.add('hidden');
        return;
    }

    manhwaStatusMessage.textContent = "Démarrage de la fusion...";
    manhwaLoadingBar.style.width = '0%';
    manhwaZipLoadingMessage.textContent = "Fusion des parties...";

    // Déclaration unique de ces variables au bon endroit, AVANT la boucle de traitement des chunks.
    const mergedManhwaBlobs = [];
    let currentImageIndex = 0;
    let partNumber = 1;

    // Assurez-vous que cette constante est définie quelque part dans votre script,
    // idéalement en haut de votre fichier JS ou dans un bloc de constantes globales.
    // Par exemple : const MAX_IMAGES_PER_CHUNK = 25; // Si elle n'est pas déjà définie ailleurs.
    let currentChunkSize = MAX_IMAGES_PER_CHUNK; // Cette ligne est correcte, elle utilisera la nouvelle valeur.

    while (currentImageIndex < allLoadedImages.length) {
        let success = false;
        // Boucle interne pour réessayer avec des tailles de chunk réduites
        while (!success && currentChunkSize >= 1) {
            const chunkImages = allLoadedImages.slice(currentImageIndex, currentImageIndex + currentChunkSize);

            if (chunkImages.length === 0) {
                success = true;
                break;
            }

            // Recréer le canvas et le contexte pour chaque tentative de chunk.
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            let totalWidth = 0;
            let totalHeight = 0;

            if (mergeOrientation === 'vertical') {
                totalWidth = Math.max(...chunkImages.map(img => img.naturalWidth));
                totalHeight = chunkImages.reduce((sum, img) => sum + img.naturalHeight, 0);
            } else { // horizontal
                totalWidth = chunkImages.reduce((sum, img) => sum + img.naturalWidth, 0);
                totalHeight = Math.max(...chunkImages.map(img => img.naturalHeight));
            }

            canvas.width = totalWidth;
            canvas.height = totalHeight;

            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            let currentX = 0;
            let currentY = 0;

            chunkImages.forEach(img => {
                if (mergeOrientation === 'vertical') {
                    const offsetX = (totalWidth - img.naturalWidth) / 2;
                    ctx.drawImage(img, offsetX, currentY);
                    currentY += img.naturalHeight;
                } else { // horizontal
                    const offsetY = (totalHeight - img.naturalHeight) / 2;
                    ctx.drawImage(img, currentX, offsetY);
                    currentX += img.naturalWidth;
                }
            });

            try {
                const blob = await new Promise(resolve => {
                    setTimeout(() => {
                        // Modification : Export en JPEG avec 70% de qualité
                        canvas.toBlob((b) => {
                            resolve(b);
                        }, 'image/jpeg', 0.7);
                    }, 0);
                });

                if (blob && blob.size > 0) {
                    // Modification : Changer l'extension du fichier généré de .png à .jpg
                    const partFileName = `${String(partNumber).padStart(2, '0')}.jpg`;
                    mergedManhwaBlobs.push({ blob: blob, name: partFileName });
                    currentImageIndex += chunkImages.length;
                    partNumber++;
                    success = true;
                    currentChunkSize = MAX_IMAGES_PER_CHUNK;
                } else {
                    throw new Error("Blob generation failed or resulted in an empty image.");
                }

            } catch (error) {
                console.warn(`Tentative de fusion de ${chunkImages.length} images échouée pour la partie ${partNumber}. Réduction du chunk. Erreur:`, error.message);
                currentChunkSize = Math.floor(currentChunkSize / 2) || 1;
                manhwaStatusMessage.textContent = `Taille de fusion réduite à ${currentChunkSize}. Réessai...`;
            }

            if (!success && currentChunkSize < 1) {
                manhwaStatusMessage.textContent = `Erreur irrécupérable : impossible de fusionner les images restantes, même individuellement.`;
                manhwaStatusMessage.classList.add('text-red-500');
                manhwaLoadingBarContainer.classList.add('hidden');
                manhwaZipLoadingMessage.classList.add('hidden');
                allLoadedImages.forEach(img => URL.revokeObjectURL(img._objectURL));
                return;
            }
        }
        const fusionProgress = (currentImageIndex / allLoadedImages.length) * 100;
        manhwaLoadingBar.style.width = `${fusionProgress.toFixed(2)}%`;
        manhwaZipLoadingMessage.textContent = `Fusion des parties : ${currentImageIndex}/${allLoadedImages.length} images traitées (${fusionProgress.toFixed(0)}%)`;
    }

    // --- Reste du code pour gérer le téléchargement du lien ou du ZIP ---
    // Ces lignes étaient correctement placées à la fin.
    // --- MODIFICATION MAJEURE ICI : Révoquer toutes les URL d'objet APRES que toutes les fusions sont terminées ---
    allLoadedImages.forEach(img => {
        if (img._objectURL) { // Vérifie si l'URL a été stockée
            URL.revokeObjectURL(img._objectURL);
        }
    });

    if (mergedManhwaBlobs.length === 1) {
        const url = URL.createObjectURL(mergedManhwaBlobs[0].blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = mergedManhwaBlobs[0].name;
        downloadLink.textContent = `Télécharger l'image fusionnée (${mergedManhwaBlobs[0].name})`;
        downloadLink.classList.add('bg-purple-600', 'hover:bg-purple-700', 'text-white', 'font-bold', 'py-3', 'px-8', 'rounded-full', 'text-lg', 'shadow-lg', 'transition-colors', 'duration-200', 'block', 'text-center', 'mx-auto');

        manhwaDownloadLinkContainer.appendChild(downloadLink);
        downloadLink.addEventListener('click', () => {
            setTimeout(() => URL.revokeObjectURL(url), 100);
        });

        manhwaStatusMessage.textContent = "Fusion terminée !";
        manhwaStatusMessage.classList.remove('text-blue-600', 'text-red-500');
        manhwaStatusMessage.classList.add('text-green-600');

    } else if (mergedManhwaBlobs.length > 1) {
        manhwaStatusMessage.textContent = "Préparation du fichier ZIP des parties fusionnées...";
        manhwaZipLoadingMessage.textContent = "Génération du fichier ZIP...";
        manhwaLoadingBar.style.width = '0%';

        const zip = new JSZip();
        mergedManhwaBlobs.forEach(item => {
            zip.file(item.name, item.blob);
        });

        try {
            const content = await zip.generateAsync({ type: "blob" }, function updateCallback(metadata) {
                const percent = metadata.percent.toFixed(2);
                manhwaLoadingBar.style.width = `${percent}%`;
                manhwaZipLoadingMessage.textContent = `Génération du fichier ZIP : ${percent}%`;
            });

            const zipFileName = `manhwa_fusionnees_${Date.now()}.zip`;
            const url = URL.createObjectURL(content);

            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = zipFileName;
            downloadLink.textContent = `Télécharger toutes les parties (${mergedManhwaBlobs.length} fichiers)`;
            downloadLink.classList.add('bg-purple-600', 'hover:bg-purple-700', 'text-white', 'font-bold', 'py-3', 'px-8', 'rounded-full', 'text-lg', 'shadow-lg', 'transition-colors', 'duration-200', 'block', 'text-center', 'mx-auto');

            manhwaDownloadLinkContainer.appendChild(downloadLink);

            downloadLink.addEventListener('click', () => {
                setTimeout(() => URL.revokeObjectURL(url), 100);
            });

            manhwaStatusMessage.textContent = "Fichier ZIP téléchargé !";
            manhwaStatusMessage.classList.remove('text-blue-600');
            manhwaStatusMessage.classList.add('text-green-600');

        } catch (error) {
            console.error("Erreur lors de la création du ZIP :", error);
            manhwaStatusMessage.textContent = "Erreur lors de la création du fichier ZIP.";
            manhwaStatusMessage.classList.add('text-red-500');
        }
    } else {
        manhwaStatusMessage.textContent = "Aucune partie fusionnée générée.";
        manhwaStatusMessage.classList.add('text-red-500');
    }

    manhwaLoadingBarContainer.classList.add('hidden');
    manhwaZipLoadingMessage.classList.add('hidden');
    manhwaLoadingBar.style.width = '0%';
}
    // Activation de l'écouteur du bouton Manhwa
    mergeManhwaButton.addEventListener('click', mergeManhwaImages);

    // Initialisation: affiche la section "Merge Vinted" par défaut au chargement
    showSection(vintedMergerSection);
    updateMergeButtonState(); // S'assure que l'état initial du bouton Vinted est correct

    // Initialisation de l'état des boutons Manhwa au chargement
    // Simule un clic sur le bouton Vertical pour définir l'état initial visuel et la variable
    orientationVerticalButton.click();
    updateManhwaMergeButtonState(); // S'assure que le bouton de fusion Manhwa est désactivé si aucune image n'est sélectionnée
});
