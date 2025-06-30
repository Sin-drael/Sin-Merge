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

    // --- NOUVEAU : Éléments spécifiques à la section Manhwa Fusion ---
    const manhwaImagesInput = document.getElementById('manhwaImagesInput');
    const selectManhwaImagesButton = document.getElementById('selectManhwaImagesButton');
    const manhwaImagesFileNames = document.getElementById('manhwaImagesFileNames');
    const manhwaImagesPreview = document.getElementById('manhwaImagesPreview');
    const orientationHorizontalButton = document.getElementById('orientationHorizontal');
    const orientationVerticalButton = document.getElementById('orientationVertical');
    const mergeManhwaButton = document.getElementById('mergeManhwaButton');
    const manhwaStatusMessage = document.getElementById('manhwaStatusMessage');
    const manhwaDownloadLinkContainer = document.getElementById('manhwaDownloadLink');

    let manhwaImageFiles = [];
    let mergeOrientation = 'vertical'; // Par défaut, la fusion est verticale

    // NOUVEAU : Taille maximale des images à fusionner par partie
    const MAX_IMAGES_PER_CHUNK = 50; // Ajustez ce nombre si nécessaire après des tests

    // Références aux éléments de la barre de chargement
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
                backgroundsFileNames.textContent = `${backgroundImageFiles.length} fichiers sélectionnés.`;
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
        downloadAllButton.classList.add('hidden'); // Assurez-vous qu'il est caché au début de la fusion
        loadingBarContainer.classList.add('hidden'); // Cacher la barre avant la fusion principale
        zipLoadingMessage.classList.add('hidden'); // Cacher le message de la barre

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

                    // NOUVELLE LOGIQUE POUR DÉTERMINER LES DIMENSIONS DU CANVAS ET LA ROTATION
                    let currentCanvasWidth = overlayImage.naturalWidth;
                    let currentCanvasHeight = overlayImage.naturalHeight;
                    let rotateCanvas = false;

                    // Si l'image de fond est en paysage, le cadre (calque) doit "tourner" pour que l'image de fond puisse s'y insérer
                    if (imgOriginalWidth > imgOriginalHeight) {
                        currentCanvasWidth = overlayImage.naturalHeight; // La hauteur du calque devient la largeur du canvas
                        currentCanvasHeight = overlayImage.naturalWidth; // La largeur du calque devient la hauteur du canvas
                        rotateCanvas = true;
                    }

                    canvas.width = currentCanvasWidth;
                    canvas.height = currentCanvasHeight;

                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    // Appliquez la rotation du contexte si nécessaire AVANT de dessiner
                    if (rotateCanvas) {
                        ctx.save(); // Sauvegarde l'état non-rotatif du contexte
                        // Déplace l'origine au centre du canvas, tourne, puis ramène l'origine au coin supérieur gauche du cadre rotatif
                        ctx.translate(canvas.width / 2, canvas.height / 2);
                        ctx.rotate(Math.PI / 2); // Rotation de 90 degrés (sens horaire)
                        ctx.translate(-canvas.height / 2, -canvas.width / 2); // Ajuste l'origine pour le dessin
                    }

                    // Logique de redimensionnement pour l'image de fond (conserver les proportions, s'adapter au canvas)
                    let bgDrawWidth;
                    let bgDrawHeight;
                    let bgOffsetX = 0;
                    let bgOffsetY = 0;

                    // Calculez les dimensions de dessin de l'image de fond par rapport aux dimensions du canvas actuel
                    const bgAspectRatio = imgOriginalWidth / imgOriginalHeight;
                    // canvasAspectRatio est calculé ici pour cette itération du canvas
                    const currentCanvasAspectRatio = canvas.width / canvas.height; // CORRECTION: Définition locale ici

                    if (bgAspectRatio > currentCanvasAspectRatio) { // L'image est plus large que le canvas
                        bgDrawWidth = canvas.width;
                        bgDrawHeight = canvas.width / bgAspectRatio;
                        bgOffsetY = (canvas.height - bgDrawHeight) / 2;
                    } else { // L'image est plus haute que le canvas ou a le même ratio
                        bgDrawHeight = canvas.height;
                        bgDrawWidth = canvas.height * bgAspectRatio;
                        bgOffsetX = (canvas.width - bgDrawWidth) / 2;
                    }

                    ctx.drawImage(img, bgOffsetX, bgOffsetY, bgDrawWidth, bgDrawHeight);

                    // Logique de redimensionnement pour le calque (conserver les proportions, s'adapter au canvas)
                    let olDrawWidth;
                    let olDrawHeight;
                    let olOffsetX = 0;
                    let olOffsetY = 0;

                    const olOriginalWidth = overlayImage.naturalWidth;
                    const olOriginalHeight = overlayImage.naturalHeight;

                    const olAspectRatio = olOriginalWidth / olOriginalHeight;
                    // Note: currentCanvasAspectRatio est maintenant défini ci-dessus et est correct pour le canvas après potentielle rotation
                    if (olAspectRatio > currentCanvasAspectRatio) { // Utilisation de la variable localement définie
                        olDrawWidth = canvas.width;
                        olDrawHeight = canvas.width / olAspectRatio;
                        olOffsetY = (canvas.height - olDrawHeight) / 2;
                    } else {
                        olDrawHeight = canvas.height;
                        olDrawWidth = canvas.height * olAspectRatio;
                        olOffsetX = (canvas.width - olDrawWidth) / 2;
                    }

                    ctx.drawImage(overlayImage, olOffsetX, olOffsetY, olDrawWidth, olDrawHeight);

                    // Restaure le contexte à son état précédent (non-rotatif)
                    if (rotateCanvas) {
                        ctx.restore();
                    }

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
            });
            URL.revokeObjectURL(img.src); // Important de révoquer après que l'image est chargée sur le canvas
        }

        statusMessage.textContent = "Fusion terminée !";
        statusMessage.classList.remove('text-blue-600', 'text-red-500');
        statusMessage.classList.add('text-green-600');

        if (mergedImageBlobs.length > 0) {
            downloadAllButton.classList.remove('hidden');
        }
    });

    // --- NOUVEAU : Initialisation des écouteurs d'événements pour la section Manhwa ---

    selectManhwaImagesButton.addEventListener('click', () => {
        manhwaImagesInput.click();
    });

    manhwaImagesInput.addEventListener('change', (event) => {
        const newFiles = Array.from(event.target.files).filter(file => file.type.startsWith('image/'));
        const uniqueFiles = new Map();
        manhwaImageFiles.forEach(file => {
            uniqueFiles.set(`${file.name}-${file.size}-${file.lastModified}`, file);
        });
        newFiles.forEach(file => {
            uniqueFiles.set(`${file.name}-${file.size}-${file.lastModified}`, file);
        });
        manhwaImageFiles = Array.from(uniqueFiles.values());

        manhwaImagesPreview.innerHTML = '';
        if (manhwaImageFiles.length > 0) {
            if (manhwaImageFiles.length === 1) {
                manhwaImagesFileNames.textContent = manhwaImageFiles[0].name;
            } else {
                manhwaImagesFileNames.textContent = `${manhwaImageFiles.length} fichiers sélectionnés.`;
            }

            manhwaImageFiles.forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.classList.add('w-24', 'h-24', 'object-cover', 'rounded-md', 'shadow-sm');
                    manhwaImagesPreview.appendChild(img);
                };
                reader.readAsDataURL(file);
            });
        } else {
            manhwaImagesFileNames.textContent = 'Aucun fichier sélectionné.';
            manhwaImagesPreview.innerHTML = '<span class="text-gray-400">Aperçu des images</span>';
        }
        updateManhwaMergeButtonState(); // Cette fonction sera ajoutée à l'étape suivante
        event.target.value = ''; // Réinitialise l'input pour pouvoir sélectionner les mêmes fichiers à nouveau
    });

    orientationHorizontalButton.addEventListener('click', () => {
        mergeOrientation = 'horizontal';
        orientationHorizontalButton.classList.remove('border-gray-300', 'text-gray-700', 'hover:bg-gray-100');
        orientationHorizontalButton.classList.add('border-blue-500', 'text-blue-500', 'hover:bg-blue-50');
        orientationVerticalButton.classList.remove('border-blue-500', 'text-blue-500', 'hover:bg-blue-50');
        orientationVerticalButton.classList.add('border-gray-300', 'text-gray-700', 'hover:bg-gray-100');
        updateManhwaMergeButtonState();
    });

    orientationVerticalButton.addEventListener('click', () => {
        mergeOrientation = 'vertical';
        orientationVerticalButton.classList.remove('border-gray-300', 'text-gray-700', 'hover:bg-gray-100');
        orientationVerticalButton.classList.add('border-blue-500', 'text-blue-500', 'hover:bg-blue-50');
        orientationHorizontalButton.classList.remove('border-blue-500', 'text-blue-500', 'hover:bg-blue-50');
        orientationHorizontalButton.classList.add('border-gray-300', 'text-gray-700', 'hover:bg-gray-100');
        updateManhwaMergeButtonState();
    });

    // Remarque : la fonction `mergeManhwaImages` sera ajoutée dans une étape ultérieure
    mergeManhwaButton.addEventListener('click', mergeManhwaImages);
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

// --- NOUVEAU : Fonction de fusion des images Manhwa ---
    async function mergeManhwaImages() {
        if (manhwaImageFiles.length === 0) {
            manhwaStatusMessage.textContent = "Veuillez sélectionner au moins une image.";
            manhwaStatusMessage.classList.add('text-red-500');
            return;
        }

        manhwaStatusMessage.textContent = "Fusion en cours...";
        manhwaStatusMessage.classList.remove('text-red-500', 'text-green-600');
        manhwaStatusMessage.classList.add('text-blue-600');
        manhwaDownloadLinkContainer.innerHTML = ''; // Efface tout lien de téléchargement précédent

        const imagesToLoad = manhwaImageFiles.map(file => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => {
                    console.error("Erreur de chargement de l'image:", file.name);
                    resolve(null); // Résoudre avec null en cas d'erreur
                };
                img.src = URL.createObjectURL(file);
            });
        });

        const loadedImages = await Promise.all(imagesToLoad);
        // Filtrer les images qui ont échoué au chargement
        const validImages = loadedImages.filter(img => img instanceof Image && img.naturalWidth > 0 && img.naturalHeight > 0);

        if (validImages.length === 0) {
            manhwaStatusMessage.textContent = "Aucune image valide n'a pu être chargée pour la fusion.";
            manhwaStatusMessage.classList.add('text-red-500');
            return;
        }

        let totalWidth = 0;
        let totalHeight = 0;

        // Calculer les dimensions du canvas final
        if (mergeOrientation === 'vertical') {
            totalWidth = Math.max(...validImages.map(img => img.naturalWidth)); // La largeur est la plus grande largeur parmi toutes les images
            totalHeight = validImages.reduce((sum, img) => sum + img.naturalHeight, 0); // La hauteur est la somme des hauteurs
        } else { // horizontal
            totalWidth = validImages.reduce((sum, img) => sum + img.naturalWidth, 0); // La largeur est la somme des largeurs
            totalHeight = Math.max(...validImages.map(img => img.naturalHeight)); // La hauteur est la plus grande hauteur parmi toutes les images
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = totalWidth;
        canvas.height = totalHeight;

        ctx.fillStyle = '#FFFFFF'; // Définir un fond blanc par défaut
        ctx.fillRect(0, 0, canvas.width, canvas.height); // Remplir le fond

        let currentX = 0;
        let currentY = 0;

        // Dessiner les images sur le canvas
        validImages.forEach(img => {
            if (mergeOrientation === 'vertical') {
                // Centrer horizontalement si les images ont des largeurs différentes
                const offsetX = (totalWidth - img.naturalWidth) / 2;
                ctx.drawImage(img, offsetX, currentY);
                currentY += img.naturalHeight;
            } else { // horizontal
                // Centrer verticalement si les images ont des hauteurs différentes
                const offsetY = (totalHeight - img.naturalHeight) / 2;
                ctx.drawImage(img, currentX, offsetY);
                currentX += img.naturalWidth;
            }
            // Important : Libérer l'URL de l'objet Blob après que l'image est dessinée sur le canvas
            // car l'image n'est plus nécessaire en tant qu'objet DOM pour la fusion
            URL.revokeObjectURL(img.src);
        });

        // Générer l'image fusionnée et le lien de téléchargement
        canvas.toBlob((blob) => {
            if (!blob) {
                manhwaStatusMessage.textContent = "Erreur lors de la génération de l'image fusionnée.";
                manhwaStatusMessage.classList.add('text-red-500');
                return;
            }

            const url = URL.createObjectURL(blob);
            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = `manhwa_fusionne_${Date.now()}.png`; // Nom du fichier
            downloadLink.textContent = `Télécharger l'image fusionnée`;
            downloadLink.classList.add('bg-purple-600', 'hover:bg-purple-700', 'text-white', 'font-bold', 'py-3', 'px-8', 'rounded-full', 'text-lg', 'shadow-lg', 'transition-colors', 'duration-200', 'block', 'text-center', 'mx-auto');

            manhwaDownloadLinkContainer.innerHTML = ''; // Assure qu'un seul lien est présent
            manhwaDownloadLinkContainer.appendChild(downloadLink);

            manhwaStatusMessage.textContent = "Fusion terminée !";
            manhwaStatusMessage.classList.remove('text-blue-600', 'text-red-500');
            manhwaStatusMessage.classList.add('text-green-600');

        }, 'image/png'); // Spécifier le format de sortie
    }
    
    // NOUVEAU : Initialisation: affiche la section "Merge Vinted" par défaut au chargement
    showSection(vintedMergerSection);
    updateMergeButtonState(); // S'assure que l'état initial du bouton Vinted est correct

    // --- NOUVEAU : Initialisation de l'état des boutons Manhwa au chargement ---
    // Simule un clic sur le bouton Vertical pour définir l'état initial visuel et la variable
    orientationVerticalButton.click();
    updateManhwaMergeButtonState(); // S'assure que le bouton de fusion Manhwa est désactivé si aucune image n'est sélectionnée
});
