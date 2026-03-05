# Verification — palantir-deep-research-20260305

## 1) 파일 존재 확인
```bash
ls -l _posts/2026-03-05-palantir-deep-research.md
```
Result:
- `-rw-------  1 kjaylee  staff  6289 Mar  5 17:19 _posts/2026-03-05-palantir-deep-research.md`

## 2) 필수 섹션 확인
```bash
grep -n "Executive Summary" -n _posts/2026-03-05-palantir-deep-research.md
grep -n "비즈니스 모델" -n _posts/2026-03-05-palantir-deep-research.md
grep -n "플랫폼" -n _posts/2026-03-05-palantir-deep-research.md
grep -n "재무" -n _posts/2026-03-05-palantir-deep-research.md
grep -n "리스크" -n _posts/2026-03-05-palantir-deep-research.md
grep -n "시나리오" -n _posts/2026-03-05-palantir-deep-research.md
```
Result:
- `9:## Executive Summary`
- `14:## 1) 비즈니스 모델: 구독 + 서비스`
- `19:## 2) 플랫폼 스택: Gotham · Foundry · Apollo · AIP`
- `32:## 4) 재무 요약`
- `54:## 6) 리스크 요인`
- `61:## 7) 시나리오 분석`

## 3) 출처 링크 확인
```bash
grep -n "investors.palantir.com/files" -n _posts/2026-03-05-palantir-deep-research.md
```
Result:
- `10:...Q4 2025 Investor Presentation.pdf`
- `15:...2024 FY PLTR 10-K.pdf`
- `26:...Palantir Q4 2024 Business Update.pdf`
- `82:...2024 FY PLTR 10-K.pdf`
- `84:...Palantir Q4 2025 Investor Presentation.pdf`
