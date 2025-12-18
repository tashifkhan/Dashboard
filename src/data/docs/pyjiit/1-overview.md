# Overview

- [.gitignore](https://github.com/codelif/pyjiit/blob/0fe02955/.gitignore)
- [LICENSE](https://github.com/codelif/pyjiit/blob/0fe02955/LICENSE)
- [README.rst](https://github.com/codelif/pyjiit/blob/0fe02955/README.rst)
- [pyjiit/exceptions.py](https://github.com/codelif/pyjiit/blob/0fe02955/pyjiit/exceptions.py)
- [pyjiit/init.py](https://github.com/codelif/pyjiit/blob/0fe02955/pyjiit/init.py)
- [pyproject.toml](https://github.com/codelif/pyjiit/blob/0fe02955/pyproject.toml)

## Purpose and Scope

This document provides a high-level introduction to **pyjiit**, a Python library for programmatic access to the JIIT Webportal system. It covers what pyjiit is, its architectural design, core components, and how data flows through the system. This overview is intended for developers who want to understand the library's structure before using it or contributing to it.

For detailed API reference, see [Core API Reference](3-core-api-reference). For installation and usage instructions, see [Getting Started](2-getting-started). For information about the encryption mechanisms, see [Security and Encryption](4-security-and-encryption).

**Sources:** [README.rst1-46](https://github.com/codelif/pyjiit/blob/0fe02955/README.rst#L1-L46) [pyproject.toml1-28](https://github.com/codelif/pyjiit/blob/0fe02955/pyproject.toml#L1-L28)

---

## What is pyjiit

**pyjiit** is a Python wrapper library that provides programmatic access to the JIIT (Jaypee Institute of Information Technology) Webportal's internal APIs. The library enables Python applications to authenticate with the webportal and retrieve student data including attendance records, exam events, and course registration information.

The library reverse-engineers the webportal's proprietary encryption scheme to communicate with the backend APIs at `webportal.jiit.ac.in:6011`. It abstracts the complexity of payload encryption, session management, and API authentication behind a simple Python interface.

### Primary Use Cases

| Use Case                | Description                                                                               |
| ----------------------- | ----------------------------------------------------------------------------------------- |
| **Attendance Tracking** | Query class attendance data including headers, semesters, and detailed attendance records |
| **Exam Information**    | Retrieve exam event schedules and details                                                 |
| **Registration Data**   | Access course registration information and registered subjects                            |
| **Session Management**  | Handle authentication, token generation, and session lifecycle                            |

**Sources:** [README.rst1-18](https://github.com/codelif/pyjiit/blob/0fe02955/README.rst#L1-L18) [pyproject.toml1-6](https://github.com/codelif/pyjiit/blob/0fe02955/pyproject.toml#L1-L6)

---

## Core Components

pyjiit is organized into four primary subsystems that work together to provide its functionality:

![Architecture Diagram](images/1-overview_diagram_1.png)

### Component Descriptions

| Component             | File Path                                                                                                                                                                                                                                                                                                                                                           | Purpose                                                                                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Webportal**         | [pyjiit/wrapper.py](https://github.com/codelif/pyjiit/blob/0fe02955/pyjiit/wrapper.py)                                                                                                                                                                                                                                                                              | Main API client class; orchestrates all operations including authentication, data retrieval, and session management                                      |
| **WebportalSession**  | [pyjiit/wrapper.py](https://github.com/codelif/pyjiit/blob/0fe02955/pyjiit/wrapper.py)                                                                                                                                                                                                                                                                              | Encapsulates session state including tokens, client ID, and user information                                                                             |
| **Encryption Module** | [pyjiit/encryption.py](https://github.com/codelif/pyjiit/blob/0fe02955/pyjiit/encryption.py)                                                                                                                                                                                                                                                                        | Implements AES-CBC encryption with daily key rotation; handles payload serialization/deserialization and LocalName header generation                     |
| **Data Models**       | [pyjiit/attendance.py](https://github.com/codelif/pyjiit/blob/0fe02955/pyjiit/attendance.py) [pyjiit/exam.py](https://github.com/codelif/pyjiit/blob/0fe02955/pyjiit/exam.py) [pyjiit/registration.py](https://github.com/codelif/pyjiit/blob/0fe02955/pyjiit/registration.py) [pyjiit/tokens.py](https://github.com/codelif/pyjiit/blob/0fe02955/pyjiit/tokens.py) | Structured classes for API responses; provide type-safe access to attendance, exam, registration, and token data                                         |
| **Exceptions**        | [pyjiit/exceptions.py1-18](https://github.com/codelif/pyjiit/blob/0fe02955/pyjiit/exceptions.py#L1-L18)                                                                                                                                                                                                                                                             | Custom exception hierarchy for error handling; includes `APIError`, `LoginError`, `SessionError`, `SessionExpired`, `NotLoggedIn`, and `AccountAPIError` |
| **Utilities**         | [pyjiit/utils.py](https://github.com/codelif/pyjiit/blob/0fe02955/pyjiit/utils.py)                                                                                                                                                                                                                                                                                  | Helper functions for date sequence generation and random character sequences used in encryption                                                          |

**Sources:** [pyjiit/\_\_init\_\_.py1-2](https://github.com/codelif/pyjiit/blob/0fe02955/pyjiit/__init__.py#L1-L2) [pyproject.toml9-12](https://github.com/codelif/pyjiit/blob/0fe02955/pyproject.toml#L9-L12) [README.rst9-18](https://github.com/codelif/pyjiit/blob/0fe02955/README.rst#L9-L18)

---

## System Architecture

The following diagram shows how the core components interact during a typical API request flow:

![Architecture Diagram](images/1-overview_diagram_2.png)

### Authentication Flow

The authentication process uses a two-phase approach:

1. **Pretoken Check** (`/token/pretoken-check`): Validates credentials and establishes initial session parameters
2. **Token Generation** (`/token/generate-token1`): Generates the final authentication token

Both phases require encrypted payloads and a `LocalName` header. The encryption key rotates daily at 00:00 IST.

### Data Retrieval Pattern

All data retrieval methods follow a consistent pattern:

1. Application calls a `Webportal` method (e.g., `get_attendance()`)
2. `Webportal` encrypts the request payload using the `Encryption Module`
3. HTTP POST request sent to JIIT API with encrypted payload and `LocalName` header
4. Response is decrypted by the `Encryption Module`
5. Raw JSON is parsed into a structured `Data Model` object
6. Structured object returned to application

**Sources:** [pyjiit/wrapper.py](https://github.com/codelif/pyjiit/blob/0fe02955/pyjiit/wrapper.py) [pyjiit/encryption.py](https://github.com/codelif/pyjiit/blob/0fe02955/pyjiit/encryption.py) [README.rst12-16](https://github.com/codelif/pyjiit/blob/0fe02955/README.rst#L12-L16)

---

## Key Abstractions

### Webportal Class

The `Webportal` class (defined in [pyjiit/wrapper.py](https://github.com/codelif/pyjiit/blob/0fe02955/pyjiit/wrapper.py)) is the primary interface for all interactions with the JIIT Webportal. It provides methods for:

- **Authentication**: `student_login()`, `logout()`
- **Attendance Queries**: `get_attendance_meta()`, `get_attendance()`
- **Exam Data**: `get_exam_events()`
- **Registration**: `get_registrations()`
- **Account Management**: `set_password()`

The class maintains an internal `WebportalSession` object that tracks authentication state and tokens.

### WebportalSession Class

The `WebportalSession` class (defined in [pyjiit/wrapper.py](https://github.com/codelif/pyjiit/blob/0fe02955/pyjiit/wrapper.py)) encapsulates session state including:

- Authentication tokens
- Client ID
- User information (username, member type)
- Session metadata (registration ID, curriculum semester)

Sessions can expire (typically after HTTP 401 responses), at which point methods raise `SessionExpired` exceptions.

### Data Models

Data model classes provide structured, type-safe access to API responses:

- **AttendanceMeta** / **AttendanceHeader**: Organize attendance data by semester and subject
- **ExamEvent**: Represents individual exam schedules
- **RegisteredSubject** / **Registrations**: Encapsulate course registration information
- **Captcha**: Represents captcha image data for authentication

All data models provide a `from_json()` class method for construction from API responses.

### Exception Hierarchy

The exception hierarchy (defined in [pyjiit/exceptions.py1-18](https://github.com/codelif/pyjiit/blob/0fe02955/pyjiit/exceptions.py#L1-L18)) provides granular error handling:

![Architecture Diagram](images/1-overview_diagram_3.png)

**Sources:** [pyjiit/exceptions.py1-18](https://github.com/codelif/pyjiit/blob/0fe02955/pyjiit/exceptions.py#L1-L18) [pyjiit/wrapper.py](https://github.com/codelif/pyjiit/blob/0fe02955/pyjiit/wrapper.py)

---

## Encryption and Security

pyjiit implements a proprietary encryption scheme reverse-engineered from the JIIT Webportal. The encryption system uses:

- **Algorithm**: AES-CBC with a fixed 16-byte IV
- **Key Derivation**: Daily rotating key based on current date in IST timezone
- **Payload Format**: JSON → Encrypt → Base64 encode
- **Headers**: Every request includes an encrypted `LocalName` header

The encryption key is generated using the pattern: `"qa8y" + date_sequence + "ty1pn"`, where `date_sequence` is derived from the current date. Keys rotate at 00:00 IST, providing a 24-hour validity window.

For detailed information about the encryption implementation, see [Security and Encryption](4-security-and-encryption).

**Sources:** [pyjiit/encryption.py](https://github.com/codelif/pyjiit/blob/0fe02955/pyjiit/encryption.py) [README.rst33-34](https://github.com/codelif/pyjiit/blob/0fe02955/README.rst#L33-L34)

---

## Dependencies

pyjiit has minimal runtime dependencies:

| Dependency       | Version Constraint | Purpose                           |
| ---------------- | ------------------ | --------------------------------- |
| **requests**     | >=2.32.3, <3.0.0   | HTTP client for API communication |
| **pycryptodome** | >=3.22.0, <4.0.0   | AES encryption implementation     |

The library requires Python 3.9 or higher. Development dependencies (for documentation) include Sphinx and the Furo theme.

**Sources:** [pyproject.toml8-12](https://github.com/codelif/pyjiit/blob/0fe02955/pyproject.toml#L8-L12) [pyproject.toml19-21](https://github.com/codelif/pyjiit/blob/0fe02955/pyproject.toml#L19-L21)

---

## Distribution and Documentation

pyjiit is distributed through:

- **PyPI**: Package name `pyjiit`, installable via `pip install pyjiit`
- **GitHub**: Source repository at `https://github.com/codelif/pyjiit`
- **Documentation**: Hosted at `https://pyjiit.codelif.in` (GitHub Pages)

The project uses:

- **Poetry** for dependency management and packaging
- **Sphinx** with Furo theme for documentation generation
- **GitHub Actions** for automated testing, documentation builds, and PyPI publishing

For information about building and deploying documentation, see [Documentation System](6-documentation-system). For information about the CI/CD pipeline, see [Deployment and CI/CD](7-deployment-and-cicd).

**Sources:** [pyproject.toml1-6](https://github.com/codelif/pyjiit/blob/0fe02955/pyproject.toml#L1-L6) [pyproject.toml14-16](https://github.com/codelif/pyjiit/blob/0fe02955/pyproject.toml#L14-L16) [README.rst6](https://github.com/codelif/pyjiit/blob/0fe02955/README.rst#L6-L6)
