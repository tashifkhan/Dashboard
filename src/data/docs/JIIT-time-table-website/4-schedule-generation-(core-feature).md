# Schedule Generation (Core Feature)

## Purpose and Scope

This document describes the primary feature of the JIIT Timetable website: the personalized schedule generation pipeline. This process transforms user inputs (campus, year, batch, and elective selections) into a customized weekly timetable by executing Python parsing logic client-side via Pyodide WASM.

For information about the user interface components that collect this input, see [Schedule Form & User Input](4.1-schedule-form-and-user-input). For details on how Python modules parse and filter timetable data, see [Python Processing Pipeline](4.2-python-processing-pipeline). For how the generated schedule is displayed and edited, see [Schedule Display & Editing](4.3-schedule-display-and-editing).

---

## High-Level Generation Flow

The schedule generation process follows a client-side pipeline that eliminates the need for a backend server. User selections flow through React components, trigger Pyodide initialization if needed, execute Python processing, and return a formatted timetable stored in both React state and localStorage.

### Schedule Generation Sequence

![Architecture Diagram](images/4-schedule-generation-(core-feature)_diagram_1.png)

**Sources:** [src/App.tsx115-229](https://github.com/tashifkhan/JIIT-time-table-website/blob/0ffdedf5/src/App.tsx#L115-L229) [public/\_creator.py423-531](https://github.com/tashifkhan/JIIT-time-table-website/blob/0ffdedf5/public/_creator.py#L423-L531)

---

## Component Responsibilities

The schedule generation pipeline distributes responsibilities across multiple code entities to maintain separation of concerns.

| Component | File | Primary Responsibilities |
| --- | --- | --- |
| **ScheduleForm** | `schedule-form.tsx` | Campus/year/batch/elective input collection, validation, fuzzy search |
| **App** | `App.tsx` | Orchestration, Pyodide initialization, JSON fetching, function selection |
| **evaluteTimeTable** | `App.tsx:115-152` | Python function name resolution based on campus + year |
| **callPythonFunction** | `pyodide.ts` | Execute Python via Pyodide, handle type conversion |
| **Python Creator Functions** | `_creator.py` | Parse timetable JSON, filter by batch, match electives, format output |
| **UserContext** | `userContext.tsx` | Global state management for schedule and editedSchedule |
| **localStorage** | Browser API | Persist schedule and parameters across sessions |

**Sources:** [src/App.tsx1-841](https://github.com/tashifkhan/JIIT-time-table-website/blob/0ffdedf5/src/App.tsx#L1-L841) [src/components/schedule-form.tsx1-793](https://github.com/tashifkhan/JIIT-time-table-website/blob/0ffdedf5/src/components/schedule-form.tsx#L1-L793)

---

## User Input Collection

The `ScheduleForm` component collects four required inputs from users, with campus-specific validation rules enforced before submission.

### Input Fields and Validation

![Architecture Diagram](images/4-schedule-generation-(core-feature)_diagram_2.png)

**Sources:** [src/components/schedule-form.tsx364-399](https://github.com/tashifkhan/JIIT-time-table-website/blob/0ffdedf5/src/components/schedule-form.tsx#L364-L399) [src/components/schedule-form.tsx507-588](https://github.com/tashifkhan/JIIT-time-table-website/blob/0ffdedf5/src/components/schedule-form.tsx#L507-L588)

### Campus-Specific Batch Validation

The form enforces strict batch format rules before allowing submission:

```
// Campus 62: Only A, B, C, G, H batches allowed
if (campus === "62") {
    if (batch.match(/^[DFH]|BBA|BCA|BSC|MCA|MBA|^[E]/)) {
        error = "62 campus only allows A, B, C, G, and H batches.";
    }
}

// Campus 128: Only E, F, G, H batches allowed  
else if (campus === "128") {
    if (!batch.match(/^[EFGH]/)) {
        error = "128 campus only allows E, F, G, and H batches.";
    }
}

// BCA Campus: Must match BCA\d+ pattern
else if (campus === "BCA") {
    if (!batch.match(/^BCA\d*$/)) {
        error = "BCA campus only allows batches like BCA1, BCA2, etc.";
    }
}
```

**Sources:** [src/components/schedule-form.tsx367-386](https://github.com/tashifkhan/JIIT-time-table-website/blob/0ffdedf5/src/components/schedule-form.tsx#L367-L386)

### Elective Selection with Fuzzy Search

For year > 1, students select elective subjects through the `SubjectSelector` modal, which implements combined exact and fuzzy search using `Fuse.js`:

**Search Algorithm:**

1. **Exact matches** are identified first (substring matching on subject name, code, and full code)
2. **Fuzzy matches** are added from Fuse.js results (threshold: 0.4)
3. Exact matches that start with the search term are prioritized
4. Results are deduplicated by subject code

**Sources:** [src/components/schedule-form.tsx38-219](https://github.com/tashifkhan/JIIT-time-table-website/blob/0ffdedf5/src/components/schedule-form.tsx#L38-L219) [src/components/schedule-form.tsx47-105](https://github.com/tashifkhan/JIIT-time-table-website/blob/0ffdedf5/src/components/schedule-form.tsx#L47-L105)

---

## Python Function Selection Logic

When `handleSubmit` is called, the `App` component determines which Python function to invoke based on campus and year parameters. This mapping ensures the correct parsing logic is applied to each timetable structure.

### Function Selection Algorithm

![Architecture Diagram](images/4-schedule-generation-(core-feature)_diagram_3.png)

**Sources:** [src/App.tsx115-152](https://github.com/tashifkhan/JIIT-time-table-website/blob/0ffdedf5/src/App.tsx#L115-L152) [src/App.tsx154-229](https://github.com/tashifkhan/JIIT-time-table-website/blob/0ffdedf5/src/App.tsx#L154-L229)

### Function Mapping Table

| Campus | Year | Python Function | File Location |
| --- | --- | --- | --- |
| 62 | 1 | `time_table_creator` | `_creator.py:423-531` |
| 62 | 2-4 | `time_table_creator_v2` | `_creator.py:949-1059` |
| 128 | 1 | `bando128_year1` | `_creator.py:817-883` |
| 128 | 2-4 | `banado128` | `_creator.py:739-815` |
| BCA | 1 | `bca_creator_year1` | `_creator.py:1357-1448` |
| BCA | 2-3 | `bca_creator` | `_creator.py:1247-1355` |

**Sources:** [src/App.tsx124-139](https://github.com/tashifkhan/JIIT-time-table-website/blob/0ffdedf5/src/App.tsx#L124-L139)

### Double Execution for First Run

The system executes the Python function twice on the first invocation to account for Pyodide warm-up behavior:

```
if (numExecutions === 0) {
    console.log("Initial execution - running twice");
    Schedule = await evaluteTimeTable(
        timeTableJSON, subjectJSON, batch, electives, campus, year
    );
}
```

**Sources:** [src/App.tsx194-204](https://github.com/tashifkhan/JIIT-time-table-website/blob/0ffdedf5/src/App.tsx#L194-L204)

---

## Python Processing Pipeline

Each Python creator function follows a consistent processing pattern: parse the timetable JSON structure, extract batch and subject information from activity strings, filter classes based on user enrollment, and format time slots into a standardized structure.

### Core Processing Pattern

**Sources:** [public/\_creator.py423-531](https://github.com/tashifkhan/JIIT-time-table-website/blob/0ffdedf5/public/_creator.py#L423-L531) [public/\_creator.py949-1059](https://github.com/tashifkhan/JIIT-time-table-website/blob/0ffdedf5/public/_creator.py#L949-L1059)

### Batch String Parsing

The `parse_batch_numbers` function handles diverse batch format specifications found in timetable data:

**Supported Formats:**

* Single batch: `"A6"` → `["A6"]`
* Alphabetic concatenation: `"ABC"` → `["A", "B", "C"]`
* Hyphenated range: `"A6-A9"` → `["A6", "A7", "A8", "A9"]`
* Comma-separated: `"A6,A8,B12"` → `["A6", "A8", "B12"]`
* Mixed format: `"A6-A8,B12"` → `["A6", "A7", "A8", "B12"]`
* Concatenated ranges: `"A15A17"` → `["A15", "A17"]`
* Empty string: `""` → `["A", "B", "C", "D", "G", "H"]` (all default batches)

**Sources:** [public/\_creator.py8-94](https://github.com/tashifkhan/JIIT-time-table-website/blob/0ffdedf5/public/_creator.py#L8-L94)

### Activity String Extraction

Each class entry in the timetable JSON is a formatted string containing batch, subject code, and location information. The system uses regex-based extractors to parse these components:

**Example Activity String:** `"L(A6-A9)(CS101)-G7/FacultyName"`

**Extraction Functions:**

| Extractor | Pattern | Example Output |
| --- | --- | --- |
| `batch_extractor` | Text before `(` | `"LA6-A9"` → `"A6-A9"` |
| `subject_extractor` | Text inside first `()` | `"(CS101)"` → `"CS101"` |
| `location_extractor` | Text after `-` before `/` | `"-G7/Faculty"` → `"G7"` |

**Sources:** [public/\_creator.py158-218](https://github.com/tashifkhan/JIIT-time-table-website/blob/0ffdedf5/public/_creator.py#L158-L218)

---

## Batch Filtering and Elective Matching

The system distinguishes between core subjects (mandatory for all students in a batch) and elective subjects (selected by individual students). Different filtering logic applies to each category.

### Elective Detection Logic

The `is_elective` function determines whether a subject should be treated as an elective based on batch characteristics:

```
def is_elective(extracted_batch: str, subject_code: str, 
                extracted_batches: list[str]) -> bool:
    # Special case: Not an elective
    if extracted_batch.upper() == "A7-A8-A10":
        return False

    # Alphabetic-only batch = elective
    if extracted_batch.isalpha():
        return True

    # More than 3 batches = elective
    if len(extracted_batches) > 3:
        return True

    # Empty batch string = elective
    if not extracted_batch.strip():
        return True

    # C-batch with 3 batches (non-B subject) = elective
    if (len(extracted_batches) == 3 and 
        extracted_batch[0] == "C" and 
        subject_code[0] != "B"):
        return True

    return False
```

**Sources:** [public/\_creator.py96-129](https://github.com/tashifkhan/JIIT-time-table-website/blob/0ffdedf5/public/_creator.py#L96-L129)

### Batch Inclusion Check

The `is_batch_included` function determines if a user's batch matches the class batch specification:

**Matching Rules:**

1. Empty batch string in timetable → matches all batches
2. Exact match: user batch `"A6"` matches timetable batch `["A6"]`
3. Prefix match: user batch `"A6"` matches timetable batch `["A"]`

**Sources:** [public/\_creator.py131-156](https://github.com/tashifkhan/JIIT-time-table-website/blob/0ffdedf5/public/_creator.py#L131-L156)

### Elective Enrollment Verification

For year > 1, the `is_enrolled_subject` function matches user-selected elective codes against extracted subject codes, handling multiple code format variations:

**Matching Patterns Checked:**

* Exact code match: `"CS311"` = `"CS311"`
* Code with slash: `"CS311/312"` split and match first part
* Full code match: `"B15CS311"` = `"B15CS311"`
* Prefix combinations: `full_code[:2] + code`, `full_code[3:]`, `full_code[2:]`
* Extended patterns: `full_code[:5] + code`, `full_code[2:5] + code`

**Sources:** [public/\_creator.py255-308](https://github.com/tashifkhan/JIIT-time-table-website/blob/0ffdedf5/public/_creator.py#L255-L308)

---

## Time Slot Formatting

The `process_timeslot` function converts timetable time strings into standardized 24-hour format, handling various input formats and special cases.

### Time Format Conversion

![Architecture Diagram](images/4-schedule-generation-(core-feature)_diagram_4.png)

**Sources:** [public/\_creator.py364-421](https://github.com/tashifkhan/JIIT-time-table-website/blob/0ffdedf5/public/_creator.py#L364-L421) [public/\_creator.py345-362](https://github.com/tashifkhan/JIIT-time-table-website/blob/0ffdedf5/public/_creator.py#L345-L362)

### Special Time Handling Cases

| Case | Input Example | Output | Logic |
| --- | --- | --- | --- |
| **NOON keyword** | `"12 NOON-1:00 PM"` | `"12:00-13:00"` | Replace NOON with 12:00 PM |
| **Practical extension** | `"8:00-9:00 AM"` (type=P) | `"08:00-10:00"` | Add 1 hour to end time |
| **Midnight correction** | `"00:00-01:00"` | `"12:00-01:00"` | Start time set to 12:00 |
| **Minute rounding** | `"10:00-10:50"` | `"10:00-11:00"` | Round :50 to next hour |
| **Missing colon** | `"1100"` | `"11:00"` | Insert colon at position 2 |

**Sources:** [public/\_creator.py364-421](https://github.com/tashifkhan/JIIT-time-table-website/blob/0ffdedf5/public/_creator.py#L364-L421)

---

## Subject Name Resolution

The system maintains a mapping between subject codes and full names in the `subjects` JSON array. The `subject_name_extractor` function resolves codes to human-readable names.

### Code Matching Strategy

```
def subject_name_extractor(subjects_dict: dict, code: str) -> str:
    for subject in subjects_dict:
        # Direct code match
        if subject.get("Code") == code:
            return subject.get("Subject", code)

        # Full code with patterns
        if "Full Code" in subject:
            full_code = subject["Full Code"]
            patterns = [
                full_code,
                full_code[:2] + subject["Code"],
                full_code[3:],
                full_code[2:],
                full_code[:5] + subject["Code"],
                full_code[2:5] + subject["Code"],
                full_code[3:5] + subject["Code"],
            ]
            if any(pattern.strip() == code.strip() for pattern in patterns):
                return subject.get("Subject", code)

        # Suffix match (skip first character)
        if subject["Code"][1:].strip() == code.strip():
            return subject.get("Subject", code)

    return code  # Return code if no match found
```

**Sources:** [public/\_creator.py220-253](https://github.com/tashifkhan/JIIT-time-table-website/blob/0ffdedf5/public/_creator.py#L220-L253) [public/\_creator.py704-737](https://github.com/tashifkhan/JIIT-time-table-website/blob/0ffdedf5/public/_creator.py#L704-L737)

---

## Result Structure and Storage

After Python processing completes, the schedule is structured as a nested dictionary and stored in multiple locations for different purposes.

### Output Data Structure

The `YourTietable` interface defines the returned schedule format:

```
interface YourTietable {
    [day: string]: {
        [timeSlot: string]: {
            subject_name: string;
            type: "L" | "T" | "P" | "C";  // Lecture, Tutorial, Practical, Custom
            location: string;
        };
    };
}
```

**Example:**

```
{
    "Monday": {
        "08:00-09:00": {
            "subject_name": "Data Structures and Algorithms",
            "type": "L",
            "location": "G7"
        },
        "10:00-11:00": {
            "subject_name": "Database Management Systems Lab",
            "type": "P",
            "location": "CL04"
        }
    },
    "Tuesday": {
        "09:00-10:00": {
            "subject_name": "Operating Systems",
            "type": "L",
            "location": "G8"
        }
    }
}
```

**Sources:** [src/App.tsx28-36](https://github.com/tashifkhan/JIIT-time-table-website/blob/0ffdedf5/src/App.tsx#L28-L36) [public/\_creator.py520-525](https://github.com/tashifkhan/JIIT-time-table-website/blob/0ffdedf5/public/_creator.py#L520-L525)

### Storage Locations

The generated schedule is persisted in three locations:

![Architecture Diagram](images/4-schedule-generation-(core-feature)_diagram_5.png)

**Sources:** [src/App.tsx205-223](https://github.com/tashifkhan/JIIT-time-table-website/blob/0ffdedf5/src/App.tsx#L205-L223) [src/App.tsx84-95](https://github.com/tashifkhan/JIIT-time-table-website/blob/0ffdedf5/src/App.tsx#L84-L95) [src/App.tsx105-109](https://github.com/tashifkhan/JIIT-time-table-website/blob/0ffdedf5/src/App.tsx#L105-L109)

### Context Update Flow

When the schedule is set in `UserContext`, all consuming components automatically re-render:

1. **App.tsx** displays the schedule and navigation buttons
2. **ScheduleDisplay** renders the timetable grid
3. **Timeline** updates the calendar view (if user navigates there)
4. **Compare** uses the schedule for comparison (if invoked)

**Sources:** [src/App.tsx557-590](https://github.com/tashifkhan/JIIT-time-table-website/blob/0ffdedf5/src/App.tsx#L557-L590) [src/context/userContext.tsx](https://github.com/tashifkhan/JIIT-time-table-website/blob/0ffdedf5/src/context/userContext.tsx) (referenced)

---

## URL Parameter Handling

The system supports shareable URLs that encode schedule parameters. When a URL contains parameters that differ from cached data, a conflict resolution dialog appears.

### URL Parameter Sync

The `nuqs` library manages URL query parameters as React state:

```
const [_year, setYear] = useQueryState("year", parseAsString.withDefault(""));
const [_batch, setBatch] = useQueryState("batch", parseAsString.withDefault(""));
const [_campus, setCampus] = useQueryState("campus", parseAsString.withDefault(""));
const [_selectedSubjects, setSelectedSubjects] = useQueryState(
    "selectedSubjects", 
    parseAsArrayOf(parseAsString).withDefault([])
);
```

**Sources:** [src/App.tsx231-247](https://github.com/tashifkhan/JIIT-time-table-website/blob/0ffdedf5/src/App.tsx#L231-L247)

### Conflict Resolution

![Architecture Diagram](images/4-schedule-generation-(core-feature)_diagram_6.png)

**Sources:** [src/App.tsx273-359](https://github.com/tashifkhan/JIIT-time-table-website/blob/0ffdedf5/src/App.tsx#L273-L359) [src/components/url-params-dialog.tsx](https://github.com/tashifkhan/JIIT-time-table-website/blob/0ffdedf5/src/components/url-params-dialog.tsx) (referenced)

---

## Error Handling and Edge Cases

The generation pipeline includes error handling at multiple stages to ensure graceful degradation.

### Error Categories

| Error Type | Location | Handling Strategy |
| --- | --- | --- |
| **Python execution failure** | `evaluteTimeTable` | Return empty schedule object `{}` |
| **Batch validation error** | `ScheduleForm.handleSubmit` | Show `BatchErrorDialog`, prevent submission |
| **Invalid time format** | `process_timeslot` | Return `"00:00", "00:00"` and log error |
| **Subject code not found** | `subject_name_extractor` | Return original code string |
| **Empty timetable JSON** | Python functions | Return empty formatted\_timetable `{}` |
| **Pyodide load failure** | `initializePyodide` | Error logged, generation blocked |

**Sources:** [src/App.tsx149-151](https://github.com/tashifkhan/JIIT-time-table-website/blob/0ffdedf5/src/App.tsx#L149-L151) [src/App.tsx223-225](https://github.com/tashifkhan/JIIT-time-table-website/blob/0ffdedf5/src/App.tsx#L223-L225) [src/components/schedule-form.tsx367-386](https://github.com/tashifkhan/JIIT-time-table-website/blob/0ffdedf5/src/components/schedule-form.tsx#L367-L386) [public/\_creator.py418-420](https://github.com/tashifkhan/JIIT-time-table-website/blob/0ffdedf5/public/_creator.py#L418-L420)

### First Execution Workaround

Pyodide exhibits warm-up behavior where the first execution may return incorrect results. The system compensates by executing twice on the first run:

```
if (numExecutions === 0) {
    console.log("Initial execution - running twice");
    Schedule = await evaluteTimeTable(
        timeTableJSON, subjectJSON, batch, electives, campus, year
    );
}
```

**Sources:** [src/App.tsx194-204](https://github.com/tashifkhan/JIIT-time-table-website/blob/0ffdedf5/src/App.tsx#L194-L204)

---

## Performance Characteristics

The schedule generation process has distinct performance phases:

| Phase | Duration | Occurs When | Cached |
| --- | --- | --- | --- |
| **Pyodide initialization** | ~3-5 seconds | First generation only | Yes (browser session) |
| **Python module loading** | ~500ms | First generation only | Yes (Pyodide runtime) |
| **JSON fetching** | ~100-300ms | First generation per campus | Yes (browser cache) |
| **Python execution** | ~200-500ms | Every generation | No |
| **State updates** | ~50-100ms | Every generation | No |

**Optimization Strategies:**

1. Pyodide instance cached globally after first load
2. JSON files served as static assets with browser caching
3. Python module loaded once and retained in Pyodide memory
4. Schedule cached in localStorage for instant page reloads

**Sources:** [src/utils/pyodide.ts](https://github.com/tashifkhan/JIIT-time-table-website/blob/0ffdedf5/src/utils/pyodide.ts) (referenced), [src/App.tsx111-113](https://github.com/tashifkhan/JIIT-time-table-website/blob/0ffdedf5/src/App.tsx#L111-L113)

---

## Integration Points

The schedule generation feature integrates with other system components:

### Downstream Consumers

![Architecture Diagram](images/4-schedule-generation-(core-feature)_diagram_7.png)

**Sources:** [src/App.tsx557-590](https://github.com/tashifkhan/JIIT-time-table-website/blob/0ffdedf5/src/App.tsx#L557-L590) [src/components/schedule-display.tsx](https://github.com/tashifkhan/JIIT-time-table-website/blob/0ffdedf5/src/components/schedule-display.tsx) (referenced), [src/pages/timeline.tsx](https://github.com/tashifkhan/JIIT-time-table-website/blob/0ffdedf5/src/pages/timeline.tsx) (referenced)

### State Management Flow

1. **Generation**: `schedule` set in UserContext
2. **Display**: Components read `schedule` via `useContext(UserContext)`
3. **Editing**: User edits create `editedSchedule` entries
4. **Rendering**: Display components merge `schedule` + `editedSchedule`
5. **Persistence**: Both saved to localStorage on changes

**Sources:** [src/context/userContext.tsx](https://github.com/tashifkhan/JIIT-time-table-website/blob/0ffdedf5/src/context/userContext.tsx) (referenced), [src/App.tsx56](https://github.com/tashifkhan/JIIT-time-table-website/blob/0ffdedf5/src/App.tsx#L56-L56)
