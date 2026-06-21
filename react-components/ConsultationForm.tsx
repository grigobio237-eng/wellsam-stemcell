"use client";

import React, { useState } from 'react';

// Google Apps Script Web App URL (상단에 상수로 배치)
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzSNAEvPE1XRL8o1AEXj3-6JeeOdhofDnSrldDAdv7HMfT1K7F1iZSrv5SFlKA_NgpW2w/exec";

interface FormData {
  name: string;
  gender: string;
  phone: string;
  privacyConsent: boolean;
  marketingConsent: boolean;
  thirdPartyConsent: boolean;
  q1Score: number;
  q2Track: 'A' | 'B' | 'C' | null;
  q3: string;
  q4: string;
  q5: string;
  q6: string;
  q7: string;
  q8: string;
  q9: string;
  q10: string;
  q11Date: string;
  q12Memo: string;
}

const initialFormData: FormData = {
  name: '',
  gender: '',
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

export default function ConsultationForm({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  const totalSteps = 12;
  const progressPercent = Math.min(100, Math.round(((step - 1) / (totalSteps - 1)) * 100));

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) {
      if (step === 12 && analysisLoading) return; // 로딩 중 뒤로가기 방지
      setStep(step - 1);
    }
  };

  const handleChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const onSubmitStep1 = async () => {
    if (!formData.name || !formData.phone || !formData.gender) {
      alert("이름, 성별, 연락처를 모두 입력해 주세요.");
      return;
    }
    if (!formData.privacyConsent) {
      alert("개인정보 수집 및 이용에 동의해 주세요.");
      return;
    }

    // Step 1 임시 저장 (중간 이탈자 팔로우업용)
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: "step1",
          timestamp: new Date().toISOString(),
          name: formData.name,
          gender: formData.gender,
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

  const onSubmitFinal = async () => {
    if (!formData.q11Date) {
      alert("희망하시는 대면 상담 일정을 선택해 주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: "final",
          timestamp: new Date().toISOString(),
          ...formData
        })
      });
      alert("상담 신청이 완료되었습니다. 전문 의료진이 확인 후 연락드리겠습니다.");
      onClose();
    } catch (error) {
      console.error("최종 전송 실패:", error);
      alert("전송 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQ10Next = () => {
    setStep(12);
    setAnalysisLoading(true);
    setTimeout(() => {
      setAnalysisLoading(false);
    }, 2500);
  };

  // 트랙별 질문 세팅
  const renderTrackSpecificQuestions = () => {
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
  };

  const trackQs = formData.q2Track ? renderTrackSpecificQuestions() : null;

  const trackNames = {
    'A': '전신 항노화 및 면역 피로 관리',
    'B': '비수술 관절 및 만성 통증 치료',
    'C': '프리미엄 피부 세포 재생술'
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#FDFBF7] overflow-y-auto">
      {/* Header & Progress */}
      <div className="sticky top-0 w-full bg-[#FDFBF7]/90 backdrop-blur-md z-10">
        <div className="flex justify-between items-center px-6 py-4 max-w-3xl mx-auto">
          <div className="text-sm font-semibold tracking-widest text-[#D4AF37]">THE WELLSAM</div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-800 transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Progress Bar */}
        <div className="h-1 w-full bg-gray-200">
          <div
            className="h-full bg-[#D4AF37] transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Form Content */}
      <div className="flex-1 flex items-center justify-center p-6 w-full max-w-2xl mx-auto animate-fade-in-up">
        <div className="w-full space-y-8">

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl md:text-3xl font-light text-gray-800">
                맞춤형 자가진단을 위한<br />
                <span className="font-medium text-[#D4AF37]">기본 정보</span>를 입력해 주세요.
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">성함</label>
                  <input type="text" value={formData.name} onChange={e => handleChange('name', e.target.value)}
                    className="w-full border-b border-gray-300 py-2 bg-transparent focus:outline-none focus:border-[#D4AF37] transition-colors text-lg"
                    placeholder="홍길동" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">성별</label>
                  <div className="flex gap-4">
                    {['남성', '여성'].map(gender => (
                      <label key={gender} className={`flex-1 text-center py-3 border rounded cursor-pointer transition-all ${formData.gender === gender ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37] font-medium' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                        <input type="radio" className="hidden" name="gender" value={gender} checked={formData.gender === gender} onChange={() => handleChange('gender', gender)} />
                        {gender}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">연락처</label>
                  <input type="tel" value={formData.phone} onChange={e => handleChange('phone', e.target.value)}
                    className="w-full border-b border-gray-300 py-2 bg-transparent focus:outline-none focus:border-[#D4AF37] transition-colors text-lg"
                    placeholder="010-0000-0000" />
                </div>
                <div className="pt-4 space-y-2">
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input type="checkbox" checked={formData.privacyConsent} onChange={e => handleChange('privacyConsent', e.target.checked)} className="accent-[#D4AF37] w-4 h-4" />
                    <span>[필수] 개인정보 수집 및 이용 동의</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input type="checkbox" checked={formData.marketingConsent} onChange={e => handleChange('marketingConsent', e.target.checked)} className="accent-[#D4AF37] w-4 h-4" />
                    <span>[선택] 더웰샘 VIP 초청 이벤트 및 소식지 수신 동의</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input type="checkbox" checked={formData.thirdPartyConsent} onChange={e => handleChange('thirdPartyConsent', e.target.checked)} className="accent-[#D4AF37] w-4 h-4" />
                    <span>[선택] 양·한방 협진 및 정밀 상담을 위한 제3자 정보 제공 동의</span>
                  </label>
                </div>
              </div>
              <button onClick={onSubmitStep1} className="w-full bg-[#1A1817] text-white py-4 rounded font-medium hover:bg-black transition-colors mt-8">
                진단 시작하기
              </button>
            </div>
          )}

          {/* STEP 2: Q1 */}
          {step === 2 && (
            <div className="space-y-8 text-center">
              <h2 className="text-2xl md:text-3xl font-light text-gray-800 leading-relaxed">
                최근 6개월간 본인이 체감하는<br />
                <span className="font-medium">전신 건강 점수</span>는 몇 점인가요?
              </h2>
              <div className="py-8">
                <span className="text-5xl font-light text-[#D4AF37]">{formData.q1Score}</span><span className="text-2xl text-gray-400 ml-1">/ 10</span>
                <input
                  type="range" min="1" max="10" value={formData.q1Score}
                  onChange={e => handleChange('q1Score', parseInt(e.target.value))}
                  className="w-full mt-8 accent-[#D4AF37]"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>매우 나쁨</span>
                  <span>매우 좋음</span>
                </div>
              </div>
              <button onClick={handleNext} className="w-full bg-[#1A1817] text-white py-4 rounded font-medium hover:bg-black transition-colors">다음</button>
            </div>
          )}

          {/* STEP 3: Q2 */}
          {step === 3 && (
            <div className="space-y-8">
              <h2 className="text-2xl md:text-3xl font-light text-gray-800 leading-relaxed">
                오늘 자가진단을 통해<br />
                가장 <span className="font-medium">정밀하게 체크</span>받고 싶은 영역은 어디인가요?
              </h2>
              <div className="space-y-3">
                {[
                  { id: 'A', text: '전신 항노화 및 면역 피로 관리' },
                  { id: 'B', text: '비수술 관절 및 만성 통증 치료' },
                  { id: 'C', text: '프리미엄 피부 세포 재생술' }
                ].map(opt => (
                  <button key={opt.id}
                    onClick={() => { handleChange('q2Track', opt.id); setTimeout(handleNext, 300); }}
                    className={`w-full text-left px-6 py-5 border rounded transition-all duration-300 ${formData.q2Track === opt.id ? 'border-[#D4AF37] bg-[#D4AF37]/5 shadow-[0_0_15px_rgba(212,175,55,0.1)]' : 'border-gray-200 hover:border-[#D4AF37]/50 bg-white'}`}
                  >
                    <span className="text-lg text-gray-800">{opt.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Q3 */}
          {step === 4 && trackQs && (
            <div className="space-y-8">
              <h2 className="text-2xl md:text-3xl font-light text-gray-800 leading-relaxed">
                {trackQs.q3.title}
              </h2>
              <div className="space-y-3">
                {trackQs.q3.options?.map(opt => (
                  <button key={opt}
                    onClick={() => { handleChange('q3', opt); setTimeout(handleNext, 300); }}
                    className={`w-full text-left px-6 py-5 border rounded transition-all duration-300 ${formData.q3 === opt ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-gray-200 hover:border-[#D4AF37]/50 bg-white'}`}
                  >
                    <span className="text-lg text-gray-800">{opt}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: Q4 */}
          {step === 5 && trackQs && (
            <div className="space-y-8">
              <h2 className="text-2xl md:text-3xl font-light text-gray-800 leading-relaxed">
                {trackQs.q4.title}
              </h2>
              <div className="space-y-3">
                {trackQs.q4.options?.map(opt => (
                  <button key={opt}
                    onClick={() => { handleChange('q4', opt); setTimeout(handleNext, 300); }}
                    className={`w-full text-left px-6 py-5 border rounded transition-all duration-300 ${formData.q4 === opt ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-gray-200 hover:border-[#D4AF37]/50 bg-white'}`}
                  >
                    <span className="text-lg text-gray-800">{opt}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 6: Q5 */}
          {step === 6 && trackQs && (
            <div className="space-y-8">
              <h2 className="text-2xl md:text-3xl font-light text-gray-800 leading-relaxed">
                {trackQs.q5.title}
              </h2>
              <div className="space-y-3">
                {trackQs.q5.options?.map(opt => (
                  <button key={opt}
                    onClick={() => { handleChange('q5', opt); setTimeout(handleNext, 300); }}
                    className={`w-full text-left px-6 py-5 border rounded transition-all duration-300 ${formData.q5 === opt ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-gray-200 hover:border-[#D4AF37]/50 bg-white'}`}
                  >
                    <span className="text-lg text-gray-800">{opt}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 7: Q6 */}
          {step === 7 && trackQs && (
            <div className="space-y-8">
              <h2 className="text-2xl md:text-3xl font-light text-gray-800 leading-relaxed">
                {trackQs.q6.title}
              </h2>
              {trackQs.q6.type === "textarea" ? (
                <div className="space-y-4">
                  <textarea
                    value={formData.q6}
                    onChange={e => handleChange('q6', e.target.value)}
                    className="w-full h-32 p-4 border border-gray-300 rounded focus:outline-none focus:border-[#D4AF37] bg-white resize-none"
                    placeholder="자유롭게 기재해 주세요."
                  />
                  <button onClick={handleNext} disabled={!formData.q6} className="w-full bg-[#1A1817] text-white py-4 rounded font-medium hover:bg-black transition-colors disabled:opacity-50">다음</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {trackQs.q6.options?.map(opt => (
                    <button key={opt}
                      onClick={() => { handleChange('q6', opt); setTimeout(handleNext, 300); }}
                      className={`w-full text-left px-6 py-5 border rounded transition-all duration-300 ${formData.q6 === opt ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-gray-200 hover:border-[#D4AF37]/50 bg-white'}`}
                    >
                      <span className="text-lg text-gray-800">{opt}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 8: Q7 */}
          {step === 8 && (
            <div className="space-y-8">
              <h2 className="text-2xl md:text-3xl font-light text-gray-800 leading-relaxed">
                현재 정기적으로 복용 중인 약물이 있으신가요?
              </h2>
              <div className="space-y-3">
                {['없음', '고혈압·당뇨약', '아스피린·항응고제'].map(opt => (
                  <button key={opt}
                    onClick={() => { handleChange('q7', opt); setTimeout(handleNext, 300); }}
                    className={`w-full text-left px-6 py-5 border rounded transition-all duration-300 ${formData.q7 === opt ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-gray-200 hover:border-[#D4AF37]/50 bg-white'}`}
                  >
                    <span className="text-lg text-gray-800">{opt}</span>
                  </button>
                ))}
                <div className="flex gap-2">
                  <input type="text" placeholder="기타 (직접 입력)" value={formData.q7 !== '없음' && formData.q7 !== '고혈압·당뇨약' && formData.q7 !== '아스피린·항응고제' ? formData.q7 : ''}
                    onChange={e => handleChange('q7', e.target.value)}
                    className="flex-1 border border-gray-300 rounded px-6 py-4 focus:outline-none focus:border-[#D4AF37] bg-white" />
                  <button onClick={handleNext} disabled={!formData.q7} className="px-8 bg-[#1A1817] text-white rounded font-medium hover:bg-black transition-colors">다음</button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 9: Q8 */}
          {step === 9 && (
            <div className="space-y-8">
              <h2 className="text-2xl md:text-3xl font-light text-gray-800 leading-relaxed">
                최근 5년 이내에 진단받으신 주요 질환(암, 자가면역질환 등)이 있으신가요?
              </h2>
              <div className="space-y-3">
                <button onClick={() => { handleChange('q8', '없음'); setTimeout(handleNext, 300); }}
                  className={`w-full text-left px-6 py-5 border rounded transition-all duration-300 ${formData.q8 === '없음' ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-gray-200 hover:border-[#D4AF37]/50 bg-white'}`}
                >
                  <span className="text-lg text-gray-800">없음</span>
                </button>
                <div className="flex flex-col gap-3 pt-2">
                  <label className="text-sm text-gray-500">있으시다면 질환명을 입력해 주세요.</label>
                  <div className="flex gap-2">
                    <input type="text" placeholder="예: 류마티스 관절염" value={formData.q8 !== '없음' ? formData.q8 : ''}
                      onChange={e => handleChange('q8', e.target.value)}
                      className="flex-1 border border-gray-300 rounded px-6 py-4 focus:outline-none focus:border-[#D4AF37] bg-white" />
                    <button onClick={handleNext} disabled={!formData.q8} className="px-8 bg-[#1A1817] text-white rounded font-medium hover:bg-black transition-colors">다음</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 10: Q9 */}
          {step === 10 && (
            <div className="space-y-8">
              <h2 className="text-2xl md:text-3xl font-light text-gray-800 leading-relaxed">
                평소 하루 평균 수면 시간과 수면의 질은 어떠신가요?
              </h2>
              <div className="space-y-3">
                {['6시간 미만 · 숙면 못함', '6~7시간 · 보통', '8시간 이상 · 숙면'].map(opt => (
                  <button key={opt}
                    onClick={() => { handleChange('q9', opt); setTimeout(handleNext, 300); }}
                    className={`w-full text-left px-6 py-5 border rounded transition-all duration-300 ${formData.q9 === opt ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-gray-200 hover:border-[#D4AF37]/50 bg-white'}`}
                  >
                    <span className="text-lg text-gray-800">{opt}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 11: Q10 */}
          {step === 11 && (
            <div className="space-y-8">
              <h2 className="text-2xl md:text-3xl font-light text-gray-800 leading-relaxed">
                일주일 기준 음주 빈도와 흡연 여부를 체크해 주세요.
              </h2>
              <div className="space-y-3">
                {['비음주 · 비흡연', '음주만 가끔', '흡연 중', '둘 다 해당'].map(opt => (
                  <button key={opt}
                    onClick={() => { handleChange('q10', opt); setTimeout(handleQ10Next, 300); }}
                    className={`w-full text-left px-6 py-5 border rounded transition-all duration-300 ${formData.q10 === opt ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-gray-200 hover:border-[#D4AF37]/50 bg-white'}`}
                  >
                    <span className="text-lg text-gray-800">{opt}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 12: Loading & Result & Final Form */}
          {step === 12 && (
            <div>
              {analysisLoading ? (
                <div className="flex flex-col items-center justify-center space-y-6 py-20 animate-pulse">
                  <div className="w-16 h-16 border-4 border-gray-200 border-t-[#D4AF37] rounded-full animate-spin"></div>
                  <h3 className="text-xl text-gray-600 font-light">세포 데이터 및 라이프스타일 분석 중...</h3>
                </div>
              ) : (
                <div className="space-y-8 animate-fade-in-up">
                  <div className="bg-white p-8 rounded border border-[#D4AF37]/30 shadow-sm text-center">
                    <p className="text-sm text-[#D4AF37] font-semibold mb-2">ANALYSIS COMPLETE</p>
                    <h2 className="text-2xl font-light text-gray-800 mb-4">
                      분석 결과, <span className="font-medium">[{formData.q2Track ? trackNames[formData.q2Track] : ''}]</span> 단계로 추정됩니다.
                    </h2>
                    <p className="text-gray-500">의료진의 정밀 분석 상담을 위한 VVIP 프라이빗 룸 예약을 도와드립니다.</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">희망 대면 상담 일정</label>
                      <input
                        type="datetime-local"
                        value={formData.q11Date}
                        onChange={e => handleChange('q11Date', e.target.value)}
                        className="w-full border border-gray-300 rounded px-4 py-3 bg-white focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">의료진에게 미리 전달하실 특이사항 (선택)</label>
                      <textarea
                        value={formData.q12Memo}
                        onChange={e => handleChange('q12Memo', e.target.value)}
                        className="w-full h-24 p-4 border border-gray-300 rounded focus:outline-none focus:border-[#D4AF37] bg-white resize-none"
                        placeholder="이전에 받으신 시술이나, 특별히 피하고 싶으신 치료법이 있다면 적어주세요."
                      />
                    </div>
                    <button
                      onClick={onSubmitFinal}
                      disabled={isSubmitting}
                      className="w-full bg-[#1A1817] text-[#D4AF37] py-4 rounded text-lg font-medium hover:bg-black transition-colors disabled:opacity-70 flex justify-center items-center"
                    >
                      {isSubmitting ? (
                        <div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        "맞춤 상담 신청 완료하기"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Navigation Footer (except step 1, 12, or loading) */}
      {step > 1 && step < 12 && !analysisLoading && (
        <div className="fixed bottom-0 w-full bg-[#FDFBF7]/90 backdrop-blur-md border-t border-gray-200">
          <div className="flex justify-between items-center px-6 py-4 max-w-3xl mx-auto">
            <button onClick={handlePrev} className="text-gray-500 hover:text-gray-800 px-4 py-2 text-sm">
              이전으로
            </button>
            <span className="text-xs text-gray-400">{step} / 11</span>
            {/* 다음 버튼은 문항별로 내부에 구현되어 있으나, 스킵이나 보조 용도로 필요할 시 추가 가능 */}
            <div className="w-[60px]"></div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
