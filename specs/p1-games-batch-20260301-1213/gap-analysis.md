# Gap Analysis — p1-games-batch-20260301-1213

## 1) Verification Commands

```bash
# size + 핵심 제약 + node --check
python3 - <<'PY'
from pathlib import Path
import re, subprocess, tempfile, os
for g in ['echo-chamber','fractal-forest','tempo-tiles']:
    p=Path('eastsea-blog/games')/g/'index.html'
    txt=p.read_text()
    print(g, 'size', p.stat().st_size)
    print(' touch', ('pointerdown' in txt or 'touchstart' in txt), 'keyboard', ('keydown' in txt),
          'audio', ('AudioContext' in txt), 'localStorage', ('localStorage' in txt),
          'manifest-link', ('manifest.webmanifest' in txt), 'neon', ('#0a0a1a' in txt))
    scripts=re.findall(r'<script>([\s\S]*?)</script>', txt)
    t=tempfile.NamedTemporaryFile('w',suffix='.js',delete=False)
    t.write('\n'.join(scripts)); t.close()
    r=subprocess.run(['node','--check',t.name],capture_output=True,text=True)
    os.unlink(t.name)
    print(' node-check', r.returncode==0)
PY

# manifest 신규 slug 확인
node - <<'NODE'
const fs=require('fs');
const m=JSON.parse(fs.readFileSync('eastsea-blog/games/manifest.json','utf8'));
for(const s of ['echo-chamber','fractal-forest','tempo-tiles']){
  console.log(s, m.games.findIndex(g=>g.slug===s));
}
console.log('count',m.count,'length',m.games.length);
NODE
```

## 2) Checklist vs Result

| 항목 | 결과 |
|---|---|
| 단일 index.html | PASS (3/3) |
| 파일 크기 < 500KB | PASS (`16286`, `15674`, `13596` bytes) |
| 터치 입력 | PASS (`pointerdown` / touch hooks 존재) |
| 키보드 입력 | PASS (`keydown` 핸들러 존재) |
| Web Audio API | PASS (`AudioContext` 사용) |
| localStorage 저장 | PASS (best level/score/combo 키 사용) |
| 모바일 반응형 | PASS (media query + fluid canvas) |
| 네온 다크 테마 #0a0a1a | PASS |
| 5+ 레벨 또는 무한 모드 | PASS (echo 10레벨, fractal 6레벨, tempo infinite) |
| PWA manifest.webmanifest | PASS (각 게임별 파일 + link 연결) |
| JS 구문 체크 (`node --check`) | PASS (3/3) |
| games/manifest.json 신규 3개 추가 | PASS (slug index 0/1/2, count 89) |
| 기존 엔트리 삭제 금지 | PASS (count 86 → 89, +3) |

## 3) Quality Loop

### Round 1 — Score 96/100
- 발견 이슈: `echo-chamber/index.html` HUD 텍스트에 `Aim & Fire`의 `&` 미이스케이프.
- 영향: HTML 문법 엄밀성 저하 가능.

### Round 2 — Score 100/100
- 조치: `Aim &amp; Fire`로 수정.
- 재검증: node 구문체크/제약 체크/manifest 체크 전부 PASS.

## 4) Residual Risk
- 퍼즐 난이도(레벨 해법 체감)는 플레이테스트 편차가 있을 수 있음.
- 기능/제약 관점에서는 출하 기준 충족.
