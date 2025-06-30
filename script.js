// script.js

document.addEventListener('DOMContentLoaded', () => {
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

        canvas.width = overlayImage.naturalWidth;
        canvas.height = overlayImage.naturalHeight;

        for (const file of backgroundImageFiles) {
            statusMessage.textContent = `Fusion de ${file.name}...`;

            const img = new Image();
            img.src = URL.createObjectURL(file);

            await new Promise(resolve => {
                img.onload = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    // NOUVELLE LOGIQUE DE REDIMENSIONNEMENT : Portrait vs Paysage
                    let drawWidth;
                    let drawHeight;
                    let offsetX = 0;
                    let offsetY = 0;

                    const imgOriginalWidth = img.naturalWidth;
                    const imgOriginalHeight = img.naturalHeight;

                    // Déterminez si l'image est en format portrait ou paysage
                    if (imgOriginalHeight > imgOriginalWidth) { // Format Portrait (hauteur > largeur)
                        // Redimensionner sur la hauteur (canvas.height) en conservant les proportions
                        drawHeight = canvas.height;
                        drawWidth = (imgOriginalWidth / imgOriginalHeight) * drawHeight;
                    } else { // Format Paysage (largeur >= hauteur)
                        // Redimensionner sur la largeur (canvas.width) en conservant les proportions
                        drawWidth = canvas.width;
                        drawHeight = (imgOriginalHeight / imgOriginalWidth) * drawWidth;
                    }

                    // Centrer l'image si elle n'occupe pas tout le canvas après redimensionnement
                    offsetX = (canvas.width - drawWidth) / 2;
                    offsetY = (canvas.height - drawHeight) / 2;

                    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
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

    updateMergeButtonState();
});
