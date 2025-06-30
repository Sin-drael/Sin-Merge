// script.js

document.addEventListener('DOMContentLoaded', () => {
    const overlayInput = document.getElementById('overlayInput');
    const backgroundsInput = document.getElementById('backgroundsInput');
    const mergeButton = document.getElementById('mergeButton');
    const overlayPreview = document.getElementById('overlayPreview');
    const backgroundsPreview = document.getElementById('backgroundsPreview');
    const statusMessage = document.getElementById('statusMessage');
    const downloadLinks = document.getElementById('downloadLinks');

    let overlayImage = null;
    let backgroundImageFiles = [];

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
    };

    // Lecture du fichier de calque (overlay)
    overlayInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'image/png') {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    overlayImage = img;
                    overlayPreview.innerHTML = ''; // Nettoie l'aperçu
                    overlayPreview.appendChild(img);
                    img.classList.add('max-w-full', 'max-h-full', 'object-contain'); // Classes Tailwind pour l'aperçu
                    updateMergeButtonState();
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        } else {
            overlayImage = null;
            overlayPreview.innerHTML = '<span class="text-gray-400">Veuillez sélectionner un fichier PNG valide.</span>';
            updateMergeButtonState();
        }
    });

    // Lecture des fichiers de fond (backgrounds)
    backgroundsInput.addEventListener('change', (event) => {
        backgroundImageFiles = Array.from(event.target.files).filter(file => file.type.startsWith('image/'));
        backgroundsPreview.innerHTML = ''; // Nettoie l'aperçu
        if (backgroundImageFiles.length > 0) {
            backgroundImageFiles.forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.classList.add('w-24', 'h-24', 'object-cover', 'rounded-md', 'shadow-sm'); // Classes Tailwind pour l'aperçu
                    backgroundsPreview.appendChild(img);
                };
                reader.readAsDataURL(file);
            });
        } else {
            backgroundsPreview.innerHTML = '<span class="text-gray-400">Aperçu des fonds</span>';
        }
        updateMergeButtonState();
    });

    // Fonction de fusion
    mergeButton.addEventListener('click', async () => {
        if (!overlayImage || backgroundImageFiles.length === 0) {
            statusMessage.textContent = "Veuillez sélectionner un calque et au moins une image de fond.";
            statusMessage.classList.add('text-red-500');
            return;
        }

        statusMessage.textContent = "Fusion en cours...";
        statusMessage.classList.remove('text-red-500');
        statusMessage.classList.add('text-blue-600');
        downloadLinks.innerHTML = ''; // Nettoie les liens de téléchargement précédents

        // Crée un canvas pour la fusion
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // S'assure que le canvas a la taille de l'image de calque
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

                    // Dessine l'image de fond (recadrée si nécessaire pour s'adapter)
                    // Il est important de dessiner l'image de fond AVANT le calque
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height); // Redimensionne le fond pour qu'il corresponde au calque

                    // Dessine le calque par-dessus
                    ctx.drawImage(overlayImage, 0, 0, canvas.width, canvas.height);

                    // Convertit le canvas en image PNG
                    canvas.toBlob((blob) => {
                        const url = URL.createObjectURL(blob);
                        const downloadLink = document.createElement('a');
                        downloadLink.href = url;
                        downloadLink.download = `fusion_${file.name.split('.')[0]}.png`; // Nom du fichier de sortie
                        downloadLink.textContent = `Télécharger ${downloadLink.download}`;
                        downloadLink.classList.add('bg-blue-500', 'hover:bg-blue-600', 'text-white', 'py-2', 'px-4', 'rounded-md', 'block', 'text-center', 'transition-colors', 'duration-200');
                        downloadLinks.appendChild(downloadLink);
                        resolve();
                    }, 'image/png');
                };
            });
        }

        statusMessage.textContent = "Fusion terminée !";
        statusMessage.classList.remove('text-blue-600');
        statusMessage.classList.add('text-green-600');
    });

    // Initialisation de l'état du bouton
    updateMergeButtonState();
});
