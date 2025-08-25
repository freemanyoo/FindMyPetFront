# FindMyFet 프로젝트 Java 파일 기능 분석

이 문서는 FindMyFet 백엔드 프로젝트의 각 Java 파일이 어떤 역할과 책임을 가지고 있는지 분석하고 설명합니다.

---

## 📂 `com.busanit501.findmyfet` (루트 패키지)

### 📄 `FindMyFetApplication.java`
- **역할:** Spring Boot 애플리케이션의 **시작점(Entry Point)**입니다.
- **주요 기능:**
    - `@SpringBootApplication` 어노테이션을 통해 스프링 부트의 자동 설정, 컴포넌트 스캔 등 핵심 기능을 활성화합니다.
    - `main` 메소드가 실행되면 내장된 Tomcat 서버가 구동되며 전체 애플리케이션이 시작됩니다.

---

## 📂 `config` (설정 패키지)

### 📄 `RootConfig.java`
- **역할:** 프로젝트의 핵심적인 **설정(Configuration)**을 담당합니다.
- **주요 기능:**
    - `@Configuration` 어노테이션을 통해 이 파일이 설정 파일임을 명시합니다.
    - 향후 데이터베이스, 모델 매퍼(ModelMapper) 등 프로젝트 전반에서 사용될 공용 Bean을 정의할 수 있습니다. (현재는 비어있음)

### 📄 `SecurityConfig.java`
- **역할:** Spring Security를 이용한 **인증/인가 관련 보안 설정**을 총괄합니다.
- **주요 기능:**
    - `passwordEncoder()`: 비밀번호를 안전하게 암호화하는 `BCryptPasswordEncoder`를 Bean으로 등록합니다.
    - `filterChain()`: HTTP 요청에 대한 보안 규칙을 설정합니다.
        - `/api/auth/**` (로그인, 회원가입 등) 경로는 인증 없이 접근을 허용합니다.
        - 나머지 모든 `/api/**` 경로는 인증된 사용자만 접근 가능하도록 설정합니다.
        - `JwtAuthenticationFilter`를 `UsernamePasswordAuthenticationFilter` 앞에 배치하여 매 요청마다 JWT 토큰을 먼저 검증하도록 합니다.

### 📄 `SwaggerConfig.java`
- **역할:** **API 문서 자동화 도구**인 Swagger (OpenAPI) 설정을 담당합니다.
- **주요 기능:**
    - `@OpenAPIDefinition`을 통해 API 문서의 기본 정보(제목, 버전 등)를 설정합니다.
    - API를 테스트하고 명세를 쉽게 확인할 수 있는 UI를 제공하여 프론트엔드와의 협업을 돕습니다.

---

## 📂 `controller` (API 엔드포인트 패키지)

### 📄 `GlobalExceptionHandler.java`
- **역할:** 프로젝트 전역에서 발생하는 **예외(Exception)를 중앙에서 처리**합니다.
- **주요 기능:**
    - `@RestControllerAdvice`를 통해 모든 Controller에서 발생하는 예외를 감지합니다.
    - `handleIllegalArgumentException` 메소드가 `IllegalArgumentException` 발생 시, 표준화된 에러 응답(`ErrorResponse`) 형식으로 클라이언트에게 반환하여 일관된 에러 처리를 보장합니다.

### 📄 `UserController.java`
- **역할:** **사용자 관련 HTTP 요청을 받는 API 엔드포인트**입니다.
- **주요 기능:**
    - `@RestController`를 통해 이 클래스가 RESTful API의 컨트롤러임을 나타냅니다.
    - **회원가입:** `@PostMapping("/auth/signup")`
    - **로그인:** `@PostMapping("/auth/login")`
    - **토큰 재발급:** `@PostMapping("/auth/refresh")`
    - **내 정보 조회:** `@GetMapping("/users/me")`
    - **내 정보 수정:** `@PutMapping("/users/me")`

---

## 📂 `domain` (데이터베이스 모델 패키지)

### 📄 `BaseEntity.java`
- **역할:** 모든 Entity 클래스들이 공통으로 사용할 **생성/수정 시간을 자동으로 관리**합니다.
- **주요 기능:**
    - `@MappedSuperclass`: 이 클래스가 다른 엔티티에게 속성을 상속해주는 역할임을 명시합니다.
    - `@CreatedDate`, `@LastModifiedDate`: JPA Auditing 기능을 통해 데이터 생성 및 수정 시각을 자동으로 기록합니다.

### 📄 `Role.java`
- **역할:** 사용자의 **권한(등급)을 정의하는 Enum** 클래스입니다.
- **주요 기능:**
    - `USER`, `ADMIN` 등 사용자의 역할을 안전하고 일관되게 관리합니다.

### 📄 `User.java`
- **역할:** **사용자 정보를 나타내는 데이터베이스 테이블과 매핑되는 Entity** 클래스입니다.
- **주요 기능:**
    - `@Entity`를 통해 JPA가 관리하는 엔티티임을 나타냅니다.
    - 사용자의 `loginId`, `password`, `name`, `email` 등 핵심 정보를 필드로 가집니다.
    - `updateRefreshToken` 메소드를 통해 Refresh Token을 관리합니다.

---

## 📂 `dto` (데이터 전송 객체 패키지)

> DTO(Data Transfer Object)는 각 계층 간(특히 Controller-View) 데이터 전송을 위해 사용되는 객체입니다. Entity를 직접 노출하지 않아 안전하고, 필요한 데이터만 담아 전송할 수 있습니다.

### 📄 `request` (요청 DTO)
- **`RefreshTokenRequestDTO.java`**: 토큰 재발급 요청 시 Refresh Token을 담는 DTO.
- **`UserLoginRequestDTO.java`**: 로그인 요청 시 아이디와 비밀번호를 담는 DTO.
- **`UserSignupRequestDTO.java`**: 회원가입 요청 시 필요한 정보들을 담는 DTO.
- **`UserUpdateRequestDTO.java`**: 회원 정보 수정 요청 시 변경할 정보들을 담는 DTO.

### 📄 `response` (응답 DTO)
- **`CommonResponse.java`**: 모든 API 응답을 감싸는 **공용 래퍼(Wrapper)** 클래스. `{ "message": "...", "data": { ... } }` 형식으로 일관된 응답 구조를 제공합니다.
- **`ErrorResponse.java`**: 예외 발생 시 에러 정보를 담아 반환하는 DTO.
- **`LoginResponseDTO.java`**: 로그인 성공 시 Access/Refresh Token과 간단한 사용자 정보를 담아 반환하는 DTO.
- **`LoginUserInfoDTO.java`**: `LoginResponseDTO` 내부에 포함될, UI 표시에 필요한 최소한의 사용자 정보를 담는 DTO.
- **`UserInfoResponseDTO.java`**: 내 정보 조회 등 사용자 상세 정보를 담아 반환하는 DTO.

---

## 📂 `repository` (데이터베이스 접근 패키지)

### 📄 `UserRepository.java`
- **역할:** `User` Entity에 대한 **데이터베이스 CRUD(Create, Read, Update, Delete) 작업을 처리**합니다.
- **주요 기능:**
    - `JpaRepository`를 상속받아 기본적인 DB 작업을 위한 메소드(`save`, `findById` 등)를 자동으로 사용합니다.
    - `findByLoginId`: 로그인 아이디로 사용자를 조회하는 커스텀 쿼리 메소드를 정의합니다.

---

## 📂 `security` (보안 관련 패키지)

### 📄 `JwtAuthenticationFilter.java`
- **역할:** 클라이언트의 **모든 API 요청을 가로채서 JWT 토큰을 검증**하는 필터입니다.
- **주요 기능:**
    - 요청 헤더의 `Authorization`에서 `Bearer` 토큰을 추출합니다.
    - `JwtUtil`을 통해 토큰을 검증하고, 유효하다면 Spring Security의 `SecurityContextHolder`에 인증 정보를 등록하여 해당 요청이 인증된 사용자의 요청임을 알립니다.

### 📄 `JwtUtil.java`
- **역할:** **JWT(Json Web Token)의 생성 및 검증**과 관련된 모든 유틸리티 기능을 제공합니다.
- **주요 기능:**
    - `generateAccessToken`, `generateRefreshToken`: Access/Refresh Token을 생성합니다.
    - `validateToken`: 토큰의 유효기간, 서명 등을 검증하고 토큰에 담긴 정보(Claims)를 추출합니다.

---

## 📂 `service` (비즈니스 로직 패키지)

### 📄 `UserService.java`
- **역할:** **사용자 관련 핵심 비즈니스 로직**을 처리합니다.
- **주요 기능:**
    - `@Service`를 통해 비즈니스 계층의 컴포넌트임을 나타냅니다.
    - **`signup`**: 회원가입 로직 (비밀번호 암호화 포함).
    - **`login`**: 로그인 로직 (ID/PW 검증, 토큰 발급).
    - **`getMe`**: 내 정보 조회 로직.
    - **`updateMe`**: 내 정보 수정 로직.
    - **`refreshAccessToken`**: Refresh Token을 이용한 Access Token 재발급 로직.

---

## 📂 `test` (테스트 코드 패키지)

### 📄 `FindMyFetApplicationTests.java`
- **역할:** Spring Boot 애플리케이션이 **정상적으로 실행되는지 확인**하는 기본 테스트입니다.
- **주요 기능:**
    - `contextLoads()`: 스프링 컨텍스트가 오류 없이 로드되는지 검증합니다.

### 📄 `service/UserServiceTest.java`
- **역할:** `UserService`의 **비즈니스 로직을 검증하는 단위 테스트** 코드입니다.
- **주요 기능:**
    - `@ExtendWith(MockitoExtension.class)`: Mockito 프레임워크를 사용하여 가짜 객체(Mock)를 만들 수 있게 합니다.
    - `signup` 메소드가 정상적으로 동작하는지, 중복된 아이디를 잘 처리하는지 등을 테스트합니다.
