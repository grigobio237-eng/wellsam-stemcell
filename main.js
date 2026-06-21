/* 
  =========================================
  THE WELLSAM STEM CELL - INTERACTIVE ENGINE
  =========================================
*/

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initCanvasParticles();
  initScrollReveal();
  initDetailPages();
});

/* 1. Header Navigation Scroll State */
function initNavigation() {
  const header = document.getElementById('site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.style.padding = '0';
      header.style.backgroundColor = 'rgba(12, 12, 13, 0.95)';
      header.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
    } else {
      header.style.padding = '0';
      header.style.backgroundColor = 'rgba(12, 12, 13, 0.85)';
      header.style.boxShadow = 'none';
    }
  });
}

/* 2. Interactive Canvas Particles (Stem Cells) */
function initCanvasParticles() {
  const canvas = document.getElementById('hero-particles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationFrameId;

  // Particle Settings
  const particlesArray = [];
  const numberOfParticles = Math.min(60, Math.floor((window.innerWidth * window.innerHeight) / 18000));
  
  // Mouse & Scroll interaction state
  const mouse = {
    x: null,
    y: null,
    radius: 120, // Interaction radius
  };

  let lastScrollY = window.scrollY;
  let scrollDelta = 0;

  window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
  });

  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    scrollDelta = currentScrollY - lastScrollY;
    lastScrollY = currentScrollY;
  });

  // Particle Class
  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.radius = Math.random() * 6 + 2; // Particle size
      this.x = Math.random() * canvas.width;
      this.y = initial ? Math.random() * canvas.height : canvas.height + this.radius + 10;
      
      // Floating speed (slow and drift-like)
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = -(Math.random() * 0.4 + 0.1); // Always float upwards slightly
      
      this.baseAlpha = Math.random() * 0.4 + 0.15;
      this.alpha = this.baseAlpha;
      
      // Light gold or pearl white color hues
      const isGold = Math.random() > 0.7;
      this.color = isGold ? '212, 175, 55' : '246, 245, 242';
      
      // Floating amplitude and frequency
      this.amplitude = Math.random() * 0.5 + 0.2;
      this.waveSpeed = Math.random() * 0.02 + 0.005;
      this.angle = Math.random() * Math.PI * 2;
    }

    draw() {
      ctx.beginPath();
      
      // Outer glow gradient
      const gradient = ctx.createRadialGradient(
        this.x, this.y, 0, 
        this.x, this.y, this.radius * 3
      );
      gradient.addColorStop(0, `rgba(${this.color}, ${this.alpha})`);
      gradient.addColorStop(0.3, `rgba(${this.color}, ${this.alpha * 0.5})`);
      gradient.addColorStop(1, `rgba(${this.color}, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.arc(this.x, this.y, this.radius * 3, 0, Math.PI * 2);
      ctx.fill();
    }

    update() {
      // 1. Natural floating wave motion
      this.angle += this.waveSpeed;
      this.x += Math.sin(this.angle) * this.amplitude * 0.1 + this.vx;
      this.y += this.vy;

      // 2. Scroll interaction - rise faster when scrolling down (Anti-gravity effect)
      if (scrollDelta > 0) {
        this.y -= scrollDelta * 0.05;
      }

      // 3. Mouse interaction (Repulsion)
      if (mouse.x !== null && mouse.y !== null) {
        let dx = this.x - mouse.x;
        let dy = this.y - mouse.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < mouse.radius) {
          const force = (mouse.radius - distance) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          
          // Gently push particle away
          this.x += Math.cos(angle) * force * 1.5;
          this.y += Math.sin(angle) * force * 1.5;
          
          // Light up near mouse
          this.alpha = Math.min(0.8, this.baseAlpha + force * 0.4);
        } else {
          // Fade back to normal
          if (this.alpha > this.baseAlpha) {
            this.alpha -= 0.01;
          }
        }
      } else {
        // Fade back to normal
        if (this.alpha > this.baseAlpha) {
          this.alpha -= 0.01;
        }
      }

      // 4. Out of bounds boundary check
      if (this.y < -this.radius * 3 || this.x < -this.radius * 3 || this.x > canvas.width + this.radius * 3) {
        this.reset(false);
      }
    }
  }

  // Handle Resize
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Clear and reinitialize if size changes significantly
    particlesArray.length = 0;
    for (let i = 0; i < numberOfParticles; i++) {
      particlesArray.push(new Particle());
    }
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Animation Loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Decay scrollDelta decay slowly
    scrollDelta *= 0.95;
    if (Math.abs(scrollDelta) < 0.1) scrollDelta = 0;

    for (let i = 0; i < particlesArray.length; i++) {
      particlesArray[i].update();
      particlesArray[i].draw();
    }

    animationFrameId = requestAnimationFrame(animate);
  }

  animate();
}

/* 3. Intersection Observer for Scroll Reveals */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal-up');
  
  const observerOptions = {
    root: null, // viewport
    rootMargin: '0px',
    threshold: 0.1 // Trigger when 10% of element is visible
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Once visible, we can stop observing this element
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(element => {
    revealObserver.observe(element);
  });
}

/* 4. Full-Screen Detail Overlay & Dynamic SVG Infographic Animations */

const cardDetailsData = [
  {
    tag: 'PREMIUM ANTI-AGING',
    title: '전신 항노화 케어',
    subtitle: 'Cellular Rejuvenation',
    concept: '피부 겉면만 일시적으로 당겨주는 시술이 아닙니다. 노화로 저하된 내 몸속 세포를 젊고 건강한 상태로 되돌려, 피부 탄력은 물론 전신의 활력을 함께 되찾아주는 근본적인 안티에이징 치료입니다.',
    conceptImage: '/detail1-concept.webp',
    mechanisms: [
      {
        title: '잠든 재생 세포 깨우기 (파라크라인 효과)',
        desc: '우리 몸에 들어간 줄기세포는 노화로 인해 활동을 멈춘 피부와 조직의 세포들에게 신호를 보내 다시 일하도록 만듭니다. 잠들어 있던 세포들이 스스로 깨어나 손상된 부위를 복구하기 시작합니다.',
        image: '/detail1-mechanism1.webp'
      },
      {
        title: '천연 콜라겐 자가 생성',
        desc: '외부에서 인공 물질(필러 등)을 억지로 주입하지 않습니다. 내 몸의 세포가 스스로 양질의 콜라겐과 엘라스틴을 대량으로 만들어내도록 유도하여, 탄력을 잃고 무너진 피부 속 지지대를 튼튼하게 다시 세웁니다.',
        image: '/detail1-mechanism2.webp'
      }
    ],
    effects: [
      '처진 얼굴선의 자연스러운 리프팅 및 꺼진 볼륨 복원',
      '피부 속 두께가 증가하며 깊게 패인 주름(진성 주름) 완화',
      '화장품으로 채울 수 없는 피부 속부터 우러나오는 윤기(광채)',
      '전반적인 신체 컨디션 회복 및 노화로 인한 무기력함 개선'
    ]
  },
  {
    tag: 'PAIN & JOINT REGENERATION',
    title: '비수술 관절·통증 재생',
    subtitle: 'Deep Tissue Healing',
    concept: '수술에 대한 두려움과 오랜 회복 기간 없이, 내 몸이 가진 본연의 치유력으로 손상된 조직을 다시 세웁니다. 닳고 찢겨 통증을 유발하는 관절과 인대에 줄기세포를 직접 투여하여, 염증을 잠재우고 조직 자체를 건강하게 재생시키는 근본적인 비수술 치료입니다.',
    conceptImage: '/detail2-concept.webp',
    mechanisms: [
      {
        title: '통증의 뿌리를 찾아가는 스마트 추적 시스템',
        desc: '우리 몸에 투여된 줄기세포는 염증이 있거나 손상된 부위가 보내는 \'구조 신호\'를 스스로 감지하여 정확하게 찾아갑니다. 통증의 근원지에 도달하여 강력한 항염증 성분을 뿜어내어 지긋지긋한 만성 통증과 붓기를 빠르게 가라앉힙니다.',
        image: '/detail2-mechanism1.webp'
      },
      {
        title: '손상된 연골과 인대의 직접 재생',
        desc: '단순히 통증만 일시적으로 가리는 진통제나 스테로이드가 아닙니다. 손상된 부위에 자리 잡은 줄기세포는 연골과 인대 세포로 직접 변환되어, 닳아 없어진 빈 공간을 튼튼하고 쫀쫀한 새 조직으로 채워 넣습니다.',
        image: '/detail2-mechanism2.webp'
      }
    ],
    effects: [
      '퇴행성 관절염으로 인한 무릎·어깨 통증의 획기적 완화',
      '스포츠 손상, 테니스 엘보 등 찢어진 인대 및 힘줄의 빠른 복구',
      '수술 및 마취에 대한 부담 없이 시술 후 빠른 일상생활 복귀',
      '진통제 의존도를 낮추고 자유롭고 편안한 움직임 회복'
    ]
  },
  {
    tag: 'SYSTEMIC REVITALIZATION',
    title: '신체 에너지 리마스터링',
    subtitle: 'Immunity & Vitality',
    concept: '단순한 피로 회복을 넘어, 신체 전반의 생체 나이를 낮추는 전신 케어 메커니즘을 설명합니다.',
    mechanisms: [
      {
        title: '미세 혈관 신생 (Angiogenesis)',
        desc: '줄기세포는 혈관 내피 성장인자(VEGF)를 분비하여 막히거나 노화된 미세 혈관망을 새로 구축합니다. 이를 통해 뇌와 전신 장기에 산소와 영양분이 폭발적으로 공급됩니다.'
      },
      {
        title: '면역 조절 (Immunomodulation)',
        desc: '과각성된 자가면역 반응은 가라앉히고, 저하된 방어력(NK세포 및 T세포 기능)은 끌어올려 신체의 면역 밸런스를 완벽한 상태로 재조정합니다. 활성산소(스트레스 물질)를 효과적으로 제거하여 세포 산화를 방지합니다.'
      }
    ],
    effects: [
      '만성 피로 증후군 개선 및 뇌 브레인 포그(Brain Fog) 해소',
      '수술 및 중증 질환 후 전신 컨디션의 급진적 회복'
    ],
    visualSvg: `
      <svg class="visual-svg" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M 40 200 L 220 200" stroke="rgba(255,255,255,0.06)" stroke-width="4" stroke-linecap="round"/>
        
        <path d="M 100 200 C 110 170, 130 150, 160 140" stroke="var(--color-gold)" stroke-width="1.2" stroke-linecap="round" fill="none" class="vessel-path"/>
        <path d="M 140 140 C 150 120, 180 110, 200 110" stroke="var(--color-gold)" stroke-width="1" stroke-linecap="round" fill="none" class="vessel-path" style="animation-delay: 1.8s;"/>
        
        <path d="M 170 200 C 180 230, 200 250, 220 260" stroke="var(--color-gold)" stroke-width="1.2" stroke-linecap="round" fill="none" class="vessel-path" style="animation-delay: 0.8s;"/>
        <path d="M 200 250 C 210 270, 230 280, 260 285" stroke="var(--color-gold)" stroke-width="1" stroke-linecap="round" fill="none" class="vessel-path" style="animation-delay: 2.6s;"/>
        
        <g transform="translate(290, 180)" class="nk-cell">
          <circle cx="0" cy="0" r="22" fill="rgba(100, 180, 240, 0.05)" stroke="rgba(100, 180, 240, 0.3)" stroke-width="1" stroke-dasharray="4 2"/>
          <polygon points="0,-15 4,-4 15,-4 6,2 9,13 0,6 -9,13 -6,2 -15,-4 -4,-4" fill="rgba(100, 180, 240, 0.12)" stroke="rgba(100, 180, 240, 0.7)" stroke-width="1.2" class="glowing-node-blue"/>
          <circle cx="0" cy="0" r="3" fill="rgba(100, 180, 240, 0.95)"/>
        </g>
        
        <circle cx="160" cy="140" r="2.5" fill="var(--color-gold)" class="vitality-bubble" style="--bx: -20px; animation-delay: 0.5s;"/>
        <circle cx="200" cy="110" r="2" fill="var(--color-gold)" class="vitality-bubble" style="--bx: 30px; animation-delay: 2.3s;"/>
        <circle cx="220" cy="260" r="3" fill="var(--color-gold)" class="vitality-bubble" style="--bx: -35px; animation-delay: 1.3s;"/>
        <circle cx="260" cy="285" r="2.5" fill="var(--color-gold)" class="vitality-bubble" style="--bx: 10px; animation-delay: 3.2s;"/>
      </svg>
    `
  },
  {
    tag: 'PREMIUM SKIN BEAUTY',
    title: '고품격 피부 미학의 완성',
    subtitle: 'Premium Skin Aesthetics',
    concept: '피부 표면의 즉각적인 빛과 결 개선에 초점을 맞추어, 기미와 색소 침착을 근본적으로 케어하고 투명한 귀족적 광채를 선사합니다.',
    mechanisms: [
      {
        title: '엑소좀(Exosome) 침투 기술',
        desc: '줄기세포 배양액의 핵심 유효 성분인 \'엑소좀(나노 크기의 세포 간 신호 전달 물질)\'을 피부 깊숙이 침투시킵니다. 이는 세포 간의 소통을 원활하게 하여 무너진 피부 장벽을 빠르게 복구합니다.'
      },
      {
        title: '색소 침착 억제',
        desc: '자외선과 노화로 인해 과다 생성되는 멜라닌 색소의 합성 경로(Tyrosinase 활성)를 차단하고, 표피의 턴오버(Turn-over) 주기를 정상화하여 이미 침착된 기미와 잡티를 빠르게 탈락시킵니다.'
      }
    ],
    effects: [
      '기미, 난치성 색소 침착 개선 및 균일한 화이트닝 효과',
      '넓어진 모공 축소 및 매끄러운 도자기 피부결 완성'
    ],
    visualSvg: `
      <svg class="visual-svg" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="50" y1="120" x2="350" y2="120" stroke="rgba(255,255,255,0.15)" stroke-width="1.2" class="skin-barrier-line" stroke-linecap="round"/>
        <line x1="50" y1="200" x2="350" y2="200" stroke="rgba(255,255,255,0.06)" stroke-width="1" stroke-dasharray="5 3"/>
        <line x1="50" y1="280" x2="350" y2="280" stroke="rgba(255,255,255,0.06)" stroke-width="1" stroke-dasharray="5 3"/>
        
        <text x="60" y="105" fill="rgba(255,255,255,0.25)" font-size="8" font-family="sans-serif" letter-spacing="1">EPIDERMIS (표피)</text>
        <text x="60" y="185" fill="rgba(255,255,255,0.25)" font-size="8" font-family="sans-serif" letter-spacing="1">DERMIS (진피)</text>

        <g class="exosome-node" style="animation-delay: 0s; --dx: 120px;">
          <circle cx="120" cy="100" r="6" fill="rgba(255,255,255,0.12)" stroke="var(--color-gold)" stroke-width="1" class="glowing-node"/>
          <circle cx="120" cy="100" r="2" fill="var(--color-gold)"/>
        </g>
        <g class="exosome-node" style="animation-delay: 1.4s; --dx: 220px;">
          <circle cx="220" cy="100" r="8" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.5)" stroke-width="1" style="filter: drop-shadow(0 0 5px rgba(255,255,255,0.4));"/>
          <circle cx="220" cy="100" r="2.5" fill="#fff"/>
        </g>
        <g class="exosome-node" style="animation-delay: 2.6s; --dx: 280px;">
          <circle cx="280" cy="100" r="6" fill="rgba(255,255,255,0.12)" stroke="var(--color-gold)" stroke-width="1" class="glowing-node"/>
          <circle cx="280" cy="100" r="2" fill="var(--color-gold)"/>
        </g>

        <g class="melanin-target" style="animation-delay: 0s;">
          <circle cx="120" cy="260" r="10" fill="none" stroke="rgba(212,175,55,0.12)" stroke-width="1" stroke-dasharray="2 2"/>
          <circle cx="120" cy="260" r="4" fill="rgba(130, 95, 45, 0.35)" stroke="rgba(130, 95, 45, 0.7)" stroke-width="1"/>
        </g>
        <g class="melanin-target" style="animation-delay: 1.4s;">
          <circle cx="220" cy="260" r="14" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1" stroke-dasharray="2 2"/>
          <circle cx="220" cy="260" r="5" fill="rgba(130, 95, 45, 0.35)" stroke="rgba(130, 95, 45, 0.7)" stroke-width="1"/>
        </g>
        <g class="melanin-target" style="animation-delay: 2.6s;">
          <circle cx="280" cy="260" r="10" fill="none" stroke="rgba(212,175,55,0.12)" stroke-width="1" stroke-dasharray="2 2"/>
          <circle cx="280" cy="260" r="4" fill="rgba(130, 95, 45, 0.35)" stroke="rgba(130, 95, 45, 0.7)" stroke-width="1"/>
        </g>
      </svg>
    `
  }
];

function initDetailPages() {
  const overlay = document.getElementById('detail-overlay');
  if (!overlay) return;

  const closeBtn = document.getElementById('detail-close-btn');
  const overlayBg = overlay.querySelector('.detail-overlay-bg');
  const dynamicContent = document.getElementById('detail-dynamic-content');

  const cards = document.querySelectorAll('.essence-card');

  // Open details
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const index = parseInt(card.getAttribute('data-card-index'), 10);
      if (isNaN(index) || !cardDetailsData[index]) return;

      const data = cardDetailsData[index];

      // Check if it's the new landing page format (has conceptImage)
      if (data.conceptImage) {
        dynamicContent.classList.add('scroll-mode');
        
        let mechanismsHtml = '';
        data.mechanisms.forEach(mech => {
          mechanismsHtml += `
            <div class="mechanism-item">
              <span class="mechanism-item-title">${mech.title}</span>
              <p class="mechanism-item-desc">${mech.desc}</p>
              ${mech.image ? `<img src="${mech.image}" class="detail-section-img" alt="${mech.title}">` : ''}
            </div>
          `;
        });

        let effectsHtml = '';
        data.effects.forEach(eff => {
          effectsHtml += `<li class="effect-item">${eff}</li>`;
        });

        dynamicContent.innerHTML = `
          <div class="detail-scroll-inner">
            <span class="detail-tag">${data.tag}</span>
            <h2 class="detail-title text-serif">${data.title}</h2>
            <span class="detail-subtitle">${data.subtitle}</span>
            
            <div class="detail-concept-box">
              <span class="concept-label">TREATMENT CONCEPT</span>
              <p class="detail-concept">${data.concept}</p>
            </div>
            
            <img src="${data.conceptImage}" class="detail-hero-img" alt="Treatment Concept">

            <div class="detail-sections">
              <div class="detail-section">
                <h4 class="section-title text-serif">치료 메커니즘 (The Science)</h4>
                <div class="mechanism-list">
                  ${mechanismsHtml}
                </div>
              </div>

              <div class="detail-section">
                <h4 class="section-title text-serif">전문적 기대 효과</h4>
                <ul class="effect-list">
                  ${effectsHtml}
                </ul>
              </div>
            </div>
          </div>
        `;
      } else {
        // Legacy Split Layout
        dynamicContent.classList.remove('scroll-mode');
        
        let mechanismsHtml = '';
        data.mechanisms.forEach(mech => {
          mechanismsHtml += `
            <div class="mechanism-item">
              <span class="mechanism-item-title">${mech.title}</span>
              <p class="mechanism-item-desc">${mech.desc}</p>
            </div>
          `;
        });

        let effectsHtml = '';
        data.effects.forEach(eff => {
          effectsHtml += `<li class="effect-item">${eff}</li>`;
        });

        dynamicContent.innerHTML = `
          <div class="detail-content-side">
            <span class="detail-tag">${data.tag}</span>
            <h2 class="detail-title text-serif">${data.title}</h2>
            <span class="detail-subtitle">${data.subtitle}</span>

            <div class="detail-concept-box">
              <span class="concept-label">TREATMENT CONCEPT</span>
              <p class="detail-concept">${data.concept}</p>
            </div>

            <div class="detail-sections">
              <div class="detail-section">
                <h4 class="section-title text-serif">치료 메커니즘 (The Science)</h4>
                <div class="mechanism-list">
                  ${mechanismsHtml}
                </div>
              </div>

              <div class="detail-section">
                <h4 class="section-title text-serif">전문적 기대 효과</h4>
                <ul class="effect-list">
                  ${effectsHtml}
                </ul>
              </div>
            </div>
          </div>

          <div class="detail-visual-side">
            <div class="visual-canvas-container">
              ${data.visualSvg}
            </div>
          </div>
        `;
      }

      // Show Overlay
      overlay.classList.add('active');
      
      // Lock background scroll without jumping
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.setAttribute('data-scroll-y', scrollY);
    });
  });

  // Close details
  function closeOverlay() {
    overlay.classList.remove('active');
    
    // Unlock background scroll and restore position
    const scrollY = parseInt(document.body.getAttribute('data-scroll-y') || '0', 10);
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, scrollY);
    
    // Clear dynamic content after transition to save resources
    setTimeout(() => {
      if (!overlay.classList.contains('active')) {
        dynamicContent.innerHTML = '';
      }
    }, 500);
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeOverlay);
  }

  if (overlayBg) {
    overlayBg.addEventListener('click', closeOverlay);
  }

  // Handle ESC key to close
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      closeOverlay();
    }
  });
}
