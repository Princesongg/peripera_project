# Peripera 웹 디자인 포트폴리오

React + Vite로 제작한 페리페라 웹 디자인 포트폴리오입니다. 스크롤 전환, 추천 제품 카드, 자동 순환 갤러리와 TOP 버튼을 구현했습니다.

## 실행

PowerShell 터미널에서 실행하세요.

```powershell
npm.cmd ci
npm.cmd run dev
```

터미널에 표시되는 Local 주소를 브라우저에서 열면 됩니다. 종료하려면 Ctrl + C를 누르세요.

## 검사와 빌드

```powershell
npm.cmd run lint
npm.cmd run build
npm.cmd run preview
```

## GitHub Pages 경로

빌드 기본 경로는 저장소 이름에 맞춘 `/peripera_project/`입니다. 미리보기 서버에서도 `/peripera_project/` 주소로 확인하세요.
Vite는 빌드할 때 CSS의 이미지·폰트 URL에도 이 경로를 적용합니다.
다른 경로에 배포할 경우 `vite.config.js`의 `base` 설정을 변경하세요.

## Vercel 배포

프로젝트 이름은 `peripera_project`이며 주소는 https://periperaproject.vercel.app/ 입니다.
Vercel 빌드에서는 `VERCEL` 환경 변수를 확인해 기본 경로 `/`를 사용합니다.
로그인 및 프로젝트 연결 후 `vercel deploy --prod`로 다시 배포할 수 있습니다.

## 주요 파일

- `src/App.jsx`: 메인 페이지 구성
- `src/components/`: 섹션과 인터랙션
- `public/images/`: 이미지
- `public/fonts/`: 폰트
- `vite.config.js`: 빌드와 배포 경로

## 커밋 대상

npm을 사용하며 `package-lock.json`을 포함합니다. `node_modules`, `dist`, 로그와 환경 변수 파일은 `.gitignore`로 제외합니다.
사이트 이미지와 폰트는 `public/`에 포함되어 있습니다.

이 프로젝트는 개인 포트폴리오이며 실제 상품 구매 기능은 제공하지 않습니다.
