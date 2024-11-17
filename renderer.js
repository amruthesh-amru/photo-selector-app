const gallery = document.getElementById('gallery');
const fullscreenContainer = document.getElementById('full-screen-container');
const fullscreenImage = document.getElementById('fullscreen-image');
const prevPhotoButton = document.getElementById('prev-photo');
const nextPhotoButton = document.getElementById('next-photo');
const closeFullscreenButton = document.getElementById('close-fullscreen');
const selectFullscreenButton = document.getElementById('select-fullscreen');

let currentFolder = '';
let imageFiles = [];
let selectedPhotos = [];
let currentIndex = 0;
let zoomLevel = 1; // Initial zoom level

// Select folder
document.getElementById('select-folder').addEventListener('click', async () => {
    const folderPath = await window.electronAPI.selectFolder();
    if (folderPath) {
        currentFolder = folderPath;
        loadPhotos();
    }
});

// Load photos in grid
function loadPhotos() {
    window.electronAPI.loadFiles(currentFolder).then((files) => {
        imageFiles = files.filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file));
        gallery.innerHTML = '';

        if (imageFiles.length === 0) {
            gallery.innerHTML = '<p>No images found in the selected folder.</p>';
            return;
        }

        imageFiles.forEach((file, index) => {
            const photoDiv = document.createElement('div');
            photoDiv.classList.add('photo');
            photoDiv.innerHTML = `
        <img src="file://${currentFolder}/${file}" alt="${file}" data-index="${index}" />
        <button class="select-button" data-index="${index}">Select</button>
      `;
            gallery.appendChild(photoDiv);

            // Double-click to open in full screen
            photoDiv.querySelector('img').addEventListener('dblclick', () => openFullscreen(index));

            // Select button functionality
            photoDiv.querySelector('.select-button').addEventListener('click', () => selectPhoto(index));
        });
    });
}

// Open fullscreen
function openFullscreen(index) {
    currentIndex = index;
    zoomLevel = 1; // Reset zoom level
    updateFullscreenImage();
    fullscreenContainer.style.display = 'flex';
}

// Update fullscreen image
function updateFullscreenImage() {
    fullscreenImage.src = `file://${currentFolder}/${imageFiles[currentIndex]}`;
    fullscreenImage.style.transform = `scale(${zoomLevel})`;
    const isSelected = selectedPhotos.includes(imageFiles[currentIndex]);
    selectFullscreenButton.textContent = isSelected ? 'Deselect' : 'Select';
}

// Close fullscreen
closeFullscreenButton.addEventListener('click', () => {
    fullscreenContainer.style.display = 'none';
});

// Navigate images
prevPhotoButton.addEventListener('click', () => {
    if (currentIndex > 0) {
        currentIndex--;
        updateFullscreenImage();
    }
});

nextPhotoButton.addEventListener('click', () => {
    if (currentIndex < imageFiles.length - 1) {
        currentIndex++;
        updateFullscreenImage();
    }
});

// Select photo in fullscreen
selectFullscreenButton.addEventListener('click', () => {
    selectPhoto(currentIndex);
    updateFullscreenImage();
});

// Select photo
function selectPhoto(index) {
    const file = imageFiles[index];
    const isSelected = selectedPhotos.includes(file);

    if (isSelected) {
        selectedPhotos = selectedPhotos.filter((photo) => photo !== file);
    } else {
        selectedPhotos.push(file);
    }

    // Update grid button if the image is deselected
    const button = gallery.querySelector(`.select-button[data-index="${index}"]`);
    if (button) {
        button.textContent = isSelected ? 'Select' : 'Deselect';
        button.style.backgroundColor = isSelected ? '' : 'green';
    }
}

// Zoom in/out functionality
fullscreenImage.addEventListener('wheel', (event) => {
    event.preventDefault();
    const zoomStep = 0.1;
    if (event.deltaY < 0) {
        zoomLevel = Math.min(zoomLevel + zoomStep, 3); // Max zoom 3x
    } else {
        zoomLevel = Math.max(zoomLevel - zoomStep, 0.5); // Min zoom 0.5x
    }
    fullscreenImage.style.transform = `scale(${zoomLevel})`;
});

// Navigate with arrow keys
document.addEventListener('keydown', (event) => {
    if (fullscreenContainer.style.display === 'flex') {
        if (event.key === 'ArrowLeft' && currentIndex > 0) {
            currentIndex--;
            updateFullscreenImage();
        } else if (event.key === 'ArrowRight' && currentIndex < imageFiles.length - 1) {
            currentIndex++;
            updateFullscreenImage();
        }
    }
});

// Save selected photos
document.getElementById('save-selected').addEventListener('click', () => {
    if (selectedPhotos.length === 0) {
        alert('No photos selected.');
        return;
    }

    window.electronAPI.saveSelectedPhotos(currentFolder, selectedPhotos).then((result) => {
        if (result.success) {
            alert(`Selected photos saved to: ${result.savedFolder}`);
        } else {
            alert('Failed to save selected photos.');
        }
    });
});
