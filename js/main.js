document.addEventListener('DOMContentLoaded', function () {
    checkAuthStatus();

    if (typeof bootstrap !== 'undefined') {
        const tooltipTriggerList = Array.from(
            document.querySelectorAll('[data-bs-toggle="tooltip"]')
        );
        tooltipTriggerList.forEach(function (tooltipTriggerEl) {
            new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
});

function checkAuthStatus() {
    const isLoggedIn = localStorage.getItem('loggedIn') === 'true';

    const loginLink = document.querySelector('a[href="/login"]');
    const accountLink = document.querySelector('a[href="/my-account"]');
    const logoutBtn = document.getElementById('logoutBtn');

    if (isLoggedIn) {
        if (loginLink) loginLink.style.display = 'none';
        if (accountLink) accountLink.style.display = 'block';
        if (logoutBtn) logoutBtn.addEventListener('click', logout);
    } else {
        if (loginLink) loginLink.style.display = 'block';
        if (accountLink) accountLink.style.display = 'none';

        // Redirection si l'utilisateur non authentifié essaie d'accéder à une page protégée
        if (window.location.pathname === '/my-account') {
            window.location.href = '/login';
        }
    }
}

function logout(e) {
    e.preventDefault();

    // Effacer les données d'authentification
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');

    // Rediriger vers la page de login (la route React)
    window.location.href = '/login';
}
