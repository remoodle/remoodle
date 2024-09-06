/// HTTP

export type APIError = {
  status: number;
  message: string;
};

export type APIErrorResponse = {
  error: APIError;
};

export type APIWrapper<T> = T | APIErrorResponse;

/// API

export type HealthResponse = {
  status: "ok";
  message: "pong";
};

export type MoodleUser = {
  moodle_id: number;
  username: string;
  name: string;
  name_alias: string | null;
  email: string | null;
};

export type Deadline = {
  event_id: number;
  timestart: number;
  instance: number;
  name: string;
  visible: number;
  course_id: number;
  course_name: string;
  assignment?: {
    assignment_id: number;
    cmid: number;
    duedate: number;
  };
};

export type ActiveCourse = {
  course_id: number;
  name: string;
  coursecategory: string;
  url: string;
  start_date: number;
  end_date: number;
};

export type ExtendedCourse = ActiveCourse & {
  grades?: Grade[];
};

export type Grade = {
  id: number;
  grade_id: number;
  cmid: number;
  name: string;
  percentage: number | null;
  itemtype: string;
  itemmodule: string;
  iteminstance: number;
  grademin: number;
  grademax: number;
  feedbackformat: 1 | 0;
  graderaw: number | null;
  feedback: string;
};

export type Course = {
  course_id: number;
  name: string;
  coursecategory: string;
  url: string;
  start_date: number;
  end_date: number;
  content: CourseContent[];
};

export type CourseContent = {
  id: number;
  name: string;
  visible: number;
  summary: string;
  summaryformat: number;
  section: number;
  hiddenbynumsections: number;
  uservisible: boolean;
  modules: CourseModule[];
};

export type CourseGradeItem = {
  grade_id: number;
  name: string;
  moodle_id: number;
  itemtype: string;
  grademin: number;
  grademax: number;
  feedbackformat: number;
  iteminstance: number;
  itemmodule: string;
  cmid: number;
  graderaw?: number;
  feedback: string;
  percentage?: number;
};

// export type CourseGrades = {
//   usergrades: {
//     courseid: number;
//     courseidnumber: string;
//     userid: number;
//     userfullname: string;
//     useridnumber: string;
//     maxdepth: number;
//     gradeitems: CourseGradeItem[];
//   }[];
//   warnings: any[];
// };

export type Attachment = {
  filename: string;
  filepath: string;
  filesize: number;
  fileurl: string;
  timemodified: number;
  mimetype: string;
  isexternalfile: boolean;
};

export type CourseModule = {
  id: number;
  url: string;
  name: string;
  instance: number;
  description?: string;
  contextid: number;
  visible: number;
  uservisible: boolean;
  visibleoncoursepage: number;
  modicon: string;
  modname: string;
  modplural: string;
  indent: number;
  onclick: string;
  afterlink: any;
  customdata: string;
  noviewlink: boolean;
  completion: number;
  completiondata: {
    state: number;
    timecompleted: number;
    overrideby: any;
    valueused: boolean;
    hascompletion: boolean;
    isautomatic: boolean;
    istrackeduser: boolean;
    uservisible: boolean;
    details: any[];
  };
  dates: {
    label: string;
    timestamp: number;
  }[];
  availabilityinfo?: string;
  contents?: (Attachment & {
    // filename: string;
    // filepath: string;
    // filesize: number;
    // fileurl: string;
    // timemodified: number;
    // mimetype: string;
    // isexternalfile: boolean;
    type: string;
    timecreated: number;
    sortorder: number;
    userid: number;
    author: string;
    license: string;
  })[];
  contentsinfo?: {
    filescount: number;
    filessize: number;
    lastmodified: number;
    mimetypes: string[];
    repositorytype: string;
  };
};

// export type Assignment = {
//   assignment_id: number;
//   course_id: number;
//   name: string;
//   nosubmissions: boolean;
//   duedate: number;
//   allowsubmissionsfromdate: number;
//   grade: number;
//   introattachments: Attachment[];
// };

export type Assignment = {
  assignment_id: number;
  course_id: number;
  cmid: number;
  name: string;
  nosubmissions: boolean;
  duedate: number;
  allowsubmissionsfromdate: number;
  grade: number;
  introattachments: Attachment[];
  introformat: number;
  intro: string;
  gradeEntity?: {
    grade_id: number;
    name: string;
    moodle_id: number;
    itemtype: string;
    grademin: number;
    grademax: number;
    feedbackformat: number;
    itemmodule: string;
    iteminstance: number;
    cmid: number;
    graderaw: number;
    feedback: string;
    percentage: number;
  };
};
