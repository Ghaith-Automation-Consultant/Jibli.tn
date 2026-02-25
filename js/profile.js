document.addEventListener('DOMContentLoaded', async () => {
    // 1. Check Auth
    const token = JibliData.getToken();
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    // 2. Load User Data
    try {
        const user = await JibliData.getMe();
        populateProfile(user);
    } catch (error) {
        console.error("Error loading profile:", error);
        if (typeof showToast === 'function') showToast("Erreur lors du chargement du profil", "error");
    }

    // 3. Handle Avatar Upload
    document.getElementById('avatarInput').addEventListener('change', handleAvatarUpload);
});

let currentUser = null;

function populateProfile(user) {
    currentUser = user;

    // Header Info
    document.getElementById('profileName').textContent = user.name || 'Utilisateur';
    document.getElementById('profileJoinDate').textContent = `Membre depuis le ${new Date(user.createdAt).toLocaleDateString()}`;
    document.getElementById('profileAvatar').src = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0D9488&color=fff`;
    document.getElementById('navUserAvatar').src = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0D9488&color=fff`;

    // Stats (Mock or Real)
    // document.getElementById('profileRating').textContent = user.rating || '4.8'; 
    // document.getElementById('profileReviewCount').textContent = user.reviews ? user.reviews.length : 0;

    // Badges
    toggleBadge('badgeEmail', user.isEmailVerified);
    toggleBadge('badgePhone', user.isPhoneVerified);
    toggleBadge('badgeIdentity', user.isIdentityVerified);

    // Form Fields
    document.getElementById('inputName').value = user.name || '';
    document.getElementById('inputEmail').value = user.email || '';
    document.getElementById('inputPhone').value = user.phone || '';
    document.getElementById('inputLocation').value = user.location || '';
    document.getElementById('inputBio').value = user.bio || '';

    // Languages
    if (user.languages) {
        const checkboxes = document.querySelectorAll('input[name="languages"]');
        checkboxes.forEach(cb => {
            if (user.languages.includes(cb.value)) cb.checked = true;
        });
    }
}

function toggleBadge(id, isActive) {
    const el = document.getElementById(id);
    if (isActive) {
        el.classList.remove('bg-neutral-100', 'text-neutral-400');
        el.classList.add('bg-green-100', 'text-green-600');
    } else {
        el.classList.add('bg-neutral-100', 'text-neutral-400');
        el.classList.remove('bg-green-100', 'text-green-600');
    }
}

function switchTab(tabName) {
    // Update Sidebar
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-${tabName}`).classList.add('active');

    // Update Content
    ['info', 'security', 'verification', 'reviews', 'preferences'].forEach(t => {
        const panel = document.getElementById(`panel-${t}`);
        if (t === tabName) {
            panel.classList.remove('hidden');
        } else {
            panel.classList.add('hidden');
        }
    });
}

async function saveProfile() {
    if (!currentUser) return;

    const updates = {
        name: document.getElementById('inputName').value,
        phone: document.getElementById('inputPhone').value,
        location: document.getElementById('inputLocation').value,
        bio: document.getElementById('inputBio').value,
        languages: Array.from(document.querySelectorAll('input[name="languages"]:checked')).map(cb => cb.value)
    };

    try {
        const updatedUser = await JibliData.updateMe(updates);
        populateProfile(updatedUser); // Refresh UI
        // alert("Profil mis à jour !"); // Replace with toast if available
        if (typeof showToast === 'function') {
            showToast("Profil mis à jour avec succès !", "success");
        } else {
            alert("Profil mis à jour avec succès !");
        }
    } catch (error) {
        console.error("Update failed", error);
        alert("Erreur lors de la mise à jour.");
    }
}

function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
        alert("L'image est trop volumineuse (max 2MB).");
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        const base64Image = e.target.result;

        // Optimistically update UI
        document.getElementById('profileAvatar').src = base64Image;
        document.getElementById('navUserAvatar').src = base64Image;

        // Save to backend
        try {
            await JibliData.updateMe({ avatar: base64Image });
            if (typeof showToast === 'function') showToast("Photo de profil mise à jour !", "success");
        } catch (error) {
            console.error("Avatar upload failed", error);
            // Revert on failure?
        }
    };
    reader.readAsDataURL(file);
}

async function changePassword() {
    event.preventDefault(); // Ensure we don't reload if it's in a form
    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const btn = document.querySelector('#passwordForm button[type="submit"]') || document.querySelector('#passwordForm button');
    const originalText = btn ? btn.innerHTML : 'Mettre à jour le mot de passe';

    if (!oldPassword || !newPassword) {
        showToast("Veuillez remplir tous les champs.", "error");
        return;
    }

    if (newPassword.length < 12) {
        showToast("Le nouveau mot de passe doit comporter au moins 12 caractères.", "error");
        return;
    }

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Mise à jour...';
    }

    try {
        await JibliData.changePassword(oldPassword, newPassword);
        showToast("Mot de passe modifié avec succès.", "success");
        document.getElementById('passwordForm').reset();
    } catch (error) {
        showToast(error.message, "error");
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }
}
