# Bloodline Nexus — QA 테스트 케이스

## 정적 (19건)

### S1. 구조
1. 단일 index.html — 인라인 script 블록 정확히 1개
2. `node --check` 통과 (문법 오류 없음)
3. `<title>`에 "블러드라인 넥서스" + "Bloodline Nexus" 포함
4. viewport meta + 터치 지원(touchstart listener) 존재

### S2. 연구 원천 명시
5. HTML 주석에 원천 4건 경로 포함 (v3/혈통분석-Nicks-Inbreeding.md, korea/bloodlines.md, v8/japan-triple-crown-eight.md, v8/korea-triple-crown-two.md)
6. `BN.SOURCES` — 4건, 각각 path+use 존재
7. 타이틀 화면 렌더에 연구 원천 안내 포함

### S3. 메카닉 상수 (v3 원문 직결)
8. COI 계산식 `Σ(0.5)^(n1+n2+1)` — calcCOI('mr-prospector','native-girl') = Native Dancer 경로 0.5^(1+1+1) = 0.125 (고도), calcCOI('deep-impact','ss-girl') = Sunday Silence 경로 0.5^(1+2+1) = 0.0625 (중등), calcCOI('contrail','ss-girl') = 0.03125 (경미)
9. COI 밴드 3단계 (경미 <0.04 / 중등 <0.10 / 고도 ≥0.10) — 보너스 3/7/12
10. 인브리딩 리스크 15%/30%/50% — 밴드 순응
11. Nicks 테이블: nd×htr=GOOD(+8), mp×htr=BAD(-4), 동계열=NEUTRAL
12. 잡종 강세: 계통 상이 +3, 양쪽 평균 52+ 시 +4 추가
13. 부자 계승 보너스 +6 (chain #4 전례 일치)
14. 성능 지수 = spd+end+sta, 각 30~90 클램프

### S4. 로직
15. 스탯 계산 NaN 방지 — calcCOI·평균·교배 경로에서 NaN/undefined 불가
16. pickSire/pickDam은 select 단계에서만 성공, 유효하지 않은 id 거부
17. breed는 선택 미완료 시 {ok:false}
18. finish 시 meta.plays +1, bestScore 갱신
19. resetAll → phase=title + localStorage 제거

## 런타임 (DOM 헤드리스 하니스, 30건)

### R1. 부트스트랩 (chain #3 적발 유형)
1. VM 로드 후 pageErrors=[]
2. window.BN export 존재
3. 로드 즉시 phase=title (부트스트랩 state)
4. 로드 즉시 render() 호출 → app.innerHTML에 "BLOODLINE NEXUS"
5. localStorage 세이브 복원 시 해당 phase로 부트

### R2. 시작 → 선택
6. startGame → phase=select, gen=1
7. 렌더에 씨수마/모계 카드 8+6장
8. G1 자마 없는 상태 → 내 혈통(foal) 카드 없음
9. legacy 각인 없으면 교배 보너스 안내 없음

### R3. 미리보기
10. pickSire('deep-impact') + pickDam('hail-girl') → COI 0 미리보기 (무근친), 잡종 강세 표기
11. pickSire('contrail') + pickDam('ss-girl') → COI 0.1563 (고도) 미리보기
12. pickSire('northern-dancer') + pickDam('hail-girl') → GOOD NICK 미리보기

### R4. 교배·리스크 (시드 고정 결정적)
13. breed() with 완전 선택 → {ok:true}, phase=result
14. 자마 스탯 3종 전부 정수 30~90, NaN 없음
15. 자마 성능 지수 = spd+end+sta 정합
16. lineage: sireName/damName/lineName 기록
17. 리스크 롤 판정 — 시드 스캔으로 riskHit true/false 케이스 모두 존재
18. 리스크 발현 시 페널티 반영(스탯 하강) + 이벤트 박스
19. 리스크 미발현 시 성공 박스 (인브리딩 고정 성공)

### R5. 세대 진행·승격
20. nextGen → phase=select, gen=2, 내 혈통 카드 노출
21. foal 카드를 씨수마로 선택 가능 (pickSire('foal-1'))
22. G3 완성 후 nextGen → phase=summary (최종 평가)

### R6. 평가·계승
23. summary 렌더에 등급(S/A/B/C) + 점수 산식
24. finish 시 meta.plays 증가·bestScore 갱신·persist
25. 스코어 200+ 명마 → localStorage에 legacy 후보 저장
26. retry → 새 세대 시작, startGame → legacy 각인 활성, G1 자마 전 스탯 +6
27. 계승 각인 텍스트에 "콘트레일" 또는 "딥 임팩트" 모티프 노출

### R7. 경계·저장
28. 잘못된 단계에서 breed/pickSire → {ok:false} 상태 불변
29. localStorage 복원 → 플레이 수 누적
30. 기록 초기화(wipe) → phase=title, localStorage 제거되어 재로드 시 초기 상태

## 성능 기준
- 1회 render ≤ 5ms (헤드리스 100회 평균)
- 교배 시뮬레이션 10만 회(무작위) — NaN/Infinity 0건