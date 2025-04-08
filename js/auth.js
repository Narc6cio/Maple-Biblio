
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);
        
        const password = document.getElementById('password');
        const confirmPassword = document.getElementById('confirmPassword');
        
        if (password && confirmPassword) {
            confirmPassword.addEventListener('input', validatePasswordMatch);
        }
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const redirectUrl = urlParams.get('redirect');
    
    if (redirectUrl) {
        localStorage.setItem('redirectAfterLogin', redirectUrl);
    }
});

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const loginError = document.getElementById('loginError');
    
    if (!email || !password) {
        loginError.textContent = 'Please enter both email and password.';
        loginError.classList.remove('d-none');
        return;
    }
    
    const submitButton = this.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Logging in...';
    
    // In a real app, this would be an AJAX call to your PHP backend
    // For this example, we'll simulate the login process
    setTimeout(() => {
        // Simulating a successful login (in a real app, this would check credentials against the database)
        if (email === 'user@example.com' && password === 'password') {
            // Login successful
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('userId', '1');
            localStorage.setItem('userName', 'John Doe');
            
            // Check if there's a redirect URL
            const redirectUrl = localStorage.getItem('redirectAfterLogin');
            if (redirectUrl) {
                localStorage.removeItem('redirectAfterLogin');
                window.location.href = redirectUrl;
            } else {
                window.location.href = 'my-account.html';
            }
        } else {
            // Login failed
            loginError.textContent = 'Invalid email or password. Please try again.';
            loginError.classList.remove('d-none');
            
            // Reset button
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    }, 1000); // Simulate network delay
}

/**
 * Handle registration form submission
 */
function handleRegistration(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;
    const registerError = document.getElementById('registerError');
    
    // Basic validation
    if (!firstName || !lastName || !email || !password) {
        registerError.textContent = 'Please fill in all required fields.';
        registerError.classList.remove('d-none');
        return;
    }
    
    if (password !== confirmPassword) {
        registerError.textContent = 'Passwords do not match.';
        registerError.classList.remove('d-none');
        return;
    }
    
    if (!agreeTerms) {
        registerError.textContent = 'You must agree to the Terms of Service and Privacy Policy.';
        registerError.classList.remove('d-none');
        return;
    }
    
    // Show loading state
    const submitButton = this.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Registering...';
    
    // In a real app, this would be an AJAX call to your PHP backend
    // For this example, we'll simulate the registration process
    setTimeout(() => {
        // Simulating a successful registration (in a real app, this would validate and save to the database)
        
        // Registration successful
        localStorage.setItem('loggedIn', 'true');
        localStorage.setItem('userId', '1');
        localStorage.setItem('userName', firstName + ' ' + lastName);
        
        window.location.href = 'my-account.html';
    }, 1500); // Simulate network delay
}

/**
 * Validate that passwords match during registration
 */
function validatePasswordMatch() {
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    
    if (password.value !== confirmPassword.value) {
        confirmPassword.setCustomValidity('Passwords do not match');
    } else {
        confirmPassword.setCustomValidity('');
    }
}
