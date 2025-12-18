# API Reference

## Purpose and Scope

This document provides comprehensive reference documentation for all public classes, methods, constants, and interfaces exposed by the jsjiit library. It serves as the authoritative guide to the library's API surface, detailing the types, signatures, and purposes of all exported constructs.

For implementation details and internal architecture, see [Architecture and Design](4-architecture-and-design). For step-by-step usage examples, see [Quick Start Guide](2.2-quick-start-guide). For detailed information about specific API categories, refer to the subsections below.

**Sources:** [src/index.js1-32](https://github.com/codeblech/jsjiit/blob/d123b782/src/index.js#L1-L32)

---

## Public API Surface

The jsjiit library exports its entire public API through [src/index.js1-32](https://github.com/codeblech/jsjiit/blob/d123b782/src/index.js#L1-L32) All imports should be made from this module or its compiled distribution bundles.

### Complete Export Table

| Export Name | Type | Module | Purpose |
| --- | --- | --- | --- |
| `WebPortal` | Class | [src/wrapper.js75-671](https://github.com/codeblech/jsjiit/blob/d123b782/src/wrapper.js#L75-L671) | Main class for interacting with JIIT web portal API |
| `WebPortalSession` | Class | [src/wrapper.js25-70](https://github.com/codeblech/jsjiit/blob/d123b782/src/wrapper.js#L25-L70) | Represents an authenticated session with the portal |
| `API` | Constant | [src/wrapper.js14](https://github.com/codeblech/jsjiit/blob/d123b782/src/wrapper.js#L14-L14) | Base API endpoint URL |
| `DEFCAPTCHA` | Constant | [src/wrapper.js20](https://github.com/codeblech/jsjiit/blob/d123b782/src/wrapper.js#L20-L20) | Default CAPTCHA bypass values |
| `AttendanceHeader` | Class | src/attendance.js | Represents attendance header metadata |
| `Semester` | Class | src/attendance.js | Represents semester information |
| `AttendanceMeta` | Class | src/attendance.js | Container for attendance metadata |
| `RegisteredSubject` | Class | src/registration.js | Represents a registered subject |
| `Registrations` | Class | src/registration.js | Container for registration data |
| `ExamEvent` | Class | src/exam.js | Represents an exam event |
| `APIError` | Class | src/exceptions.js | Base exception for API errors |
| `LoginError` | Class | src/exceptions.js | Exception for login failures |
| `AccountAPIError` | Class | src/exceptions.js | Exception for account operation failures |
| `NotLoggedIn` | Class | src/exceptions.js | Exception when authentication is required |
| `SessionError` | Class | src/exceptions.js | Exception for session-related errors |
| `SessionExpired` | Class | src/exceptions.js | Exception when session token expires |
| `generate_local_name` | Function | src/encryption.js | Generates LocalName header for requests |

**Sources:** [src/index.js1-32](https://github.com/codeblech/jsjiit/blob/d123b782/src/index.js#L1-L32)

---

## API Architecture Diagram

The following diagram illustrates the relationship between the primary API classes and their dependencies:

![Architecture Diagram](images/3-api-reference_diagram_1.png)

**Sources:** [src/index.js1-32](https://github.com/codeblech/jsjiit/blob/d123b782/src/index.js#L1-L32) [src/wrapper.js75-719](https://github.com/codeblech/jsjiit/blob/d123b782/src/wrapper.js#L75-L719)

---

## WebPortal Class Overview

The `WebPortal` class is the primary interface for all portal interactions. It provides methods organized into functional categories.

### Method Categories

![Architecture Diagram](images/3-api-reference_diagram_2.png)

**Sources:** [src/wrapper.js75-719](https://github.com/codeblech/jsjiit/blob/d123b782/src/wrapper.js#L75-L719)

### Method Reference Table

| Method | Authentication Required | Return Type | Purpose |
| --- | --- | --- | --- |
| `student_login(username, password, captcha)` | No | `Promise<WebPortalSession>` | Authenticates and creates session |
| `get_attendance_meta()` | Yes | `Promise<AttendanceMeta>` | Retrieves attendance headers and semesters |
| `get_attendance(header, semester)` | Yes | `Promise<Object>` | Gets attendance details for a semester |
| `get_subject_daily_attendance(...)` | Yes | `Promise<Object>` | Gets daily attendance for a subject |
| `get_registered_semesters()` | Yes | `Promise<Array<Semester>>` | Lists semesters with registrations |
| `get_registered_subjects_and_faculties(semester)` | Yes | `Promise<Registrations>` | Gets subjects and faculty for semester |
| `get_semesters_for_exam_events()` | Yes | `Promise<Array<Semester>>` | Lists semesters with exam events |
| `get_exam_events(semester)` | Yes | `Promise<Array<ExamEvent>>` | Gets exam events for semester |
| `get_exam_schedule(exam_event)` | Yes | `Promise<Object>` | Gets schedule for an exam event |
| `get_semesters_for_marks()` | Yes | `Promise<Array<Semester>>` | Lists semesters with marks available |
| `download_marks(semester)` | Yes | `Promise<void>` | Downloads marks PDF for semester |
| `get_semesters_for_grade_card()` | Yes | `Promise<Array<Semester>>` | Lists semesters with grade cards |
| `get_grade_card(semester)` | Yes | `Promise<Object>` | Gets grade card for semester |
| `get_sgpa_cgpa()` | Yes | `Promise<Object>` | Retrieves SGPA and CGPA data |
| `get_personal_info()` | Yes | `Promise<Object>` | Gets student personal information |
| `get_student_bank_info()` | Yes | `Promise<Object>` | Gets student bank details |
| `change_password(old_password, new_password)` | Yes | `Promise<Object>` | Changes account password |
| `get_hostel_details()` | Yes | `Promise<Object>` | Gets hostel allocation details |
| `get_fee_summary()` | Yes | `Promise<Object>` | Gets fee summary information |
| `get_fines_msc_charges()` | Yes | `Promise<Object>` | Gets pending fines/charges |
| `get_subject_choices(semester)` | Yes | `Promise<Object>` | Gets subject choice preferences |
| `fill_feedback_form(feedback_option)` | Yes | `Promise<void>` | Submits feedback forms |

For detailed documentation of each method, see:

* [Authentication and Session Management](3.2-authentication-and-session-management)
* [Attendance Methods](3.3-attendance-methods)
* [Registration and Subject Methods](3.4-registration-and-subject-methods)
* [Exam and Schedule Methods](3.5-exam-and-schedule-methods)
* [Academic Records Methods](3.6-academic-records-methods)
* [Feedback and Account Methods](3.7-feedback-and-account-methods)

**Sources:** [src/wrapper.js168-719](https://github.com/codeblech/jsjiit/blob/d123b782/src/wrapper.js#L168-L719) [README.md19-96](https://github.com/codeblech/jsjiit/blob/d123b782/README.md#L19-L96)

---

## WebPortalSession Class

The `WebPortalSession` class represents an authenticated session with the JIIT web portal. It is created automatically by `WebPortal.student_login()` and should not be instantiated directly.

### Session Properties

| Property | Type | Description |
| --- | --- | --- |
| `raw_response` | Object | Complete API response from login |
| `regdata` | Object | Registration data from response |
| `institute` | string | Institute name/label |
| `instituteid` | string | Institute identifier |
| `memberid` | string | Member/student ID |
| `userid` | string | User ID |
| `token` | string | JWT authentication token |
| `expiry` | Date | Token expiration timestamp |
| `clientid` | string | Client identifier |
| `membertype` | string | Type of member (student) |
| `name` | string | Student name |
| `enrollmentno` | string | Enrollment number |

### Session Methods

| Method | Return Type | Purpose |
| --- | --- | --- |
| `get_headers()` | `Promise<Object>` | Generates authentication headers for API requests |

**Sources:** [src/wrapper.js25-70](https://github.com/codeblech/jsjiit/blob/d123b782/src/wrapper.js#L25-L70)

---

## Data Models

The library provides typed data model classes to represent portal data structures. These classes parse and structure raw API responses.

### Data Model Hierarchy

![Architecture Diagram](images/3-api-reference_diagram_3.png)

For complete documentation of data model properties and methods, see [Data Models](3.9-data-models).

**Sources:** [src/attendance.js](https://github.com/codeblech/jsjiit/blob/d123b782/src/attendance.js) [src/registration.js](https://github.com/codeblech/jsjiit/blob/d123b782/src/registration.js) [src/exam.js](https://github.com/codeblech/jsjiit/blob/d123b782/src/exam.js)

---

## Error Handling

The library provides a hierarchy of exception classes for different error scenarios. All exceptions extend from `Error`.

### Exception Hierarchy

![Architecture Diagram](images/3-api-reference_diagram_4.png)

### Exception Reference

| Exception | Thrown By | When Thrown |
| --- | --- | --- |
| `APIError` | All API methods | Generic API errors, network failures, non-Success status |
| `LoginError` | `student_login()` | Authentication failures, invalid credentials |
| `AccountAPIError` | `change_password()` | Password change failures |
| `NotLoggedIn` | All authenticated methods | Method called without prior login |
| `SessionExpired` | All authenticated methods | JWT token has expired (HTTP 401) |
| `SessionError` | Session operations | Generic session-related errors |

For detailed error handling strategies and examples, see [Error Handling](3.8-error-handling).

**Sources:** [src/exceptions.js](https://github.com/codeblech/jsjiit/blob/d123b782/src/exceptions.js) [src/wrapper.js97-157](https://github.com/codeblech/jsjiit/blob/d123b782/src/wrapper.js#L97-L157) [src/wrapper.js679-719](https://github.com/codeblech/jsjiit/blob/d123b782/src/wrapper.js#L679-L719)

---

## Constants and Utilities

### Constants

#### API

```
const API = "https://webportal.jiit.ac.in:6011/StudentPortalAPI"
```

Base endpoint URL for all API requests. Defined in [src/wrapper.js14](https://github.com/codeblech/jsjiit/blob/d123b782/src/wrapper.js#L14-L14)

#### DEFCAPTCHA

```
const DEFCAPTCHA = { captcha: "phw5n", hidden: "gmBctEffdSg=" }
```

Default CAPTCHA bypass values used by `student_login()`. Defined in [src/wrapper.js20](https://github.com/codeblech/jsjiit/blob/d123b782/src/wrapper.js#L20-L20)

### Utility Functions

#### generate\_local\_name()

```
async generate_local_name(): Promise<string>
```

Generates a `LocalName` header value required for all API requests. This function is exported for advanced use cases but is typically called internally by the library. Defined in [src/encryption.js](https://github.com/codeblech/jsjiit/blob/d123b782/src/encryption.js)

**Sources:** [src/wrapper.js14-20](https://github.com/codeblech/jsjiit/blob/d123b782/src/wrapper.js#L14-L20) [src/encryption.js](https://github.com/codeblech/jsjiit/blob/d123b782/src/encryption.js) [src/index.js10](https://github.com/codeblech/jsjiit/blob/d123b782/src/index.js#L10-L10)

---

## API Request Flow

The following diagram illustrates the typical request flow through the `WebPortal` class:

![Architecture Diagram](images/3-api-reference_diagram_5.png)

**Sources:** [src/wrapper.js97-157](https://github.com/codeblech/jsjiit/blob/d123b782/src/wrapper.js#L97-L157) [src/wrapper.js679-719](https://github.com/codeblech/jsjiit/blob/d123b782/src/wrapper.js#L679-L719)

---

## Authentication Decorator Pattern

All methods requiring authentication are decorated with the `authenticated` decorator. This pattern is implemented at [src/wrapper.js679-719](https://github.com/codeblech/jsjiit/blob/d123b782/src/wrapper.js#L679-L719)

### Authenticated Methods List

The following methods are automatically wrapped with authentication checks:

```
const authenticatedMethods = [
  "get_personal_info",
  "get_student_bank_info",
  "change_password",
  "get_attendance_meta",
  "get_attendance",
  "get_subject_daily_attendance",
  "get_registered_semesters",
  "get_registered_subjects_and_faculties",
  "get_semesters_for_exam_events",
  "get_exam_events",
  "get_exam_schedule",
  "get_semesters_for_marks",
  "download_marks",
  "get_semesters_for_grade_card",
  "__get_program_id",
  "get_grade_card",
  "__get_semester_number",
  "get_sgpa_cgpa",
  "get_hostel_details",
  "get_fines_msc_charges",
  "get_fee_summary",
  "get_subject_choices"
];
```

Any attempt to call these methods without first calling `student_login()` will throw a `NotLoggedIn` exception.

**Sources:** [src/wrapper.js692-719](https://github.com/codeblech/jsjiit/blob/d123b782/src/wrapper.js#L692-L719)

---

## Method Endpoint Mapping

The following table maps `WebPortal` methods to their corresponding API endpoints for reference:

| Method | API Endpoint |
| --- | --- |
| `student_login()` | `/token/pretoken-check`, `/token/generate-token1` |
| `get_personal_info()` | `/studentpersinfo/getstudent-personalinformation` |
| `get_student_bank_info()` | `/studentbankdetails/getstudentbankinfo` |
| `change_password()` | `/clxuser/changepassword` |
| `get_attendance_meta()` | `/StudentClassAttendance/getstudentInforegistrationforattendence` |
| `get_attendance()` | `/StudentClassAttendance/getstudentattendancedetail` |
| `get_subject_daily_attendance()` | `/StudentClassAttendance/getstudentsubjectpersentage` |
| `get_registered_semesters()` | `/reqsubfaculty/getregistrationList` |
| `get_registered_subjects_and_faculties()` | `/reqsubfaculty/getfaculties` |
| `get_semesters_for_exam_events()` | `/studentcommonsontroller/getsemestercode-withstudentexamevents` |
| `get_exam_events()` | `/studentcommonsontroller/getstudentexamevents` |
| `get_exam_schedule()` | `/studentsttattview/getstudent-examschedule` |
| `get_semesters_for_marks()` | `/studentcommonsontroller/getsemestercode-exammarks` |
| `download_marks()` | `/studentsexamview/printstudent-exammarks/...` |
| `get_semesters_for_grade_card()` | `/studentgradecard/getregistrationList` |
| `get_grade_card()` | `/studentgradecard/showstudentgradecard` |
| `get_sgpa_cgpa()` | `/studentsgpacgpa/getallsemesterdata` |
| `get_hostel_details()` | `/myhostelallocationdetail/gethostelallocationdetail` |
| `get_fines_msc_charges()` | `/collectionpendingpayments/getpendingpaymentsdata` |
| `get_fee_summary()` | `/studentfeeledger/loadfeesummary` |
| `get_subject_choices()` | `/studentchoiceprint/getsubjectpreference` |
| `fill_feedback_form()` | `/feedbackformcontroller/getFeedbackEvent`, `/feedbackformcontroller/getGriddataForFeedback`, `/feedbackformcontroller/getIemQuestion`, `/feedbackformcontroller/savedatalist` |

**Sources:** [src/wrapper.js168-670](https://github.com/codeblech/jsjiit/blob/d123b782/src/wrapper.js#L168-L670)

---

## Usage Pattern

The typical usage pattern for the jsjiit API follows this sequence:

1. **Import the library**

   ```
   ```
   import { WebPortal } from 'jsjiit';
   ```
   ```
2. **Create a WebPortal instance**

   ```
   ```
   const portal = new WebPortal();
   ```
   ```
3. **Authenticate**

   ```
   ```
   await portal.student_login(username, password);
   ```
   ```
4. **Call API methods**

   ```
   ```
   const meta = await portal.get_attendance_meta();
   const grades = await portal.get_grade_card(semester);
   ```
   ```

All authenticated methods return Promises and should be awaited. Errors should be caught and handled appropriately using try-catch blocks.

For complete usage examples, see [Quick Start Guide](2.2-quick-start-guide).

**Sources:** [README.md21-96](https://github.com/codeblech/jsjiit/blob/d123b782/README.md#L21-L96) [src/wrapper.js75-81](https://github.com/codeblech/jsjiit/blob/d123b782/src/wrapper.js#L75-L81)

---

## Version and Compatibility

The current API version is **0.0.23** as defined in package.json. The library targets ES2020+ browsers and is distributed as ES modules.

### Import Paths

* **NPM**: `import { WebPortal } from 'jsjiit'`
* **CDN (Production)**: `import { WebPortal } from 'https://cdn.jsdelivr.net/npm/jsjiit@0.0.23/dist/jsjiit.min.esm.js'`
* **CDN (Development)**: `import { WebPortal } from 'https://cdn.jsdelivr.net/npm/jsjiit@0.0.23/dist/jsjiit.esm.js'`

For installation instructions, see [Installation](2.1-installation).

**Sources:** [README.md23-28](https://github.com/codeblech/jsjiit/blob/d123b782/README.md#L23-L28) [package.json](https://github.com/codeblech/jsjiit/blob/d123b782/package.json)
