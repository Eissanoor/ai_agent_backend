
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.6.0
 * Query Engine version: f676762280b54cd07c770017ed3711ddde35f37a
 */
Prisma.prismaVersion = {
  client: "6.6.0",
  engine: "f676762280b54cd07c770017ed3711ddde35f37a"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable',
  Snapshot: 'Snapshot'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  password: 'password',
  name: 'name',
  deptcode: 'deptcode',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  email: 'email'
};

exports.Prisma.BedScalarFieldEnum = {
  id: 'id',
  bedNumber: 'bedNumber',
  bedStatus: 'bedStatus',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.JourneyScalarFieldEnum = {
  id: 'id',
  isActive: 'isActive',
  firstCallTime: 'firstCallTime',
  vitalTime: 'vitalTime',
  assignDeptTime: 'assignDeptTime',
  secondCallTime: 'secondCallTime',
  beginTime: 'beginTime',
  endTime: 'endTime',
  patientId: 'patientId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PatientScalarFieldEnum = {
  id: 'id',
  name: 'name',
  nationality: 'nationality',
  sex: 'sex',
  idNumber: 'idNumber',
  age: 'age',
  mobileNumber: 'mobileNumber',
  status: 'status',
  cheifComplaint: 'cheifComplaint',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  ticket: 'ticket',
  userId: 'userId',
  callPatient: 'callPatient',
  state: 'state',
  barcode: 'barcode',
  departmentId: 'departmentId',
  ticketNumber: 'ticketNumber',
  bedId: 'bedId',
  beginTime: 'beginTime',
  endTime: 'endTime',
  birthDate: 'birthDate',
  bloodGroup: 'bloodGroup',
  mrnNumber: 'mrnNumber',
  remarks: 'remarks',
  assignDeptTime: 'assignDeptTime',
  firstCallTime: 'firstCallTime',
  secondCallTime: 'secondCallTime',
  vitalTime: 'vitalTime',
  registrationDate: 'registrationDate'
};

exports.Prisma.PatientCountScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  counter: 'counter',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RefreshTokenScalarFieldEnum = {
  id: 'id',
  token: 'token',
  userId: 'userId',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt'
};

exports.Prisma.RoleScalarFieldEnum = {
  id: 'id',
  name: 'name',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  description: 'description',
  route: 'route'
};

exports.Prisma.TblAdmissionScalarFieldEnum = {
  tblAdmissionID: 'tblAdmissionID',
  admissioncode: 'admissioncode',
  admissionname: 'admissionname'
};

exports.Prisma.TblAppScalarFieldEnum = {
  tblAppID: 'tblAppID',
  AppID: 'AppID',
  ApplicationName: 'ApplicationName'
};

exports.Prisma.TblAppAuthScalarFieldEnum = {
  tblAppAuthID: 'tblAppAuthID',
  appAuthID: 'appAuthID',
  AppID: 'AppID',
  userid: 'userid',
  last_update: 'last_update'
};

exports.Prisma.TblAppModeAuthScalarFieldEnum = {
  tblUserAppModAuthID: 'tblUserAppModAuthID',
  moduleID: 'moduleID',
  UserappModAuthID: 'UserappModAuthID',
  userid: 'userid',
  last_update: 'last_update'
};

exports.Prisma.TblAppModulesScalarFieldEnum = {
  tblAppModulesID: 'tblAppModulesID',
  moduleID: 'moduleID',
  AppID: 'AppID',
  ModuleName: 'ModuleName'
};

exports.Prisma.TblConsultScalarFieldEnum = {
  tblConsultID: 'tblConsultID',
  tblconsultspecialtyid: 'tblconsultspecialtyid',
  specialtyname: 'specialtyname'
};

exports.Prisma.TblCounterScalarFieldEnum = {
  tblCounterID: 'tblCounterID',
  currentCount: 'currentCount',
  ratz: 'ratz',
  acu: 'acu',
  ucc: 'ucc',
  triageout: 'triageout'
};

exports.Prisma.TblDepartmentScalarFieldEnum = {
  tblDepartmentID: 'tblDepartmentID',
  deptcode: 'deptcode',
  deptname: 'deptname'
};

exports.Prisma.TblLocationScalarFieldEnum = {
  tblLocationID: 'tblLocationID',
  loccode: 'loccode',
  deptcode: 'deptcode',
  locationname: 'locationname'
};

exports.Prisma.TblLocationSessionScalarFieldEnum = {
  tblLocationSessionID: 'tblLocationSessionID',
  loccode: 'loccode',
  deptcode: 'deptcode',
  qnumber: 'qnumber',
  start_dt: 'start_dt',
  finish_dt: 'finish_dt',
  tblQueueID: 'tblQueueID',
  name: 'name',
  dept_counter: 'dept_counter',
  locationname: 'locationname',
  status: 'status'
};

exports.Prisma.TbllocationsessionArchieveScalarFieldEnum = {
  tblLocationSessionID: 'tblLocationSessionID',
  loccode: 'loccode',
  deptcode: 'deptcode',
  qnumber: 'qnumber',
  start_dt: 'start_dt',
  finish_dt: 'finish_dt',
  tblQueueID: 'tblQueueID',
  name: 'name',
  dept_counter: 'dept_counter',
  locationname: 'locationname',
  status: 'status'
};

exports.Prisma.TblQueueScalarFieldEnum = {
  tblQueueID: 'tblQueueID',
  deptcode: 'deptcode',
  qnumber: 'qnumber',
  issued_dt: 'issued_dt',
  start_dt: 'start_dt',
  finish_dt: 'finish_dt',
  status: 'status',
  waiting: 'waiting',
  barcode: 'barcode',
  deptname: 'deptname',
  name: 'name',
  userid: 'userid',
  locationname: 'locationname',
  nationality: 'nationality',
  id: 'id',
  patient_age: 'patient_age',
  gender: 'gender',
  complain: 'complain',
  triage_dt: 'triage_dt',
  bp: 'bp',
  temp: 'temp',
  hr: 'hr',
  rr: 'rr',
  spo2: 'spo2',
  rbs: 'rbs',
  height: 'height',
  weight: 'weight',
  allergies: 'allergies',
  bedassignment: 'bedassignment',
  override: 'override',
  critical: 'critical',
  criticalmsg: 'criticalmsg',
  category: 'category',
  dept_counter: 'dept_counter',
  toremarks: 'toremarks',
  last_update: 'last_update',
  mobileno: 'mobileno',
  returnvisit72Hrs: 'returnvisit72Hrs',
  admitted: 'admitted',
  admittedIn: 'admittedIn',
  consulted: 'consulted',
  consultspecialtyid: 'consultspecialtyid',
  consultassign: 'consultassign',
  consultarrive: 'consultarrive',
  consultdesicion: 'consultdesicion',
  transferred: 'transferred',
  transferid: 'transferid',
  Pmh: 'Pmh',
  ticket: 'ticket'
};

exports.Prisma.TblQueueArchieveScalarFieldEnum = {
  tblQueueID: 'tblQueueID',
  deptcode: 'deptcode',
  qnumber: 'qnumber',
  issued_dt: 'issued_dt',
  start_dt: 'start_dt',
  finish_dt: 'finish_dt',
  status: 'status',
  waiting: 'waiting',
  barcode: 'barcode',
  deptname: 'deptname',
  name: 'name',
  userid: 'userid',
  locationname: 'locationname',
  nationality: 'nationality',
  id: 'id',
  patient_age: 'patient_age',
  gender: 'gender',
  complain: 'complain',
  triage_dt: 'triage_dt',
  bp: 'bp',
  temp: 'temp',
  hr: 'hr',
  rr: 'rr',
  spo2: 'spo2',
  rbs: 'rbs',
  height: 'height',
  weight: 'weight',
  allergies: 'allergies',
  bedassignment: 'bedassignment',
  override: 'override',
  critical: 'critical',
  criticalmsg: 'criticalmsg',
  category: 'category',
  dept_counter: 'dept_counter',
  toremarks: 'toremarks',
  last_update: 'last_update',
  mobileno: 'mobileno',
  returnvisit72Hrs: 'returnvisit72Hrs',
  admitted: 'admitted',
  admittedIn: 'admittedIn',
  consulted: 'consulted',
  consultspecialtyid: 'consultspecialtyid',
  consultassign: 'consultassign',
  consultarrive: 'consultarrive',
  consultdesicion: 'consultdesicion',
  transferred: 'transferred',
  transferid: 'transferid',
  ticket: 'ticket',
  Pmh: 'Pmh'
};

exports.Prisma.TblQueueArchieveTempScalarFieldEnum = {
  tblQueueID: 'tblQueueID',
  deptcode: 'deptcode',
  qnumber: 'qnumber',
  issued_dt: 'issued_dt',
  start_dt: 'start_dt',
  finish_dt: 'finish_dt',
  status: 'status',
  waiting: 'waiting',
  barcode: 'barcode',
  deptname: 'deptname',
  name: 'name',
  userid: 'userid',
  locationname: 'locationname',
  nationality: 'nationality',
  id: 'id',
  patient_age: 'patient_age',
  gender: 'gender',
  complain: 'complain',
  triage_dt: 'triage_dt',
  bp: 'bp',
  temp: 'temp',
  hr: 'hr',
  rr: 'rr',
  spo2: 'spo2',
  rbs: 'rbs',
  height: 'height',
  weight: 'weight',
  allergies: 'allergies',
  bedassignment: 'bedassignment',
  override: 'override',
  critical: 'critical',
  criticalmsg: 'criticalmsg',
  category: 'category',
  dept_counter: 'dept_counter',
  toremarks: 'toremarks',
  last_update: 'last_update',
  mobileno: 'mobileno'
};

exports.Prisma.TblQueuePulmoScalarFieldEnum = {
  tblQueueID: 'tblQueueID',
  deptcode: 'deptcode',
  qnumber: 'qnumber',
  issued_dt: 'issued_dt',
  start_dt: 'start_dt',
  finish_dt: 'finish_dt',
  status: 'status',
  waiting: 'waiting',
  barcode: 'barcode',
  deptname: 'deptname',
  name: 'name',
  userid: 'userid',
  locationname: 'locationname',
  nationality: 'nationality',
  id: 'id',
  patient_age: 'patient_age',
  gender: 'gender',
  complain: 'complain',
  triage_dt: 'triage_dt',
  bp: 'bp',
  temp: 'temp',
  hr: 'hr',
  rr: 'rr',
  spo2: 'spo2',
  rbs: 'rbs',
  height: 'height',
  weight: 'weight',
  allergies: 'allergies',
  bedassignment: 'bedassignment',
  override: 'override',
  critical: 'critical',
  criticalmsg: 'criticalmsg',
  category: 'category',
  dept_counter: 'dept_counter',
  toremarks: 'toremarks',
  last_update: 'last_update',
  mobileno: 'mobileno',
  returnvisit72Hrs: 'returnvisit72Hrs',
  admitted: 'admitted',
  admittedIn: 'admittedIn',
  consulted: 'consulted',
  consultspecialtyid: 'consultspecialtyid',
  consultassign: 'consultassign',
  consultarrive: 'consultarrive',
  consultdesicion: 'consultdesicion',
  transferred: 'transferred',
  transferid: 'transferid'
};

exports.Prisma.TblQueueSessionScalarFieldEnum = {
  tblLocationSessionID: 'tblLocationSessionID',
  deptcode: 'deptcode',
  qnumber: 'qnumber',
  tblQueueID: 'tblQueueID'
};

exports.Prisma.TblQueueTransferDeptScalarFieldEnum = {
  tblQueueTransferDeptID: 'tblQueueTransferDeptID',
  barcode: 'barcode',
  fromdeptcode: 'fromdeptcode',
  todeptcode: 'todeptcode',
  last_update: 'last_update',
  issued_dt: 'issued_dt'
};

exports.Prisma.TblQueueWaitScalarFieldEnum = {
  tblQueueID: 'tblQueueID',
  deptcode: 'deptcode',
  qnumber: 'qnumber',
  issued_dt: 'issued_dt',
  start_dt: 'start_dt',
  finish_dt: 'finish_dt',
  status: 'status',
  waiting: 'waiting',
  barcode: 'barcode',
  deptname: 'deptname',
  name: 'name',
  userid: 'userid',
  locationname: 'locationname',
  queueID: 'queueID',
  dept_counter: 'dept_counter'
};

exports.Prisma.TblSubLocationScalarFieldEnum = {
  tblLocationID: 'tblLocationID',
  loccode: 'loccode',
  deptcode: 'deptcode',
  locationname: 'locationname',
  status: 'status'
};

exports.Prisma.TblTransferScalarFieldEnum = {
  tblTransferID: 'tblTransferID',
  transferid: 'transferid',
  transfername: 'transfername'
};

exports.Prisma.TblUserDepartmentAuthScalarFieldEnum = {
  tblUserDepartmentAuthID: 'tblUserDepartmentAuthID',
  authiD: 'authiD',
  deptcode: 'deptcode',
  userid: 'userid',
  last_update: 'last_update'
};

exports.Prisma.TblUserOverrideAuthScalarFieldEnum = {
  tblUserOverrideAuthID: 'tblUserOverrideAuthID',
  appAuthID: 'appAuthID',
  userid: 'userid',
  last_update: 'last_update'
};

exports.Prisma.PromptScalarFieldEnum = {
  id: 'id',
  text: 'text',
  intent: 'intent',
  parameters: 'parameters',
  hasAction: 'hasAction',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  userId: 'userId'
};

exports.Prisma.TblUsersScalarFieldEnum = {
  tblUsersID: 'tblUsersID',
  userid: 'userid',
  password: 'password',
  name: 'name',
  deptcode: 'deptcode',
  date: 'date'
};

exports.Prisma.VitalSignScalarFieldEnum = {
  id: 'id',
  patientId: 'patientId',
  bp: 'bp',
  height: 'height',
  temp: 'temp',
  spo2: 'spo2',
  weight: 'weight',
  hr: 'hr',
  rbs: 'rbs',
  rr: 'rr',
  timeVs: 'timeVs',
  allergies: 'allergies',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};


exports.Prisma.ModelName = {
  User: 'User',
  Bed: 'Bed',
  Journey: 'Journey',
  Patient: 'Patient',
  PatientCount: 'PatientCount',
  RefreshToken: 'RefreshToken',
  Role: 'Role',
  tblAdmission: 'tblAdmission',
  tblApp: 'tblApp',
  tblAppAuth: 'tblAppAuth',
  tblAppModeAuth: 'tblAppModeAuth',
  tblAppModules: 'tblAppModules',
  tblConsult: 'tblConsult',
  tblCounter: 'tblCounter',
  tblDepartment: 'tblDepartment',
  tblLocation: 'tblLocation',
  tblLocationSession: 'tblLocationSession',
  tbllocationsessionArchieve: 'tbllocationsessionArchieve',
  tblQueue: 'tblQueue',
  tblQueueArchieve: 'tblQueueArchieve',
  tblQueueArchieveTemp: 'tblQueueArchieveTemp',
  tblQueuePulmo: 'tblQueuePulmo',
  tblQueueSession: 'tblQueueSession',
  tblQueueTransferDept: 'tblQueueTransferDept',
  tblQueueWait: 'tblQueueWait',
  tblSubLocation: 'tblSubLocation',
  tblTransfer: 'tblTransfer',
  tblUserDepartmentAuth: 'tblUserDepartmentAuth',
  tblUserOverrideAuth: 'tblUserOverrideAuth',
  Prompt: 'Prompt',
  tblUsers: 'tblUsers',
  VitalSign: 'VitalSign'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }

        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
