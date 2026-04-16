# Project Guide

## Language

- 기본 프로그램 언어는 TypeScript다.
- 자동화, 인덱싱, 분석, 검색, 리서치 루프 로직은 `scripts/*.ts` 기준으로 수정한다.
- 새 실행 스크립트는 Python 대신 TypeScript로 추가한다.

## Commands

- 인덱스 생성: `npm run index`
- 코퍼스 분석: `npm run analyze`
- CLI 검색: `npm run search -- "검색어"`
- 리서치 루프: `npm run research`
- 정보지 초안 생성: `npm run issue`
- 전체 자동 파이프라인: `npm run full-auto`
- 프로덕션 번들 생성: `npm run production`
- 프로덕션 미리보기: `npm run preview-production`
- 프로덕션 링크 검증: `npm run verify-production`
- 테스트 실행: `npm run test`
- 타입 검사: `npm run typecheck`

## Scope

- 검색 인덱스 출력물은 `search/`에 생성한다.
- 분석 결과는 `analysis/`에 생성한다.
- 자동 수집 결과는 `research/`에 생성한다.
