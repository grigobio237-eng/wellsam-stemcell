const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzngGtQ17CyjrbDSPKnfGKh1KqFAlXgGQKZRaS4Y4dxCyNb-SudXxkpPBcOeDmLEm1kTQ/exec";

let step = 1;
const totalSteps = 12;
let formData = {
  name: '',
  gender: '',
  ageGroup: '',
  phone: '',
  privacyConsent: false,
  marketingConsent: false,
  thirdPartyConsent: false,
  q1Score: 5,
  q2Track: null,
  q3: '',
  q4: '',
  q5: '',
  q6: '',
  q7: '',
  q8: '',
  q9: '',
  q10: '',
  q11Date: '',
  q12Memo: ''
};

let isSubmitting = false;
let analysisLoading = false;

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('consultation-btn');
  if (btn) {
    btn.addEventListener('click', openModal);
  }
});

window.openModal = function() {
  const modal = document.getElementById('consultation-modal');
  modal.classList.remove('cf-modal-hidden');
  modal.classList.add('cf-modal-open');
  // Body scroll 막기
  document.body.style.overflow = 'hidden';
  step = 1;
  renderStep();
};

window.closeModal = function() {
  const modal = document.getElementById('consultation-modal');
  modal.classList.remove('cf-modal-open');
  modal.classList.add('cf-modal-hidden');
  document.body.style.overflow = '';
};

window.handleNext = function() {
  if (step < totalSteps) {
    step++;
    renderStep();
  }
};

window.handlePrev = function() {
  if (step > 1) {
    if (step === 12 && analysisLoading) return;
    step--;
    renderStep();
  }
};

window.updateData = function(field, value) {
  formData[field] = value;
  renderStep(); // Re-render to update UI (like React)
};

window.submitStep1 = async function() {
  if (!formData.name || !formData.phone || !formData.gender || !formData.ageGroup) {
    alert("이름, 연령대, 성별, 연락처를 모두 입력해 주세요.");
    return;
  }
  if (!formData.privacyConsent) {
    alert("개인정보 수집 및 이용에 동의해 주세요.");
    return;
  }
  
  // Step 1 임시 저장 API 호출
  try {
    fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' }, // CORS issue prevention
      body: JSON.stringify({
        action: "step1",
        timestamp: new Date().toISOString(),
        name: formData.name,
        gender: formData.gender,
        ageGroup: formData.ageGroup,
        phone: formData.phone,
        marketingConsent: formData.marketingConsent,
        thirdPartyConsent: formData.thirdPartyConsent
      })
    });
  } catch (error) {
    console.error("Step 1 전송 실패:", error);
  }
  
  handleNext();
};

window.handleQ10Next = function() {
  step = 12;
  analysisLoading = true;
  renderStep();
  
  setTimeout(() => {
    analysisLoading = false;
    renderStep();
  }, 2500);
};

window.submitFinal = async function() {
  if (!formData.q11Date) {
    alert("희망하시는 대면 상담 일정을 선택해 주세요.");
    return;
  }

  isSubmitting = true;
  renderStep();
  
  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: "final",
        timestamp: new Date().toISOString(),
        ...formData
      })
    });
    alert("상담 신청이 완료되었습니다. 전문 의료진이 확인 후 연락드리겠습니다.");
    closeModal();
  } catch (error) {
    console.error("최종 전송 실패:", error);
    alert("전송 중 오류가 발생했습니다. 다시 시도해 주세요.");
  } finally {
    isSubmitting = false;
    renderStep();
  }
};

function getTrackQuestions() {
  if (formData.q2Track === 'A') {
    return {
      q3: { title: "아침에 일어날 때의 피로감이나 기력 저하 수준은 어떠신가요?", options: ["매우 심함", "보통", "양호"] },
      q4: { title: "최근 기억력, 집중력 감소나 급격한 체력 저하를 경험하셨나요?", options: ["자주 느낌", "가끔 느낌", "없음"] },
      q5: { title: "감기 등 잔병치레가 잦거나, 상처나 염증이 잘 낫지 않는 편인가요?", options: ["그렇다", "아니다"] },
      q6: { title: "줄기세포 치료를 통해 기대하는 항노화 목표는 무엇인가요?", options: ["신체 활력 복원", "면역력 강화", "노화 질환 예방"] },
    };
  } else if (formData.q2Track === 'B') {
    return {
      q3: { title: "현재 가장 통증이나 불편함이 심한 관절 부위는 어디인가요?", options: ["무릎", "어깨", "척추·허리", "기타"] },
      q4: { title: "해당 부위의 통증이 시작된 지 얼마나 되셨나요?", options: ["3개월 미만", "6개월~1년", "1년 이상 만성"] },
      q5: { title: "현재 통증의 강도를 표현한다면?", options: ["뻐근한 수준", "움직일 때 통증", "가만히 있어도 통증"] },
      q6: { title: "과거 해당 부위로 진단받은 병명이나 치료 경험(수술, 주사 등)이 있으신가요?", type: "textarea" },
    };
  } else {
    return {
      q3: { title: "현재 피부와 관련하여 가장 해결하고 싶은 탄력/노화 고민은 무엇인가요?", options: ["깊은 주름", "탄력 저하 및 처짐", "푸석한 안색"] },
      q4: { title: "기미, 잡티, 색소 침착 등 안색을 어둡게 하는 고민이 동반되나요?", options: ["매우 심함", "약간 있음", "없음"] },
      q5: { title: "평소 피부과 레이저나 스킨부스터 시술을 주기적으로 받으시는 편인가요?", options: ["자주 받음", "가끔 받음", "거의 안 받음"] },
      q6: { title: "시술 후 기대하시는 피부 개선 방향은 무엇인가요?", options: ["자연스러운 탄력 리프팅", "맑고 투명한 피부톤", "흉터 및 요철 재생"] },
    };
  }
}

function renderStep() {
  const modal = document.getElementById('consultation-modal');
  if (!modal) return;
  
  const progressPercent = Math.min(100, Math.round(((step - 1) / (totalSteps - 1)) * 100));
  const trackQs = formData.q2Track ? getTrackQuestions() : null;
  const trackNames = {
    'A': '전신 항노화 및 면역 피로 관리',
    'B': '비수술 관절 및 만성 통증 치료',
    'C': '프리미엄 피부 세포 재생술'
  };

  let contentHtml = '';

  if (step === 1) {
    contentHtml = `
      <div class="cf-space-y-6">
        <h2 class="cf-title">맞춤형 자가진단을 위한<br/><span class="cf-highlight">기본 정보</span>를 입력해 주세요.</h2>
        <div class="cf-space-y-4">
          <div>
            <label class="cf-label">성함</label>
            <input type="text" class="cf-input" placeholder="홍길동" value="${formData.name}" onchange="updateData('name', this.value)">
          </div>
          <div class="cf-flex-gap-4">
            <div style="flex:1;">
              <label class="cf-label">연령대</label>
              <select class="cf-input" onchange="updateData('ageGroup', this.value)" style="cursor: pointer; appearance: none; background: transparent url('data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'24\\' height=\\'24\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'2\\' stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\'><polyline points=\\'6 9 12 15 18 9\\'></polyline></svg>') no-repeat right 4px center; padding-right: 24px;">
                <option value="" disabled ${!formData.ageGroup ? 'selected' : ''}>선택해주세요</option>
                <option value="10대" ${formData.ageGroup === '10대' ? 'selected' : ''}>10대</option>
                <option value="20대" ${formData.ageGroup === '20대' ? 'selected' : ''}>20대</option>
                <option value="30대" ${formData.ageGroup === '30대' ? 'selected' : ''}>30대</option>
                <option value="40대" ${formData.ageGroup === '40대' ? 'selected' : ''}>40대</option>
                <option value="50대" ${formData.ageGroup === '50대' ? 'selected' : ''}>50대</option>
                <option value="60대 이상" ${formData.ageGroup === '60대 이상' ? 'selected' : ''}>60대 이상</option>
              </select>
            </div>
            <div style="flex:1;">
              <label class="cf-label">성별</label>
              <div class="cf-flex-gap-4">
                <label class="cf-radio-btn ${formData.gender === '남성' ? 'active' : ''}" style="padding: 8px 0;">
                  <input type="radio" class="cf-hidden" name="gender" value="남성" ${formData.gender === '남성' ? 'checked' : ''} onchange="updateData('gender', '남성')">남성
                </label>
                <label class="cf-radio-btn ${formData.gender === '여성' ? 'active' : ''}" style="padding: 8px 0;">
                  <input type="radio" class="cf-hidden" name="gender" value="여성" ${formData.gender === '여성' ? 'checked' : ''} onchange="updateData('gender', '여성')">여성
                </label>
              </div>
            </div>
          </div>
          <div>
            <label class="cf-label">연락처</label>
            <input type="tel" class="cf-input" placeholder="010-0000-0000" value="${formData.phone}" onchange="updateData('phone', this.value)">
          </div>
          <div class="cf-pt-4 cf-space-y-2">
            <label class="cf-checkbox-label">
              <input type="checkbox" ${formData.privacyConsent ? 'checked' : ''} onchange="updateData('privacyConsent', this.checked)">
              <span>[필수] 개인정보 수집 및 이용 동의</span>
            </label>
            <label class="cf-checkbox-label">
              <input type="checkbox" ${formData.marketingConsent ? 'checked' : ''} onchange="updateData('marketingConsent', this.checked)">
              <span>[선택] 더웰샘 VIP 초청 이벤트 및 소식지 수신 동의</span>
            </label>
            <label class="cf-checkbox-label">
              <input type="checkbox" ${formData.thirdPartyConsent ? 'checked' : ''} onchange="updateData('thirdPartyConsent', this.checked)">
              <span>[선택] 양·한방 협진 및 정밀 상담을 위한 제3자 정보 제공 동의</span>
            </label>
          </div>
        </div>
        <button onclick="submitStep1()" class="cf-btn-primary cf-mt-8">사전상담 시작하기</button>
      </div>
    `;
  } else if (step === 2) {
    contentHtml = `
      <div class="cf-text-center cf-space-y-8">
        <h2 class="cf-title">최근 6개월간 본인이 체감하는<br/><span class="cf-highlight">전신 건강 점수</span>는 몇 점인가요?</h2>
        <div class="cf-py-8">
          <span class="cf-score-text">${formData.q1Score}</span><span class="cf-score-total">/ 10</span>
          <input type="range" min="1" max="10" value="${formData.q1Score}" onchange="updateData('q1Score', parseInt(this.value))" oninput="updateData('q1Score', parseInt(this.value))" class="cf-range mt-8">
          <div class="cf-flex-between cf-text-xs mt-2">
            <span>매우 나쁨</span>
            <span>매우 좋음</span>
          </div>
        </div>
        <button onclick="handleNext()" class="cf-btn-primary">다음</button>
      </div>
    `;
  } else if (step === 3) {
    const opts = [
      { id: 'A', text: '전신 항노화 및 면역 피로 관리' },
      { id: 'B', text: '비수술 관절 및 만성 통증 치료' },
      { id: 'C', text: '프리미엄 피부 세포 재생술' }
    ];
    let btns = opts.map(o => `
      <button onclick="updateData('q2Track', '${o.id}'); setTimeout(handleNext, 300);" class="cf-option-btn ${formData.q2Track === o.id ? 'active' : ''}">${o.text}</button>
    `).join('');
    contentHtml = `
      <div class="cf-space-y-8">
        <h2 class="cf-title">오늘 자가진단을 통해<br/>가장 <span class="cf-highlight">정밀하게 체크</span>받고 싶은 영역은 어디인가요?</h2>
        <div class="cf-space-y-3">${btns}</div>
      </div>
    `;
  } else if (step >= 4 && step <= 7) {
    const qKey = 'q' + (step - 1);
    const qData = trackQs[qKey];
    if (qData.type === 'textarea') {
      contentHtml = `
        <div class="cf-space-y-8">
          <h2 class="cf-title">${qData.title}</h2>
          <div class="cf-space-y-4">
            <textarea class="cf-textarea" onchange="updateData('${qKey}', this.value)">${formData[qKey]}</textarea>
            <button onclick="handleNext()" class="cf-btn-primary" ${!formData[qKey] ? 'disabled' : ''}>다음</button>
          </div>
        </div>
      `;
    } else {
      let btns = qData.options.map(o => `
        <button onclick="updateData('${qKey}', '${o}'); setTimeout(handleNext, 300);" class="cf-option-btn ${formData[qKey] === o ? 'active' : ''}">${o}</button>
      `).join('');
      contentHtml = `
        <div class="cf-space-y-8">
          <h2 class="cf-title">${qData.title}</h2>
          <div class="cf-space-y-3">${btns}</div>
        </div>
      `;
    }
  } else if (step === 8) {
    const opts = ['없음', '고혈압·당뇨약', '아스피린·항응고제'];
    let btns = opts.map(o => `
      <button onclick="updateData('q7', '${o}'); setTimeout(handleNext, 300);" class="cf-option-btn ${formData.q7 === o ? 'active' : ''}">${o}</button>
    `).join('');
    const isCustom = formData.q7 && !opts.includes(formData.q7);
    contentHtml = `
      <div class="cf-space-y-8">
        <h2 class="cf-title">현재 정기적으로 복용 중인 약물이 있으신가요?</h2>
        <div class="cf-space-y-3">
          ${btns}
          <div class="cf-flex-gap-2 mt-2">
            <input type="text" placeholder="기타 (직접 입력)" value="${isCustom ? formData.q7 : ''}" onchange="updateData('q7', this.value)" class="cf-input-flex">
            <button onclick="handleNext()" class="cf-btn-dark-small" ${!formData.q7 ? 'disabled' : ''}>다음</button>
          </div>
        </div>
      </div>
    `;
  } else if (step === 9) {
    contentHtml = `
      <div class="cf-space-y-8">
        <h2 class="cf-title">최근 5년 이내에 진단받으신 주요 질환(암, 자가면역질환 등)이 있으신가요?</h2>
        <div class="cf-space-y-3">
          <button onclick="updateData('q8', '없음'); setTimeout(handleNext, 300);" class="cf-option-btn ${formData.q8 === '없음' ? 'active' : ''}">없음</button>
          <div class="cf-col-gap-3 pt-2">
            <label class="cf-label-small">있으시다면 질환명을 입력해 주세요.</label>
            <div class="cf-flex-gap-2">
              <input type="text" placeholder="예: 류마티스 관절염" value="${formData.q8 !== '없음' ? formData.q8 : ''}" onchange="updateData('q8', this.value)" class="cf-input-flex">
              <button onclick="handleNext()" class="cf-btn-dark-small" ${!formData.q8 ? 'disabled' : ''}>다음</button>
            </div>
          </div>
        </div>
      </div>
    `;
  } else if (step === 10) {
    const opts = ['6시간 미만 · 숙면 못함', '6~7시간 · 보통', '8시간 이상 · 숙면'];
    let btns = opts.map(o => `
      <button onclick="updateData('q9', '${o}'); setTimeout(handleNext, 300);" class="cf-option-btn ${formData.q9 === o ? 'active' : ''}">${o}</button>
    `).join('');
    contentHtml = `
      <div class="cf-space-y-8">
        <h2 class="cf-title">평소 하루 평균 수면 시간과 수면의 질은 어떠신가요?</h2>
        <div class="cf-space-y-3">${btns}</div>
      </div>
    `;
  } else if (step === 11) {
    const opts = ['비음주 · 비흡연', '음주만 가끔', '흡연 중', '둘 다 해당'];
    let btns = opts.map(o => `
      <button onclick="updateData('q10', '${o}'); setTimeout(handleQ10Next, 300);" class="cf-option-btn ${formData.q10 === o ? 'active' : ''}">${o}</button>
    `).join('');
    contentHtml = `
      <div class="cf-space-y-8">
        <h2 class="cf-title">일주일 기준 음주 빈도와 흡연 여부를 체크해 주세요.</h2>
        <div class="cf-space-y-3">${btns}</div>
      </div>
    `;
  } else if (step === 12) {
    if (analysisLoading) {
      contentHtml = `
        <div class="cf-loading-box">
          <div class="cf-spinner"></div>
          <h3>세포 데이터 및 라이프스타일 분석 중...</h3>
        </div>
      `;
    } else {
      contentHtml = `
        <div class="cf-space-y-8 cf-animate-up">
          <div class="cf-result-box">
            <p class="cf-result-eyebrow">ANALYSIS COMPLETE</p>
            <h2 class="cf-result-title">분석 결과, <span>[${trackNames[formData.q2Track] || ''}]</span> 단계로 추정됩니다.</h2>
            <p class="cf-result-desc">의료진의 정밀 분석 상담을 위한 VVIP 프라이빗 룸 예약을 도와드립니다.</p>
          </div>
          <div class="cf-space-y-6">
            <div>
              <label class="cf-label-bold">희망 대면 상담 일정</label>
              <input type="datetime-local" value="${formData.q11Date}" onchange="updateData('q11Date', this.value)" class="cf-input-full">
            </div>
            <div>
              <label class="cf-label-bold">의료진에게 미리 전달하실 특이사항 (선택)</label>
              <textarea class="cf-textarea-small" onchange="updateData('q12Memo', this.value)" placeholder="이전에 받으신 시술이나, 특별히 피하고 싶으신 치료법이 있다면 적어주세요.">${formData.q12Memo}</textarea>
            </div>
            <button onclick="submitFinal()" class="cf-btn-primary-gold" ${isSubmitting ? 'disabled' : ''}>
              ${isSubmitting ? '<div class="cf-spinner-small"></div>' : '맞춤 상담 신청 완료하기'}
            </button>
          </div>
        </div>
      `;
    }
  }

  // Footer Navigation
  let footerHtml = '';
  if (step > 1 && step < 12 && !analysisLoading) {
    footerHtml = `
      <div class="cf-footer">
        <div class="cf-footer-inner">
          <button onclick="handlePrev()" class="cf-prev-btn">이전으로</button>
          <span class="cf-step-count">${step} / 11</span>
          <div style="width:60px;"></div>
        </div>
      </div>
    `;
  }

  modal.innerHTML = `
    <div class="cf-header-sticky">
      <div class="cf-header-inner">
        <div class="cf-logo">THE WELLSAM</div>
        <button onclick="closeModal()" class="cf-close-btn">&times;</button>
      </div>
      <div class="cf-progress-bg">
        <div class="cf-progress-bar" style="width: ${progressPercent}%"></div>
      </div>
    </div>
    <div class="cf-content-area cf-animate-up" id="cf-content">
      <div class="cf-w-full">
        ${contentHtml}
      </div>
    </div>
    ${footerHtml}
  `;
}
