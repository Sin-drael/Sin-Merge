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
                    const canvasAspectRatio = canvas.width / canvas.height;

                    if (bgAspectRatio > canvasAspectRatio) { // L'image est plus large que le canvas
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
                    // Note: currentCanvasAspectRatio est déjà calculé et correct pour le canvas après potentielle rotation
                    if (olAspectRatio > currentCanvasAspectRatio) {
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
            URL.revokeObjectURL(img.src);
        }

        statusMessage.textContent = "Fusion terminée !";
        statusMessage.classList.remove('text-blue-600', 'text-red-500');
        statusMessage.classList.add('text-green-600');

        if (mergedImageBlobs.length > 0) {
            downloadAllButton.classList.remove('hidden');
        }
    });

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

    // NOUVEAU : Initialisation: affiche la section "Merge Vinted" par défaut au chargement
    showSection(vintedMergerSection);
    updateMergeButtonState(); // S'assure que l'état initial du bouton est correct
});
