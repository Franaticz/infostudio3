
// Tooplate 2149 Strategic Consulting
// https://www.tooplate.com/view/2149-strategic-consulting

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.goal-tab');
  const details = document.querySelectorAll('.goal-detail');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.target;

      // Tabs aktiv setzen
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Details anzeigen
      details.forEach(detail => {
        if (detail.id.toLowerCase() === target.toLowerCase()) {
          detail.classList.add('active');
        } else {
          detail.classList.remove('active');
        }
      });
    });
  });

  // Optional: ersten Tab und Detail aktiv setzen
  if (tabs[0] && details[0]) {
    tabs[0].classList.add('active');
    details[0].classList.add('active');
  }

  // ========================================
  // Services Carousel Functionality - Infinite Loop
  // ========================================
  const carouselWrapper = document.querySelector('.services-cards-wrapper');
  const originalCards = document.querySelectorAll('.service-card');
  const prevBtn = document.querySelector('.carousel-btn-prev');
  const nextBtn = document.querySelector('.carousel-btn-next');
  const dots = document.querySelectorAll('.carousel-dot');
  
  if (carouselWrapper && originalCards.length > 0) {
    const totalCards = originalCards.length;
    let currentIndex = 0;
    let isTransitioning = false;
    
    // Clone cards for infinite effect
    const clonesPerSide = 2;
    
    // Clone last cards and prepend
    for (let i = clonesPerSide; i > 0; i--) {
      const clone = originalCards[totalCards - i].cloneNode(true);
      clone.classList.add('clone');
      clone.setAttribute('data-clone', 'prepend');
      carouselWrapper.insertBefore(clone, carouselWrapper.firstChild);
    }
    
    // Clone first cards and append
    for (let i = 0; i < clonesPerSide; i++) {
      const clone = originalCards[i].cloneNode(true);
      clone.classList.add('clone');
      clone.setAttribute('data-clone', 'append');
      carouselWrapper.appendChild(clone);
    }
    
    // Get all cards including clones
    const allCards = document.querySelectorAll('.service-card');
    
    // Update active dot
    function updateDots(index) {
      const normalizedIndex = ((index % totalCards) + totalCards) % totalCards;
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === normalizedIndex);
      });
    }
    
    // Update active card styling
    function updateActiveCard(index) {
      allCards.forEach((card, i) => {
        const isActive = i === index + clonesPerSide;
        card.classList.toggle('active', isActive);
      });
    }
    
    // Scroll to specific card (with clone offset)
    function scrollToCard(index, smooth = true) {
      const cardIndex = index + clonesPerSide;
      const card = allCards[cardIndex];
      
      if (!card) return;
      
      const scrollLeft = card.offsetLeft - (carouselWrapper.offsetWidth / 2) + (card.offsetWidth / 2);
      
      carouselWrapper.scrollTo({
        left: scrollLeft,
        behavior: smooth ? 'smooth' : 'instant'
      });
      
      currentIndex = index;
      updateDots(index);
      updateActiveCard(index);
    }
    
    // Handle infinite loop jump
    function handleInfiniteLoop() {
      if (isTransitioning) return;
      
      const containerCenter = carouselWrapper.scrollLeft + (carouselWrapper.offsetWidth / 2);
      let closestIndex = 0;
      let closestDistance = Infinity;
      
      allCards.forEach((card, index) => {
        const cardCenter = card.offsetLeft + (card.offsetWidth / 2);
        const distance = Math.abs(containerCenter - cardCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });
      
      const realIndex = closestIndex - clonesPerSide;
      
      // Jump to real card if on a clone
      if (realIndex < 0) {
        isTransitioning = true;
        const jumpTo = totalCards + realIndex;
        scrollToCard(jumpTo, false);
        setTimeout(() => { isTransitioning = false; }, 50);
      } else if (realIndex >= totalCards) {
        isTransitioning = true;
        const jumpTo = realIndex - totalCards;
        scrollToCard(jumpTo, false);
        setTimeout(() => { isTransitioning = false; }, 50);
      } else {
        currentIndex = realIndex;
        updateDots(realIndex);
        updateActiveCard(realIndex);
      }
    }
    
    // Navigate to next card
    function goToNext() {
      let nextIndex = currentIndex + 1;
      if (nextIndex >= totalCards) {
        // Scroll to clone first, then jump
        const cardIndex = nextIndex + clonesPerSide;
        const card = allCards[cardIndex];
        const scrollLeft = card.offsetLeft - (carouselWrapper.offsetWidth / 2) + (card.offsetWidth / 2);
        
        carouselWrapper.scrollTo({ left: scrollLeft, behavior: 'smooth' });
        
        allCards.forEach((c, i) => c.classList.toggle('active', i === cardIndex));
        updateDots(0);
        
        setTimeout(() => {
          scrollToCard(0, false);
        }, 400);
      } else {
        scrollToCard(nextIndex);
      }
    }
    
    // Navigate to previous card
    function goToPrev() {
      let prevIndex = currentIndex - 1;
      if (prevIndex < 0) {
        // Scroll to clone first, then jump
        const cardIndex = prevIndex + clonesPerSide;
        const card = allCards[cardIndex];
        const scrollLeft = card.offsetLeft - (carouselWrapper.offsetWidth / 2) + (card.offsetWidth / 2);
        
        carouselWrapper.scrollTo({ left: scrollLeft, behavior: 'smooth' });
        
        allCards.forEach((c, i) => c.classList.toggle('active', i === cardIndex));
        updateDots(totalCards - 1);
        
        setTimeout(() => {
          scrollToCard(totalCards - 1, false);
        }, 400);
      } else {
        scrollToCard(prevIndex);
      }
    }

    const allCardsArray = Array.from(allCards);
    // Click on card -> next/prev depending on position
    allCardsArray.forEach(card => {
      card.addEventListener('click', (event) => {
        if (event.target.closest('a, button')) return;
        const activeIndex = currentIndex + clonesPerSide;
        const clickedIndex = allCardsArray.indexOf(card);
        if (clickedIndex < activeIndex) {
          goToPrev();
        } else {
          goToNext();
        }
      });
    });
    
    // Previous button
    if (prevBtn) {
      prevBtn.addEventListener('click', goToPrev);
    }
    
    // Next button
    if (nextBtn) {
      nextBtn.addEventListener('click', goToNext);
    }
    
    // Dot navigation
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        scrollToCard(index);
      });
    });
    
    // Update active card on scroll end
    let scrollTimeout;
    carouselWrapper.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        handleInfiniteLoop();
      }, 100);
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      const servicesSection = document.getElementById('services');
      const rect = servicesSection.getBoundingClientRect();
      const isInView = rect.top < window.innerHeight && rect.bottom > 0;
      
      if (isInView) {
        if (e.key === 'ArrowLeft') {
          goToPrev();
        } else if (e.key === 'ArrowRight') {
          goToNext();
        }
      }
    });
    
    // Initial scroll to first card
    setTimeout(() => {
      scrollToCard(0, false);
    }, 100);
  }

  // ========================================
  // Bento Grid Stats Animations
  // ========================================
  const bentoCards = document.querySelectorAll('.bento-card[data-animate]');
  const progressRings = document.querySelectorAll('.progress-ring-fill');
  const miniRings = document.querySelectorAll('.mini-ring-fill');
  const timelineProgress = document.querySelector('.timeline-progress');
  
  // Intersection Observer for Bento Cards
  const bentoObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Stagger animation
        setTimeout(() => {
          entry.target.classList.add('animate-in');
        }, index * 100);
        
        // Animate progress rings inside this card
        const ring = entry.target.querySelector('.progress-ring-fill');
        if (ring) {
          setTimeout(() => {
            const progress = ring.getAttribute('data-progress');
            const circumference = 2 * Math.PI * 85;
            const offset = circumference - (progress / 100) * circumference;
            ring.style.strokeDashoffset = offset;
          }, 300);
        }
        
        // Animate mini rings
        const miniRing = entry.target.querySelector('.mini-ring-fill');
        if (miniRing) {
          setTimeout(() => {
            const progress = miniRing.getAttribute('data-progress');
            const circumference = 2 * Math.PI * 40;
            const offset = circumference - (progress / 100) * circumference;
            miniRing.style.strokeDashoffset = offset;
          }, 300);
        }
        
        // Animate timeline
        if (entry.target.querySelector('.timeline-progress')) {
          setTimeout(() => {
            const timeline = entry.target.querySelector('.timeline-progress');
            timeline.style.width = '60%';
          }, 500);
        }
        
        // Animate counters in this card
        const counters = entry.target.querySelectorAll('.counter');
        counters.forEach(counter => {
          animateCounter(counter);
        });
        
        bentoObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  
  bentoCards.forEach(card => bentoObserver.observe(card));

  // Tap-to-flip on touch devices
  const bentoTapCards = document.querySelectorAll('.bento-card');
  const prefersTapFlip = window.matchMedia('(hover: none), (pointer: coarse)');

  if (prefersTapFlip.matches && bentoTapCards.length) {
    bentoTapCards.forEach(card => {
      card.addEventListener('click', (event) => {
        if (event.target.closest('a, button')) return;
        const isFlipped = card.classList.toggle('is-flipped');
        bentoTapCards.forEach(other => {
          if (other !== card) other.classList.remove('is-flipped');
        });
      });
    });
  }
  
  // Counter Animation Function
  function animateCounter(counter) {
    const rawValue = counter.getAttribute('data-count') || '0';
    const normalized = rawValue.replace(',', '.');
    const target = parseFloat(normalized);
    const decimals = normalized.includes('.') ? Math.min(2, normalized.split('.')[1].length) : 0;
    const formatNumber = (value) => value.toLocaleString('de-DE', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
    const duration = 2000;
    const start = performance.now();
    const startValue = 0;
    
    function update(currentTime) {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out-cubic)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (target - startValue) * easeOut;
      const displayValue = decimals > 0 ? Math.round(current * Math.pow(10, decimals)) / Math.pow(10, decimals) : Math.floor(current);
      
      counter.textContent = formatNumber(displayValue);
      
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        counter.textContent = formatNumber(target);
      }
    }
    
    requestAnimationFrame(update);
  }
});

function setEqualHeightGoalDetails() {
  const details = document.querySelectorAll('.goal-detail');
  let maxHeight = 0;

  // Höhe zurücksetzen, damit wir korrekt messen
  details.forEach(detail => {
    detail.style.height = 'auto';
  });

  // Höchste Höhe ermitteln
  details.forEach(detail => {
    const h = detail.offsetHeight;
    if (h > maxHeight) maxHeight = h;
  });

  // Alle auf max-Höhe setzen
  details.forEach(detail => {
    detail.style.height = maxHeight + 'px';
  });
}

// Beim Laden und Resizen aufrufen
window.addEventListener('load', setEqualHeightGoalDetails);
window.addEventListener('resize', setEqualHeightGoalDetails);

// Mobile Menu
const mobileMenu = document.querySelector('.mobile-menu');
const navLinks = document.querySelector('.nav-links');

if (mobileMenu && navLinks) {
   mobileMenu.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('active');
      mobileMenu.classList.toggle('is-open', isOpen);
   });
}

// Active Menu Highlight
function updateActiveMenu() {
   const sections = document.querySelectorAll('section[id]');
   const navLinks = document.querySelectorAll('.nav-links a');

   let current = 'home'; // Default to home

   // Only update current if user has scrolled past the hero section
   if (window.scrollY > 100) {
      sections.forEach(section => {
         const sectionTop = section.offsetTop;
         if (scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
         }
      });
   }

   navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href').substring(1) === current) {
         link.classList.add('active');
      }
   });
}

window.addEventListener('scroll', updateActiveMenu);

// Initialize with only home active on page load
document.addEventListener('DOMContentLoaded', () => {
   const navLinks = document.querySelectorAll('.nav-links a');
   const homeLink = document.querySelector('.nav-links a[href="#home"]');

   navLinks.forEach(link => link.classList.remove('active'));

   if (homeLink) {
      homeLink.classList.add('active');
   }
});

updateActiveMenu();

// Back to top visibility after section 3
const backToTop = document.getElementById('backToTop');
const contentSections = document.querySelectorAll('section[id]');
const thresholdSection = contentSections.length >= 3 ? contentSections[2] : null;

function updateBackToTop() {
  if (!backToTop || !thresholdSection) return;
  const triggerPoint = thresholdSection.offsetTop - 120;
  if (window.scrollY >= triggerPoint) {
    backToTop.classList.add('visible');
  } else {
    backToTop.classList.remove('visible');
  }
}

window.addEventListener('scroll', updateBackToTop);
window.addEventListener('resize', updateBackToTop);
window.addEventListener('load', updateBackToTop);

// Parallax for sections
const parallaxSections = Array.from(document.querySelectorAll('section'));
let parallaxTicking = false;

function updateParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    parallaxSections.forEach(section => section.style.setProperty('--parallax-y', '0px'));
    return;
  }

  const vh = window.innerHeight || 0;
  parallaxSections.forEach(section => {
    const rect = section.getBoundingClientRect();
    const distance = rect.top + rect.height / 2 - vh / 2;
    const offset = Math.max(Math.min(-distance * 0.08, 60), -60);
    section.style.setProperty('--parallax-y', `${offset}px`);
  });
}

function onParallaxScroll() {
  if (parallaxTicking) return;
  parallaxTicking = true;
  requestAnimationFrame(() => {
    parallaxTicking = false;
    updateParallax();
  });
}

window.addEventListener('scroll', onParallaxScroll, { passive: true });
window.addEventListener('resize', updateParallax);
window.addEventListener('load', updateParallax);

// Scroll reveal for sections (in/out)
const revealTargets = Array.from(document.querySelectorAll(
  '.section, .services-modern-container, .method-container, .stats-container, .ios-container, .summary-wrap, .hero-content'
));

revealTargets.forEach((el) => el.classList.add('reveal-on-scroll'));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
    } else if (!entry.target.classList.contains('method-container')) {
      entry.target.classList.remove('in-view');
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

revealTargets.forEach((el) => revealObserver.observe(el));

// Services Tab Functionality
const serviceTabs = document.querySelectorAll('.service-tab');
const serviceDetails = document.querySelectorAll('.service-details');

serviceTabs.forEach(tab => {
   tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-target');

      serviceTabs.forEach(t => t.classList.remove('active'));
      serviceDetails.forEach(d => d.classList.remove('active'));

      tab.classList.add('active');
      document.querySelector(`.service-details[data-service="${target}"]`).classList.add('active');
   });
});

function scrollToAlignedSection(target) {
   const navbar = document.querySelector('.navbar');
   const headerOffset = (navbar ? navbar.offsetHeight : 0) + 16;
   const title = target.querySelector('.section-title, .services-modern-title, .stats-title');
   const element = title || target;
   const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
   const offsetPosition = elementPosition - headerOffset;

   window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
   });
}

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
   anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
         scrollToAlignedSection(target);
      }
      navLinks.classList.remove('active');
      if (mobileMenu) {
         mobileMenu.classList.remove('is-open');
      }
   });
});

// Advanced Scroll Animations
const observerOptions = {
   threshold: 0.15,
   rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
   entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
         setTimeout(() => {
            entry.target.classList.add('animate');

            if (entry.target.classList.contains('counter')) {
               animateCounter(entry.target);
            }
         }, index * 100);
      }
   });
}, observerOptions);

document.querySelectorAll('.fade-in, .service-tab, .team-member, .testimonial, .counter').forEach(el => {
   observer.observe(el);
});

function animateCounter(element) {
   if (element.classList.contains('animated')) return;
   element.classList.add('animated');

   const rawValue = element.getAttribute('data-count') || '0';
   const normalized = rawValue.replace(',', '.');
   const target = parseFloat(normalized);
   const decimals = normalized.includes('.') ? Math.min(2, normalized.split('.')[1].length) : 0;
   const formatNumber = (value) => value.toLocaleString('de-DE', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
   });
   const showPercent = !element.hasAttribute('data-no-percent') && target <= 100;
   const increment = target / 80;
   let current = 0;

   const timer = setInterval(() => {
      current += increment;
      const value = decimals > 0 ? Math.round(current * Math.pow(10, decimals)) / Math.pow(10, decimals) : Math.floor(current);
      element.textContent = showPercent ? formatNumber(value) + ' %' : formatNumber(value);

      if (current >= target) {
         element.textContent = showPercent ? formatNumber(target) + ' %' : formatNumber(target);
         clearInterval(timer);
      }
   }, 25);
}

// Navbar scroll effect
window.addEventListener('scroll', () => {
   const navbar = document.querySelector('.navbar');
   const scrolled = window.scrollY;

   if (scrolled > 50) {
      navbar.style.background = '#FFFFFF';
      navbar.style.borderBottomColor = 'rgba(71, 85, 105, 0.2)';
   } else {
      navbar.style.background = '#FFFFFF';
      navbar.style.borderBottomColor = 'rgba(71, 85, 105, 0.1)';
   }
});

// Form submission
const contactForm = document.querySelector('.contact-form');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const submitBtn = contactForm.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;

    submitBtn.textContent = 'Initiating Connection...';
    submitBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
    submitBtn.classList.add('loading');

    setTimeout(() => {
      submitBtn.textContent = 'Partnership Initiated!';
      submitBtn.classList.remove('loading');
      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.style.background = 'linear-gradient(135deg, #64748b, #475569)';
        contactForm.reset();
      }, 3000);
    }, 2000);
  });
}

// Hover effects for service tabs
document.querySelectorAll('.service-tab').forEach((tab, index) => {
   tab.addEventListener('mouseenter', () => {
      if (!tab.classList.contains('active')) {
         tab.style.transform = 'translateX(5px)';
         tab.style.boxShadow = '0 10px 25px rgba(71, 85, 105, 0.1)';
      }
   });

   tab.addEventListener('mouseleave', () => {
      if (!tab.classList.contains('active')) {
         tab.style.transform = 'translateX(0)';
         tab.style.boxShadow = 'none';
      }
   });
});

// Parallax effect
window.addEventListener('scroll', () => {
   const scrolled = window.pageYOffset;
   const parallaxElements = document.querySelectorAll('.geometric-shapes, .hero-content');

   parallaxElements.forEach((element, index) => {
      const speed = 0.3 + (index * 0.2);
      if (scrolled < window.innerHeight) {
         element.style.transform = `translateY(${scrolled * speed}px)`;
      }
   });

   const shapes = document.querySelectorAll('.geo-shape');
   shapes.forEach((shape, index) => {
      const rotation = scrolled * 0.05 * (index + 1);
      shape.style.transform += ` rotate(${rotation}deg)`;
   });
});

// Interactive testimonials
document.querySelectorAll('.testimonial-content').forEach(testimonial => {
   testimonial.addEventListener('mouseenter', () => {
      testimonial.style.transform = 'scale(1.02) translateY(-5px)';
      testimonial.style.boxShadow = '0 25px 50px rgba(71, 85, 105, 0.2)';
   });

   testimonial.addEventListener('mouseleave', () => {
      testimonial.style.transform = 'scale(1) translateY(0)';
      testimonial.style.boxShadow = '0 15px 35px rgba(71, 85, 105, 0.1)';
   });
});

// ======= LocalStorage basierte Umfrage =======

const surveyQuestions = [
  { id: "q1", question: "1. Wie wichtig ist Ihnen der Ausbau von Ladestationen für Elektroautos in Karlsruhe?", options: ["Sehr wichtig","Wichtig", "Neutral/Keine Meinung","Weniger Wichtig","Unwichtig"] },
  { id: "q2_public_private", question: "2. Halten Sie mehr Schnellladestationen in Ihrer Stadt für sinnvoll?", options: ["Ja, definitiv", "Ja, eher ja", "Neutral / Keine Meinung", "Eher nein", "Nein, nicht notwendig"]},
  { id: "q3_ausbau", question: "3. Sind Sie zufrieden damit, dass die Stadt die Ladeinfrastruktur erweitert?", options: ["Sehr zufrieden","Zufrieden","Neutral/Keine Meinung","Unzufrieden","Sehr unzufrieden"]},
  { id: "q4_ziel_realistisch", question: "4. Haben Sie Bedenken im Zusammenhang mit dem Ausbau (z. B. Platzbedarf, Umwelt, Kosten)?", options: ["Ja, große Bedenken","Ja, einige Bedenken","Neutral/Keine Meinung","Wenige Bedenken","Keine Bedenken"]},
  { id: "q5_eauto_vorstellen", question: "5. Finden Sie, dass Ladestationen einfach nutzbar und barrierefrei zugänglich sein sollen?", options: ["Absolut zustimmend","Zustimmend","Neutral/Keine Meinung", "Ablehnend", "Absolut ablehnend"] },
];

document.addEventListener('DOMContentLoaded', () => {
   const surveyContent = document.getElementById("survey-content");
   const nextBtn = document.getElementById("nextBtn");
   const resetBtn = document.getElementById("resetBtn");

   // Reset-Button im Footer: Passwortabfrage beim Klick
   resetBtn.addEventListener('click', function(e) {
      const pw = prompt('Passwort zum Zurücksetzen der Umfrage eingeben:');
      if (pw === 'hka2026') {
         localStorage.removeItem('allSurveys');
         location.reload();
      } else {
         alert('Falsches Passwort! Die Umfrage wurde nicht zurückgesetzt.');
      }
   });

  if (!surveyContent) return;

  let answers = {};
  let currentQuestion = 0;
  const allSurveys = JSON.parse(localStorage.getItem('allSurveys') || '[]');


function getNextQuestion() {
  if (currentQuestion < surveyQuestions.length) {
    return surveyQuestions[currentQuestion];
  }
  return null;
}


  function renderQuestion() {
  if (currentQuestion >= surveyQuestions.length) {
    showResults();
    return;
  }

  const q = surveyQuestions[currentQuestion];

  surveyContent.parentElement.classList.remove('results-mode');

  surveyContent.innerHTML = `
    <div class="survey-question">${q.question}</div>
    <div class="survey-options">
      ${q.options.map((opt, index) => `
        <input type="radio" name="survey" value="${opt}" id="opt${index}" style="display:none;">
        <label for="opt${index}" class="survey-option">${opt}</label>
      `).join("")}
    </div>
  `;

  surveyContent.querySelectorAll('input[type="radio"]').forEach(input => {
    input.addEventListener('change', () => {
      const value = input.value;

      answers[q.id] = value;
      localStorage.setItem('surveyAnswers', JSON.stringify(answers));

      currentQuestion++;          // NUR +1
      renderQuestion();           // Nächste Frage anzeigen
    });
  });
}


function showResults() {
    // Speichere die aktuelle Umfrage zuerst
    allSurveys.push({ ...answers });
    localStorage.setItem('allSurveys', JSON.stringify(allSurveys));

    surveyContent.parentElement.classList.add('results-mode');
    const colorMap = [
        "linear-gradient(135deg, #065f46, #047857)",  // sehr positiv → dunkelgrün
        "linear-gradient(135deg, #10b981, #6ee7b7)",  // positiv → hellgrün
        "linear-gradient(135deg, #facc15, #eab308)",  // neutral → gelb
        "linear-gradient(135deg, #f97316, #ea580c)",  // negativ → orange
        "linear-gradient(135deg, #ef4444, #b91c1c)"   // sehr negativ → rot
    ];

    let currentChartIndex = 0;


   const tabLabels = [
     "1. Ausbau",
     "2. Schnelllader",
     "3. Zufriedenheit",
     "4. Bedenken",
     "5. Barrierefrei"
   ];
   const tabsHTML = surveyQuestions.map((q, index) => 
      `<div class="survey-tab ${index === 0 ? 'active' : ''}" data-index="${index}">${tabLabels[index]}</div>`
   ).join('');

   let resultHTML = `<div class="survey-thankyou">Danke für deine Teilnahme!</div><div class="survey-subtitle" style="text-align:center; font-size:1.1rem; color:#1a202c; margin-bottom:1.5rem;">So haben die anderen Besucher abgestimmt:</div><div class="survey-tabs">${tabsHTML}</div><div class="survey-chart-container"></div>`;

    surveyContent.innerHTML = resultHTML;

    // Event Listener für Tabs
    document.querySelectorAll('.survey-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const index = parseInt(tab.dataset.index);
            currentChartIndex = index;
            renderChart(index);
            document.querySelectorAll('.survey-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });

    // Funktion zum Rendern des Diagramms
    function renderChart(index) {
        const q = surveyQuestions[index];
        const counts = {};
        let total = 0;

        q.options.forEach(opt => {
            counts[opt] = 0;
        });

        allSurveys.forEach(survey => {
            const val = survey[q.id];
            if (val !== undefined && counts[val] !== undefined) {
                counts[val]++;
                total++;
            }
        });

        const percent = key => total ? Math.round((counts[key] / total) * 100) : 0;
        const chartHTML = `<h4>${q.question}</h4>` + q.options.map((opt, optIndex) => {
            const p = percent(opt);
            return `
              <div class="result-bar">
                <div class="bar-label">
                    ${opt} (<span class="bar-percent" data-target="${p}">0</span>%)
                </div>
                <div class="bar-container">
                    <div class="bar-fill"
                         data-target="${p}"
                         data-color="${optIndex}">
                    </div>
                </div>
              </div>
            `;
        }).join('');

        document.querySelector('.survey-chart-container').innerHTML = chartHTML;

        // Animation für Balken
        const bars = document.querySelectorAll('.bar-fill');
        const percents = document.querySelectorAll('.bar-percent');

        bars.forEach((bar, i) => {
            const target = parseInt(bar.dataset.target);
            const colorIndex = parseInt(bar.dataset.color);

            bar.style.background = colorMap[colorIndex];

            let current = 0;
            const step = target / 40;

            const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                bar.style.width = current + "%";
                percents[i].textContent = Math.floor(current);
            }, 25);
        });
    }

    // Initiales Rendern
    renderChart(0);

    // Buttons
    if (nextBtn) nextBtn.style.display = "none";
   if (resetBtn) {
      // EventListener nur hier nach Ergebnissen
      resetBtn.onclick = () => {
         localStorage.removeItem('allSurveys');  // Umfragen löschen
         currentQuestion = 0;
         answers = {};
         renderQuestion();
         resetBtn.style.display = "none";        // Button wieder verstecken
         nextBtn.style.display = "inline-block"; // Falls nötig
      };
   }
}




  renderQuestion();

   // Entfernt: resetBtn Event-Listener ohne Passwortabfrage
});



const timeline = entry.target.querySelector('.timeline-progress');
if (timeline) {
  setTimeout(() => {
    const target = timeline.getAttribute('data-progress') || '0';
    timeline.style.width = '0%';
    timeline.offsetWidth; // reflow
    requestAnimationFrame(() => {
      timeline.style.width = target + '%';
    });
  }, 500);
}

