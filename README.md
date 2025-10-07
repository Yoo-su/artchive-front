# 📚 ArtChive: 문화와 지식을 잇는 아카이브

**ArtChive**는 스쳐 지나가는 문화 예술 정보와 잠들어 있는 중고 서적의 가치를 다시 발견하고 연결하는 웹 플랫폼입니다. 공연, 전시 등 다채로운 문화 예술 정보를 탐색하고, 소장하고 있던 중고 서적을 다른 사람과 쉽고 편리하게 거래하며 지식의 선순환을 만들어보세요.

<br/>

### 🌐 서비스 바로가기 (Service URL)

**[http://artchive-front-dun.vercel.app](http://artchive-front-dun.vercel.app)**

<br/>

---

## 🚀 주요 기능 (Features)

ArtChive는 사용자의 문화 생활과 지식 공유를 돕기 위해 다음과 같은 핵심 기능들을 제공합니다.

- **🎨 문화 예술 정보 탐색 (Art Discovery)**
  - 공연/전시 정보를 장르별, 상태별(공연중, 공연예정)로 필터링하여 조회할 수 있습니다.
  - KOPIS API를 활용하여 신뢰도 높은 최신 데이터를 제공합니다.
  - 스타일리시한 슬라이더 UI를 통해 사용자 경험을 극대화했습니다.

- **📖 중고 서적 거래 (Used Book Marketplace)**
  - 네이버 책 검색 API를 통해 판매할 도서 정보를 손쉽게 등록할 수 있습니다.
  - 판매 게시글에 대한 생성(Create), 조회(Read), 수정(Update), 삭제(Delete) 기능을 완벽하게 지원합니다.
  - 최신 등록된 판매글을 메인 페이지에서 바로 확인할 수 있습니다.

- **💬 실시간 채팅 (Real-time Chat)**
  - 판매자와 구매자 간의 1:1 실시간 채팅 기능을 제공하여 원활한 거래를 돕습니다.
  - Socket.IO를 기반으로 메시지 전송, 상대방 입력 상태 표시, 채팅방 나가기 등 필수적인 기능을 구현했습니다.
  - 채팅 위젯을 통해 어느 페이지에서든 채팅 목록을 확인하고 대화를 이어갈 수 있습니다.

- **🤖 AI 도서 요약**
  - Google Gemini LLM을 연동하여, 책 상세 페이지에서 AI가 생성한 핵심 요약 및 도서 추천 대상 정보를 제공합니다.

- **👤 간편한 소셜 로그인 및 마이페이지**
  - 카카오, 네이버 소셜 로그인을 통해 3초 만에 간편하게 서비스를 시작할 수 있습니다.
  - 마이페이지에서 내가 등록한 판매글 목록을 관리하고, 판매 상태를 손쉽게 변경할 수 있습니다.

---

## 🛠️ 기술 스택 (Tech Stack)

이 프로젝트는 현대적인 웹 개발 트렌드에 맞춰 검증되고 효율적인 기술들을 조합하여 구축되었습니다.

| 구분                 | 기술                                                                                                                                                                                               |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Framework**        | ![Next.js](https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white)                                                                                                             |
| **Language**         | ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)                                                                                                      |
| **Styling**          | ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white) ![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?logo=framer&logoColor=white) |
| **UI Components**    | **shadcn/ui** - 재사용 가능하고 접근성 높은 컴포넌트 라이브러리                                                                                                                                    |
| **State Management** | ![Zustand](https://img.shields.io/badge/Zustand-592815?logo=zustand&logoColor=white) (Global UI State) <br/> **TanStack Query** (Server State)                                                     |
| **Data Fetching**    | **TanStack Query (React Query)**, Axios, Fetch API                                                                                                                                                 |
| **Forms**            | **React Hook Form** + **Zod** (타입 기반 유효성 검사)                                                                                                                                              |
| **Authentication**   | **NextAuth.js** (Frontend)                                                                                                                                                                         |
| **Real-time**        | **Socket.IO Client**                                                                                                                                                                               |
| **Deployment**       | ![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white)                                                                                                                  |

---

## 💡 주요 기술적 내용 (Technical Highlights)

### 1. Feature-Based 아키텍처 도입

프로젝트의 유지보수성과 확장성을 높이기 위해 채택했습니다. `features`, `views`, `shared` 등의 계층으로 코드를 분리하여 관심사를 명확히 하고, 컴포넌트 및 로직의 재사용성을 극대화했습니다.

### 2. 서버 상태와 클라이언트 상태의 분리

- **TanStack Query (React Query)**: API 요청, 캐싱, 동기화 등 모든 서버 상태 관련 로직을 TanStack Query로 관리하여 데이터 흐름을 예측 가능하고 효율적으로 만들었습니다. `useInfiniteQuery`를 활용해 무한 스크롤을 구현하고, `useMutation`과 낙관적 업데이트(Optimistic Updates)를 통해 사용자 경험을 향상시켰습니다.
- **Zustand**: 채팅 위젯의 열림/닫힘 상태, 사용자 인증 정보 등 전역적으로 필요한 UI 상태는 Zustand를 사용하여 간결하고 직관적으로 관리합니다.

### 3. NextAuth.js와 NestJS 백엔드의 연동을 통한 인증 처리

NextAuth.js를 프론트엔드 인증 레이어로 활용하여 소셜 로그인 과정을 처리하고, 성공 시 백엔드(`NestJS`)의 `/auth/social-login` 엔드포인트로 사용자 정보를 전달합니다. 백엔드는 이 정보를 바탕으로 JWT(Access/Refresh Token)를 발급하며, 프론트엔드는 이를 받아 Zustand 스토어에 저장하고 이후 모든 인증된 요청에 사용합니다.

### 4. Vercel Blob과 Server Actions을 이용한 이미지 처리

사용자가 업로드하는 이미지는 Next.js의 Server Actions을 통해 Vercel Blob 스토리지에 직접 업로드됩니다. 이를 통해 이미지 처리 로직을 백엔드 API 서버와 분리하여 서버 부하를 줄이고, 프론트엔드와 더 긴밀하게 통합된 파일 업로드 환경을 구축했습니다.

### 5. AI 기반 도서 정보 요약

LLM 모델을 활용하여 책의 핵심 내용을 간결하게 요약해 제공합니다. AI가 책의 주제와 내용을 분석하여 어떤 독자층에게 적합할지 추천해줍니다.

---

## 💻 서비스 화면 (Service Preview)

<img width="1470" height="956" alt="image" src="https://github.com/user-attachments/assets/f553b0fa-aa35-4f96-9b46-655d3cd876ef" />
<img width="1470" height="956" alt="image" src="https://github.com/user-attachments/assets/68f968a2-fc37-4057-a946-60810b111cd1" />
<img width="1470" height="956" alt="image" src="https://github.com/user-attachments/assets/2d584a48-500b-4ca8-9833-fa0cb9428cb4" />
<img width="1470" height="956" alt="image" src="https://github.com/user-attachments/assets/5d0a8740-5c08-4b3f-933d-81521a2a7fc5" />
<img width="1470" height="956" alt="image" src="https://github.com/user-attachments/assets/b01cb24c-666d-485c-b3c4-3b2ddaa62944" />
<img width="1470" height="956" alt="image" src="https://github.com/user-attachments/assets/9dcca7ad-0041-4108-ac8b-002346d24e53" />
<img width="1470" height="956" alt="image" src="https://github.com/user-attachments/assets/f0229bdd-0b25-4ae2-bc5b-9753ccf58610" />
<img width="1470" height="956" alt="image" src="https://github.com/user-attachments/assets/480b5319-9cb1-48e6-965c-68f3c2290258" />
<img width="1470" height="956" alt="image" src="https://github.com/user-attachments/assets/b6ad653e-c691-4620-8ed9-7d452d96f248" />
<img width="1470" height="956" alt="image" src="https://github.com/user-attachments/assets/cf3068c5-630c-45bf-b9c3-5aeb9a4d5b28" />


---

## 🏁 시작하기 (Getting Started)

1.  **Repository 클론:**

    ```bash
    git clone [Repository URL]
    cd [프로젝트 폴더명]
    ```

2.  **의존성 설치:**

    ```bash
    npm install
    # or yarn install
    ```

3.  **개발 서버 실행:**

    ```bash
    npm run dev
    # or yarn dev
    ```

4.  브라우저에서 `http://localhost:3000`으로 접속하여 확인합니다.
