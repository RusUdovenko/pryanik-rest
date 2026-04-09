// ===== СЛАЙДЕР ИНТЕРЬЕРА (работает на всех устройствах) =====
document.addEventListener('DOMContentLoaded', function() {
    const track = document.querySelector('.interior-slds__items-wrapper');
    const slides = document.querySelectorAll('.interior-slds__item');
    const prevBtn = document.querySelector('.interior-slds__arrow-left');
    const nextBtn = document.querySelector('.interior-slds__arrow-right');
    const bullets = document.querySelectorAll('.interior-slds__bullet');
    
    if (!track || !slides.length) return;

    let currentIndex = 0;
    let isMobile = window.innerWidth <= 768;
    let startX = 0;
    let isDragging = false;
    let startTransform = 0;
    let currentTransform = 0;

    // Получаем полную ширину слайда с учетом gap
    function getSlideWidth() {
        const slide = slides[0];
        const style = window.getComputedStyle(track);
        const gap = parseFloat(style.gap) || 0;
        return slide.offsetWidth + gap;
    }

    // Получаем смещение для центрирования
    function getCenterOffset() {
        const container = track.parentElement;
        const slideWidth = getSlideWidth();
        const containerWidth = container.offsetWidth;
        const slideRealWidth = slides[0].offsetWidth;
        return (containerWidth - slideRealWidth) / 2;
    }

    // Функция прокрутки к слайду (с ограничением)
    function scrollToSlide(index, withAnimation = true) {
        if (index < 0) index = 0;
        if (index >= slides.length) index = slides.length - 1;
        
        currentIndex = index;
        const slideWidth = getSlideWidth();
        const centerOffset = getCenterOffset();
        
        // Расчет смещения
        let transformX = centerOffset - (currentIndex * slideWidth);
        
        // ВАЖНО: ограничиваем максимальное смещение, чтобы не уехать за последний слайд
        const maxRightOffset = centerOffset - ((slides.length - 1) * slideWidth);
        transformX = Math.min(centerOffset, Math.max(transformX, maxRightOffset));
        
        if (!withAnimation) {
            track.style.transition = 'none';
        } else {
            track.style.transition = 'transform 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1)';
        }
        
        track.style.transform = `translateX(${transformX}px)`;
        currentTransform = transformX;
        
        if (!withAnimation) {
            track.offsetHeight; // force reflow
            track.style.transition = '';
        }
        
        // Обновляем активные классы
        slides.forEach((slide, i) => {
            slide.classList.toggle('active-slide', i === currentIndex);
        });
        
        bullets.forEach((bullet, i) => {
            bullet.classList.toggle('interior-slds__bullet-active', i === currentIndex);
        });
        
        // Обновляем видимость кнопок
        if (prevBtn) {
            prevBtn.style.display = currentIndex === 0 ? 'none' : 'flex';
        }
        if (nextBtn) {
            nextBtn.style.display = currentIndex === slides.length - 1 ? 'none' : 'flex';
        }
    }

    // Обработчики кнопок
    if (nextBtn) {
        nextBtn.onclick = function(e) {
            e.preventDefault();
            if (currentIndex < slides.length - 1) {
                scrollToSlide(currentIndex + 1, true);
            }
        };
    }
    
    if (prevBtn) {
        prevBtn.onclick = function(e) {
            e.preventDefault();
            if (currentIndex > 0) {
                scrollToSlide(currentIndex - 1, true);
            }
        };
    }
    
    // Обработчики буллетов
    bullets.forEach((bullet, i) => {
        bullet.onclick = function(e) {
            e.preventDefault();
            scrollToSlide(i, true);
        };
    });
    
    // ===== СВАЙП ДЛЯ МОБИЛЬНЫХ =====
    function onDragStart(e) {
        isDragging = true;
        startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
        startTransform = currentTransform;
        track.style.transition = 'none';
    }
    
    function onDragMove(e) {
        if (!isDragging) return;
        const currentX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
        const diff = currentX - startX;
        let newTransform = startTransform + diff;
        
        // Ограничиваем перетаскивание
        const slideWidth = getSlideWidth();
        const centerOffset = getCenterOffset();
        const maxLeft = centerOffset;
        const maxRight = centerOffset - ((slides.length - 1) * slideWidth);
        newTransform = Math.min(maxLeft, Math.max(newTransform, maxRight));
        
        track.style.transform = `translateX(${newTransform}px)`;
        currentTransform = newTransform;
    }
    
    function onDragEnd() {
        if (!isDragging) return;
        isDragging = false;
        track.style.transition = 'transform 0.3s ease';
        
        // Определяем, к какому слайду ближе
        const slideWidth = getSlideWidth();
        const centerOffset = getCenterOffset();
        
        let newIndex = Math.round((centerOffset - currentTransform) / slideWidth);
        newIndex = Math.min(slides.length - 1, Math.max(0, newIndex));
        
        scrollToSlide(newIndex, true);
    }
    
    // Добавляем обработчики для свайпа
    track.addEventListener('mousedown', onDragStart);
    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('mouseup', onDragEnd);
    
    track.addEventListener('touchstart', onDragStart, { passive: false });
    window.addEventListener('touchmove', onDragMove, { passive: false });
    window.addEventListener('touchend', onDragEnd);
    
    // Адаптация при изменении размера окна
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            scrollToSlide(currentIndex, false);
        }, 150);
    });
    
    // Запуск
    setTimeout(function() {
        scrollToSlide(0, false);
    }, 100);
    
    window.addEventListener('load', function() {
        scrollToSlide(currentIndex, false);
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('.interior-slds__item');
    
    slides.forEach(function(slide) {
        slide.addEventListener('click', function(e) {
            if (e.target.closest('.interior-slds__arrow')) return;
            
            const bgDiv = this.querySelector('.interior-slds__bgimg');
            if (!bgDiv) return;
            
            const bgStyle = bgDiv.style.backgroundImage;
            const url = bgStyle.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
            
            if (!url) return;
            
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            
            const modalContent = document.createElement('div');
            modalContent.className = 'modal-content';
            
            const img = document.createElement('img');
            img.className = 'modal-image';
            img.src = url;
            img.alt = 'Увеличенное фото интерьера';
            
            modalContent.appendChild(img);
            modal.appendChild(modalContent);
            document.body.appendChild(modal);
            
            modal.addEventListener('click', function() {
                document.body.removeChild(modal);
                document.body.style.overflow = '';
            });
            
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && document.body.contains(modal)) {
                    document.body.removeChild(modal);
                    document.body.style.overflow = '';
                }
            });
            
            document.body.style.overflow = 'hidden';
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const burgerButton = document.querySelector('.burger-button');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (burgerButton && mobileMenu) {
        burgerButton.addEventListener('click', function() {
            this.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });
        
        const closeButton = mobileMenu.querySelector('.mobile-menu__close');
        if (closeButton) {
            closeButton.addEventListener('click', function() {
                burgerButton.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        }
        
        const menuLinks = mobileMenu.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', function() {
                burgerButton.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
                burgerButton.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.menu-main-tab');
    const contents = document.querySelectorAll('.menu-tab-content');
    
    if (!tabs.length || !contents.length) return;
    
    function switchTab(tabId) {
        tabs.forEach(t => t.classList.remove('active'));
        
        const activeTab = document.querySelector(`.menu-main-tab[data-tab="${tabId}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
        
        contents.forEach(content => content.classList.remove('active'));
        
        const activeContent = document.getElementById(`tab-${tabId}`);
        if (activeContent) {
            activeContent.classList.add('active');
            
            const categoryButtons = activeContent.querySelectorAll('.menu-catalog-cat');
            const catalogItems = activeContent.querySelectorAll('.menu-catalog-item');
            
            if (categoryButtons.length && catalogItems.length) {
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                const allButton = activeContent.querySelector('.menu-catalog-cat[data-cat="all"]');
                if (allButton) {
                    allButton.classList.add('active');
                }
                
                catalogItems.forEach(item => {
                    item.style.display = 'block';
                });
            }
        }
    }
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    const firstTab = document.querySelector('.menu-main-tab.active');
    if (firstTab) {
        const firstTabId = firstTab.getAttribute('data-tab');
        switchTab(firstTabId);
    }
});

document.addEventListener('DOMContentLoaded', function() {
    
    function initFiltersForContainer(container) {
        const categoryButtons = container.querySelectorAll('.menu-catalog-cat');
        const catalogItems = container.querySelectorAll('.menu-catalog-item');
        
        if (!categoryButtons.length || !catalogItems.length) return;
        
        function filterItems(category) {
            
            catalogItems.forEach(item => {
                if (category === 'all') {
                    item.style.display = 'block';
                } else {
                    const itemCategory = item.getAttribute('data-category');
                    if (itemCategory === category) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                }
            });
        }
        
        categoryButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                const category = this.getAttribute('data-cat');
                filterItems(category);
            });
        });
        
        const allButton = container.querySelector('.menu-catalog-cat[data-cat="all"]');
        if (allButton) {
            filterItems('all');
        }
    }
    
    const tabContents = document.querySelectorAll('.menu-tab-content');
    tabContents.forEach(content => {
        initFiltersForContainer(content);
    });
});



document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    function checkScroll() {
        const windowHeight = window.innerHeight;
        const triggerPoint = windowHeight * 0.85;
        
        animatedElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            
            if (elementTop < triggerPoint) {
                element.classList.add('animated');
            }
        });
    }
    
    checkScroll();
    
    window.addEventListener('scroll', checkScroll);
});

document.addEventListener('DOMContentLoaded', function() {
    const accordionItems = document.querySelectorAll('.vacancy-accordion-item');
    
    accordionItems.forEach(item => {
        const header = item.querySelector('.vacancy-accordion-header');
        const content = item.querySelector('.vacancy-accordion-content');
        
        if (!header || !content) return;
        
        header.addEventListener('click', function() {
            const isActive = item.classList.contains('active');
            
            accordionItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    const otherContent = otherItem.querySelector('.vacancy-accordion-content');
                    otherItem.classList.remove('active');
                    if (otherContent) {
                        otherContent.style.maxHeight = '0';
                    }
                }
            });
            
            if (isActive) {
                item.classList.remove('active');
                content.style.maxHeight = '0';
            } else {
                item.classList.add('active');
                setTimeout(() => {
                    content.style.maxHeight = content.scrollHeight + 30 + 'px';
                }, 10);
            }
        });
    });
});

const mobileLogoLink = document.querySelector('.mobile-menu__logo-wrapper a');
const burgerButton = document.querySelector('.burger-button');
const mobileMenu = document.querySelector('.mobile-menu');
if (mobileLogoLink && burgerButton && mobileMenu) {
    mobileLogoLink.addEventListener('click', function() {
        burgerButton.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    });
}


        // Открытие модального окна при клике на кнопку
        const loyaltyBtn = document.querySelector('.loyalty-program-btn');
        const modal = document.getElementById('deviceModal');
        const closeModal = document.getElementById('closeDeviceModal');
        const iphoneBtn = document.getElementById('iphoneBtn');
        const androidBtn = document.getElementById('androidBtn');

        if (loyaltyBtn) {
            loyaltyBtn.addEventListener('click', function(e) {
                e.preventDefault();
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        }

        function closeDeviceModal() {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }

        if (closeModal) {
            closeModal.addEventListener('click', closeDeviceModal);
        }

        // modal.addEventListener('click', function(e) {
        //     if (e.target === modal) {
        //         closeDeviceModal();
        //     }
        // });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeDeviceModal();
            }
        });

        if (iphoneBtn) {
            iphoneBtn.addEventListener('click', function(e) {
                e.preventDefault();
                window.open('https://apps.apple.com/ru/app/%D0%BF%D1%80%D1%8F%D0%BD%D0%B8%D0%BA-%D0%BF%D0%B5%D1%82%D1%80%D0%BE%D0%B7%D0%B0%D0%B2%D0%BE%D0%B4%D1%81%D0%BA/id6744920649?l=en-GB', '_blank');
                closeDeviceModal();
            });
        }

        if (androidBtn) {
            androidBtn.addEventListener('click', function(e) {
                e.preventDefault();
                window.open('https://play.google.com/store/apps/details?id=com.remarked.pryanik.app', '_blank');
                closeDeviceModal();
            });
        }
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});