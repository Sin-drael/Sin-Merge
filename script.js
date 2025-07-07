document.addEventListener('DOMContentLoaded', () => {
    // --- Éléments de navigation et de section ---
    const navVintedMergeButton = document.getElementById('navVintedMerge');
    const navManhwaFusionButton = document.getElementById('navManhwaFusion');
    const vintedMergerSection = document.getElementById('vintedMergerSection');
    const manhwaMergerSection = document.getElementById('manhwaMergerSection');

    // --- Éléments spécifiques à la section Vinted Merge ---
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
    const selectManhwaImagesButton = document.getElementById('selectManhwaImagesButton');
    const manhwaImagesFileNames = document.getElementById('manhwaImagesFileNames');
    const manhwaImagesPreview = document.getElementById('manhwaImagesPreview');
    const orientationHorizontalButton = document.getElementById('orientationHorizontal');
    const orientationVerticalButton = document.getElementById('orientationVertical');

    // Références aux éléments de la barre de chargement spécifiques à la fusion Manhwa
    const manhwaLoadingBarContainer = document.getElementById('manhwaLoadingBarContainer');
    const manhwaLoadingBar = document.getElementById('manhwaLoadingBar');
    const manhwaZipLoadingMessage = document.getElementById('manhwaZipLoadingMessage');

    // Référence au bouton Reset Manhwa
    const resetManhwaButton = document.getElementById('resetManhwaButton');
    const manhwaStatusMessage = document.getElementById('manhwaStatusMessage');
    const manhwaDownloadLinkContainer = document.getElementById('manhwaDownloadLink');

    const mergeManhwaButton = document.getElementById('mergeManhwaButton');


    let manhwaImageFiles = [];
    let mergeOrientation = 'vertical'; // Par défaut, la fusion est verticale
    let draggedElement = null; // Élément en cours de glissement pour le drag-and-drop
    let dropTargetIndicator = null; // Pour suivre l'élément où l'indicateur est affiché

    // Taille maximale des images à fusionner par partie
    const MAX_IMAGES_PER_CHUNK = 50;

    // Références aux éléments de la barre de chargement (pour la section Vinted Merge / Global si Manhwa utilise les mêmes IDs)
    const loadingBarContainer = document.getElementById('loadingBarContainer');
    const loadingBar = document.getElementById('loadingBar');
    const zipLoadingMessage = document.getElementById('zipLoadingMessage');

    let overlayImage = null;
    let backgroundImageFiles = [];
    let mergedImageBlobs = [];

    // --- Fonctions de gestion des sections ---

    // Fonction pour masquer toutes les sections
    const hideAllSections = () => {
        vintedMergerSection.classList.add('hidden');
        manhwaMergerSection.classList.add('hidden');
    };

    // Fonction pour afficher une section spécifique
    const showSection = (sectionElement) => {
        hideAllSections();
        sectionElement.classList.remove('hidden');
    };

    // --- Initialisation des écouteurs d'événements pour la navigation ---
    navVintedMergeButton.addEventListener('click', () => {
        showSection(vintedMergerSection);
    });

    navManhwaFusionButton.addEventListener('click', () => {
        showSection(manhwaMergerSection);
    });

    // --- Fin des sections de navigation ---


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
        loadingBarContainer.classList.add('hidden');
        zipLoadingMessage.classList.add('hidden');
        loadingBar.style.width = '0%';
    };

    // Fonction pour mettre à jour l'état du bouton de fusion Manhwa
    const updateManhwaMergeButtonState = () => {
        if (manhwaImageFiles.length > 0 && mergeOrientation) {
            mergeManhwaButton.disabled = false;
            mergeManhwaButton.classList.remove('bg-green-400', 'cursor-not-allowed');
            mergeManhwaButton.classList.add('bg-green-600', 'hover:bg-green-700');
        } else {
            mergeManhwaButton.disabled = true;
            mergeManhwaButton.classList.remove('bg-green-600', 'hover:bg-green-700');
            mergeManhwaButton.classList.add('bg-green-400', 'cursor-not-allowed');
        }
        manhwaDownloadLinkContainer.innerHTML = '';
        manhwaStatusMessage.textContent = '';
    };

    // Fonction pour réinitialiser la section Manhwa Fusion
    const resetManhwaImages = () => {
        manhwaImageFiles = [];

        manhwaImagesInput.value = '';

        manhwaImagesFileNames.textContent = 'Aucun fichier sélectionné.';

        manhwaImagesPreview.innerHTML = '<span class="text-gray-400">Aperçu des images</span>';

        orientationVerticalButton.click();

        manhwaStatusMessage.textContent = '';
        manhwaStatusMessage.classList.remove('text-red-500', 'text-green-600', 'text-blue-600');

        manhwaDownloadLinkContainer.innerHTML = '';

        manhwaLoadingBarContainer.classList.add('hidden');
        manhwaZipLoadingMessage.classList.add('hidden');
        manhwaLoadingBar.style.width = '0%';

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

                    let imgDrawWidth = imgOriginalWidth;
                    let imgDrawHeight = imgOriginalHeight;
                    let imgOffsetX = 0;
                    let imgOffsetY = 0;

                    let canvasWidth;
                    let canvasHeight;

                    if (imgAspectRatio <= 1) {
                        const MAX_FINAL_HEIGHT = 1020;

                        let scale = 1;
                        if (imgOriginalHeight > MAX_FINAL_HEIGHT) {
                            scale = MAX_FINAL_HEIGHT / imgOriginalHeight;
                        }
                        imgDrawWidth = imgOriginalWidth * scale;
                        imgDrawHeight = imgOriginalHeight * scale;

                        canvasWidth = imgDrawWidth;
                        canvasHeight = imgDrawHeight;

                        imgOffsetX = 0;
                        imgOffsetY = 0;

                    } else {
                        const MAX_FINAL_HEIGHT = 1020;

                        canvasHeight = MAX_FINAL_HEIGHT;
                        canvasWidth = canvasHeight * overlayAspectRatio;

                        let scale = Math.min(canvasWidth / imgOriginalWidth, canvasHeight / imgOriginalHeight);
                        imgDrawWidth = imgOriginalWidth * scale;
                        imgDrawHeight = imgOriginalHeight * scale;

                        imgOffsetX = (canvasWidth - imgDrawWidth) / 2;
                        imgOffsetY = (canvasHeight - imgDrawHeight) / 2;
                    }

                    canvas.width = canvasWidth;
                    canvas.height = canvasHeight;

                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    ctx.drawImage(img, imgOffsetX, imgOffsetY, imgDrawWidth, imgDrawHeight);

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
                    resolve();
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

    selectManhwaImagesButton.addEventListener('click', () => {
        manhwaImagesInput.click();
    });

    manhwaImagesInput.addEventListener('change', async (event) => {
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
            manhwaImagesFileNames.textContent = manhwaImageFiles.length === 1 ? manhwaImageFiles[0].name : `${manhwaImageFiles.length} fichiers sélectionnés.`;

            // Utilisation de Promise.all pour charger toutes les images en parallèle
            const loadPromises = manhwaImageFiles.map(file => {
                return new Promise(resolve => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const img = new Image();
                        img.onload = () => {
                            resolve({ file, src: e.target.result, imgElement: img }); // Retourne le fichier, la source et l'élément Image
                        };
                        img.onerror = () => {
                            console.error(`Erreur de chargement de l'image de prévisualisation: ${file.name}`);
                            resolve(null); // Gérer les erreurs de chargement d'image
                        };
                        img.src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                });
            });

            const loadedImages = await Promise.all(loadPromises);

            loadedImages.forEach(result => {
                if (result) { // Si l'image a été chargée avec succès
                    const { file, src, imgElement } = result;

                    const thumbnailWrapper = document.createElement('div');
                    thumbnailWrapper.classList.add('flex', 'flex-col', 'items-center', 'manhwa-thumbnail-wrapper', 'cursor-grab', 'p-1');
                    
                    const imgContainer = document.createElement('div');
                    imgContainer.classList.add(
                        'relative', 'w-24', 'h-24', 'object-cover', 'rounded-md', 'shadow-sm',
                        'overflow-hidden', 'flex-shrink-0'
                    );
                    imgContainer.draggable = true;
                    imgContainer.dataset.originalIndex = manhwaImageFiles.indexOf(file);
                    imgContainer.dataset.fileKey = `${file.name}-${file.size}-${file.lastModified}`;

                    imgElement.classList.add('w-full', 'h-full', 'object-cover', 'pointer-events-none');
                    imgContainer.appendChild(imgElement);
                    thumbnailWrapper.appendChild(imgContainer);

                    const fileNameSpan = document.createElement('span');
                    fileNameSpan.classList.add('text-xs', 'text-gray-500', 'mt-1', 'w-24', 'truncate', 'text-center');
                    fileNameSpan.textContent = file.name;
                    thumbnailWrapper.appendChild(fileNameSpan);

                    manhwaImagesPreview.appendChild(thumbnailWrapper);
                }
            });

        } else {
            manhwaImagesFileNames.textContent = 'Aucun fichier sélectionné.';
            manhwaImagesPreview.innerHTML = '<span class="text-gray-400">Aperçu des images</span>';
        }
        updateManhwaMergeButtonState();
        event.target.value = '';
    });

    // --- Logique de Drag & Drop pour ManhwaImagesPreview ---

    manhwaImagesPreview.addEventListener('dragstart', (e) => {
        const targetWrapper = e.target.closest('.manhwa-thumbnail-wrapper');
        if (targetWrapper) {
            draggedElement = targetWrapper;
            draggedElement.classList.add('opacity-50', 'border-2', 'border-blue-500');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', draggedElement.querySelector('[data-file-key]').dataset.fileKey);
        }
    });

    manhwaImagesPreview.addEventListener('dragover', (e) => {
        e.preventDefault();
        const targetWrapper = e.target.closest('.manhwa-thumbnail-wrapper');

        if (draggedElement && targetWrapper && targetWrapper !== draggedElement) {
            if (dropTargetIndicator && dropTargetIndicator !== targetWrapper) {
                dropTargetIndicator.querySelector('.relative').classList.remove('border-l-4', 'border-r-4', 'border-blue-500');
            }
            targetWrapper.querySelector('.relative').classList.remove('border-l-4', 'border-r-4', 'border-blue-500');

            const targetRect = targetWrapper.getBoundingClientRect();
            const mouseX = e.clientX;
            const center = targetRect.left + targetRect.width / 2;

            if (mouseX < center) {
                targetWrapper.querySelector('.relative').classList.add('border-l-4', 'border-blue-500');
            } else {
                targetWrapper.querySelector('.relative').classList.add('border-r-4', 'border-blue-500');
            }
            dropTargetIndicator = targetWrapper;
            e.dataTransfer.dropEffect = 'move';
        } else if (draggedElement && e.target === manhwaImagesPreview && manhwaImagesPreview.children.length === 0) {
            manhwaImagesPreview.classList.add('border-2', 'border-blue-500', 'border-dashed');
            e.dataTransfer.dropEffect = 'move';
        } else if (draggedElement && !targetWrapper && e.target === manhwaImagesPreview && manhwaImagesPreview.querySelector('.manhwa-thumbnail-wrapper')) {
            // Dragging over the main preview area, but not directly over a thumbnail
            // Remove any existing indicators
            if (dropTargetIndicator) {
                dropTargetIndicator.querySelector('.relative').classList.remove('border-l-4', 'border-r-4', 'border-blue-500');
                dropTargetIndicator = null;
            }
             // Optional: Add a general border to the preview area if nothing else is highlighted
            manhwaImagesPreview.classList.add('border-2', 'border-blue-500', 'border-dashed');
            e.dataTransfer.dropEffect = 'move';
        }
    });

    manhwaImagesPreview.addEventListener('dragleave', (e) => {
        if (dropTargetIndicator) {
            dropTargetIndicator.querySelector('.relative').classList.remove('border-l-4', 'border-r-4', 'border-blue-500');
            dropTargetIndicator = null;
        }
        // Only remove dashed border from preview if not hovering a thumbnail
        if (!e.relatedTarget || !e.relatedTarget.closest('.manhwa-thumbnail-wrapper')) {
            manhwaImagesPreview.classList.remove('border-2', 'border-blue-500', 'border-dashed');
        }
    });

    manhwaImagesPreview.addEventListener('drop', (e) => {
        e.preventDefault();
        if (draggedElement) {
            if (dropTargetIndicator) {
                dropTargetIndicator.querySelector('.relative').classList.remove('border-l-4', 'border-r-4', 'border-blue-500');
                dropTargetIndicator = null;
            }
            manhwaImagesPreview.classList.remove('border-2', 'border-blue-500', 'border-dashed');

            let targetWrapper = e.target.closest('.manhwa-thumbnail-wrapper');

            // Handle drop into an empty preview area
            if (!targetWrapper && manhwaImagesPreview.children.length === 0) {
                manhwaImagesPreview.appendChild(draggedElement);
            } else if (targetWrapper && targetWrapper !== draggedElement) {
                const wrappers = Array.from(manhwaImagesPreview.children).filter(el => el.classList.contains('manhwa-thumbnail-wrapper'));
                const draggedIndexDOM = wrappers.indexOf(draggedElement);
                let targetIndexDOM = wrappers.indexOf(targetWrapper);

                const targetRect = targetWrapper.getBoundingClientRect();
                const mouseX = e.clientX;
                const center = targetRect.left + targetRect.width / 2;

                if (mouseX > center) {
                    // Drop to the right of the target thumbnail
                    manhwaImagesPreview.insertBefore(draggedElement, wrappers[targetIndexDOM + 1]);
                } else {
                    // Drop to the left of the target thumbnail
                    manhwaImagesPreview.insertBefore(draggedElement, wrappers[targetIndexDOM]);
                }
            }
            
            // Reorder the underlying manhwaImageFiles array based on the new DOM order
            const newOrderedManhwaFiles = [];
            Array.from(manhwaImagesPreview.children).forEach(wrapper => {
                const keyElement = wrapper.querySelector('[data-file-key]');
                if (keyElement) { // S'assurer que l'élément avec data-file-key existe
                    const key = keyElement.dataset.fileKey;
                    const file = manhwaImageFiles.find(f => `${f.name}-${f.size}-${f.lastModified}` === key);
                    if (file) {
                        newOrderedManhwaFiles.push(file);
                    }
                }
            });
            manhwaImageFiles = newOrderedManhwaFiles;
            updateManhwaMergeButtonState(); // Mettre à jour l'état du bouton de fusion après réordonnancement
        }
    });

    manhwaImagesPreview.addEventListener('dragend', () => {
        if (draggedElement) {
            draggedElement.classList.remove('opacity-50', 'border-2', 'border-blue-500');
            document.querySelectorAll('.manhwa-thumbnail-wrapper .relative').forEach(thumbImgContainer => {
                thumbImgContainer.classList.remove('border-l-4', 'border-r-4', 'border-blue-500');
            });
            manhwaImagesPreview.classList.remove('border-2', 'border-blue-500', 'border-dashed');
            draggedElement = null;
            dropTargetIndicator = null;
        }
    });

    // --- FIN Logique de Drag & Drop pour ManhwaImagesPreview ---

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

            const zipFileName = `images_fusionnees_${Date.now()}.zip`;

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
        manhwaDownloadLinkContainer.innerHTML = '';

        manhwaLoadingBarContainer.classList.remove('hidden');
        manhwaZipLoadingMessage.classList.remove('hidden');
        manhwaZipLoadingMessage.textContent = "Chargement des images...";
        manhwaLoadingBar.style.width = '0%';

        const allLoadedImages = [];

        const imageLoadPromises = manhwaImageFiles.map(file => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    img._objectURL = img.src;
                    resolve(img);
                };
                img.onerror = () => {
                    console.error("Erreur de chargement de l'image:", file.name);
                    resolve(null);
                };
                img.src = URL.createObjectURL(file);
            });
        });

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
            while (!success && currentChunkSize >= 1) {
                const chunkImages = allLoadedImages.slice(currentImageIndex, currentImageIndex + currentChunkSize);

                if (chunkImages.length === 0) {
                    success = true;
                    break;
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
                            canvas.toBlob((b) => {
                                resolve(b);
                            }, 'image/jpeg', 0.7);
                        }, 0);
                    });

                    if (blob && blob.size > 0) {
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

        allLoadedImages.forEach(img => {
            if (img._objectURL) {
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
    mergeManhwaButton.addEventListener('click', mergeManhwaImages);

    // Initialisation
    showSection(vintedMergerSection);
    updateMergeButtonState();

    orientationVerticalButton.click();
    updateManhwaMergeButtonState();
});
