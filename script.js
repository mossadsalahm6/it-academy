document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation links
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all animated elements
    const animatedElements = document.querySelectorAll('.slide-in-left, .slide-in-right, .slide-in-up, .bounce-in, .zoom-in');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        observer.observe(el);
    });

    // Form handling
    const form = document.getElementById('registrationForm');
    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();

            // Get form values
            const firstName = document.getElementById('firstName').value.trim();
            const lastName = document.getElementById('lastName').value.trim();
            const college = document.getElementById('college').value.trim();
            const grade = document.getElementById('grade').value;
            const phone = document.getElementById('phone').value.trim();

            // Validation
            if (!firstName || !lastName || !college || !grade || !phone) {
                showNotification('الرجاء ملء جميع الحقول المطلوبة.', 'error');
                return;
            }

            // Phone validation (Egyptian numbers)
            const phoneRegex = /^(010|011|012|015)[0-9]{8}$/;
            if (!phoneRegex.test(phone)) {
                showNotification('الرجاء إدخال رقم هاتف مصري صحيح.', 'error');
                return;
            }

            // Success animation
            const submitButton = document.querySelector('.submit-button');
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التسجيل...';
            submitButton.disabled = true;

            // Submit to Google Forms
            submitToGoogleForms(firstName, lastName, college, grade, phone)
                .then(() => {
                    showNotification('تم تسجيلك بنجاح! سنتواصل معك قريباً. لا تنس الانضمام لجروب الواتساب.', 'success');
                    
                    // Show WhatsApp group link after successful registration
                    setTimeout(() => {
                        const groupNotification = document.createElement('div');
                        groupNotification.innerHTML = `
                            <div style="
                                position: fixed;
                                top: 50%;
                                left: 50%;
                                transform: translate(-50%, -50%);
                                background: linear-gradient(135deg, #25d366, #128c7e);
                                color: white;
                                padding: 30px;
                                border-radius: 20px;
                                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                                z-index: 1001;
                                text-align: center;
                                max-width: 400px;
                                animation: bounceIn 0.5s ease-out;
                            ">
                                <i class="fab fa-whatsapp" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                                <h3 style="margin: 0 0 1rem 0;">انضم لجروب الواتساب</h3>
                                <p style="margin: 0 0 2rem 0;">للحصول على آخر التحديثات والتواصل مع المدربين</p>
                                <a href="https://chat.whatsapp.com/FzG15yl0iXWAtp55JF6Kaw?mode=ac_c" target="_blank" 
                                   style="
                                       background: white;
                                       color: #25d366;
                                       padding: 12px 25px;
                                       border-radius: 25px;
                                       text-decoration: none;
                                       font-weight: bold;
                                       display: inline-block;
                                       margin-right: 10px;
                                   ">انضم الآن</a>
                                <button onclick="this.parentElement.parentElement.remove()" 
                                        style="
                                            background: transparent;
                                            color: white;
                                            border: 2px solid white;
                                            padding: 12px 25px;
                                            border-radius: 25px;
                                            cursor: pointer;
                                            font-weight: bold;
                                        ">لاحقاً</button>
                            </div>
                            <div style="
                                position: fixed;
                                top: 0;
                                left: 0;
                                width: 100%;
                                height: 100%;
                                background: rgba(0,0,0,0.5);
                                z-index: 1000;
                            " onclick="this.parentElement.remove()"></div>
                        `;
                        document.body.appendChild(groupNotification);
                    }, 3000);
                    
                    form.reset();
                })
                .catch((error) => {
                    console.error('Error submitting form:', error);
                    showNotification('حدث خطأ أثناء التسجيل. الرجاء المحاولة مرة أخرى.', 'error');
                })
                .finally(() => {
                    submitButton.innerHTML = 'سجل الآن';
                    submitButton.disabled = false;
                });
        });
    }

    // Function to submit data to Google Forms
    function submitToGoogleForms(firstName, lastName, college, grade, phone) {
        return new Promise((resolve, reject) => {
            const formData = new FormData();
            
            // Google Forms entry IDs (extracted from the form)
            formData.append('entry.776836534', firstName);      // الاسم
            formData.append('entry.2020564483', lastName);      // الاسم الثاني
            formData.append('entry.831504130', college);        // الكلية/المعهد
            formData.append('entry.992635013', grade);          // الفرقة
            formData.append('entry.943928125', phone);          // رقم الهاتف

            // Google Forms submit URL
            const submitURL = 'https://docs.google.com/forms/d/e/1FAIpQLSdwl6KijLvOOEzDhL-zT6eefT-SIGSQEje_pRZmFZYCJgxIqQ/formResponse';

            fetch(submitURL, {
                method: 'POST',
                body: formData,
                mode: 'no-cors' // Required for Google Forms
            })
            .then(() => {
                // Since we're using no-cors mode, we can't check the response
                // but if no error is thrown, we assume success
                resolve();
            })
            .catch((error) => {
                reject(error);
            });
        });
    }

    // Notification system
    function showNotification(message, type) {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : '#dc3545'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideInRight 0.3s ease-out;
            max-width: 400px;
        `;

        document.body.appendChild(notification);

        // Close button functionality
        const closeButton = notification.querySelector('.notification-close');
        closeButton.addEventListener('click', () => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        });

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease-out';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    // Add notification animations to CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .notification-close {
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            padding: 0;
            margin-left: 10px;
        }
    `;
    document.head.appendChild(style);

    // Add floating animation to hero icons
    const heroIcons = document.querySelectorAll('.hero-icons i');
    heroIcons.forEach((icon, index) => {
        icon.style.animationDelay = `${index * 0.5}s`;
    });

    // Add hover effects to course items
    const courseItems = document.querySelectorAll('.course-item');
    courseItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-15px) scale(1.02)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Add click effects to buttons
    const buttons = document.querySelectorAll('.btn, .submit-button, .instapay-link, .vodafone-link');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Create ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255,255,255,0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });

    // Add ripple animation to CSS
    const rippleStyle = document.createElement('style');
    rippleStyle.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(rippleStyle);

    // Parallax effect for hero section
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            heroSection.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });

    // Add loading animation
    window.addEventListener('load', function() {
        const loader = document.createElement('div');
        loader.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #007bff, #0056b3);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                animation: fadeOut 1s ease-out 0.5s forwards;
            ">
                <div style="
                    text-align: center;
                    color: white;
                ">
                    <i class="fas fa-heartbeat" style="font-size: 4rem; animation: pulse 1s infinite;"></i>
                    <i class="fas fa-laptop" style="font-size: 4rem; animation: pulse 1s infinite 0.5s; margin-left: 2rem;"></i>
                    <p style="margin-top: 2rem; font-size: 1.5rem;">جاري تحميل الموقع...</p>
                </div>
            </div>
        `;
        
        const fadeOutStyle = document.createElement('style');
        fadeOutStyle.textContent = `
            @keyframes fadeOut {
                to {
                    opacity: 0;
                    visibility: hidden;
                }
            }
        `;
        document.head.appendChild(fadeOutStyle);
        document.body.appendChild(loader);
        
        setTimeout(() => loader.remove(), 1500);
    });
});


