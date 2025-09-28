// index.js
// import lucide from "lucide"

lucide.createIcons();

const sectionTitles = {
  home: "Home",
  about: "About",
  projects: "Projects",
  skills: "Skills",
  events: "Events",
  contact: "Contact",
}

const NAV_HEIGHT_OFFSET = 80;
function updateActiveNavLink() {
    // Urutan sections: home, about, projects, skills, events, contact (dari index.js baris 20)
    // Mari kita gunakan urutan yang sama untuk konsistensi meskipun ada sedikit perbedaan urutan di nav-menu/section dots HTML.
    const sections = ["home", "about", "projects", "skills", "events", "contact"]
    const scrollPosition = window.scrollY + NAV_HEIGHT_OFFSET + 1; 
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const isAtBottom = window.scrollY >= maxScroll - 10;

    let activeSectionId = null;

    // 1. Cek apakah sudah di bagian 'contact' (logika yang diperbaiki)
    const contactElement = document.getElementById("contact");
    if (contactElement) {
        // Jika scrollPosition melewati batas atas section 'contact', langsung aktifkan 'contact'
        if (scrollPosition >= contactElement.offsetTop) {
            activeSectionId = "contact";
        }
    }

    // 2. Loop mundur untuk section lainnya jika 'contact' belum aktif
    if (activeSectionId === null) {
        // Loop mundur dari 'events' ke 'home'
        for (let i = sections.length - 2; i >= 0; i--) { // Start from 'events' (index 4) down to 'home' (index 0)
            const section = sections[i];
            const element = document.getElementById(section);
            if (element) {
                const offsetTop = element.offsetTop;
                const offsetHeight = element.offsetHeight;
                
                if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                    activeSectionId = section;
                    break; 
                }
            }
        }
    }
    
    // 3. Fallback jika masih null (e.g., scroll di atas 'home')
    if (activeSectionId === null) {
        // Jika isAtBottom, set ke contact (safety net)
        if (isAtBottom) {
             activeSectionId = "contact";
        } else {
             // Jika masih di atas semua section
             activeSectionId = "home";
        }
    }
    
    if (activeSectionId) {
        document.querySelectorAll(".nav-link").forEach((link) => {
            link.classList.remove("active");
        });
        document.querySelectorAll(".section-dot").forEach((dot) => {
            dot.classList.remove("active");
        });

        const navLink = document.querySelector(`a[href="#${activeSectionId}"]`);
        const sectionDot = document.querySelector(`.section-dot[data-section="${activeSectionId}"]`);

        if (navLink) navLink.classList.add("active");
        if (sectionDot) sectionDot.classList.add("active");

        const titleDisplay = document.getElementById("current-section-title");
        if (titleDisplay) {
            titleDisplay.textContent = sectionTitles[activeSectionId];
        }
    }
}

let eventsExpanded = false;
let isCarouselMode = true; // State for the project view mode
let autoPlayInterval; // Variable to hold the auto-play timer for Projects
let eventAutoPlayInterval; // Variable to hold the auto-play timer for Events

// Animate sections on scroll
function animateOnScroll() {
  const sections = document.querySelectorAll(".section")
  const windowHeight = window.innerHeight
  const scrollTop = window.scrollY

  sections.forEach((section) => {
    const sectionTop = section.offsetTop
    const sectionHeight = section.offsetHeight

    if (scrollTop + windowHeight > sectionTop + 100) {
      section.classList.add("animate")
    }
  })
}

// Function to switch between Carousel and Grid View (Show All)
function toggleViewMode() {
    const carouselView = document.querySelector('.carousel-view-mode');
    const gridView = document.querySelector('.project-grid-mode');
    const button = document.querySelector('.projects-section-container .show-more-btn');

    if (isCarouselMode) {
        // Switch to Grid Mode (Show All)
        clearInterval(autoPlayInterval); // Stop auto-play
        carouselView.classList.add('hidden');
        gridView.classList.remove('hidden');
        button.textContent = "Show Less";
        isCarouselMode = false;
    } else {
        // Switch to Carousel Mode (Show Less)
        gridView.classList.add('hidden');
        carouselView.classList.remove('hidden');
        button.textContent = "Show All";
        isCarouselMode = true;
        
        // Restart auto-play
        initializeCarousel();
    }
}

// CAROUSEL INITIALIZATION AND LOGIC (Projects)
function initializeCarousel() {
    const carouselTrack = document.querySelector('.carousel-track');
    const projectCards = document.querySelectorAll('.carousel-track .project-card');
    const leftArrow = document.querySelector('.projects-section-container .left-arrow');
    const rightArrow = document.querySelector('.projects-section-container .right-arrow');
    const dots = document.querySelectorAll('.projects-section-container .carousel-nav-dots .dot');
    
    // Clear any existing interval before setting a new one
    clearInterval(autoPlayInterval); 

    if (!carouselTrack || projectCards.length === 0 || !leftArrow || !rightArrow || !dots.length) {
        // If elements are hidden (e.g., grid view is active), exit gracefully
        if (document.querySelector('.project-grid-mode:not(.hidden)')) {
            return;
        }
        console.warn("Project Carousel initialization failed: Elements not found or view is inactive.");
        return;
    }

    let currentIndex = 0;
    
    function getCardWidth() {
        // Get the width of the first project card, which defines the slide distance
        return projectCards[0].offsetWidth;
    }

    function moveCarouselTo(index) {
        // *** PERBAIKAN: Selalu gunakan lebar kartu yang dihitung ulang ***
        const cardWidth = getCardWidth();
        const offset = -index * cardWidth;
        carouselTrack.style.transform = `translateX(${offset}px)`;

        dots.forEach((dot, i) => {
            if (i === index) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
    
    function showNextCard() {
        currentIndex = (currentIndex < projectCards.length - 1) ? currentIndex + 1 : 0;
        moveCarouselTo(currentIndex);
    }
    
    // 1. AUTO-PLAY: Move right every 3 seconds
    autoPlayInterval = setInterval(showNextCard, 3000);

    // Pause auto-play when hovering over the carousel container
    const carouselContainer = document.querySelector('.projects-section-container .carousel-container');
    if (carouselContainer) {
        carouselContainer.onmouseenter = () => clearInterval(autoPlayInterval);
        carouselContainer.onmouseleave = () => autoPlayInterval = setInterval(showNextCard, 3000);
    }

    // Manual navigation event listeners
    leftArrow.onclick = () => {
        currentIndex = (currentIndex > 0) ? currentIndex - 1 : projectCards.length - 1;
        moveCarouselTo(currentIndex);
    };

    rightArrow.onclick = () => {
        showNextCard();
    };

    dots.forEach((dot, index) => {
        dot.onclick = () => {
            currentIndex = index;
            moveCarouselTo(currentIndex);
        };
    });

    // Initial update and resize handler
    moveCarouselTo(currentIndex);

    window.onresize = () => {
        // Recalculate card width and move to current index to correct positioning
        moveCarouselTo(currentIndex); 
    };
}

function initializeEventsCarousel() {
    const sectionContainer = document.querySelector('#events'); // Use the section ID as the scope
    const carouselTrack = sectionContainer.querySelector('.carousel-track'); 
    const eventCards = sectionContainer.querySelectorAll('.carousel-track .event-item'); 
    const leftArrow = sectionContainer.querySelector('.left-arrow');
    const rightArrow = sectionContainer.querySelector('.right-arrow');
    const dotsContainer = sectionContainer.querySelector('.carousel-nav-dots');
    const dots = sectionContainer.querySelectorAll('.carousel-nav-dots .dot');
    
    // Clear any existing interval before setting a new one
    clearInterval(eventAutoPlayInterval); 

    if (!carouselTrack || eventCards.length === 0 || !leftArrow || !rightArrow || !dots.length) {
        // Hide carousel if not enough items or elements missing
        if (dotsContainer) dotsContainer.classList.add('hidden');
        if (leftArrow) leftArrow.classList.add('hidden');
        if (rightArrow) rightArrow.classList.add('hidden');
        console.warn("Events Carousel initialization failed: Elements not found or view is inactive.");
        return;
    }

    let currentIndex = 0;
    
    function getCardWidth() {
        // Get the width of the first event card, which defines the slide distance
        return eventCards[0].offsetWidth;
    }

    function moveCarouselTo(index) {
        const cardWidth = getCardWidth();
        const offset = -index * cardWidth;
        carouselTrack.style.transform = `translateX(${offset}px)`;

        dots.forEach((dot, i) => {
            if (i === index) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
    
    function showNextCard() {
        currentIndex = (currentIndex < eventCards.length - 1) ? currentIndex + 1 : 0;
        moveCarouselTo(currentIndex);
    }
    
    // AUTO-PLAY: Move right every 3 seconds
    eventAutoPlayInterval = setInterval(showNextCard, 3000);

    // Pause auto-play when hovering over the carousel container
    const carouselContainer = sectionContainer.querySelector('.carousel-container');
    if (carouselContainer) {
        carouselContainer.onmouseenter = () => clearInterval(eventAutoPlayInterval);
        carouselContainer.onmouseleave = () => eventAutoPlayInterval = setInterval(showNextCard, 3000);
    }

    // Manual navigation event listeners
    leftArrow.onclick = () => {
        currentIndex = (currentIndex > 0) ? currentIndex - 1 : eventCards.length - 1;
        moveCarouselTo(currentIndex);
    };

    rightArrow.onclick = () => {
        showNextCard();
    };

    dots.forEach((dot, index) => {
        dot.onclick = () => {
            currentIndex = index;
            moveCarouselTo(currentIndex);
        };
    });

    // Initial update and resize handler
    moveCarouselTo(currentIndex);

    window.onresize = () => {
        // Recalculate card width and move to current index to correct positioning
        moveCarouselTo(currentIndex); 
    };
}

// Event listeners
window.addEventListener("scroll", () => {
  updateActiveNavLink()
  animateOnScroll()
})

// Initializer
document.addEventListener("DOMContentLoaded", () => {
  animateOnScroll()
  updateActiveNavLink()
  // Start the carousel immediately on load
  initializeCarousel();
  initializeEventsCarousel(); 

  lucide.createIcons();
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault()

    const targetId = this.getAttribute("href")
    const target = document.querySelector(targetId)
    
    if (target) {
          document.querySelectorAll(".nav-link").forEach((link) => {
          link.classList.remove("active")
      })
      document.querySelectorAll(".section-dot").forEach((dot) => {
          dot.classList.remove("active")
      })
      
      const clickedSection = targetId.substring(1)
      const navLink = document.querySelector(`a[href="${targetId}"]`)
      const sectionDot = document.querySelector(`.section-dot[data-section="${clickedSection}"]`)
      
      if (navLink) navLink.classList.add("active")
      if (sectionDot) sectionDot.classList.add("active")
      
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  })
})

// Section dot click functionality
document.querySelectorAll(".section-dot").forEach((dot) => {
  dot.addEventListener("click", function () {
    const sectionId = this.getAttribute("data-section")
    const target = document.getElementById(sectionId)
    if (target) {
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - NAV_HEIGHT_OFFSET;

        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
        })
    }
  })
})