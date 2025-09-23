// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('nav ul');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            navMenu.classList.toggle('show');
        });
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (navMenu.classList.contains('show')) {
                    navMenu.classList.remove('show');
                }
            }
        });
    });
    
    // Initialize media gallery
    initMediaGallery();
    // Hero video and scripture
    initHeroVideo();
    initScripture();
    
    // Contact form submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Thank you for your message! We will get back to you soon.');
            this.reset();
        });
    }
    
    // Newsletter form submission
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            alert(`Thank you for subscribing with ${email}!`);
            this.reset();
        });
    }
});

// Media Gallery functionality
function initMediaGallery() {
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const clearGalleryBtn = document.getElementById('clearGallery');
    const mediaGallery = document.getElementById('mediaGallery');
    const editModal = document.getElementById('editModal');
    const editForm = document.getElementById('editForm');
    const closeModal = document.querySelector('.close');
    
    // Load gallery items from localStorage
    loadGalleryItems();
    
    // Upload button click handler
    if (uploadBtn) {
        uploadBtn.addEventListener('click', function() {
            fileInput.click();
        });
    }
    
    // File input change handler
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            if (this.files.length > 0) {
                uploadFiles(this.files);
                this.value = ''; // Reset file input
            }
        });
    }
    
    // Clear gallery button handler
    if (clearGalleryBtn) {
        clearGalleryBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to clear the entire gallery? This action cannot be undone.')) {
                clearGallery();
            }
        });
    }
    
    // Close modal when clicking the X
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            editModal.style.display = 'none';
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === editModal) {
            editModal.style.display = 'none';
        }
    });
    
    // Edit form submission handler
    if (editForm) {
        editForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveEdit();
        });
    }
    
    // Upload files to the gallery
    function uploadFiles(files) {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            // Check if file is an image or video
            if (!file.type.match('image.*') && !file.type.match('video.*')) {
                alert('Please upload only images or videos.');
                continue;
            }
            
            const reader = new FileReader();
            
            reader.onload = function(e) {
                // Create a new gallery item
                const galleryItem = createGalleryItem({
                    id: Date.now() + i,
                    src: e.target.result,
                    type: file.type.split('/')[0], // 'image' or 'video'
                    title: file.name,
                    description: '',
                    timestamp: new Date().toISOString()
                });
                
                // Add to gallery
                mediaGallery.appendChild(galleryItem);
                
                // Save to localStorage
                saveGalleryItem({
                    id: Date.now() + i,
                    src: e.target.result,
                    type: file.type.split('/')[0],
                    title: file.name,
                    description: '',
                    timestamp: new Date().toISOString()
                });
            };
            
            reader.readAsDataURL(file);
        }
        
        // Remove empty message if it exists
        const emptyMessage = mediaGallery.querySelector('.empty-gallery');
        if (emptyMessage) {
            emptyMessage.remove();
        }
    }
    
    // Create a gallery item element
    function createGalleryItem(item) {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.setAttribute('data-id', item.id);
        
        let mediaElement;
        if (item.type === 'image') {
            mediaElement = document.createElement('img');
            mediaElement.src = item.src;
            mediaElement.alt = item.title;
        } else {
            mediaElement = document.createElement('video');
            mediaElement.src = item.src;
            mediaElement.controls = true;
        }
        
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        overlay.innerHTML = `<h4>${item.title}</h4><p>${item.description || 'No description'}</p>`;
        
        const actions = document.createElement('div');
        actions.className = 'actions';
        
        const editBtn = document.createElement('button');
        editBtn.className = 'action-btn edit-btn';
        editBtn.innerHTML = '✏️';
        editBtn.title = 'Edit';
        editBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            openEditModal(item);
        });
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'action-btn delete-btn';
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.title = 'Delete';
        deleteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            deleteGalleryItem(item.id);
        });
        
        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
        
        galleryItem.appendChild(mediaElement);
        galleryItem.appendChild(overlay);
        galleryItem.appendChild(actions);
        
        return galleryItem;
    }
    
    // Open edit modal
    function openEditModal(item) {
        document.getElementById('editId').value = item.id;
        document.getElementById('editTitle').value = item.title;
        document.getElementById('editDescription').value = item.description || '';
        
        editModal.style.display = 'block';
    }
    
    // Save edit changes
    function saveEdit() {
        const id = parseInt(document.getElementById('editId').value);
        const title = document.getElementById('editTitle').value;
        const description = document.getElementById('editDescription').value;
        
        // Update the gallery item
        const galleryItem = document.querySelector(`.gallery-item[data-id="${id}"]`);
        if (galleryItem) {
            const overlay = galleryItem.querySelector('.overlay');
            overlay.innerHTML = `<h4>${title}</h4><p>${description || 'No description'}</p>`;
        }
        
        // Update localStorage
        updateGalleryItem(id, { title, description });
        
        // Close modal
        editModal.style.display = 'none';
        
        alert('Changes saved successfully!');
    }
    
    // Delete a gallery item
    function deleteGalleryItem(id) {
        if (confirm('Are you sure you want to delete this item?')) {
            const galleryItem = document.querySelector(`.gallery-item[data-id="${id}"]`);
            if (galleryItem) {
                galleryItem.remove();
            }
            
            // Remove from localStorage
            removeGalleryItem(id);
            
            // Show empty message if gallery is empty
            if (mediaGallery.children.length === 0) {
                const emptyMessage = document.createElement('div');
                emptyMessage.className = 'empty-gallery';
                emptyMessage.innerHTML = '<p>No media uploaded yet. Use the upload section above to add images or videos from previous services.</p>';
                mediaGallery.appendChild(emptyMessage);
            }
        }
    }
    
    // Clear the entire gallery
    function clearGallery() {
        mediaGallery.innerHTML = '';
        
        // Add empty message
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-gallery';
        emptyMessage.innerHTML = '<p>No media uploaded yet. Use the upload section above to add images or videos from previous services.</p>';
        mediaGallery.appendChild(emptyMessage);
        
        // Clear localStorage
        localStorage.removeItem('churchMediaGallery');
    }
    
    // Save gallery item to localStorage
    function saveGalleryItem(item) {
        let gallery = JSON.parse(localStorage.getItem('churchMediaGallery')) || [];
        gallery.push(item);
        localStorage.setItem('churchMediaGallery', JSON.stringify(gallery));
    }
    
    // Load gallery items from localStorage
    function loadGalleryItems() {
        const gallery = JSON.parse(localStorage.getItem('churchMediaGallery')) || [];
        
        if (gallery.length > 0) {
            // Remove empty message if it exists
            const emptyMessage = mediaGallery.querySelector('.empty-gallery');
            if (emptyMessage) {
                emptyMessage.remove();
            }
            
            // Add gallery items
            gallery.forEach(item => {
                const galleryItem = createGalleryItem(item);
                mediaGallery.appendChild(galleryItem);
            });
        }
    }
    
    // Update gallery item in localStorage
    function updateGalleryItem(id, updates) {
        let gallery = JSON.parse(localStorage.getItem('churchMediaGallery')) || [];
        const index = gallery.findIndex(item => item.id === id);
        
        if (index !== -1) {
            gallery[index] = { ...gallery[index], ...updates };
            localStorage.setItem('churchMediaGallery', JSON.stringify(gallery));
        }
    }
    
    // Remove gallery item from localStorage
    function removeGalleryItem(id) {
        let gallery = JSON.parse(localStorage.getItem('churchMediaGallery')) || [];
        gallery = gallery.filter(item => item.id !== id);
        localStorage.setItem('churchMediaGallery', JSON.stringify(gallery));
    }
}

// Hero video: prefer first uploaded video, else fallback ambient worship
function initHeroVideo() {
    const el = document.getElementById('heroVideo');
    if (!el) return;
    try {
        const gallery = JSON.parse(localStorage.getItem('churchMediaGallery')) || [];
        const firstVideo = gallery.find(item => item.type === 'video');
        if (firstVideo && firstVideo.src) {
            el.src = firstVideo.src;
            return;
        }
    } catch (_) {}
    el.src = 'https://cdn.coverr.co/videos/coverr-worship-hands-raising-9696/1080p.mp4';
}

// Scripture rotator with salvation-focused verses
function initScripture() {
    const el = document.getElementById('scriptureText');
    if (!el) return;
    const verses = [
        '“For God so loved the world that he gave his one and only Son...” — John 3:16',
        '“Everyone who calls on the name of the Lord will be saved.” — Romans 10:13',
        '“Believe in the Lord Jesus, and you will be saved.” — Acts 16:31',
        '“If anyone is in Christ, the new creation has come.” — 2 Corinthians 5:17'
    ];
    let i = 0;
    setInterval(() => {
        i = (i + 1) % verses.length;
        el.textContent = verses[i];
    }, 7000);
}