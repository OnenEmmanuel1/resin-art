// ============================================
// ResinArt AR - Client-Side JavaScript
// ============================================

document.addEventListener('DOMContentLoaded', function() {

    // ---- Toast Notification System ----
    const toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.cssText = 'position:fixed;top:90px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;';
    document.body.appendChild(toastContainer);

    window.showToast = function(message, type = 'success', duration = 4000) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
        const bgColor = type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#8b5cf6';
        
        toast.style.cssText = `
            background: var(--card-bg, #fff); color: var(--text-dark, #0f172a);
            padding: 16px 20px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.15);
            display: flex; align-items: center; gap: 12px; min-width: 300px; max-width: 400px;
            border-left: 4px solid ${bgColor}; transform: translateX(120%); transition: transform 0.3s ease;
            font-family: 'Outfit', sans-serif;
        `;
        toast.innerHTML = `<i class="fa-solid ${icon}" style="color:${bgColor};font-size:1.2rem"></i><span>${message}</span>`;
        
        toastContainer.appendChild(toast);
        requestAnimationFrame(() => { toast.style.transform = 'translateX(0)'; });
        
        setTimeout(() => {
            toast.style.transform = 'translateX(120%)';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    };

    // Convert existing Bootstrap alerts to toasts
    document.querySelectorAll('.alert').forEach(alert => {
        const msg = alert.textContent.trim();
        const type = alert.classList.contains('alert-danger') ? 'error' : 'success';
        if (msg) showToast(msg, type);
        alert.remove();
    });

    // ---- Navbar scroll effect ----
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
            } else {
                navbar.style.boxShadow = 'none';
            }
        });
    }

    // ---- Smooth scroll for anchor links ----
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ---- Animate elements on scroll ----
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.resin-card, .stat-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });

    // ---- Active nav link highlight ----
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || (href !== '/' && currentPath.startsWith(href))) {
            link.classList.add('active');
        }
    });

    // ---- Admin sidebar active state ----
    document.querySelectorAll('.admin-sidebar .nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || (href !== '/' && currentPath.startsWith(href))) {
            link.classList.add('active');
        }
    });

    // ---- Image zoom on product details ----
    const mainImage = document.getElementById('mainImage');
    if (mainImage) {
        mainImage.addEventListener('click', function() {
            if (this.style.transform === 'scale(1.5)') {
                this.style.transform = 'scale(1)';
                this.style.cursor = 'zoom-in';
            } else {
                this.style.transform = 'scale(1.5)';
                this.style.cursor = 'zoom-out';
            }
        });
    }

    // ---- Confirm delete actions ----
    document.querySelectorAll('form[onsubmit]').forEach(form => {
        // Already handled inline, but we keep this for safety
    });

    // ---- Real-time Notifications & Socket.IO ----
    if (typeof io !== 'undefined') {
        const socket = io();
        
        // Check for unread notifications on load
        const notifBadge = document.getElementById('notif-count');
        const notifBell = document.getElementById('notif-bell');
        
        if (notifBadge && notifBell) {
            fetch('/notifications/unread-count')
                .then(res => res.json())
                .then(data => {
                    if (data.count > 0) {
                        notifBadge.textContent = data.count;
                        notifBadge.classList.remove('d-none');
                        notifBell.querySelector('i').classList.remove('fa-regular');
                        notifBell.querySelector('i').classList.add('fa-solid', 'fa-shake');
                    }
                })
                .catch(err => console.error(err));
                
            socket.on('new_notification', function(data) {
                showToast(data.message, 'info');
                notifBadge.textContent = parseInt(notifBadge.textContent || 0) + 1;
                notifBadge.classList.remove('d-none');
                notifBell.querySelector('i').classList.remove('fa-regular');
                notifBell.querySelector('i').classList.add('fa-solid', 'fa-shake');
            });
        }
    }

    console.log('ResinArt AR system initialized.');
});
