const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwpEszmtAJXLU4m0HxMJwFH_PdbsbYa38nHRCr3U8GO8eqf0qVZxneVroMiGX2ZoIBpQQ/exec";

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
  mainCategory: null, // 'STEM' or 'KBEAUTY'
  subCategory: null,  // 'STEM_1', 'KB_1', etc.
  subAnswers: { q1: '', q2: '', q3: '', q4: '' }, // Dynamic step 4-7
  commonAnswers: {
    medication: '', // step 8
    disease: '',    // step 9
    sleep: '',      // step 10
    lifestyle: ''   // step 11
  },
  q11Date: '',      // step 12 schedule
  q12Memo: ''       // step 12 memo
};

let isSubmitting = false;
let analysisLoading = false;

document.addEventListener('DOMContentLoaded', () => {
  const btns = document.querySelectorAll('.consultation-btn');
  btns.forEach(btn => btn.addEventListener('click', openModal));
});

window.openModal = function() {
  const modal = document.getElementById('consultation-modal');
  if(modal) {
    modal.classList.remove('cf-modal-hidden');
    modal.classList.add('cf-modal-open');
    document.body.style.overflow = 'hidden';
    step = 1;
    renderStep();
  }
};

window.closeModal = function() {
  const modal = document.getElementById('consultation-modal');
  if(modal) {
    modal.classList.remove('cf-modal-open');
    modal.classList.add('cf-modal-hidden');
    document.body.style.overflow = '';
  }
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

window.updateData = function(field, value, isSub = false, isCommon = false) {
  if (isSub) {
    formData.subAnswers[field] = value;
  } else if (isCommon) {
    formData.commonAnswers[field] = value;
  } else {
    formData[field] = value;
  }
  renderStep();
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
  
  try {
    fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
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

window.handleQ11Next = function() {
  step = 12;
  analysisLoading = true;
  renderStep();
  
  setTimeout(() => {
    analysisLoading = false;
    renderStep();
  }, 2500);
};

window.submitFinal = async function() {
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

// --- Questionnaire Data ---
const QUESTIONS = {
  'STEM_1': {
    title: '전신 항노화 상담',
    desc: '귀하의 소중한 일상에 스며든 미세한 변화를 체크하여, 가장 품격 있는 생체 활력 복원 플랜을 준비하겠습니다.',
    q: [
      { id: 'q1', title: '최근 일상에서 느끼시는 만성적인 피로감이 지속된 기간은 어느 정도이신가요?', options: ['1개월 ~ 3개월 미만 (최근 부쩍 피로함)', '3개월 ~ 6개월 미만 (쉬어도 피로가 풀리지 않음)', '6개월 이상 장기화 (만성적인 무기력감 동반)'] },
      { id: 'q2', title: '현재 수면의 상태나 아침에 일어나셨을 때의 컨디션은 어떠신가요?', options: ['잠들기가 어렵거나 깨는 등 깊은 수면을 취하지 못합니다.', '수면 시간은 충분하나 아침에 일어날 때 몸이 무겁습니다.', '수면 패턴이 매우 불규칙하여 일상 리듬이 무너진 느낌입니다.'] },
      { id: 'q3', title: '최근 전반적인 신체 컨디션 변화 중 가장 크게 체감하시는 부분은 무엇인가요?', options: ['기억력 및 집중력의 눈에 띄는 저하', '전반적인 체력 및 대사 기능 저하', '만성 피로로 인한 피부 안색 및 탄력 저하'] },
      { id: 'q4', title: '이번 프리미엄 항노화 케어를 통해 도달하고자 하시는 주된 목적은 무엇이신가요?', options: ['신체 전반의 활력 증진 및 젊음 유지', '종합적인 생체 나이 관리 및 건강한 노화 방지', '면역력 강화 및 만성 피로 리듬 개선'], custom: true }
    ]
  },
  'STEM_2': {
    title: '관절·통증 상담',
    desc: '일상의 움직임을 더 부드럽고 편안하게 만들기 위해, 현재 느끼시는 관절의 불편함을 세심하게 살피겠습니다.',
    q: [
      { id: 'q1', title: '현재 가장 불편함을 느끼시는 관절이나 통증 부위는 어디이신가요?', options: ['무릎 관절', '어깨 및 목', '허리 및 골반'], custom: true },
      { id: 'q2', title: '해당 부위의 통증이나 뻐근함 등 불편함이 지속된 기간은 어떻게 되시나요?', options: ['최근 1개월 이내에 갑자기 발생', '1개월 이상 ~ 6개월 미만 지속', '6개월 이상 지속된 만성적인 불편함'] },
      { id: 'q3', title: '일상생활 속에서 움직이실 때 느끼시는 불편함의 정도는 어느 수준이신가요?', options: ['특정 자세를 취하거나 무리하게 움직일 때만 미세한 통증', '계단을 오르내리거나 걸을 때 지속적인 시큰거림과 뻐근함', '가만히 있을 때도 불편함이 느껴져 숙면이나 일상에 지장이 있음'] },
      { id: 'q4', title: '과거에 해당 부위로 수술을 받으시거나 정기적인 시술을 받으신 경험이 있으신가요?', options: ['경험 없음 (처음 관리를 시작하는 단계)', '주사 치료, 도수 치료 등 보존적 시술 경험 있음', '수술적 치료를 받은 이력이 있음'] }
    ]
  },
  'STEM_3': {
    title: '면역·피로 상담',
    desc: '외부 스트레스로부터 귀하의 신체를 보호하는 힘, 면역 밸런스를 진단하여 무너진 컨디션의 근본적인 관리를 돕습니다.',
    q: [
      { id: 'q1', title: '하루 중 피로감이나 무기력함이 가장 심해지는 시간대는 언제이신가요?', options: ['기상 직후 및 오전 시간 (하루를 시작할 때가 가장 힘듦)', '오후 나른한 시간 (14시 ~ 17시 사이 급격한 저하)', '저녁 시간 이후 (일과를 마친 후 방전되는 느낌)', '시간대와 상관없이 하루 종일 지속되는 만성 피로'] },
      { id: 'q2', title: '현재 귀하의 일상적·업무적 스트레스 체감 정도는 어느 수준이신가요?', options: ['원만하게 조절 및 해소가 가능한 수준', '만성 피로를 유발할 정도로 다소 지속적인 수준', '두통, 소화불량 등 신체적 반응이 동반될 만큼 높은 수준'] },
      { id: 'q3', title: '최근 6개월 이내에 잦은 감기, 구내염, 피부 염증 등의 면역 저하 증상을 경험하신 적이 있으신가요?', options: ['거의 없습니다.', '컨디션이 급격히 떨어질 때 간혹 발생합니다.', '최근 들어 눈에 띄게 자주 발생하고, 한 번 발생하면 잘 회복되지 않습니다.'] },
      { id: 'q4', title: '가장 최근에 받으신 건강검진 결과 중 면역이나 피로 관련 특이 소견이 있으셨나요?', type: 'textarea' }
    ]
  },
  'STEM_4': {
    title: '피부·재생 상담',
    desc: '단순한 표면 관리를 넘어 피부 속 세포 생태계의 건강을 깨워, 가장 자연스럽고 건강한 피부 시간을 되돌려 드립니다.',
    q: [
      { id: 'q1', title: '최근 거울을 보실 때 가장 도드라지게 느끼시는 피부 탄력의 변화는 무엇인가요?', options: ['예전보다 피부가 얇아지고 푸석한 느낌이 듭니다.', '페이스 라인(턱선, 심술보 부위)이 미세하게 무너지기 시작했습니다.', '전반적인 탄력 저하와 함께 피부 처짐이 확연히 눈에 띕니다.'] },
      { id: 'q2', title: '현재 탄력 저하와 함께 가장 신경 쓰이는 피부 결 및 톤의 변화는 어떠하신가요?', options: ['눈가, 입가 주위의 미세한 잔주름 증가', '안색이 전체적으로 칙칙하고 어두워 보임', '기미, 잡티 등 불균형한 색소 침착 현상'] },
      { id: 'q3', title: '최근 1년 이내에 받으신 피부 미용 시술(레이저, 리프팅, 스킨부스터 등) 이력이 있으신가요?', options: ['이력 없음', '레이저 토닝이나 단순 수분 관리 위주로 받음', '고강도 리프팅(울쎄라, 써마지 등) 및 주사 시술 이력 있음'] },
      { id: 'q4', title: '더웰샘의 프리미엄 피부 재생 케어를 통해 가장 기대하시는 변화의 방향은 무엇인가요?', options: ['피부 속부터 차오르는 자연스러운 볼륨감과 탄력 회복', '맑고 투명한 안색 및 매끄러운 피부 결 개선', '민감해진 피부 장벽의 근본적인 강화와 건강한 생태계 조성'] }
    ]
  },
  'KB_1': {
    title: '피부미용 상담',
    desc: '고객님 본연의 아름다움이 가장 화사하게 빛날 수 있도록, 현재 가장 집중하고 싶으신 스킨 골(Skin Goal)을 선택해 주세요.',
    q: [
      { id: 'q1', title: '현재 피부 상태에서 가장 고품격으로 업그레이드하고 싶으신 부분은 무엇인가요?', options: ['탄력 & 리프팅 (느슨해진 페이스 라인 정리)', '톤 & 화이트닝 (맑고 균일한 우아한 안색)', '광채 & 수분 (속에서부터 차오르는 수분감과 부드러운 윤기)', '주름 & 안티에이징 (세월의 흔적이 느껴지는 부위 케어)'] },
      { id: 'q2', title: '기존에 타 기관에서 경험하셨던 피부 시술에 대한 전반적인 만족도는 어떠하셨나요?', options: ['효과는 만족스러웠으나, 유지 기간이 너무 짧아 아쉬웠습니다.', '시술 시 자극이나 통증이 강해 정기적인 관리가 부담스러웠습니다.', '기대했던 것에 비해 눈에 띄는 변화를 체감하지 못했습니다.', '피부 시술 경험이 없으며, 이번이 첫 관리입니다.'] },
      { id: 'q3', title: '더웰샘의 프리미엄 스킨 케어 프로그램 중 선호하시는 관리 스타일은 무엇인가요?', options: ['자극과 다운타임(회복 기간)이 거의 없어 즉각적인 일상 복귀가 가능한 케어', '시간이 다소 걸리더라도 근본적인 피부 환경을 정화하는 인텐시브 케어', '페이스 라인의 밸런스를 정교하게 잡아주는 맞춤형 디자인 케어'] },
      { id: 'q4', title: '시술을 통해 가장 개선하고 싶은 구체적인 부위가 있으시다면 적어주세요.', type: 'textarea' }
    ]
  },
  'KB_2': {
    title: '안면비대칭·안면마비 상담',
    desc: '섬세한 안면 근육의 밸런스를 바로잡아, 거울을 보거나 미소를 지을 때 가장 자연스럽고 편안한 표정을 찾아드립니다.',
    q: [
      { id: 'q1', title: '얼굴 전체의 밸런스 중에서 현재 가장 눈에 띄거나 조율을 원하시는 부위는 어디이신가요?', options: ['좌우가 다른 턱선 라인 및 비대칭 입꼬리', '눈썹 높낮이 및 눈매의 불균형', '목선 및 어깨 라인부터 이어지는 전반적인 얼굴 기울어짐', '안면마비 후유증으로 인한 특정 부위의 근육 경직 및 부자연스러움'] },
      { id: 'q2', title: '해당 안면 비대칭 우려나 불편한 증상이 처음 발생하거나 인지하신 시기는 언제인가요?', options: ['선천적이거나 수년 전부터 서서히 진행되어 인지함', '최근 수개월 이내에 외관상 눈에 띄기 시작함', '안면마비(구안와사 등) 질환 발병 후 후유증이 지속되는 상태'] },
      { id: 'q3', title: '더웰샘의 맞춤 밸런스 프로그램을 통해 가장 회복하고 싶으신 지향점은 무엇인가요?', options: ['대칭 조율을 통한 자연스럽고 균형 잡힌 인상 선사', '경직된 안면 근육의 부드러운 이완 및 자연스러운 미소 복원', '페이스와 넥 라인의 전반적인 실루엣 균형 복원'] },
      { id: 'q4', title: '과거에 관련하여 한의원이나 타 병원에서 치료를 받으신 적이 있으신가요?', type: 'textarea' }
    ]
  },
  'KB_3': {
    title: '성형수술 후 프로그램 상담',
    desc: '엄선된 사후 관리 솔루션을 통해 수술 후 생기는 불편함을 신속히 완화하고, 수술 본연의 아름다운 라인이 완성되도록 돕습니다.',
    q: [
      { id: 'q1', title: '최근에 받으신 성형수술 혹은 시술의 종류와 경과 기간은 어떻게 되시나요?', options: ['수술 후 2주 이내 (눈/코/윤곽/거상 등 직후 집중 케어가 필요한 시기)', '수술 후 2주 ~ 1개월 이내 (큰 붓기 완화 및 흉터 예방 관리가 필요한 시기)', '수술 후 1개월 이상 경과 (잔붓기 정리 및 조직 유착 관리가 필요한 시기)', '쁘띠 시술(필러, 실리프팅 등) 후 미세 붓기 관리 단계'] },
      { id: 'q2', title: '현재 일상생활에서 가장 덜어내고 싶으신 불편한 증상은 무엇인가요?', options: ['무겁게 남아있는 큰 붓기와 안색의 멍', '수술 부위 주변의 뻐근한 당김 및 일시적인 감각 저하', '피부 안쪽이 단단하게 뭉치는 듯한 흉살(유착 현상)의 우려'] },
      { id: 'q3', title: '이번 사후 관리 프로그램을 통해 집중적으로 케어받고 싶으신 부분은 무엇인가요?', options: ['빠른 일상 복귀를 위한 신속한 붓기 및 멍 케어', '절개선 및 수술 라인이 부드럽고 자연스럽게 자리 잡도록 돕는 스킨 케어', '수술 효과를 극대화하기 위한 전반적인 림프 순환 및 피부 탄력 관리'] },
      { id: 'q4', title: '수술 부위 외에 평소 순환 장애나 잘 붓는 체질을 가지고 계신가요?', options: ['아니오', '네, 평소에도 잘 붓는 체질입니다.'] }
    ]
  },
  'KB_4': {
    title: '다이어트 상담',
    desc: '무리하게 체중계 숫자만 줄이는 다이어트가 아닌, 신체 대사 리듬을 깨워 품격 있는 바디 실루엣과 건강한 활력을 디자인합니다.',
    q: [
      { id: 'q1', title: '현재 바디 라인 관리 중 가장 깊은 고민이 있으신 집중 케어 부위는 어디인가요?', options: ['복부 및 옆구리 라인', '허벅지 및 둔부(하체 라인)', '팔뚝 및 겨드랑이 주변(상체 실루엣)', '특정 부위보다는 전신 체지방 감소 및 밸런스 관리'] },
      { id: 'q2', title: '평소 일상에서 느끼시는 몸의 부종(붓기) 정도는 어떠하신가요?', options: ['아침이나 저녁 특정 시간대에 일시적으로 가볍게 붓는 편입니다.', '오후가 되면 신발이 꽉 끼거나 반지 착용이 힘들 정도로 부종이 심합니다.', '만성적인 부종으로 인해 몸이 항상 무겁고, 부종이 그대로 고착된 느낌입니다.'] },
      { id: 'q3', title: '귀하의 현재 대사 상태 및 생활 리듬은 어떠하다고 생각하시나요?', options: ['불규칙한 식습관이나 잦은 비즈니스 모임(회식)으로 관리가 어렵습니다.', '예전에 비해 대사가 느려져, 식사량을 줄여도 체중 관리가 쉽지 않습니다.', '일상적 스트레스로 인한 불규칙한 수면과 폭식 경향이 동반됩니다.'] },
      { id: 'q4', title: '이번 프리미엄 대사·체형 프로그램을 통해 이루고자 하시는 최종 목표는 무엇인가요?', options: ['무리한 체중 감량보다는 탄력 있고 매끄러운 바디 실루엣 디자인', '신체 컨디션을 저하시키지 않는 건강한 체지방 위주의 감량 (목표: 3~5kg 수준)', '전반적인 대사 기능 회복과 체질 개선을 동반한 감량 (목표: 5kg 이상 수준)'] }
    ]
  }
};

function renderStep() {
  const modal = document.getElementById('consultation-modal');
  if (!modal) return;
  
  const progressPercent = Math.min(100, Math.round(((step - 1) / (totalSteps - 1)) * 100));

  let contentHtml = '';

  if (step === 1) {
    // 1. Basic Info
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
        <button onclick="submitStep1()" class="cf-btn-primary cf-mt-8">다음 단계로 (1/11)</button>
      </div>
    `;
  } else if (step === 2) {
    // 2. Main Category Selection
    const opts = [
      { id: 'STEM', text: '줄기세포 재생 상담', desc: '근본적인 전신 컨디션 회복 및 재생 안티에이징' },
      { id: 'KBEAUTY', text: 'K-Beauty 프리미엄 상담', desc: '피부미용, 윤곽, 다이어트 등 프라이빗 뷰티 밸런스' }
    ];
    let btns = opts.map(o => `
      <div onclick="updateData('mainCategory', '${o.id}'); setTimeout(handleNext, 300);" class="cf-option-card ${formData.mainCategory === o.id ? 'active' : ''}">
        <div style="font-weight: 500; font-size: 1.1rem; margin-bottom: 4px; color: ${formData.mainCategory === o.id ? '#D4AF37' : '#111'}">${o.text}</div>
        <div style="font-size: 0.85rem; color: #666;">${o.desc}</div>
      </div>
    `).join('');
    contentHtml = `
      <div class="cf-space-y-8">
        <h2 class="cf-title">어떤 방향의<br/><span class="cf-highlight">프리미엄 케어 상담</span>을 원하시나요?</h2>
        <div class="cf-space-y-4">${btns}</div>
      </div>
    `;
  } else if (step === 3) {
    // 3. Sub Category Selection
    let opts = [];
    if (formData.mainCategory === 'STEM') {
      opts = [
        { id: 'STEM_1', text: '전신 항노화 상담' },
        { id: 'STEM_2', text: '관절·통증 상담' },
        { id: 'STEM_3', text: '면역·피로 상담' },
        { id: 'STEM_4', text: '피부·재생 상담' }
      ];
    } else {
      opts = [
        { id: 'KB_1', text: '피부미용 상담' },
        { id: 'KB_2', text: '안면비대칭·안면마비 상담' },
        { id: 'KB_3', text: '성형수술 후 프로그램 상담' },
        { id: 'KB_4', text: '다이어트 상담' }
      ];
    }
    let btns = opts.map(o => `
      <button onclick="updateData('subCategory', '${o.id}'); setTimeout(handleNext, 300);" class="cf-option-btn ${formData.subCategory === o.id ? 'active' : ''}">${o.text}</button>
    `).join('');
    contentHtml = `
      <div class="cf-space-y-8">
        <h2 class="cf-title">오늘 집중적으로<br/><span class="cf-highlight">체크받고 싶은 분야</span>를 선택해 주세요.</h2>
        <div class="cf-space-y-3">${btns}</div>
      </div>
    `;
  } else if (step >= 4 && step <= 7) {
    // 4~7. Specific Questions
    const qIndex = step - 4; // 0, 1, 2, 3
    const subData = QUESTIONS[formData.subCategory];
    if (!subData || !subData.q[qIndex]) {
        handleNext();
        return;
    }
    const qData = subData.q[qIndex];
    const qKey = qData.id; // q1, q2, q3, q4
    
    const introHtml = (step === 4) ? `
      <div style="background: rgba(212, 175, 55, 0.05); border-left: 3px solid #D4AF37; padding: 16px; margin-bottom: 32px;">
        <span style="font-family: 'Cinzel', serif; color: #D4AF37; font-size: 0.8rem; display: block; margin-bottom: 4px;">${subData.title}</span>
        <p style="font-size: 0.9rem; color: #444; line-height: 1.5; margin: 0;">${subData.desc}</p>
      </div>
    ` : '';

    if (qData.type === 'textarea') {
      contentHtml = `
        <div class="cf-space-y-8">
          ${introHtml}
          <h2 class="cf-title" style="font-size: 1.25rem;">${qData.title}</h2>
          <div class="cf-space-y-4">
            <textarea class="cf-textarea" onchange="updateData('${qKey}', this.value, true)" placeholder="여기에 자유롭게 작성해 주세요.">${formData.subAnswers[qKey]}</textarea>
            <button onclick="handleNext()" class="cf-btn-primary" ${!formData.subAnswers[qKey] ? 'disabled' : ''}>다음</button>
          </div>
        </div>
      `;
    } else {
      let btns = qData.options.map(o => `
        <button onclick="updateData('${qKey}', '${o}', true); setTimeout(handleNext, 300);" class="cf-option-btn ${formData.subAnswers[qKey] === o ? 'active' : ''}" style="text-align: left;">${o}</button>
      `).join('');
      
      const isCustomVal = formData.subAnswers[qKey] && !qData.options.includes(formData.subAnswers[qKey]);
      const customHtml = qData.custom ? `
        <div class="cf-flex-gap-2 mt-2">
          <input type="text" placeholder="기타 (직접 입력)" value="${isCustomVal ? formData.subAnswers[qKey] : ''}" onchange="updateData('${qKey}', this.value, true)" class="cf-input-flex">
          <button onclick="handleNext()" class="cf-btn-dark-small" ${!formData.subAnswers[qKey] ? 'disabled' : ''}>다음</button>
        </div>
      ` : '';

      contentHtml = `
        <div class="cf-space-y-8">
          ${introHtml}
          <h2 class="cf-title" style="font-size: 1.25rem; line-height: 1.5;">${qData.title}</h2>
          <div class="cf-space-y-3">
            ${btns}
            ${customHtml}
          </div>
        </div>
      `;
    }
  } else if (step === 8) {
    const opts = ['없음', '고혈압·당뇨약', '아스피린·항응고제'];
    let btns = opts.map(o => `
      <button onclick="updateData('medication', '${o}', false, true); setTimeout(handleNext, 300);" class="cf-option-btn ${formData.commonAnswers.medication === o ? 'active' : ''}">${o}</button>
    `).join('');
    const isCustom = formData.commonAnswers.medication && !opts.includes(formData.commonAnswers.medication);
    contentHtml = `
      <div class="cf-space-y-8">
        <h2 class="cf-title" style="font-size: 1.25rem;">현재 정기적으로 복용 중인 약물이 있으신가요?</h2>
        <div class="cf-space-y-3">
          ${btns}
          <div class="cf-flex-gap-2 mt-2">
            <input type="text" placeholder="기타 (직접 입력)" value="${isCustom ? formData.commonAnswers.medication : ''}" onchange="updateData('medication', this.value, false, true)" class="cf-input-flex">
            <button onclick="handleNext()" class="cf-btn-dark-small" ${!formData.commonAnswers.medication ? 'disabled' : ''}>다음</button>
          </div>
        </div>
      </div>
    `;
  } else if (step === 9) {
    contentHtml = `
      <div class="cf-space-y-8">
        <h2 class="cf-title" style="font-size: 1.25rem; line-height: 1.5;">최근 5년 이내에 진단받으신 주요 질환(암, 자가면역질환 등)이 있으신가요?</h2>
        <div class="cf-space-y-3">
          <button onclick="updateData('disease', '없음', false, true); setTimeout(handleNext, 300);" class="cf-option-btn ${formData.commonAnswers.disease === '없음' ? 'active' : ''}">없음</button>
          <div class="cf-col-gap-3 pt-2">
            <label class="cf-label-small">있으시다면 질환명을 입력해 주세요.</label>
            <div class="cf-flex-gap-2">
              <input type="text" placeholder="예: 류마티스 관절염" value="${formData.commonAnswers.disease !== '없음' ? formData.commonAnswers.disease : ''}" onchange="updateData('disease', this.value, false, true)" class="cf-input-flex">
              <button onclick="handleNext()" class="cf-btn-dark-small" ${!formData.commonAnswers.disease ? 'disabled' : ''}>다음</button>
            </div>
          </div>
        </div>
      </div>
    `;
  } else if (step === 10) {
    const opts = ['6시간 미만 · 숙면 못함', '6~7시간 · 보통', '8시간 이상 · 숙면'];
    let btns = opts.map(o => `
      <button onclick="updateData('sleep', '${o}', false, true); setTimeout(handleNext, 300);" class="cf-option-btn ${formData.commonAnswers.sleep === o ? 'active' : ''}">${o}</button>
    `).join('');
    contentHtml = `
      <div class="cf-space-y-8">
        <h2 class="cf-title" style="font-size: 1.25rem;">평소 하루 평균 수면 시간과 수면의 질은 어떠신가요?</h2>
        <div class="cf-space-y-3">${btns}</div>
      </div>
    `;
  } else if (step === 11) {
    const opts = ['비음주 · 비흡연', '음주만 가끔', '흡연 중', '둘 다 해당'];
    let btns = opts.map(o => `
      <button onclick="updateData('lifestyle', '${o}', false, true); setTimeout(handleQ11Next, 300);" class="cf-option-btn ${formData.commonAnswers.lifestyle === o ? 'active' : ''}">${o}</button>
    `).join('');
    contentHtml = `
      <div class="cf-space-y-8">
        <h2 class="cf-title" style="font-size: 1.25rem;">일주일 기준 음주 빈도와 흡연 여부를 체크해 주세요.</h2>
        <div class="cf-space-y-3">${btns}</div>
      </div>
    `;
  } else if (step === 12) {
    if (analysisLoading) {
      contentHtml = `
        <div class="cf-loading-box">
          <div class="cf-spinner"></div>
          <h3 style="margin-top: 16px; font-weight: 500; color: #444;">고객님의 상태와 기대 목적을<br>정리하는 중입니다...</h3>
        </div>
      `;
    } else {
      contentHtml = `
        <div class="cf-space-y-8 cf-animate-up">
          <div class="cf-result-box" style="border-top: 3px solid #D4AF37; padding-top: 32px;">
            <h2 class="cf-result-title" style="font-size: 1.4rem; line-height: 1.5; margin-bottom: 16px;">
              고객님의 현재 상태와 기대 목적이<br>잘 정리되었습니다.
            </h2>
            <p class="cf-result-desc" style="font-size: 1rem; color: #444; line-height: 1.6;">의료진이 이를 바탕으로 정밀한 상담을 준비하겠습니다. 원하시는 대면 상담 일정을 선택해 주세요.</p>
          </div>
          <div class="cf-space-y-6">
            <div>
              <label class="cf-label-bold">희망 대면 상담 일정</label>
              <input type="datetime-local" value="${formData.q11Date}" onchange="updateData('q11Date', this.value)" class="cf-input-full">
            </div>
            <div>
              <label class="cf-label-bold">의료진에게 미리 전달하실 특이사항 (선택)</label>
              <textarea class="cf-textarea-small" onchange="updateData('q12Memo', this.value)" placeholder="이전에 받으신 시술이나 특별히 피하고 싶으신 치료법이 있다면 적어주세요.">${formData.q12Memo}</textarea>
            </div>
            <button onclick="submitFinal()" class="cf-btn-primary-gold" ${isSubmitting ? 'disabled' : ''}>
              ${isSubmitting ? '<div class="cf-spinner-small"></div>' : '프라이빗 상담 예약 접수하기'}
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
