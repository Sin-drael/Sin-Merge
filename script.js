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

    // NOUVEAU : Référence au bouton de téléchargement ZIP
    const downloadAllButton = document.getElementById('downloadAllButton'); // <-- AJOUTÉ

    let overlayImage = null;
    let backgroundImageFiles = [];

    // NOUVEAU : Tableau pour stocker les blobs des images fusionnées pour le ZIP
    let mergedImageBlobs = []; // <-- AJOUTÉ

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
        // Cache le bouton "Télécharger tout" si aucune image n'est prête à être fusionnée
        downloadAllButton.classList.add('hidden'); // <-- AJOUTÉ
    };

    // Gérer le clic sur le bouton personnalisé "Choisir un fichier..." pour le calque
    selectOverlayButton.addEventListener('click', () => {
        overlayInput.click();
    });

    // Lire le fichier du calque et mettre à jour son affichage
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

    // Gérer le clic sur le bouton personnalisé pour les images de fond
    selectBackgroundsButton.addEventListener('click', () => {
        backgroundsInput.click();
    });

    // Lecture des fichiers de fond (backgrounds) et mise à jour de leur affichage
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

    // Fonction de fusion
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
        mergedImageBlobs = []; // <-- TRÈS IMPORTANT : Réinitialise le tableau de blobs avant chaque fusion

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

                    const imageAspectRatio = img.naturalWidth / img.naturalHeight;
                    const canvasAspectRatio = canvas.width / canvas.height;

                    let drawWidth;
                    let drawHeight;
                    let offsetX = 0;
                    let offsetY = 0;

                    if (imageAspectRatio > canvasAspectRatio) {
                        drawWidth = canvas.width;
                        drawHeight = canvas.width / imageAspectRatio;
                        offsetY = (canvas.height - drawHeight) / 2;
                    } else {
                        drawHeight = canvas.height;
                        drawWidth = canvas.height * imageAspectRatio;
                        offsetX = (canvas.width - drawWidth) / 2;
                    }

                    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
                    ctx.drawImage(overlayImage, 0, 0, canvas.width, canvas.height);

                    canvas.toBlob((blob) => {
                        // NOUVEAU : Ajoute le blob et le nom du fichier au tableau
                        mergedImageBlobs.push({ blob: blob, name: `${file.name.substring(0, file.name.lastIndexOf('.')) || file.name}-sinmerge.png` }); // <-- AJOUTÉ

                        const url = URL.createObjectURL(blob);
                        const downloadLink = document.createElement('a');
                        downloadLink.href = url;

                        const originalFileName = file.name;
                        const lastDotIndex = originalFileName.lastIndexOf('.');
                        let baseName;
                        // let extension; // Pas besoin de l'extension ici car on force .png

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
            URL.revokeObjectURL(img.src); // Libère la mémoire
        }

        statusMessage.textContent = "Fusion terminée !";
        statusMessage.classList.remove('text-blue-600', 'text-red-500');
        statusMessage.classList.add('text-green-600');

        // NOUVEAU : Affiche le bouton "Télécharger tout (Zip)"
        if (mergedImageBlobs.length > 0) {
            downloadAllButton.classList.remove('hidden'); // <-- AJOUTÉ
        }
    });

    // NOUVEAU : Gérer le clic sur le bouton "Télécharger tout (Zip)"
    downloadAllButton.addEventListener('click', async () => { // <-- AJOUTÉ
        if (mergedImageBlobs.length === 0) {
            statusMessage.textContent = "Aucune image fusionnée à télécharger.";
            statusMessage.classList.add('text-red-500');
            return;
        }

        statusMessage.textContent = "Préparation du fichier ZIP...";
        statusMessage.classList.remove('text-red-500', 'text-green-600');
        statusMessage.classList.add('text-blue-600');

        const zip = new JSZip(); // Crée une nouvelle instance de JSZip

        for (const item of mergedImageBlobs) {
            // Ajoute chaque blob (image fusionnée) au fichier ZIP
            zip.file(item.name, item.blob);
        }

        // Génère le fichier ZIP
        try {
            const content = await zip.generateAsync({ type: "blob" });
            const zipFileName = `images_fusionnees_${Date.now()}.zip`; // Nom unique pour le ZIP

            // Crée un lien de téléchargement pour le fichier ZIP
            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(content);
            downloadLink.download = zipFileName;
            downloadLink.textContent = `Télécharger toutes les ${mergedImageBlobs.length} images (Zip)`;
            downloadLink.classList.add('bg-purple-600', 'hover:bg-purple-700', 'text-white', 'py-2', 'px-4', 'rounded-md', 'block', 'text-center', 'mt-4', 'transition-colors', 'duration-200'); // Ajout de marges
            downloadLinks.appendChild(downloadLink); // Ajoute le lien au conteneur de liens de téléchargement

            statusMessage.textContent = "Fichier ZIP prêt au téléchargement !";
            statusMessage.classList.remove('text-blue-600');
            statusMessage.classList.add('text-green-600');

            // Simule un clic pour démarrer le téléchargement directement si désiré
            // downloadLink.click();
            // URL.revokeObjectURL(downloadLink.href); // Libère l'URL après le clic

        } catch (error) {
            console.error("Erreur lors de la création du ZIP :", error);
            statusMessage.textContent = "Erreur lors de la création du fichier ZIP.";
            statusMessage.classList.remove('text-blue-600');
            statusMessage.classList.add('text-red-500');
        }
    });


    // Initialiser l'état du bouton au chargement de la page
    updateMergeButtonState();
});
