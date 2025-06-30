// script.js

document.addEventListener('DOMContentLoaded', () => {
    const overlayInput = document.getElementById('overlayInput');
    const selectOverlayButton = document.getElementById('selectOverlayButton');
    const overlayFileName = document.getElementById('overlayFileName');

    // NOUVELLES VARIABLES pour la section des images de fond
    const backgroundsInput = document.getElementById('backgroundsInput');
    const selectBackgroundsButton = document.getElementById('selectBackgroundsButton');
    const backgroundsFileNames = document.getElementById('backgroundsFileNames');

    const mergeButton = document.getElementById('mergeButton');
    const overlayPreview = document.getElementById('overlayPreview');
    const backgroundsPreview = document.getElementById('backgroundsPreview');
    const statusMessage = document.getElementById('statusMessage');
    const downloadLinks = document.getElementById('downloadLinks');

    let overlayImage = null;
    let backgroundImageFiles = [];

    // Function to update the state of the merge button
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
    };

    // Handle the click on the custom "Choose a file..." button for the overlay
    selectOverlayButton.addEventListener('click', () => {
        overlayInput.click(); // This simulates a click on the hidden file input
    });

    // Read the overlay file and update its display
    overlayInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'image/png') {
            // Display the file name next to the custom button
            overlayFileName.textContent = file.name;

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    overlayImage = img;
                    overlayPreview.innerHTML = ''; // Clear the previous preview
                    overlayPreview.appendChild(img);
                    img.classList.add('max-w-full', 'max-h-full', 'object-contain'); // Tailwind classes for preview
                    updateMergeButtonState();
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        } else {
            overlayImage = null;
            // Reset the file name display if no valid file is selected
            overlayFileName.textContent = 'Aucun fichier sélectionné.';
            overlayPreview.innerHTML = '<span class="text-gray-400">Veuillez sélectionner un fichier PNG valide.</span>';
            updateMergeButtonState();
        }
    });

    // Gérer le clic sur le bouton personnalisé pour les images de fond
    selectBackgroundsButton.addEventListener('click', () => {
        backgroundsInput.click(); // Simule un clic sur l'input de fichier caché
    });


    // Lecture des fichiers de fond (backgrounds) et mise à jour de leur affichage
    backgroundsInput.addEventListener('change', (event) => {
        const newFiles = Array.from(event.target.files).filter(file => file.type.startsWith('image/'));

        // Crée un Map pour stocker les fichiers uniques (par nom, taille et dernière modification)
        // afin d'éviter les doublons si l'utilisateur sélectionne plusieurs fois la même image.
        const uniqueFiles = new Map();

        // Ajoute tous les fichiers existants à la Map
        backgroundImageFiles.forEach(file => {
            uniqueFiles.set(`${file.name}-${file.size}-${file.lastModified}`, file);
        });

        // Ajoute les nouveaux fichiers, remplaçant si une nouvelle version d'un fichier existe
        newFiles.forEach(file => {
            uniqueFiles.set(`${file.name}-${file.size}-${file.lastModified}`, file);
        });

        // Convertit la Map de retour en tableau
        backgroundImageFiles = Array.from(uniqueFiles.values());

        // Mise à jour de l'aperçu et du texte
        backgroundsPreview.innerHTML = ''; // Nettoie l'aperçu existant

        if (backgroundImageFiles.length > 0) {
            // Afficher le nombre de fichiers ou le nom du fichier
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
            backgroundsFileNames.textContent = 'Aucun fichier sélectionné.'; // Réinitialiser le texte
            backgroundsPreview.innerHTML = '<span class="text-gray-400">Aperçu des fonds</span>';
        }
        updateMergeButtonState();

        // Réinitialise la valeur de l'input pour permettre la re-sélection des mêmes fichiers
        event.target.value = '';
    });

    // Merge function
    mergeButton.addEventListener('click', async () => {
        if (!overlayImage || backgroundImageFiles.length === 0) {
            statusMessage.textContent = "Veuillez sélectionner un calque et au moins une image de fond.";
            statusMessage.classList.add('text-red-500');
            return;
        }

        statusMessage.textContent = "Fusion en cours...";
        statusMessage.classList.remove('text-red-500', 'text-green-600'); // Nettoie les couleurs de statut précédentes
        statusMessage.classList.add('text-blue-600');
        downloadLinks.innerHTML = ''; // Efface les liens de téléchargement précédents

        // Crée un canvas pour la fusion
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // S'assure que le canvas a la taille de l'image du calque
        canvas.width = overlayImage.naturalWidth;
        canvas.height = overlayImage.naturalHeight;

        for (const file of backgroundImageFiles) {
            statusMessage.textContent = `Fusion de ${file.name}...`;

            const img = new Image();
            img.src = URL.createObjectURL(file);

            await new Promise(resolve => {
                img.onload = () => {
                    // Nettoie le canvas pour chaque nouvelle fusion
                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    // Dessine l'image de fond (mise à l'échelle pour s'adapter)
                    // Il est crucial de dessiner l'image de fond AVANT le calque
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height); // Redimensionne l'arrière-plan pour correspondre au calque

                    // Dessine le calque par-dessus
                    ctx.drawImage(overlayImage, 0, 0, canvas.width, canvas.height);

                    // Convertit le canvas en image PNG
                    canvas.toBlob((blob) => {
                        const url = URL.createObjectURL(blob);
                        const downloadLink = document.createElement('a');
                        downloadLink.href = url;

                        // --- DÉBUT DE LA MODIFICATION POUR LE NOM DU FICHIER ---
                        const originalFileName = file.name;
                        const lastDotIndex = originalFileName.lastIndexOf('.');
                        let baseName;
                        let extension;

                        if (lastDotIndex > 0) { // S'il y a une extension
                            baseName = originalFileName.substring(0, lastDotIndex);
                            extension = originalFileName.substring(lastDotIndex); // Inclut le point
                        } else { // Pas d'extension, ou point en début de nom
                            baseName = originalFileName;
                            extension = '';
                        }

                        // Ajout de '-sinmerge' après le nom de base, et s'assure que l'extension est .png
                        downloadLink.download = `${baseName}-sinmerge.png`;
                        // --- FIN DE LA MODIFICATION POUR LE NOM DU FICHIER ---

                        downloadLink.textContent = `Télécharger ${downloadLink.download}`;
                        downloadLink.classList.add('bg-blue-500', 'hover:bg-blue-600', 'text-white', 'py-2', 'px-4', 'rounded-md', 'block', 'text-center', 'transition-colors', 'duration-200');
                        downloadLinks.appendChild(downloadLink);
                        resolve();
                    }, 'image/png');
                };
            });
        }

        statusMessage.textContent = "Fusion terminée !";
        statusMessage.classList.remove('text-blue-600', 'text-red-500'); // Nettoie les couleurs de statut précédentes
        statusMessage.classList.add('text-green-600');
    });

    // Initialize button state on page load
    updateMergeButtonState();
});
