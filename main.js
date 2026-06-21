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
    tag: 'IMMUNITY & VITALITY',
    title: '면역력 강화 및 만성피로 회복',
    subtitle: 'Systemic Revitalization',
    concept: '아무리 쉬어도 풀리지 않는 무거운 몸, 수액이나 영양제로는 닿을 수 없는 피로의 근본 원인을 해결합니다. 체내에 주입된 줄기세포가 전신을 순환하며 노화되고 손상된 장기 세포를 깨우고, 무너진 신체 방어벽을 견고하게 재건하여 당신의 일상에 가볍고 맑은 활력을 되찾아 드립니다.',
    conceptImage: '/detail3-concept.webp',
    mechanisms: [
      {
        title: '전신 산소망 복구 (미세 혈관 신생)',
        desc: '줄기세포는 몸속 구석구석 혈액이 통하지 않는 막히고 좁아진 미세 혈관들을 새로 뚫고 연결합니다. 뇌와 척수, 전신 장기에 맑은 산소와 영양분이 폭발적으로 공급되면서 머리가 맑아지고 묵은 피로가 씻겨 내려갑니다.',
        image: '/detail3-mechanism1.webp'
      },
      {
        title: '무너진 방어 체계의 정상화',
        desc: '스트레스와 노화로 밸런스가 깨진 면역 세포들을 찾아내어 최적의 상태로 조율합니다. 외부 바이러스에 대한 강력한 방어막을 형성할 뿐만 아니라, 잦은 잔병치레와 자가면역 질환의 고통으로부터 내 몸을 든든하게 지켜냅니다.',
        image: '/detail3-mechanism2.webp'
      }
    ],
    effects: [
      '수면이나 휴식으로도 해결되지 않던 극심한 만성피로 증후군 개선',
      '면역력 저하로 인한 잦은 감기, 대상포진 등 감염성 질환 예방',
      '전반적인 신체 에너지 레벨 상승 및 뇌 안개(Brain Fog) 현상 완화',
      '질병이나 수술 후 급격히 떨어진 기력의 빠른 정상화'
    ]
  },
  {
    tag: 'PREMIUM SKIN AESTHETICS',
    title: '줄기세포 피부 재생술',
    subtitle: 'Ultimate Skin Rejuvenation',
    concept: '화장으로 가릴 수 없는 깊은 세월의 흔적과 피부 칙칙함, 이제 겉이 아닌 속부터 완벽하게 채웁니다. 줄기세포에 담긴 수백 가지의 강력한 성장인자가 피부 가장 깊은 곳까지 스며들어 무너진 탄력 기둥을 바로 세우고, 당신의 피부 본연이 가진 가장 맑고 눈부신 귀족적 광채를 깨워냅니다.',
    conceptImage: '/detail4-concept.webp',
    mechanisms: [
      {
        title: '진피층 탄력 기둥줄기 재건',
        desc: '단순히 수분을 채우는 것을 넘어섭니다. 줄기세포 성장인자는 피부의 뼈대 역할을 하는 진피층의 콜라겐과 엘라스틴 섬유망을 젊은 시절의 상태로 촘촘하고 단단하게 재조립하여, 처진 피부를 쫀쫀하게 끌어올립니다.',
        image: '/detail4-mechanism1.webp'
      },
      {
        title: '맑은 유리알 피부를 위한 색소 리셋',
        desc: '칙칙한 안색과 기미, 잡티의 원인이 되는 검은 색소(멜라닌)가 퍼지는 것을 강력하게 차단합니다. 피부 세포의 교체 주기를 10대 때처럼 빠르게 앞당겨, 묵은 각질과 색소가 자연스럽게 탈락하고 티 없이 맑고 투명한 새 피부가 차오르게 합니다.',
        image: '/detail4-mechanism2.webp'
      }
    ],
    effects: [
      '자연스럽게 차오르는 얼굴 볼륨 및 안면 리프팅 효과',
      '화장품으로 구현할 수 없는 피부 속부터 우러나는 고급스러운 물광',
      '오랜 시간 자리 잡은 기미, 깊은 주름, 색소 침착의 근본적 지우개 효과',
      '얇고 예민해진 피부 장벽을 튼튼하고 건강하게 복구'
    ]
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
