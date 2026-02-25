---
title: "NotebookLM-py 리서치"
date: 2026-02-02 09:00:00 +0900
categories: [research]
tags: [notebooklm,python,ai]
---

## 개요/기능
`notebooklm-py`는 **Google NotebookLM용 비공식 Python API/CLI**다. 웹 UI에서 제공하지 않는 기능까지 포함해 **NotebookLM의 거의 모든 기능을 프로그래밍적으로 제어**할 수 있다는 점이 핵심이다. (공식 제품과 무관, undocumented API 사용)

핵심 기능 요약:
- 노트북/소스 관리, 채팅, 리서치, 공유 권한 제어
- Studio 생성물 전 범위: 오디오/비디오/슬라이드/인포그래픽/퀴즈/플래시카드/리포트/데이터테이블/마인드맵
- **웹 UI에 없는 기능**: 배치 다운로드, 퀴즈/플래시카드 JSON·MD·HTML export, 마인드맵 JSON 추출, 소스 fulltext 접근 등
- 사용 방식: **Python API / CLI / 에이전트 스킬(Claude Code 등)**

출처: [GitHub README](https://github.com/teng-lin/notebooklm-py)

---

## 설치/사용법
### 설치
```bash
pip install notebooklm-py

# 최초 로그인(브라우저 필요)
pip install "notebooklm-py[browser]"
playwright install chromium
```

### CLI 빠른 시작
```bash
notebooklm login
notebooklm create "My Research"
notebooklm use <notebook_id>
notebooklm source add "https://example.com"
notebooklm ask "핵심 요약"
notebooklm generate audio "요약을 흥미롭게" --wait
notebooklm download audio ./podcast.mp3
```

### Python API 예시
```python
import asyncio
from notebooklm import NotebookLMClient

async def main():
    async with await NotebookLMClient.from_storage() as client:
        nb = await client.notebooks.create("Research")
        await client.sources.add_url(nb.id, "https://example.com", wait=True)
        result = await client.chat.ask(nb.id, "Summarize this")
        print(result.answer)

asyncio.run(main())
```

출처: [README](https://github.com/teng-lin/notebooklm-py)

---

## API/인증 방식
- **`notebooklm login`**이 Playwright로 브라우저 로그인 → 쿠키를 `~/.notebooklm/storage_state.json`에 저장
- 인증 핵심은 **Google 쿠키(SID/HSID/SSID/APISID 등)**이며, 쿠키 만료 시 재로그인 필요
- **CI/CD용**으로 `NOTEBOOKLM_AUTH_JSON` 환경변수 지원(파일 쓰기 없이 인라인 인증)
- `NOTEBOOKLM_HOME`으로 저장 경로 분리/다중 계정 운용 가능
- CSRF 토큰/세션 ID는 **자동 갱신 로직** 포함(실패 시 재로그인 필요)
- 다운로드는 `httpx`로 쿠키 재사용 → **Playwright는 최초 로그인 때만 필요**

출처: [Configuration](https://github.com/teng-lin/notebooklm-py/blob/main/docs/configuration.md), [Troubleshooting](https://github.com/teng-lin/notebooklm-py/blob/main/docs/troubleshooting.md)

---

## 제한사항/리스크
- **비공식 라이브러리**: Google의 **undocumented API** 사용 → **엔드포인트 변경 시 즉시 깨질 수 있음**
- **Rate limit** 존재(문서화되지 않음). 대량 생성/연속 호출 시 RPC 오류 또는 `None` 응답 발생
- **Quota 제한**: 오디오/비디오/딥 리서치 등 기능별 일일/시간당 제한
- **파일 업로드 이슈**: 텍스트/Markdown 업로드가 `None` 반환 가능 → `add_text` 권장
- **대용량 파일**(약 20MB 이상) 업로드 타임아웃 가능
- **다운로드 URL 만료**: 오디오/비디오 링크는 몇 시간 내 만료 → 다운로드 전 최신 리스트 재조회 필요
- **로그인 제약**: GUI 없는 서버는 로그인 불가 → GUI 환경에서 인증 후 `storage_state.json` 복사 필요

출처: [README](https://github.com/teng-lin/notebooklm-py), [Troubleshooting](https://github.com/teng-lin/notebooklm-py/blob/main/docs/troubleshooting.md), [Development](https://github.com/teng-lin/notebooklm-py/blob/main/docs/development.md)

---

## 성공/실패 사례 (GitHub Issues)
- **Windows에서 CLI가 멈춤** (Issue #75)  
  Sandboxie 등 환경에서 `notebooklm list`가 무응답 → Windows 이벤트 루프 정책 문제. 해결책은 `WindowsSelectorEventLoopPolicy` 적용(현재 CLI는 자동 설정).  
  출처: <https://github.com/teng-lin/notebooklm-py/issues/75>

- **비영어권 Windows에서 UnicodeEncodeError** (PR/Issue #80)  
  `rich` 테이블 출력의 유니코드 체크마크가 로컬 인코딩(cp950 등)에서 충돌 → `PYTHONUTF8=1`로 해결.  
  출처: <https://github.com/teng-lin/notebooklm-py/pull/80>

- **에이전트 통합 제한** (Open Issue #43)  
  opencode에서 스킬 사용 시 명령 입력이 비어 보이는 문제 → 일부 에이전트 런타임에서 미지원/호환성 이슈 가능.  
  출처: <https://github.com/teng-lin/notebooklm-py/issues/43>

---

## 대체/비교
- **공식 API (NotebookLM Enterprise)**  
  Google Cloud의 공식 API는 OAuth 기반이며 엔터프라이즈 환경을 전제로 함. 안정성은 높지만 **소비자 NotebookLM 기능 전체를 그대로 노출하지는 않음**.  
  링크: <https://docs.cloud.google.com/gemini/enterprise/notebooklm-enterprise/docs/api-notebooks>

- **로컬/오픈소스 대체**
  - Local-NotebookLM: 로컬 LLM 기반 NotebookLM 유사 구현  
    <https://github.com/Goekdeniz-Guelmez/Local-NotebookLM>
  - open-notebook: 오픈소스 NotebookLM 대체  
    <https://github.com/lfnovo/open-notebook>
  - open-notebooklm: PDF→팟캐스트 변환 중심  
    <https://github.com/gabrielchua/open-notebooklm>

**요약 비교:**
- `notebooklm-py`: 실제 NotebookLM 백엔드 직접 제어(비공식/리스크 존재)
- 공식 Enterprise API: 안정적/공식 지원, 대상이 엔터프라이즈
- 로컬/오픈소스: 자유도 높지만 실제 NotebookLM과는 기능/품질 차이

---

## 관련 링크 모음
- GitHub: <https://github.com/teng-lin/notebooklm-py>
- PyPI: <https://pypi.org/project/notebooklm-py/>
- Troubleshooting: <https://github.com/teng-lin/notebooklm-py/blob/main/docs/troubleshooting.md>
- Configuration: <https://github.com/teng-lin/notebooklm-py/blob/main/docs/configuration.md>
- CLI Reference: <https://github.com/teng-lin/notebooklm-py/blob/main/docs/cli-reference.md>
- Issue #75 (Windows hang): <https://github.com/teng-lin/notebooklm-py/issues/75>
- PR/Issue #80 (Unicode error): <https://github.com/teng-lin/notebooklm-py/pull/80>
- Issue #43 (opencode): <https://github.com/teng-lin/notebooklm-py/issues/43>
- NotebookLM Help: <https://support.google.com/notebooklm/>
- NotebookLM Enterprise API: <https://docs.cloud.google.com/gemini/enterprise/notebooklm-enterprise/docs/api-notebooks>
