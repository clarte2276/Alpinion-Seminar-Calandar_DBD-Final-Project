# 이벤트/세미나 운영 관리 프로젝트

## 개요
- 초음파 장비, 프로브, 인원, 소모품, 배송 일정을 포함한 행사(세미나/시연) 관리 풀스택 애플리케이션입니다.
- 프런트엔드: React + Vite, 라우터를 사용해 캘린더, 행사 상세, 등록/수정, 관리자 리소스 관리 화면을 제공합니다.
- 백엔드: Express + MySQL REST API로 행사 CRUD, 장비/소모품/인력 배정, 배송 정보, 마스터 데이터(조직/직원/알바/장비/소모품) 관리를 담당합니다.

## 폴더 구조
- `front/` : Vite 기반 React UI (캘린더, 행사 등록/상세, 관리자 리소스 관리).
- `back/` : Express 서버 및 MySQL 모델/라우트.
- `SQL/` : 데이터베이스 스키마 및 샘플 데이터 덤프(`dbd_final_project_*.sql`).
- 루트 `package.json` : `concurrently`로 프런트/백엔드를 함께 실행하는 스크립트 제공.

## 주요 기능
- **캘린더**: 월간 캘린더에서 이벤트 목록을 조회(`GET /events?month=YYYY-MM`), 클릭 시 상세 이동.
- **행사 등록/수정**: 기본 정보(이름/일자/시간/장소/참석자수/메모) 입력 후 장비(초음파/프로브), 호환성에 따른 자동 제안, 필수 소모품 자동 계산, 선택 소모품·커스텀 품목 추가, 직원/알바 배정, 배송 예상/실제 시간 기록.
- **행사 상세**: 항목별 수량/시간/인력/배송 정보를 인라인 수정 및 저장, 행사 복제, 삭제, 수정 페이지 이동.
- **관리자 리소스**: 조직, 직원, 알바, 초음파 장비, 프로브, 호환 프로브 매핑, 행사 소모품 CRUD와 호환성 편집 모달 제공.
- **데이터 저장**: MySQL 스키마 및 샘플 데이터가 `SQL/`에 포함되어 있어 바로 로컬 DB를 구성 가능.

## 실행 전 준비
1. **환경 요구사항**
   - Node.js 18+ (권장 20+), npm
   - MySQL 8.x
2. **데이터베이스 생성 및 시드**
   - MySQL에 접속 후 덤프 실행:
     ```bash
     mysql -u <user> -p < SQL/dbd_final_project_organization.sql
     mysql -u <user> -p < SQL/dbd_final_project_employee.sql
     mysql -u <user> -p < SQL/dbd_final_project_parttimeworker.sql
     mysql -u <user> -p < SQL/dbd_final_project_event.sql
     mysql -u <user> -p < SQL/dbd_final_project_eventemployee.sql
     mysql -u <user> -p < SQL/dbd_final_project_eventparttimeworker.sql
     mysql -u <user> -p < SQL/dbd_final_project_ultrasound.sql
     mysql -u <user> -p < SQL/dbd_final_project_probe.sql
     mysql -u <user> -p < SQL/dbd_final_project_ultrasoundprobecompatibility.sql
     mysql -u <user> -p < SQL/dbd_final_project_eventultrasound.sql
     mysql -u <user> -p < SQL/dbd_final_project_eventprobe.sql
     mysql -u <user> -p < SQL/dbd_final_project_eventitem.sql
     mysql -u <user> -p < SQL/dbd_final_project_eventitemusage.sql
     mysql -u <user> -p < SQL/dbd_final_project_eventtempitemusage.sql
     mysql -u <user> -p < SQL/dbd_final_project_shipment.sql
     mysql -u <user> -p < SQL/dbd_final_project_routines.sql
     ```
   - 순서는 의존성에 따라 위와 같이 실행하면 됩니다. 필요한 경우 `CREATE DATABASE dbd_final_project; USE dbd_final_project;`를 먼저 수행하세요.
3. **백엔드 환경 변수(`back/src/db.js` 참고)**
   - 설정 예시:
     ```bash
     set DB_HOST=localhost
     set DB_USER=root
     set DB_PASSWORD=<your_password>
     set DB_NAME=dbd_final_project
     ```
   - 기본값이 코드에 하드코딩되어 있으므로, 실제 운영/제출 시에는 환경변수를 꼭 지정하세요.

## 설치 및 실행
1. 루트에서 공통 도구 설치(`concurrently`):
   ```bash
   npm install
   ```
2. 백엔드 의존성 설치:
   ```bash
   npm install --prefix back
   ```
3. 프런트엔드 의존성 설치:
   ```bash
   npm install --prefix front
   ```
4. 개발 서버 동시 실행(프런트 5173, 백엔드 3000):
   ```bash
   npm start
   ```
   - 또는 각각 실행: `npm run start:back` / `npm run start:front`.
5. 확인
   - 백엔드 헬스체크: `http://localhost:3000/health`
   - 프런트엔드: `http://localhost:5173`

## API 개요 (주요 엔드포인트)
- 행사
  - `GET /events?month=YYYY-MM` : 월별 목록
  - `GET /events/:eventId` : 상세 조회
  - `POST /events` : 생성 (`{ event, ultraSounds, probes, items, tempItems, employees, partTimeWorkers, shipment }`)
  - `PUT /events/:eventId` : 수정 (동일 스키마)
  - `DELETE /events/:eventId` : 삭제
  - `POST /events/:eventId/clone` : 동일 구성으로 행사 복제
- 관리자 리소스
  - 조직: `GET/POST/PUT/DELETE /admin/organizations`
  - 직원: `GET/POST/PUT/DELETE /admin/employees`
  - 알바: `GET/POST/PUT/DELETE /admin/part-time-workers`
  - 초음파 장비: `GET/POST/PUT/DELETE /admin/ultrasounds`
  - 프로브: `GET/POST/PUT/DELETE /admin/probes`
  - 호환성: `GET /admin/ultrasound-probe-compatibility`, `PUT /admin/ultrasounds/:name/compatibility`
  - 소모품: `GET/POST/PUT/DELETE /admin/event-items`

## 프런트엔드 참고
- 백엔드 기본 주소는 `front/src/api/client.js`의 `baseURL`(기본 `http://localhost:3000`). 서버 주소가 다르면 수정하세요.
- Vite 개발 서버 포트는 5173이며, 라우팅은 React Router v7을 사용합니다.

## 기타 메모
- 샘플 데이터가 포함되어 있어 즉시 화면 동작을 확인할 수 있습니다.
- DB 트리거/루틴은 `SQL/dbd_final_project_routines.sql`에 포함되어 있습니다.
- 변경 후 코드를 제출할 때는 DB 비밀번호 등 민감 정보가 환경 변수로 분리되어 있는지 다시 확인하세요.
