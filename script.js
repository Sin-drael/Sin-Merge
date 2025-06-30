// script.js

document.addEventListener('DOMContentLoaded', () => {
    const overlayInput = document.getElementById('overlayInput');
    const selectOverlayButton = document.getElementById('selectOverlayButton'); // Nouvelle variable
    const overlayFileName = document.getElementById('overlayFileName');      // Nouvelle variable
    const backgroundsInput = document.getElementById('backgroundsInput');
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

    // Step 4: Handle the click on the custom "Choose a file..." button for the overlay
    selectOverlayButton.addEventListener('click', () => {
        overlayInput.click(); // This simulates a click on the hidden file input
    });

    // Step 5: Read the overlay file and update its display
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

    // Read background files
    backgroundsInput.addEventListener('change', (event) => {
        backgroundImageFiles = Array.from(event.target.files).filter(file => file.type.startsWith('image/'));
        backgroundsPreview.innerHTML = ''; // Clear the previous preview
        if (backgroundImageFiles.length > 0) {
            backgroundImageFiles.forEach(file => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.classList.add('w-24', 'h-24', 'object-cover', 'rounded-md', 'shadow-sm'); // Tailwind classes for preview
                    backgroundsPreview.appendChild(img);
                };
                reader.readAsDataURL(file);
            });
        } else {
            backgroundsPreview.innerHTML = '<span class="text-gray-400">Aperçu des fonds</span>';
        }
        updateMergeButtonState();
    });

    // Merge function
    mergeButton.addEventListener('click', async () => {
        if (!overlayImage || backgroundImageFiles.length === 0) {
            statusMessage.textContent = "Veuillez sélectionner un calque et au moins une image de fond.";
            statusMessage.classList.add('text-red-500');
            return;
        }

        statusMessage.textContent = "Fusion en cours...";
        statusMessage.classList.remove('text-red-500');
        statusMessage.classList.add('text-blue-600');
        downloadLinks.innerHTML = ''; // Clear previous download links

        // Create a canvas for merging
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Ensure the canvas has the size of the overlay image
        canvas.width = overlayImage.naturalWidth;
        canvas.height = overlayImage.naturalHeight;

        for (const file of backgroundImageFiles) {
            statusMessage.textContent = `Fusion de ${file.name}...`;

            const img = new Image();
            img.src = URL.createObjectURL(file);

            await new Promise(resolve => {
                img.onload = () => {
                    // Clear the canvas for each new merge
                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    // Draw the background image (scaled to fit)
                    // It's crucial to draw the background image BEFORE the overlay
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height); // Resizes background to match overlay

                    // Draw the overlay on top
                    ctx.drawImage(overlayImage, 0, 0, canvas.width, canvas.height);

                    // Convert the canvas to a PNG image
                    canvas.toBlob((blob) => {
                        const url = URL.createObjectURL(blob);
                        const downloadLink = document.createElement('a');
                        downloadLink.href = url;
                        downloadLink.download = `fusion_${file.name.split('.')[0]}.png`; // Output file name
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

    // Initialize button state on page load
    updateMergeButtonState();
});
