# Verification — mobile-ad-frequency-cap-roi-calculator

## 1) Syntax check
Command:
```bash
node --check tools/mobile-ad-frequency-cap-roi-calculator/script.js && echo "NODE_CHECK_OK"
```
Result:
- `NODE_CHECK_OK`

## 2) Tests
- 별도 테스트 파일 미추가(요구사항: test 추가 시에만 `node --test` 실행).

## 3) Manifest rebuild
Command:
```bash
bash scripts/build-manifests.sh
```
Result:
- `games/manifest.json: 357개`
- `tools/manifest.json: 538개`
- `완료!`

## 4) Local HTTP 200 proof
Command:
```bash
python3 -m http.server 48273
curl -s -o /tmp/mobile-ad-frequency-cap.html -w "%{http_code}" http://127.0.0.1:48273/tools/mobile-ad-frequency-cap-roi-calculator/
```
Result:
- `HTTP_STATUS=200`
- `PAGE_TITLE=Mobile Ad Frequency Cap ROI Calculator | 모바일 광고 빈도 캡 ROI 계산기`

## 5) Wiring checks
- `tools/index.md` 신규 항목 추가
- `tools/index.html` 카드 추가
- `tools/manifest.json` 신규 slug 포함 확인
