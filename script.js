// Déclarations des éléments du DOM
const navVintedMerge = document.getElementById('navVintedMerge');
const navManhwaFusion = document.getElementById('navManhwaFusion');
const vintedMergerSection = document.getElementById('vintedMergerSection');
const manhwaMergerSection = document.getElementById('manhwaMergerSection');

const overlayInput = document.getElementById('overlayInput');
const selectOverlayButton = document.getElementById('selectOverlayButton');
const overlayFileName = document.getElementById('overlayFileName');
const overlayPreview = document.getElementById('overlayPreview');

const backgroundsInput = document.getElementById('backgroundsInput');
const selectBackgroundsButton = document.getElementById('selectBackgroundsButton');
const backgroundsFileNames = document.getElementById('backgroundsFileNames');
const backgroundsPreview = document.getElementById('backgroundsPreview');

const mergeButton = document.getElementById('mergeButton');
const statusMessage = document.getElementById('statusMessage');
const downloadLinks = document.getElementById('downloadLinks');
const downloadAllButton = document.getElementById('downloadAllButton');
const loadingBarContainer = document.getElementById('loadingBarContainer');
const loadingBar = document.getElementById('loadingBar');
const zipLoadingMessage = document.getElementById('zipLoadingMessage');

// Manhwa Merger elements
const manhwaImagesInput = document.getElementById('manhwaImagesInput');
const selectManhwaImagesButton = document.getElementById('selectManhwaImagesButton');
const manhwaImagesFileNames = document.getElementById('manhwaImagesFileNames');
const manhwaImagesPreview = document.getElementById('manhwaImagesPreview');
const orientationHorizontalButton = document.getElementById('orientationHorizontal');
const orientationVerticalButton = document.getElementById('orientationVertical');
const mergeManhwaButton = document.getElementById('mergeManhwaButton');
const resetManhwaButton = document.getElementById('resetManhwaButton');
const manhwaStatusMessage = document.getElementById('manhwaStatusMessage');
const manhwaDownloadLink = document.getElementById('manhwaDownloadLink'); // Corrected ID
const manhwaLoadingBarContainer = document.getElementById('manhwaLoadingBarContainer');
const manhwaLoadingBar = document.getElementById('manhwaLoadingBar');
const manhwaZipLoadingMessage = document.getElementById('manhwaZipLoadingMessage');


// Variables globales
let overlayFile = null;
let backgroundFiles = [];
let mergedImageBlobs = []; // Pour les images Vinted

let manhwaImageFiles = []; // Pour les images Manhwa
let mergeOrientation = 'vertical'; // Par défaut, fusion verticale pour Manhwa
let draggedItem = null; // Variable globale pour le glisser-déposer des images Manhwa

const MAX_IMAGES_PER_CHUNK = 25; // Nombre maximal d'images à fusionner par chunk pour Manhwa

// --- Fonctions utilitaires ---

// Fonction pour afficher la section active
function showSection(sectionToShow) {
    vintedMergerSection.classList.add('hidden');
    manhwaMergerSection.classList.add('hidden');
    sectionToShow.classList.remove('hidden');

    // Mettre à jour les styles des boutons de navigation
    navVintedMerge.classList.remove('bg-blue-600', 'text-white');
    navVintedMerge.classList.add('bg-sidebar-bg', 'text-white', 'hover:bg-sidebar-link-hover');
    navManhwaFusion.classList.remove('bg-blue-600', 'text-white');
    navManhwaFusion.classList.add('bg-sidebar-bg', 'text-white', 'hover:bg-sidebar-link-hover');

    if (sectionToShow === vintedMergerSection) {
        navVintedMerge.classList.remove('bg-sidebar-bg', 'text-white', 'hover:bg-sidebar-link-hover');
        navVintedMerge.classList.add('bg-blue-600', 'text-white');
    } else if (sectionToShow === manhwaMergerSection) {
        navManhwaFusion.classList.remove('bg-sidebar-bg', 'text-white', 'hover:bg-sidebar-link-hover');
        navManhwaFusion.classList.add('bg-blue-600', 'text-white');
    }
}

// Fonction pour mettre à jour l'état du bouton de fusion Vinted
function updateMergeButtonState() {
    if (overlayFile && backgroundFiles.length > 0) {
        mergeButton.disabled = false;
        mergeButton.classList.remove('bg-green-400', 'cursor-not-allowed');
        mergeButton.classList.add('bg-green-600', 'hover:bg-green-700');
    } else {
        mergeButton.disabled = true;
        mergeButton.classList.remove('bg-green-600', 'hover:bg-green-700');
        mergeButton.classList.add('bg-green-400', 'cursor-not-allowed');
    }
}

// Fonction pour réinitialiser la section Vinted
function resetVintedMerger() {
    overlayFile = null;
    backgroundFiles = [];
    mergedImageBlobs = [];

    overlayInput.value = '';
    backgroundsInput.value = '';

    overlayFileName.textContent = 'Aucun fichier sélectionné.';
    overlayPreview.innerHTML = '<span class="text-gray-400">Aperçu du calque</span>';

    backgroundsFileNames.textContent = 'Aucun fichier sélectionné.';
    backgroundsPreview.innerHTML = '<span class="text-gray-400">Aperçu des fonds</span>';

    statusMessage.textContent = '';
    downloadLinks.innerHTML = '';
    downloadAllButton.classList.add('hidden');
    loadingBarContainer.classList.add('hidden');
    zipLoadingMessage.classList.add('hidden');
    loadingBar.style.width = '0%';

    updateMergeButtonState();
}

// Fonction pour mettre à jour l'état du bouton de fusion Manhwa
function updateManhwaMergeButtonState() {
    if (manhwaImageFiles.length > 0) {
        mergeManhwaButton.disabled = false;
        mergeManhwaButton.classList.remove('bg-green-400', 'cursor-not-allowed');
        mergeManhwaButton.classList.add('bg-green-600', 'hover:bg-green-700');
    } else {
        mergeManhwaButton.disabled = true;
        mergeManhwaButton.classList.remove('bg-green-600', 'hover:bg-green-700');
        mergeManhwaButton.classList.add('bg-green-400', 'cursor-not-allowed');
    }
}

// Fonction pour réinitialiser la section Manhwa
function resetManhwaImages() {
    manhwaImageFiles = [];
    manhwaImagesInput.value = ''; // Réinitialiser l'input file

    manhwaImagesFileNames.textContent = 'Aucun fichier sélectionné.';
    manhwaImagesPreview.innerHTML = '<span class="text-gray-400">Aperçu des images</span>';

    manhwaStatusMessage.textContent = '';
    manhwaDownloadLink.innerHTML = ''; // Nettoyer les liens de téléchargement
    manhwaLoadingBarContainer.classList.add('hidden');
    manhwaZipLoadingMessage.classList.add('hidden');
    manhwaLoadingBar.style.width = '0%';

    updateManhwaMergeButtonState();
}


// --- Écouteurs d'événements Vinted Merger ---

selectOverlayButton.addEventListener('click', () => {
    overlayInput.click();
});

overlayInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/png')) {
        overlayFile = file;
        overlayFileName.textContent = file.name;
        const reader = new FileReader();
        reader.onload = (e) => {
            overlayPreview.innerHTML = `<img src="${e.target.result}" class="max-w-full max-h-full object-contain">`;
        };
        reader.readAsDataURL(file);
    } else {
        overlayFile = null;
        overlayFileName.textContent = 'Aucun fichier sélectionné.';
        overlayPreview.innerHTML = '<span class="text-gray-400">Aperçu du calque</span>';
        if (file && !file.type.startsWith('image/png')) {
            statusMessage.textContent = "Veuillez sélectionner un fichier PNG pour le calque principal.";
            statusMessage.classList.add('text-red-500');
        }
    }
    updateMergeButtonState();
});

selectBackgroundsButton.addEventListener('click', () => {
    backgroundsInput.click();
});

backgroundsInput.addEventListener('change', (event) => {
    const files = Array.from(event.target.files).filter(file => file.type.startsWith('image/'));
    backgroundFiles = files;
    backgroundsPreview.innerHTML = '';
    downloadLinks.innerHTML = ''; // Clear previous download links

    if (backgroundFiles.length > 0) {
        if (backgroundFiles.length === 1) {
            backgroundsFileNames.textContent = backgroundFiles[0].name;
        } else {
            backgroundsFileNames.textContent = `${backgroundFiles.length} fichiers sélectionnés.`;
        }
        backgroundFiles.forEach(file => {
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
});

mergeButton.addEventListener('click', async () => {
    if (!overlayFile || backgroundFiles.length === 0) {
        statusMessage.textContent = "Veuillez sélectionner un calque et au moins une image de fond.";
        statusMessage.classList.add('text-red-500');
        return;
    }

    statusMessage.textContent = "Fusion en cours...";
    statusMessage.classList.remove('text-red-500', 'text-green-600');
    statusMessage.classList.add('text-blue-600');
    downloadLinks.innerHTML = ''; // Clear previous links
    downloadAllButton.classList.add('hidden'); // Hide download all button initially

    loadingBarContainer.classList.remove('hidden');
    zipLoadingMessage.classList.remove('hidden'); // Show loading message
    loadingBar.style.width = '0%'; // Reset bar

    const overlayImage = new Image();
    overlayImage.src = URL.createObjectURL(overlayFile);
    await new Promise(resolve => overlayImage.onload = resolve);

    mergedImageBlobs = []; // Clear previous merged images

    let processedCount = 0;
    for (const backgroundFile of backgroundFiles) {
        const backgroundImage = new Image();
        backgroundImage.src = URL.createObjectURL(backgroundFile);
        await new Promise(resolve => backgroundImage.onload = resolve);

        const canvas = document.createElement('canvas');
        canvas.width = backgroundImage.width;
        canvas.height = backgroundImage.height;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(backgroundImage, 0, 0);
        ctx.drawImage(overlayImage, 0, 0, canvas.width, canvas.height); // Draw overlay resized to background

        const mergedFileName = `merged_${backgroundFile.name.replace(/\.[^/.]+$/, "")}.png`; // Keep original extension or set to PNG

        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        mergedImageBlobs.push({ blob: blob, name: mergedFileName });

        processedCount++;
        const percent = (processedCount / backgroundFiles.length) * 100;
        loadingBar.style.width = `${percent.toFixed(2)}%`;
        zipLoadingMessage.textContent = `Fusion : ${processedCount}/${backgroundFiles.length} (${percent.toFixed(0)}%)`;

        URL.revokeObjectURL(backgroundImage.src); // Free memory
    }
    URL.revokeObjectURL(overlayImage.src); // Free memory

    statusMessage.textContent = "Fusion terminée !";
    statusMessage.classList.remove('text-blue-600', 'text-red-500');
    statusMessage.classList.add('text-green-600');

    mergedImageBlobs.forEach(item => {
        const url = URL.createObjectURL(item.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = item.name;
        a.textContent = item.name;
        a.classList.add('bg-blue-500', 'hover:bg-blue-600', 'text-white', 'font-bold', 'py-2', 'px-4', 'rounded-md', 'text-sm', 'text-center', 'block', 'transition-colors', 'duration-200');
        downloadLinks.appendChild(a);
        a.addEventListener('click', () => setTimeout(() => URL.revokeObjectURL(url), 100));
    });

    if (mergedImageBlobs.length > 0) {
        downloadAllButton.classList.remove('hidden');
    }

    loadingBarContainer.classList.add('hidden');
    zipLoadingMessage.classList.add('hidden');
    loadingBar.style.width = '0%';
});

// Gérer le clic sur le bouton "Télécharger tout (Zip)" pour Vinted
downloadAllButton.addEventListener('click', async () => {
    if (mergedImageBlobs.length === 0) {
        statusMessage.textContent = "Aucune image fusionnée à télécharger.";
        statusMessage.classList.add('text-red-500');
        return;
    }

    statusMessage.textContent = "Préparation du fichier ZIP...";
    statusMessage.classList.remove('text-red-500', 'text-green-600');
    statusMessage.classList.add('text-blue-600');

    loadingBarContainer.classList.remove('hidden');
    zipLoadingMessage.classList.remove('hidden');
    loadingBar.style.width = '0%';

    const zip = new JSZip();

    for (const item of mergedImageBlobs) {
        zip.file(item.name, item.blob);
    }

    try {
        const content = await zip.generateAsync({ type: "blob" }, function updateCallback(metadata) {
            const percent = metadata.percent.toFixed(2);
            loadingBar.style.width = `${percent}%`;
            zipLoadingMessage.textContent = `Génération du fichier ZIP : ${percent}%`;
        });

        const zipFileName = `vinted_fusionnees_${Date.now()}.zip`;

        const tempDownloadLink = document.createElement('a');
        tempDownloadLink.href = URL.createObjectURL(content);
        tempDownloadLink.download = zipFileName;
        tempDownloadLink.click();
        URL.revokeObjectURL(tempDownloadLink.href);

        statusMessage.textContent = "Fichier ZIP téléchargé !";
        statusMessage.classList.remove('text-blue-600');
        statusMessage.classList.add('text-green-600');

    } catch (error) {
        console.error("Erreur lors de la création du ZIP :", error);
        statusMessage.textContent = "Erreur lors de la création du fichier ZIP.";
        statusMessage.classList.remove('text-blue-600');
        statusMessage.classList.add('text-red-500');
    } finally {
        loadingBarContainer.classList.add('hidden');
        zipLoadingMessage.classList.add('hidden');
        loadingBar.style.width = '0%';
    }
});


// --- Écouteurs d'événements et Fonctions Manhwa Merger ---

selectManhwaImagesButton.addEventListener('click', () => {
    manhwaImagesInput.click();
});

manhwaImagesInput.addEventListener('change', (event) => {
    const newFiles = Array.from(event.target.files).filter(file => file.type.startsWith('image/'));
    const uniqueFiles = new Map();

    // Lors de l'ajout de nouveaux fichiers, on s'assure de les stocker correctement
    manhwaImageFiles.forEach(file => {
        uniqueFiles.set(`${file.name}-${file.size}-${file.lastModified}`, file);
    });
    newFiles.forEach(file => {
        uniqueFiles.set(`${file.name}-${file.size}-${file.lastModified}`, file);
    });

    manhwaImageFiles = Array.from(uniqueFiles.values());

    // Le tri initial peut être conservé si tu veux que les images soient triées par défaut à la sélection,
    // avant de pouvoir les glisser-déposer.
    manhwaImageFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

    // Appel initial pour afficher les images (maintenant via la fonction séparée)
    displayManhwaImagesPreview();

    updateManhwaMergeButtonState();
    event.target.value = ''; // Réinitialise l'input file pour permettre la sélection des mêmes fichiers à nouveau
});


// --- Fonction pour rafraîchir l'affichage des miniatures Manhwa (avec Drag & Drop) ---
function displayManhwaImagesPreview() {
    manhwaImagesPreview.innerHTML = ''; // Nettoie l'aperçu existant

    if (manhwaImageFiles.length === 0) {
        manhwaImagesFileNames.textContent = 'Aucun fichier sélectionné.';
        manhwaImagesPreview.innerHTML = '<span class="text-gray-400">Aperçu des images</span>';
        updateManhwaMergeButtonState();
        return;
    }

    if (manhwaImageFiles.length === 1) {
        manhwaImagesFileNames.textContent = manhwaImageFiles[0].name;
    } else {
        manhwaImagesFileNames.textContent = `${manhwaImageFiles.length} fichiers sélectionnés.`;
    }

    const gridContainer = document.createElement('div');
    gridContainer.classList.add('grid', 'grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3', 'gap-4');
    // Ajoute le gridContainer au manhwaImagesPreview ici, immédiatement.
    manhwaImagesPreview.appendChild(gridContainer);

    manhwaImageFiles.forEach((file, index) => { // Ajoute 'index' pour suivre la position
        const reader = new FileReader();
        reader.onload = (e) => {
            const li = document.createElement('li');
            li.classList.add('flex', 'items-center', 'space-x-4', 'p-2', 'bg-gray-50', 'rounded-md', 'shadow-sm', 'hover:bg-gray-100', 'transition-colors', 'duration-150', 'cursor-grab');
            li.setAttribute('draggable', 'true');
            li.dataset.index = index; // Stocke l'index actuel dans un attribut de données

            const img = document.createElement('img');
            img.src = e.target.result;
            img.classList.add('w-16', 'h-16', 'object-cover', 'rounded-md', 'flex-shrink-0');
            img.title = file.name;

            const fileNameSpan = document.createElement('span');
            fileNameSpan.textContent = file.name;
            fileNameSpan.classList.add('text-gray-800', 'font-medium', 'break-all');

            const removeButton = document.createElement('button');
            removeButton.innerHTML = '&times;'; // Icône "X"
            removeButton.classList.add('ml-auto', 'text-red-500', 'hover:text-red-700', 'font-bold', 'text-lg', 'p-1', 'rounded-full', 'w-6', 'h-6', 'flex', 'items-center', 'justify-center', 'hover:bg-red-100');
            removeButton.title = 'Supprimer cette image';
            removeButton.addEventListener('click', () => {
                // Supprime l'image du tableau manhwaImageFiles
                manhwaImageFiles.splice(parseInt(li.dataset.index), 1);
                displayManhwaImagesPreview(); // Re-render l'aperçu
            });


            li.appendChild(img);
            li.appendChild(fileNameSpan);
            li.appendChild(removeButton); // Ajoute le bouton de suppression

            gridContainer.appendChild(li); // Ajoute l'élément li directement au gridContainer

            // --- GESTIONNAIRES D'ÉVÉNEMENTS POUR LE GLISSER-DÉPOSER sur les LI ---
            li.addEventListener('dragstart', (event) => {
                draggedItem = li;
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('text/plain', li.dataset.index); // Stocke l'index de l'élément glissé
                li.classList.add('opacity-50', 'border-2', 'border-blue-500'); // Visuel pendant le glisser
            });

            li.addEventListener('dragover', (event) => {
                event.preventDefault(); // Permet le dépôt
                event.dataTransfer.dropEffect = 'move';
                // Calcul de la moitié pour insérer avant ou après
                const targetRect = li.getBoundingClientRect();
                const offsetY = event.clientY - targetRect.top;
                const offsetX = event.clientX - targetRect.left;

                // Nettoie toutes les classes de survol des frères
                Array.from(li.parentNode.children).forEach(sibling => {
                    sibling.classList.remove('border-t-4', 'border-b-4', 'border-l-4', 'border-r-4', 'border-blue-300');
                });

                if (mergeOrientation === 'vertical') {
                    if (offsetY < targetRect.height / 2) {
                        li.classList.add('border-t-4', 'border-blue-300'); // Insérer avant
                    } else {
                        li.classList.add('border-b-4', 'border-blue-300'); // Insérer après
                    }
                } else { // horizontal
                    if (offsetX < targetRect.width / 2) {
                        li.classList.add('border-l-4', 'border-blue-300'); // Insérer avant
                    } else {
                        li.classList.add('border-r-4', 'border-blue-300'); // Insérer après
                    }
                }
            });

            li.addEventListener('dragleave', () => {
                li.classList.remove('border-t-4', 'border-b-4', 'border-l-4', 'border-r-4', 'border-blue-300');
            });

            li.addEventListener('drop', (event) => {
                event.preventDefault();
                li.classList.remove('border-t-4', 'border-b-4', 'border-l-4', 'border-r-4', 'border-blue-300');

                if (draggedItem && draggedItem !== li) {
                    const draggedIndex = parseInt(draggedItem.dataset.index);
                    let targetIndex = parseInt(li.dataset.index);

                    const targetRect = li.getBoundingClientRect();
                    const offsetY = event.clientY - targetRect.top;
                    const offsetX = event.clientX - targetRect.left;

                    // Ajuste l'index cible si on dépose après la moitié de l'élément
                    if (mergeOrientation === 'vertical') {
                        if (offsetY > targetRect.height / 2) {
                            targetIndex++;
                        }
                    } else { // horizontal
                        if (offsetX > targetRect.width / 2) {
                            targetIndex++;
                        }
                    }

                    // Assure que l'index cible ne dépasse pas la fin du tableau si on glisse vers le bas/droite
                    if (draggedIndex < targetIndex) {
                        targetIndex--; // Si on déplace vers la droite/bas, l'élément original est retiré, décalant les indices
                    }

                    // --- MISE À JOUR DE L'ORDRE DANS manhwaImageFiles ---
                    const [movedFile] = manhwaImageFiles.splice(draggedIndex, 1);
                    manhwaImageFiles.splice(targetIndex, 0, movedFile);

                    // --- RECONSTRUCTION DE L'AFFICHAGE ENTIER ---
                    displayManhwaImagesPreview(); // Appelle cette fonction pour reconstruire l'affichage
                }
            });

            li.addEventListener('dragend', () => {
                // Nettoyage de l'élément glissé
                if (draggedItem) {
                    draggedItem.classList.remove('opacity-50', 'border-2', 'border-blue-500');
                }
                draggedItem = null; // Réinitialise la variable globale

                // Nettoyage de toutes les bordures de survol au cas où dragleave n'ait pas été déclenché
                document.querySelectorAll('#manhwaImagesPreview li').forEach(item => {
                    item.classList.remove('border-t-4', 'border-b-4', 'border-l-4', 'border-r-4', 'border-blue-300');
                });
            });
        };
        reader.readAsDataURL(file);
    });

    // --- GESTIONNAIRES D'ÉVÉNEMENTS POUR LE GLISSER-DÉPOSER sur le CONTENEUR GLOBAL ---
    // Ces écouteurs gèrent le cas où l'on dépose un élément en dehors d'une miniature spécifique,
    // par exemple, pour le placer à la fin de la liste.
    manhwaImagesPreview.addEventListener('dragover', (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        // Ajoute un visuel si on survole la zone vide de l'aperçu
        if (!event.target.closest('li')) { // Si l'élément survolé n'est pas un 'li'
            manhwaImagesPreview.classList.add('border-2', 'border-dashed', 'border-blue-300');
        }
    });

    manhwaImagesPreview.addEventListener('dragleave', (event) => {
        // Ne supprime le style que si on quitte complètement la zone de preview
        if (!manhwaImagesPreview.contains(event.relatedTarget)) {
            manhwaImagesPreview.classList.remove('border-2', 'border-dashed', 'border-blue-300');
        }
    });

    manhwaImagesPreview.addEventListener('drop', (event) => {
        event.preventDefault();
        manhwaImagesPreview.classList.remove('border-2', 'border-dashed', 'border-blue-300');

        if (draggedItem) {
            const draggedIndex = parseInt(draggedItem.dataset.index);

            // Si l'élément est déposé directement sur le conteneur et non sur un li spécifique,
            // on le met à la fin
            if (!event.target.closest('li')) {
                const [movedFile] = manhwaImageFiles.splice(draggedIndex, 1);
                manhwaImageFiles.push(movedFile); // Ajoute à la fin
                displayManhwaImagesPreview();
            }
            // Si c'est déposé sur un li, l'écouteur du li gérera déjà ça.
        }
    });

    updateManhwaMergeButtonState();
}


// Gestion des boutons d'orientation Manhwa
orientationVerticalButton.addEventListener('click', () => {
    mergeOrientation = 'vertical';
    orientationVerticalButton.classList.remove('bg-gray-200', 'text-gray-700', 'border-gray-300'); // Supprime les styles inactifs
    orientationVerticalButton.classList.add('bg-blue-600', 'text-white', 'border-blue-500'); // Ajoute les styles actifs
    orientationHorizontalButton.classList.remove('bg-blue-600', 'text-white', 'border-blue-500'); // Supprime les styles actifs de l'autre bouton
    orientationHorizontalButton.classList.add('bg-gray-200', 'text-gray-700', 'border-gray-300'); // Ajoute les styles inactifs à l'autre bouton
    displayManhwaImagesPreview(); // Rafraîchit l'affichage au cas où la mise en évidence dépend de l'orientation
    updateManhwaMergeButtonState();
});

orientationHorizontalButton.addEventListener('click', () => {
    mergeOrientation = 'horizontal';
    orientationHorizontalButton.classList.remove('bg-gray-200', 'text-gray-700', 'border-gray-300');
    orientationHorizontalButton.classList.add('bg-blue-600', 'text-white', 'border-blue-500');
    orientationVerticalButton.classList.remove('bg-blue-600', 'text-white', 'border-blue-500');
    orientationVerticalButton.classList.add('bg-gray-200', 'text-gray-700', 'border-gray-300');
    displayManhwaImagesPreview(); // Rafraîchit l'affichage au cas où la mise en évidence dépend de l'orientation
    updateManhwaMergeButtonState();
});

resetManhwaButton.addEventListener('click', resetManhwaImages);


// Fonction de fusion des images Manhwa (avec gestion des chunks et ZIP)
async function mergeManhwaImages() {
    if (manhwaImageFiles.length === 0) {
        manhwaStatusMessage.textContent = "Veuillez sélectionner au moins une image.";
        manhwaStatusMessage.classList.add('text-red-500');
        return;
    }

    manhwaStatusMessage.textContent = "Préparation de la fusion...";
    manhwaStatusMessage.classList.remove('text-red-500', 'text-green-600');
    manhwaStatusMessage.classList.add('text-blue-600');
    manhwaDownloadLink.innerHTML = ''; // Efface tout lien de téléchargement précédent

    // Afficher la barre de chargement et le message
    manhwaLoadingBarContainer.classList.remove('hidden');
    manhwaZipLoadingMessage.classList.remove('hidden');
    manhwaZipLoadingMessage.textContent = "Chargement des images...";
    manhwaLoadingBar.style.width = '0%';

    const allLoadedImages = [];

    // Créer une liste de promesses pour charger toutes les images
    const imageLoadPromises = manhwaImageFiles.map(file => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                img._objectURL = img.src; // Stocke l'URL de l'objet pour la révoquer plus tard
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

    const mergedManhwaBlobs = [];
    let currentImageIndex = 0;
    let partNumber = 1;
    let currentChunkSize = MAX_IMAGES_PER_CHUNK;

    while (currentImageIndex < allLoadedImages.length) {
        let success = false;
        // Boucle interne pour réessayer avec des tailles de chunk réduites
        while (!success && currentChunkSize >= 1) {
            const chunkImages = allLoadedImages.slice(currentImageIndex, currentImageIndex + currentChunkSize);

            if (chunkImages.length === 0) {
                success = true;
                break; // Pas d'images dans ce chunk, passer au suivant
            }

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

            ctx.fillStyle = '#FFFFFF'; // Fond blanc
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
                        canvas.toBlob((b) => {
                            resolve(b);
                        }, 'image/jpeg', 0.7); // Export en JPEG avec 70% de qualité
                    }, 0);
                });

                if (blob && blob.size > 0) {
                    const partFileName = `${String(partNumber).padStart(2, '0')}.jpg`; // Extension .jpg
                    mergedManhwaBlobs.push({ blob: blob, name: partFileName });
                    currentImageIndex += chunkImages.length;
                    partNumber++;
                    success = true;
                    currentChunkSize = MAX_IMAGES_PER_CHUNK; // Réinitialise la taille de chunk si succès
                } else {
                    throw new Error("Blob generation failed or resulted in an empty image.");
                }

            } catch (error) {
                console.warn(`Tentative de fusion de ${chunkImages.length} images échouée pour la partie ${partNumber}. Réduction du chunk. Erreur:`, error.message);
                currentChunkSize = Math.floor(currentChunkSize / 2) || 1; // Réduit la taille du chunk, minimum 1
                manhwaStatusMessage.textContent = `Taille de fusion réduite à ${currentChunkSize}. Réessai...`;
                // Petite pause pour éviter de bloquer le navigateur lors des réessais rapides
                await new Promise(r => setTimeout(r, 50));
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

    // --- Révocation de toutes les URL d'objet APRES que toutes les fusions sont terminées ---
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

        manhwaDownloadLink.appendChild(downloadLink); // Utilise l'ID corrigé
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

            manhwaDownloadLink.appendChild(downloadLink); // Utilise l'ID corrigé

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


// --- Initialisation au chargement du DOM ---
document.addEventListener('DOMContentLoaded', () => {
    // Initialisation: affiche la section "Merge Vinted" par défaut au chargement
    showSection(vintedMergerSection);
    updateMergeButtonState(); // S'assure que l'état initial du bouton Vinted est correct

    // Ajout des écouteurs pour les boutons de navigation latérale
    navVintedMerge.addEventListener('click', () => showSection(vintedMergerSection));
    navManhwaFusion.addEventListener('click', () => showSection(manhwaMergerSection));

    // Initialisation de l'état des boutons Manhwa au chargement
    // Simule un clic sur le bouton Vertical pour définir l'état initial visuel et la variable
    orientationVerticalButton.click(); // Ceci va aussi appeler updateManhwaMergeButtonState()
});
