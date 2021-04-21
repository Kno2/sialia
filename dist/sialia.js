(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("bootstrap"), require("dragula"), require("jquery"), require("lodash"), require("moment"), require("riot"));
	else if(typeof define === 'function' && define.amd)
		define(["bootstrap", "dragula", "jquery", "lodash", "moment", "riot"], factory);
	else if(typeof exports === 'object')
		exports["sialia"] = factory(require("bootstrap"), require("dragula"), require("jquery"), require("lodash"), require("moment"), require("riot"));
	else
		root["sialia"] = factory(root["bootstrap"], root["dragula"], root["jquery"], root["lodash"], root["moment"], root["riot"]);
})(self, function(__WEBPACK_EXTERNAL_MODULE__4217__, __WEBPACK_EXTERNAL_MODULE__8627__, __WEBPACK_EXTERNAL_MODULE__1273__, __WEBPACK_EXTERNAL_MODULE__3804__, __WEBPACK_EXTERNAL_MODULE__2470__, __WEBPACK_EXTERNAL_MODULE__2372__) {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 2399:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

(function webpackUniversalModuleDefinition(root, factory) {
	if(true)
		module.exports = factory();
	else {}
})(self, function() {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 97:
/***/ ((module, __unused_webpack_exports, __nested_webpack_require_503__) => {

"use strict";

/*
 * ...
 */

var Core = __nested_webpack_require_503__(1);

var Documents = __nested_webpack_require_503__(452);

var Generators = __nested_webpack_require_503__(409);

var Parsers = __nested_webpack_require_503__(46);
/* exported BlueButton */


module.exports = function (source, opts) {
  var type, parsedData, parsedDocument; // Look for options

  if (!opts) opts = {}; // Detect and parse the source data

  parsedData = Core.parseData(source); // Detect and parse the document

  if (opts.parser) {
    // TODO: parse the document with provided custom parser
    parsedDocument = opts.parser();
  } else {
    var documents = new Documents();
    type = documents.detect(parsedData);
    var parsers = new Parsers(documents);

    switch (type) {
      case 'c32':
        parsedData = documents.C32.process(parsedData);
        parsedDocument = parsers.C32.run(parsedData);
        break;

      case 'ccda':
        parsedData = documents.CCDA.process(parsedData);
        parsedDocument = parsers.CCDA.run(parsedData);
        break;

      case 'ccdar2':
        parsedData = documents.CCDAR2.process(parsedData);
        parsedDocument = parsers.CCDAR2.run(parsedData);
        break;

      case 'ccd':
        parsedData = documents.CCD.process(parsedData);
        parsedDocument = parsers.CCD.run(parsedData);
        break;

      case 'json':
        /* Expects a call like:
         * BlueButton(json string, {
         *   generatorType: 'ccda',
         *   template: < EJS file contents >
         * })
         * The returned "type" will be the requested type (not "json")
         * and the XML will be turned as a string in the 'data' key
         */
        switch (opts.generatorType) {
          // only the unit tests ever need to worry about this testingMode argument
          case 'c32':
            type = 'c32';
            parsedDocument = Generators.C32.run(parsedData, opts.template, opts.testingMode);
            break;

          case 'ccda':
            type = 'ccda';
            parsedDocument = Generators.CCDA.run(parsedData, opts.template, opts.testingMode);
            break;
        }

    }
  }

  return {
    type: type,
    data: parsedDocument,
    source: parsedData
  };
};

/***/ }),

/***/ 1:
/***/ ((module, __unused_webpack_exports, __nested_webpack_require_2805__) => {

/*
 * ...
 */
var Codes = __nested_webpack_require_2805__(259);

var XML = __nested_webpack_require_2805__(58);

var _require = __nested_webpack_require_2805__(895),
    stripWhitespace = _require.stripWhitespace;
/* exported Core */


module.exports = {
  parseData: parseData,
  stripWhitespace: stripWhitespace,
  json: json,
  trim: trim,
  Codes: Codes,
  XML: XML
};
/*
  * ...
  */

function parseData(source) {
  source = stripWhitespace(source);

  if (source.charAt(0) === '<') {
    try {
      return XML.parse(source);
    } catch (e) {
      if (console.log) {
        console.log("File looked like it might be XML but couldn't be parsed.");
      }
    }
  }

  try {
    return JSON.parse(source);
  } catch (e) {
    if (console.error) {
      console.error("Error: Cannot parse this file. BB.js only accepts valid XML " + "(for parsing) or JSON (for generation). If you are attempting to provide " + "XML or JSON, please run your data through a validator to see if it is malformed.\n");
    }

    throw e;
  }
}

;
/*
  * A wrapper around JSON.stringify which allows us to produce customized JSON.
  *
  * See https://developer.mozilla.org/en-US/docs/Web/
  *        JavaScript/Guide/Using_native_JSON#The_replacer_parameter
  * for documentation on the replacerFn.
  */

function json() {
  var datePad = function datePad(number) {
    if (number < 10) {
      return '0' + number;
    }

    return number;
  };

  var replacerFn = function replacerFn(key, value) {
    /* By default, Dates are output as ISO Strings like "2014-01-03T08:00:00.000Z." This is
      * tricky when all we have is a date (not a datetime); JS sadly ignores that distinction.
      *
      * To paper over this JS wart, we use two different JSON formats for dates and datetimes.
      * This is a little ugly but makes sure that the dates/datetimes mostly just parse
      * correclty for clients:
      *
      * 1. Datetimes are rendered as standard ISO strings, without the misleading millisecond
      *    precision (misleading because we don't have it): YYYY-MM-DDTHH:mm:ssZ
      * 2. Dates are rendered as MM/DD/YYYY. This ensures they are parsed as midnight local-time,
      *    no matter what local time is, and therefore ensures the date is always correct.
      *    Outputting "YYYY-MM-DD" would lead most browsers/node to assume midnight UTC, which
      *    means "2014-04-27" suddenly turns into "04/26/2014 at 5PM" or just "04/26/2014"
      *    if you format it as a date...
      *
      * See http://stackoverflow.com/questions/2587345/javascript-date-parse and
      *     http://blog.dygraphs.com/2012/03/javascript-and-dates-what-mess.html
      * for more on this issue.
      */
    var originalValue = this[key]; // a Date

    if (value && originalValue instanceof Date && !isNaN(originalValue.getTime())) {
      // If while parsing we indicated that there was time-data specified, or if we see
      // non-zero values in the hour/minutes/seconds/millis fields, output a datetime.
      if (originalValue._parsedWithTimeData || originalValue.getHours() || originalValue.getMinutes() || originalValue.getSeconds() || originalValue.getMilliseconds()) {
        // Based on https://developer.mozilla.org/en-US/docs/Web/JavaScript/
        //    Reference/Global_Objects/Date/toISOString
        return originalValue.getUTCFullYear() + '-' + datePad(originalValue.getUTCMonth() + 1) + '-' + datePad(originalValue.getUTCDate()) + 'T' + datePad(originalValue.getUTCHours()) + ':' + datePad(originalValue.getUTCMinutes()) + ':' + datePad(originalValue.getUTCSeconds()) + 'Z';
      } // We just have a pure date


      return datePad(originalValue.getMonth() + 1) + '/' + datePad(originalValue.getDate()) + '/' + originalValue.getFullYear();
    }

    return value;
  };

  return JSON.stringify(this, replacerFn, 2);
}

;
/*
  * Removes all `null` properties from an object.
  */

function trim(o) {
  var y;

  for (var x in o) {
    if (o.hasOwnProperty(x)) {
      y = o[x]; // if (y === null || (y instanceof Object && Object.keys(y).length == 0)) {

      if (y === null) {
        delete o[x];
      }

      if (y instanceof Object) y = trim(y);
    }
  }

  return o;
}

;

/***/ }),

/***/ 259:
/***/ ((module) => {

/*
 * ...
 */

/*
  * Administrative Gender (HL7 V3)
  * http://phinvads.cdc.gov/vads/ViewValueSet.action?id=8DE75E17-176B-DE11-9B52-0015173D1785
  * OID: 2.16.840.1.113883.1.11.1
  */
var GENDER_MAP = {
  'F': 'female',
  'M': 'male',
  'UN': 'undifferentiated'
};
/*
  * Marital Status (HL7)
  * http://phinvads.cdc.gov/vads/ViewValueSet.action?id=46D34BBC-617F-DD11-B38D-00188B398520
  * OID: 2.16.840.1.114222.4.11.809
  */

var MARITAL_STATUS_MAP = {
  'N': 'annulled',
  'C': 'common law',
  'D': 'divorced',
  'P': 'domestic partner',
  'I': 'interlocutory',
  'E': 'legally separated',
  'G': 'living together',
  'M': 'married',
  'O': 'other',
  'R': 'registered domestic partner',
  'A': 'separated',
  'S': 'single',
  'U': 'unknown',
  'B': 'unmarried',
  'T': 'unreported',
  'W': 'widowed'
};
/*
  * Religious Affiliation (HL7 V3)
  * https://phinvads.cdc.gov/vads/ViewValueSet.action?id=6BFDBFB5-A277-DE11-9B52-0015173D1785
  * OID: 2.16.840.1.113883.5.1076
  */

var RELIGION_MAP = {
  "1001": "adventist",
  "1002": "african religions",
  "1003": "afro-caribbean religions",
  "1004": "agnosticism",
  "1005": "anglican",
  "1006": "animism",
  "1061": "assembly of god",
  "1007": "atheism",
  "1008": "babi & baha'i faiths",
  "1009": "baptist",
  "1010": "bon",
  "1062": "brethren",
  "1011": "cao dai",
  "1012": "celticism",
  "1013": "christian (non-catholic, non-specific)",
  "1063": "christian scientist",
  "1064": "church of christ",
  "1065": "church of god",
  "1014": "confucianism",
  "1066": "congregational",
  "1015": "cyberculture religions",
  "1067": "disciples of christ",
  "1016": "divination",
  "1068": "eastern orthodox",
  "1069": "episcopalian",
  "1070": "evangelical covenant",
  "1017": "fourth way",
  "1018": "free daism",
  "1071": "friends",
  "1072": "full gospel",
  "1019": "gnosis",
  "1020": "hinduism",
  "1021": "humanism",
  "1022": "independent",
  "1023": "islam",
  "1024": "jainism",
  "1025": "jehovah's witnesses",
  "1026": "judaism",
  "1027": "latter day saints",
  "1028": "lutheran",
  "1029": "mahayana",
  "1030": "meditation",
  "1031": "messianic judaism",
  "1073": "methodist",
  "1032": "mitraism",
  "1074": "native american",
  "1075": "nazarene",
  "1033": "new age",
  "1034": "non-roman catholic",
  "1035": "occult",
  "1036": "orthodox",
  "1037": "paganism",
  "1038": "pentecostal",
  "1076": "presbyterian",
  "1039": "process, the",
  "1077": "protestant",
  "1078": "protestant, no denomination",
  "1079": "reformed",
  "1040": "reformed/presbyterian",
  "1041": "roman catholic church",
  "1080": "salvation army",
  "1042": "satanism",
  "1043": "scientology",
  "1044": "shamanism",
  "1045": "shiite (islam)",
  "1046": "shinto",
  "1047": "sikism",
  "1048": "spiritualism",
  "1049": "sunni (islam)",
  "1050": "taoism",
  "1051": "theravada",
  "1081": "unitarian universalist",
  "1052": "unitarian-universalism",
  "1082": "united church of christ",
  "1053": "universal life church",
  "1054": "vajrayana (tibetan)",
  "1055": "veda",
  "1056": "voodoo",
  "1057": "wicca",
  "1058": "yaohushua",
  "1059": "zen buddhism",
  "1060": "zoroastrianism"
};
/*
  * Race & Ethnicity (HL7 V3)
  * Full list at http://phinvads.cdc.gov/vads/ViewCodeSystem.action?id=2.16.840.1.113883.6.238
  * OID: 2.16.840.1.113883.6.238
  *
  * Abbreviated list closer to real usage at: (Race / Ethnicity)
  * https://phinvads.cdc.gov/vads/ViewValueSet.action?id=67D34BBC-617F-DD11-B38D-00188B398520
  * https://phinvads.cdc.gov/vads/ViewValueSet.action?id=35D34BBC-617F-DD11-B38D-00188B398520
  */

var RACE_ETHNICITY_MAP = {
  '2028-9': 'asian',
  '2054-5': 'black or african american',
  '2135-2': 'hispanic or latino',
  '2076-8': 'native',
  '2186-5': 'not hispanic or latino',
  '2131-1': 'other',
  '2106-3': 'white'
};
/*
  * Role (HL7 V3)
  * https://phinvads.cdc.gov/vads/ViewCodeSystem.action?id=2.16.840.1.113883.5.111
  * OID: 2.16.840.1.113883.5.111
  */

var ROLE_MAP = {
  "ACC": "accident site",
  "ACHFID": "accreditation location identifier",
  "ACTMIL": "active duty military",
  "ALL": "allergy clinic",
  "AMB": "ambulance",
  "AMPUT": "amputee clinic",
  "ANTIBIOT": "antibiotic",
  "ASSIST": "assistive non-person living subject",
  "AUNT": "aunt",
  "B": "blind",
  "BF": "beef",
  "BILL": "billing contact",
  "BIOTH": "biotherapeutic non-person living subject",
  "BL": "broiler",
  "BMTC": "bone marrow transplant clinic",
  "BMTU": "bone marrow transplant unit",
  "BR": "breeder",
  "BREAST": "breast clinic",
  "BRO": "brother",
  "BROINLAW": "brother-in-law",
  "C": "calibrator",
  "CANC": "child and adolescent neurology clinic",
  "CAPC": "child and adolescent psychiatry clinic",
  "CARD": "ambulatory health care facilities; clinic/center; rehabilitation: cardiac facilities",
  "CAS": "asylum seeker",
  "CASM": "single minor asylum seeker",
  "CATH": "cardiac catheterization lab",
  "CCO": "clinical companion",
  "CCU": "coronary care unit",
  "CHEST": "chest unit",
  "CHILD": "child",
  "CHLDADOPT": "adopted child",
  "CHLDFOST": "foster child",
  "CHLDINLAW": "child in-law",
  "CHR": "chronic care facility",
  "CLAIM": "claimant",
  "CN": "national",
  "CNRP": "non-country member without residence permit",
  "CNRPM": "non-country member minor without residence permit",
  "CO": "companion",
  "COAG": "coagulation clinic",
  "COCBEN": "continuity of coverage beneficiary",
  "COMM": "community location",
  "COMMUNITYLABORATORY": "community laboratory",
  "COUSN": "cousin",
  "CPCA": "permit card applicant",
  "CRIMEVIC": "crime victim",
  "CRP": "non-country member with residence permit",
  "CRPM": "non-country member minor with residence permit",
  "CRS": "colon and rectal surgery clinic",
  "CSC": "community service center",
  "CVDX": "cardiovascular diagnostics or therapeutics unit",
  "DA": "dairy",
  "DADDR": "delivery address",
  "DAU": "natural daughter",
  "DAUADOPT": "adopted daughter",
  "DAUC": "daughter",
  "DAUFOST": "foster daughter",
  "DAUINLAW": "daughter in-law",
  "DC": "therapeutic class",
  "DEBR": "debridement",
  "DERM": "dermatology clinic",
  "DIFFABL": "differently abled",
  "DOMPART": "domestic partner",
  "DPOWATT": "durable power of attorney",
  "DR": "draft",
  "DU": "dual",
  "DX": "diagnostics or therapeutics unit",
  "E": "electronic qc",
  "ECHO": "echocardiography lab",
  "ECON": "emergency contact",
  "ENDO": "endocrinology clinic",
  "ENDOS": "endoscopy lab",
  "ENROLBKR": "enrollment broker",
  "ENT": "otorhinolaryngology clinic",
  "EPIL": "epilepsy unit",
  "ER": "emergency room",
  "ERL": "enrollment",
  "ETU": "emergency trauma unit",
  "EXCEST": "executor of estate",
  "EXT": "extended family member",
  "F": "filler proficiency",
  "FAMDEP": "family dependent",
  "FAMMEMB": "family member",
  "FI": "fiber",
  "FMC": "family medicine clinic",
  "FRND": "unrelated friend",
  "FSTUD": "full-time student",
  "FTH": "father",
  "FTHINLAW": "father-in-law",
  "FULLINS": "fully insured coverage sponsor",
  "G": "group",
  "GACH": "hospitals; general acute care hospital",
  "GD": "generic drug",
  "GDF": "generic drug form",
  "GDS": "generic drug strength",
  "GDSF": "generic drug strength form",
  "GGRFTH": "great grandfather",
  "GGRMTH": "great grandmother",
  "GGRPRN": "great grandparent",
  "GI": "gastroenterology clinic",
  "GIDX": "gastroenterology diagnostics or therapeutics lab",
  "GIM": "general internal medicine clinic",
  "GRFTH": "grandfather",
  "GRMTH": "grandmother",
  "GRNDCHILD": "grandchild",
  "GRNDDAU": "granddaughter",
  "GRNDSON": "grandson",
  "GRPRN": "grandparent",
  "GT": "guarantor",
  "GUADLTM": "guardian ad lidem",
  "GUARD": "guardian",
  "GYN": "gynecology clinic",
  "HAND": "hand clinic",
  "HANDIC": "handicapped dependent",
  "HBRO": "half-brother",
  "HD": "hemodialysis unit",
  "HEM": "hematology clinic",
  "HLAB": "hospital laboratory",
  "HOMEHEALTH": "home health",
  "HOSP": "hospital",
  "HPOWATT": "healthcare power of attorney",
  "HRAD": "radiology unit",
  "HSIB": "half-sibling",
  "HSIS": "half-sister",
  "HTN": "hypertension clinic",
  "HU": "hospital unit",
  "HUSB": "husband",
  "HUSCS": "specimen collection site",
  "ICU": "intensive care unit",
  "IEC": "impairment evaluation center",
  "INDIG": "member of an indigenous people",
  "INFD": "infectious disease clinic",
  "INJ": "injured plaintiff",
  "INJWKR": "injured worker",
  "INLAB": "inpatient laboratory",
  "INPHARM": "inpatient pharmacy",
  "INV": "infertility clinic",
  "JURID": "jurisdiction location identifier",
  "L": "pool",
  "LABORATORY": "laboratory",
  "LOCHFID": "local location identifier",
  "LY": "layer",
  "LYMPH": "lympedema clinic",
  "MAUNT": "maternalaunt",
  "MBL": "medical laboratory",
  "MCOUSN": "maternalcousin",
  "MGDSF": "manufactured drug strength form",
  "MGEN": "medical genetics clinic",
  "MGGRFTH": "maternalgreatgrandfather",
  "MGGRMTH": "maternalgreatgrandmother",
  "MGGRPRN": "maternalgreatgrandparent",
  "MGRFTH": "maternalgrandfather",
  "MGRMTH": "maternalgrandmother",
  "MGRPRN": "maternalgrandparent",
  "MHSP": "military hospital",
  "MIL": "military",
  "MOBL": "mobile unit",
  "MT": "meat",
  "MTH": "mother",
  "MTHINLAW": "mother-in-law",
  "MU": "multiplier",
  "MUNCLE": "maternaluncle",
  "NBOR": "neighbor",
  "NBRO": "natural brother",
  "NCCF": "nursing or custodial care facility",
  "NCCS": "neurology critical care and stroke unit",
  "NCHILD": "natural child",
  "NEPH": "nephrology clinic",
  "NEPHEW": "nephew",
  "NEUR": "neurology clinic",
  "NFTH": "natural father",
  "NFTHF": "natural father of fetus",
  "NIECE": "niece",
  "NIENEPH": "niece/nephew",
  "NMTH": "natural mother",
  "NOK": "next of kin",
  "NPRN": "natural parent",
  "NS": "neurosurgery unit",
  "NSIB": "natural sibling",
  "NSIS": "natural sister",
  "O": "operator proficiency",
  "OB": "obstetrics clinic",
  "OF": "outpatient facility",
  "OMS": "oral and maxillofacial surgery clinic",
  "ONCL": "medical oncology clinic",
  "OPH": "opthalmology clinic",
  "OPTC": "optometry clinic",
  "ORG": "organizational contact",
  "ORTHO": "orthopedics clinic",
  "OUTLAB": "outpatient laboratory",
  "OUTPHARM": "outpatient pharmacy",
  "P": "patient",
  "PAINCL": "pain clinic",
  "PATHOLOGIST": "pathologist",
  "PAUNT": "paternalaunt",
  "PAYOR": "payor contact",
  "PC": "primary care clinic",
  "PCOUSN": "paternalcousin",
  "PEDC": "pediatrics clinic",
  "PEDCARD": "pediatric cardiology clinic",
  "PEDE": "pediatric endocrinology clinic",
  "PEDGI": "pediatric gastroenterology clinic",
  "PEDHEM": "pediatric hematology clinic",
  "PEDHO": "pediatric oncology clinic",
  "PEDICU": "pediatric intensive care unit",
  "PEDID": "pediatric infectious disease clinic",
  "PEDNEPH": "pediatric nephrology clinic",
  "PEDNICU": "pediatric neonatal intensive care unit",
  "PEDRHEUM": "pediatric rheumatology clinic",
  "PEDU": "pediatric unit",
  "PGGRFTH": "paternalgreatgrandfather",
  "PGGRMTH": "paternalgreatgrandmother",
  "PGGRPRN": "paternalgreatgrandparent",
  "PGRFTH": "paternalgrandfather",
  "PGRMTH": "paternalgrandmother",
  "PGRPRN": "paternalgrandparent",
  "PH": "policy holder",
  "PHARM": "pharmacy",
  "PHLEBOTOMIST": "phlebotomist",
  "PHU": "psychiatric hospital unit",
  "PL": "pleasure",
  "PLS": "plastic surgery clinic",
  "POD": "podiatry clinic",
  "POWATT": "power of attorney",
  "PRC": "pain rehabilitation center",
  "PREV": "preventive medicine clinic",
  "PRN": "parent",
  "PRNINLAW": "parent in-law",
  "PROCTO": "proctology clinic",
  "PROFF": "provider's office",
  "PROG": "program eligible",
  "PROS": "prosthodontics clinic",
  "PSI": "psychology clinic",
  "PSTUD": "part-time student",
  "PSY": "psychiatry clinic",
  "PSYCHF": "psychiatric care facility",
  "PT": "patient",
  "PTRES": "patient's residence",
  "PUNCLE": "paternaluncle",
  "Q": "quality control",
  "R": "replicate",
  "RADDX": "radiology diagnostics or therapeutics unit",
  "RADO": "radiation oncology unit",
  "RC": "racing",
  "RESPRSN": "responsible party",
  "RETIREE": "retiree",
  "RETMIL": "retired military",
  "RH": "rehabilitation hospital",
  "RHAT": "addiction treatment center",
  "RHEUM": "rheumatology clinic",
  "RHII": "intellectual impairment center",
  "RHMAD": "parents with adjustment difficulties center",
  "RHPI": "physical impairment center",
  "RHPIH": "physical impairment - hearing center",
  "RHPIMS": "physical impairment - motor skills center",
  "RHPIVS": "physical impairment - visual skills center",
  "RHU": "rehabilitation hospital unit",
  "RHYAD": "youths with adjustment difficulties center",
  "RNEU": "neuroradiology unit",
  "ROOM": "roommate",
  "RTF": "residential treatment facility",
  "SCHOOL": "school",
  "SCN": "screening",
  "SEE": "seeing",
  "SELF": "self",
  "SELFINS": "self insured coverage sponsor",
  "SH": "show",
  "SIB": "sibling",
  "SIBINLAW": "sibling in-law",
  "SIGOTHR": "significant other",
  "SIS": "sister",
  "SISINLAW": "sister-in-law",
  "SLEEP": "sleep disorders unit",
  "SNF": "skilled nursing facility",
  "SNIFF": "sniffing",
  "SON": "natural son",
  "SONADOPT": "adopted son",
  "SONC": "son",
  "SONFOST": "foster son",
  "SONINLAW": "son in-law",
  "SPMED": "sports medicine clinic",
  "SPON": "sponsored dependent",
  "SPOWATT": "special power of attorney",
  "SPS": "spouse",
  "STPBRO": "stepbrother",
  "STPCHLD": "step child",
  "STPDAU": "stepdaughter",
  "STPFTH": "stepfather",
  "STPMTH": "stepmother",
  "STPPRN": "step parent",
  "STPSIB": "step sibling",
  "STPSIS": "stepsister",
  "STPSON": "stepson",
  "STUD": "student",
  "SU": "surgery clinic",
  "SUBJECT": "self",
  "SURF": "substance use rehabilitation facility",
  "THIRDPARTY": "third party",
  "TPA": "third party administrator",
  "TR": "transplant clinic",
  "TRAVEL": "travel and geographic medicine clinic",
  "TRB": "tribal member",
  "UMO": "utilization management organization",
  "UNCLE": "uncle",
  "UPC": "underage protection center",
  "URO": "urology clinic",
  "V": "verifying",
  "VET": "veteran",
  "VL": "veal",
  "WARD": "ward",
  "WIFE": "wife",
  "WL": "wool",
  "WND": "wound clinic",
  "WO": "working",
  "WORK": "work site"
};
var PROBLEM_STATUS_MAP = {
  "55561003": "active",
  "73425007": "inactive",
  "413322009": "resolved"
}; // copied from _.invert to avoid making browser users include all of underscore

var invertKeys = function invertKeys(obj) {
  var result = {};
  var keys = Object.keys(obj);

  for (var i = 0, length = keys.length; i < length; i++) {
    result[obj[keys[i]]] = keys[i];
  }

  return result;
};

var lookupFnGenerator = function lookupFnGenerator(map) {
  return function (key) {
    return map[key] || null;
  };
};

var reverseLookupFnGenerator = function reverseLookupFnGenerator(map) {
  return function (key) {
    if (!key) {
      return null;
    }

    var invertedMap = invertKeys(map);
    key = key.toLowerCase();
    return invertedMap[key] || null;
  };
};

module.exports = {
  gender: lookupFnGenerator(GENDER_MAP),
  reverseGender: reverseLookupFnGenerator(GENDER_MAP),
  maritalStatus: lookupFnGenerator(MARITAL_STATUS_MAP),
  reverseMaritalStatus: reverseLookupFnGenerator(MARITAL_STATUS_MAP),
  religion: lookupFnGenerator(RELIGION_MAP),
  reverseReligion: reverseLookupFnGenerator(RELIGION_MAP),
  raceEthnicity: lookupFnGenerator(RACE_ETHNICITY_MAP),
  reverseRaceEthnicity: reverseLookupFnGenerator(RACE_ETHNICITY_MAP),
  role: lookupFnGenerator(ROLE_MAP),
  reverseRole: reverseLookupFnGenerator(ROLE_MAP),
  problemStatus: lookupFnGenerator(PROBLEM_STATUS_MAP),
  reverseProblemStatus: reverseLookupFnGenerator(PROBLEM_STATUS_MAP)
};

/***/ }),

/***/ 895:
/***/ ((module) => {

module.exports = {
  stripWhitespace: stripWhitespace
};

function stripWhitespace(str) {
  if (!str) {
    return str;
  }

  return str.replace(/^\s+|\s+$/g, '');
}

;

/***/ }),

/***/ 58:
/***/ ((module, __unused_webpack_exports, __nested_webpack_require_23038__) => {

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/*
 * ...
 */
var _require = __nested_webpack_require_23038__(895),
    stripWhitespace = _require.stripWhitespace;
/*
  * A function used to wrap DOM elements in an object so methods can be added
  * to the element object. IE8 does not allow methods to be added directly to
  * DOM objects.
  */


var wrapElement = function wrapElement(el) {
  function wrapElementHelper(currentEl) {
    return {
      el: currentEl,
      template: template,
      content: content,
      tag: tag,
      immediateChildTag: immediateChildTag,
      elsByTag: elsByTag,
      attr: attr,
      boolAttr: boolAttr,
      val: val,
      isEmpty: isEmpty
    };
  } // el is an array of elements


  if (el.length) {
    var els = [];

    for (var i = 0; i < el.length; i++) {
      els.push(wrapElementHelper(el[i]));
    }

    return els; // el is a single element
  } else {
    return wrapElementHelper(el);
  }
};
/*
  * Find element by tag name, then attribute value.
  */


var tagAttrVal = function tagAttrVal(el, tag, attr, value) {
  el = el.getElementsByTagName(tag);

  for (var i = 0; i < el.length; i++) {
    if (el[i].getAttribute(attr) === value) {
      return el[i];
    }
  }
};
/*
  * Search for a template ID, and return its parent element.
  * Example:
  *   <templateId root="2.16.840.1.113883.10.20.22.2.17"/>
  * Can be found using:
  *   el = dom.template('2.16.840.1.113883.10.20.22.2.17');
  */


var template = function template(templateId) {
  var el = tagAttrVal(this.el, 'templateId', 'root', templateId);

  if (!el) {
    return emptyEl();
  } else {
    return wrapElement(el.parentNode);
  }
};
/*
  * Search for a content tag by "ID", and return it as an element.
  * These are used in the unstructured versions of each section but
  * referenced from the structured version sometimes.
  * Example:
  *   <content ID="UniqueNameReferencedElsewhere"/>
  * Can be found using:
  *   el = dom.content('UniqueNameReferencedElsewhere');
  *
  * We can't use `getElementById` because `ID` (the standard attribute name
  * in this context) is not the same attribute as `id` in XML, so there are no matches
  */


var content = function content(contentId) {
  var el = tagAttrVal(this.el, 'content', 'ID', contentId);

  if (!el) {
    // check the <td> tag too, which isn't really correct but
    // will inevitably be used sometimes because it looks like very
    // normal HTML to put the data directly in a <td>
    el = tagAttrVal(this.el, 'td', 'ID', contentId);
  }

  if (!el) {
    // Ugh, Epic uses really non-standard locations.
    el = tagAttrVal(this.el, 'caption', 'ID', contentId) || tagAttrVal(this.el, 'paragraph', 'ID', contentId) || tagAttrVal(this.el, 'tr', 'ID', contentId) || tagAttrVal(this.el, 'item', 'ID', contentId);
  }

  if (!el) {
    return emptyEl();
  } else {
    return wrapElement(el);
  }
};
/*
  * Search for the first occurrence of an element by tag name.
  */


var tag = function tag(_tag) {
  var el = this.el.getElementsByTagName(_tag)[0];

  if (!el) {
    return emptyEl();
  } else {
    return wrapElement(el);
  }
};
/*
  * Like `tag`, except it will only count a tag that is an immediate child of `this`.
  * This is useful for tags like "text" which A. may not be present for a given location
  * in every document and B. have a very different meaning depending on their positioning
  *
  *   <parent>
  *     <target></target>
  *   </parent>
  * vs.
  *   <parent>
  *     <intermediate>
  *       <target></target>
  *     </intermediate>
  *   </parent>
  * parent.immediateChildTag('target') will have a result in the first case but not in the second.
  */


var immediateChildTag = function immediateChildTag(tag) {
  var els = this.el.getElementsByTagName(tag);

  if (!els) {
    return null;
  }

  for (var i = 0; i < els.length; i++) {
    if (els[i].parentNode === this.el) {
      return wrapElement(els[i]);
    }
  }

  return emptyEl();
};
/*
  * Search for all elements by tag name.
  */


var elsByTag = function elsByTag(tag) {
  return wrapElement(this.el.getElementsByTagName(tag));
};

var unescapeSpecialChars = function unescapeSpecialChars(s) {
  if (!s) {
    return s;
  }

  return s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&apos;/g, "'");
};
/*
  * Retrieve the element's attribute value. Example:
  *   value = el.attr('displayName');
  *
  * The browser and jsdom return "null" for empty attributes;
  * xmldom (which we now use because it's faster / can be explicitly
  * told to parse malformed XML as XML anyways), return the empty
  * string instead, so we fix that here.
  */


var attr = function attr(attrName) {
  if (!this.el) {
    return null;
  }

  var attrVal = this.el.getAttribute(attrName);

  if (attrVal) {
    return unescapeSpecialChars(attrVal);
  }

  return null;
};
/*
  * Wrapper for attr() for retrieving boolean attributes;
  * a raw call attr() will return Strings, which can be unexpected,
  * since the string 'false' will by truthy
  */


var boolAttr = function boolAttr(attrName) {
  var rawAttr = this.attr(attrName);

  if (rawAttr === 'true' || rawAttr === '1') {
    return true;
  }

  return false;
};
/*
  * Retrieve the element's value. For example, if the element is:
  *   <city>Madison</city>
  * Use:
  *   value = el.tag('city').val();
  *
  * This function also knows how to retrieve the value of <reference> tags,
  * which can store their content in a <content> tag in a totally different
  * part of the document.
  */


var val = function val(html) {
  if (!this.el) {
    return null;
  }

  if (!this.el.childNodes || !this.el.childNodes.length) {
    return null;
  }

  var textContent;

  if (html) {
    textContent = this.el.innerHTML;
    if (!textContent && root.XMLSerializer) textContent = new XMLSerializer().serializeToString(this.el);
  } else {
    textContent = this.el.textContent;
  } // if there's no text value here and the only thing inside is a
  // <reference> tag, see if there's a linked <content> tag we can
  // get something out of


  if (!stripWhitespace(textContent)) {
    var contentId; // "no text value" might mean there's just a reference tag

    if (this.el.childNodes.length === 1 && this.el.childNodes[0].tagName === 'reference') {
      contentId = this.el.childNodes[0].getAttribute('value'); // or maybe a newlines on top/above the reference tag
    } else if (this.el.childNodes.length === 3 && this.el.childNodes[1].tagName === 'reference') {
      contentId = this.el.childNodes[1].getAttribute('value');
    } else {
      return unescapeSpecialChars(textContent);
    }

    if (contentId && contentId[0] === '#') {
      contentId = contentId.slice(1); // get rid of the '#'

      var docRoot = wrapElement(this.el.ownerDocument);
      var contentTag = docRoot.content(contentId);
      return contentTag.val();
    }
  }

  return unescapeSpecialChars(textContent);
};
/*
  * Creates and returns an empty DOM element with tag name "empty":
  *   <empty></empty>
  */


var emptyEl = function emptyEl() {
  var el = doc.createElement('empty');
  return wrapElement(el);
};
/*
  * Determines if the element is empty, i.e.:
  *   <empty></empty>
  * This element is created by function `emptyEL`.
  */


var isEmpty = function isEmpty() {
  if (this.el.tagName.toLowerCase() === 'empty') {
    return true;
  } else {
    return false;
  }
};
/*
  * Cross-browser XML parsing supporting IE8+ and Node.js.
  */


function parse(data) {
  // XML data must be a string
  if (!data || typeof data !== "string") {
    console.log("BB Error: XML data is not a string");
    return null;
  }

  var xml, parser; // Node

  if (isNode) {
    parser = new xmldom.DOMParser();
    xml = parser.parseFromString(data, "text/xml"); // Browser
  } else {
    // Standard parser
    if (window.DOMParser) {
      parser = new DOMParser();
      xml = parser.parseFromString(data, "text/xml"); // IE
    } else {
      try {
        xml = new ActiveXObject("Microsoft.XMLDOM");
        xml.async = "false";
        xml.loadXML(data);
      } catch (e) {
        console.log("BB ActiveX Exception: Could not parse XML");
      }
    }
  }

  if (!xml || !xml.documentElement || xml.getElementsByTagName("parsererror").length) {
    console.log("BB Error: Could not parse XML");
    return null;
  }

  return wrapElement(xml);
}

; // Establish the root object, `window` in the browser, or `global` in Node.

var root = window || __nested_webpack_require_23038__.g,
    xmldom,
    isNode = false,
    doc = root.document; // Will be `undefined` if we're in Node
// Check if we're in Node. If so, pull in `xmldom` so we can simulate the DOM.

if ((typeof process === "undefined" ? "undefined" : _typeof(process)) === 'object' && Object.prototype.toString.call(process) === '[object process]') {
  isNode = true;
  xmldom = __nested_webpack_require_23038__(348);
  doc = new xmldom.DOMImplementation().createDocument();
}

module.exports = {
  parse: parse
};

/***/ }),

/***/ 452:
/***/ ((module, __unused_webpack_exports, __nested_webpack_require_32547__) => {

/*
  * ...
  */
var C32 = __nested_webpack_require_32547__(766);

var CCD = __nested_webpack_require_32547__(626);

var CCDA = __nested_webpack_require_32547__(539);

var CCDAR2 = __nested_webpack_require_32547__(52);

module.exports = function () {
  var self = this;
  self.detect = detect;
  self.entries = entries;
  self.parseDate = parseDate;
  self.parseName = parseName;
  self.parseAddress = parseAddress;
  self.C32 = new C32(getEntries);
  self.CCD = new CCD(getEntries);
  self.CCDA = new CCDA(getEntries);
  self.CCDAR2 = new CCDAR2(getEntries);
};

function getEntries() {
  return entries;
}

;

function detect(data) {
  if (!data.template) {
    return 'json';
  }

  if (!data.template('2.16.840.1.113883.3.88.11.32.1').isEmpty()) {
    return 'c32';
  } else if (!data.template('2.16.840.1.113883.10.20.22.1.1').isEmpty()) {
    return 'ccda';
  } else if (!data.template('2.16.840.1.113883.10.20.22.1.15').isEmpty()) {
    return 'ccdar2';
  } else if (!data.template('2.16.840.1.113883.10.20.22.1.2').isEmpty()) {
    return 'ccd';
  }
}

;
/*
  * Get entries within an element (with tag name 'entry'), adds an `each` function
  */

function entries() {
  var each = function each(callback) {
    for (var i = 0; i < this.length; i++) {
      callback(this[i]);
    }
  };

  var els = this.elsByTag('entry');
  els.each = each;
  return els;
}

;
/*
  * Parses an HL7 date in String form and creates a new Date object.
  * 
  * TODO: CCDA dates can be in form:
  *   <effectiveTime value="20130703094812"/>
  * ...or:
  *   <effectiveTime>
  *     <low value="19630617120000"/>
  *     <high value="20110207100000"/>
  *   </effectiveTime>
  * For the latter, parseDate will not be given type `String`
  * and will return `null`.
  */

function parseDate(str) {
  if (!str || typeof str !== 'string') {
    return null;
  } // Note: months start at 0 (so January is month 0)
  // e.g., value="1999" translates to Jan 1, 1999


  if (str.length === 4) {
    return new Date(str, 0, 1);
  }

  var year = str.substr(0, 4); // subtract 1 from the month since they're zero-indexed

  var month = parseInt(str.substr(4, 2), 10) - 1; // days are not zero-indexed. If we end up with the day 0 or '',
  // that will be equivalent to the last day of the previous month

  var day = str.substr(6, 2) || 1; // check for time info (the presence of at least hours and mins after the date)

  if (str.length >= 12) {
    var hour = str.substr(8, 2);
    var min = str.substr(10, 2);
    var secs = str.substr(12, 2); // check for timezone info (the presence of chars after the seconds place)

    if (str.length > 14) {
      // _utcOffsetFromString will return 0 if there's no utc offset found.
      var utcOffset = _utcOffsetFromString(str.substr(14)); // We subtract that offset from the local time to get back to UTC
      // (e.g., if we're -480 mins behind UTC, we add 480 mins to get back to UTC)


      min = _toInt(min) - utcOffset;
    }

    var date = new Date(Date.UTC(year, month, day, hour, min, secs)); // This flag lets us output datetime-precision in our JSON even if the time happens
    // to translate to midnight local time. If we clone the date object, it is not
    // guaranteed to survive.

    date._parsedWithTimeData = true;
    return date;
  }

  return new Date(year, month, day);
}

; // These regexes and the two functions below are copied from moment.js
// http://momentjs.com/
// https://github.com/moment/moment/blob/develop/LICENSE

var parseTimezoneChunker = /([\+\-]|\d\d)/gi;
var parseTokenTimezone = /Z|[\+\-]\d\d:?\d\d/gi; // +00:00 -00:00 +0000 -0000 or Z

function _utcOffsetFromString(string) {
  string = string || '';

  var possibleTzMatches = string.match(parseTokenTimezone) || [],
      tzChunk = possibleTzMatches[possibleTzMatches.length - 1] || [],
      parts = (tzChunk + '').match(parseTimezoneChunker) || ['-', 0, 0],
      minutes = +(parts[1] * 60) + _toInt(parts[2]);

  return parts[0] === '+' ? minutes : -minutes;
}

function _toInt(argumentForCoercion) {
  var coercedNumber = +argumentForCoercion,
      value = 0;

  if (coercedNumber !== 0 && isFinite(coercedNumber)) {
    if (coercedNumber >= 0) {
      value = Math.floor(coercedNumber);
    } else {
      value = Math.ceil(coercedNumber);
    }
  }

  return value;
}
/*
  * Parses an HL7 name (prefix / given [] / family)
  */


function parseName(nameEl) {
  var prefix = nameEl.tag('prefix').val();
  var els = nameEl.elsByTag('given');
  var given = [];

  for (var i = 0; i < els.length; i++) {
    var val = els[i].val();

    if (val) {
      given.push(val);
    }
  }

  var family = nameEl.tag('family').val();
  return {
    prefix: prefix,
    given: given,
    family: family
  };
}

;
/*
  * Parses an HL7 address (streetAddressLine [], city, state, postalCode, country)
  */

function parseAddress(addrEl) {
  var els = addrEl.elsByTag('streetAddressLine');
  var street = [];

  for (var i = 0; i < els.length; i++) {
    var val = els[i].val();

    if (val) {
      street.push(val);
    }
  }

  var city = addrEl.tag('city').val(),
      state = addrEl.tag('state').val(),
      zip = addrEl.tag('postalCode').val(),
      country = addrEl.tag('country').val();
  return {
    street: street,
    city: city,
    state: state,
    zip: zip,
    country: country
  };
}

;

/***/ }),

/***/ 766:
/***/ ((module) => {

/*
 * ...
 */
module.exports = function (getEntries) {
  var self = this;
  self.getEntries = getEntries;
  self.process = process;
  self.section = section;
  /*
  * Preprocesses the C32 document
  */

  function process(c32) {
    c32.section = section;
    return c32;
  }

  ;
  /*
    * Finds the section of a C32 document
    *
    * Usually we check first for the HITSP section ID and then for the HL7-CCD ID.
    */

  function section(name) {
    var el,
        entries = self.getEntries();

    switch (name) {
      case 'document':
        return this.template('2.16.840.1.113883.3.88.11.32.1');

      case 'allergies':
        el = this.template('2.16.840.1.113883.3.88.11.83.102');

        if (el.isEmpty()) {
          el = this.template('2.16.840.1.113883.10.20.1.2');
        }

        el.entries = entries;
        return el;

      case 'demographics':
        return this.template('2.16.840.1.113883.3.88.11.32.1');

      case 'encounters':
        el = this.template('2.16.840.1.113883.3.88.11.83.127');

        if (el.isEmpty()) {
          el = this.template('2.16.840.1.113883.10.20.1.3');
        }

        el.entries = entries;
        return el;

      case 'immunizations':
        el = this.template('2.16.840.1.113883.3.88.11.83.117');

        if (el.isEmpty()) {
          el = this.template('2.16.840.1.113883.10.20.1.6');
        }

        el.entries = entries;
        return el;

      case 'results':
        el = this.template('2.16.840.1.113883.3.88.11.83.122');

        if (el.isEmpty()) {
          el = this.template('2.16.840.1.113883.10.20.1.14');
        }

        el.entries = entries;
        return el;

      case 'medications':
        el = this.template('2.16.840.1.113883.3.88.11.83.112');

        if (el.isEmpty()) {
          el = this.template('2.16.840.1.113883.10.20.1.8');
        }

        el.entries = entries;
        return el;

      case 'problems':
        el = this.template('2.16.840.1.113883.3.88.11.83.103');

        if (el.isEmpty()) {
          el = this.template('2.16.840.1.113883.10.20.1.11');
        }

        el.entries = entries;
        return el;

      case 'procedures':
        el = this.template('2.16.840.1.113883.3.88.11.83.108');

        if (el.isEmpty()) {
          el = this.template('2.16.840.1.113883.10.20.1.12');
        }

        el.entries = entries;
        return el;

      case 'vitals':
        el = this.template('2.16.840.1.113883.3.88.11.83.119');

        if (el.isEmpty()) {
          el = this.template('2.16.840.1.113883.10.20.1.16');
        }

        el.entries = entries;
        return el;
    }

    return null;
  }

  ;
};

/***/ }),

/***/ 626:
/***/ ((module) => {

/*
 * ...
 */
module.exports = function (getEntries) {
  var self = this;
  self.getEntries = getEntries;
  self.process = process;
  self.section = section;
  /*
   * Preprocesses the CCDAR2 document
   */

  function process(ccda) {
    ccda.section = section;
    return ccda;
  }

  ;
  /*
   * Finds the section of a CCDA document
   */

  function section(name) {
    var el,
        entries = self.getEntries();

    switch (name) {
      case 'document':
        return this.template('2.16.840.1.113883.10.20.22.1.2');

      case 'demographics':
        return this.template('2.16.840.1.113883.10.20.22.1.2');

      case 'health_concerns_document':
        el = this.template('2.16.840.1.113883.10.20.22.2.58');
        el.entries = entries;
        return el;

      case 'goals':
        el = this.template('2.16.840.1.113883.10.20.22.2.60');
        el.entries = entries;
        return el;

      case 'interventions':
        el = this.template('2.16.840.1.113883.10.20.21.2.3');
        el.entries = entries;
        return el;

      case 'health_status_outcomes':
        el = this.template('2.16.840.1.113883.10.20.22.2.61');
        el.entries = entries;
        return el;
    }

    return null;
  }

  ;
};

/***/ }),

/***/ 539:
/***/ ((module) => {

/*
 * ...
 */
module.exports = function (getEntries) {
  var self = this;
  self.getEntries = getEntries;
  self.process = process;
  self.section = section;
  /*
   * Preprocesses the CCDA document
   */

  function process(ccda) {
    ccda.section = section;
    return ccda;
  }

  ;
  /*
   * Finds the section of a CCDA document
   */

  function section(name) {
    var el,
        entries = self.getEntries();

    switch (name) {
      case 'document':
        return this.template('2.16.840.1.113883.10.20.22.1.1');

      case 'allergies':
        el = this.template('2.16.840.1.113883.10.20.22.2.6.1');
        el.entries = entries;
        return el;

      case 'care_plan':
        el = this.template('2.16.840.1.113883.10.20.22.2.10');
        el.entries = entries;
        return el;

      case 'chief_complaint':
        el = this.template('2.16.840.1.113883.10.20.22.2.13');

        if (el.isEmpty()) {
          el = this.template('1.3.6.1.4.1.19376.1.5.3.1.1.13.2.1');
        } // no entries in Chief Complaint


        return el;

      case 'demographics':
        return this.template('2.16.840.1.113883.10.20.22.1.1');

      case 'encounters':
        el = this.template('2.16.840.1.113883.10.20.22.2.22');

        if (el.isEmpty()) {
          el = this.template('2.16.840.1.113883.10.20.22.2.22.1');
        }

        el.entries = entries;
        return el;

      case 'functional_statuses':
        el = this.template('2.16.840.1.113883.10.20.22.2.14');
        el.entries = entries;
        return el;

      case 'immunizations':
        el = this.template('2.16.840.1.113883.10.20.22.2.2.1');

        if (el.isEmpty()) {
          el = this.template('2.16.840.1.113883.10.20.22.2.2');
        }

        el.entries = entries;
        return el;

      case 'instructions':
        el = this.template('2.16.840.1.113883.10.20.22.2.45');
        el.entries = entries;
        return el;

      case 'results':
        el = this.template('2.16.840.1.113883.10.20.22.2.3.1');

        if (el.isEmpty()) {
          el = this.template('2.16.840.1.113883.10.20.22.2.3');
        }

        el.entries = entries;
        return el;

      case 'medications':
        el = this.template('2.16.840.1.113883.10.20.22.2.1.1');

        if (el.isEmpty()) {
          el = this.template('2.16.840.1.113883.10.20.22.2.1');
        }

        el.entries = entries;
        return el;

      case 'problems':
        el = this.template('2.16.840.1.113883.10.20.22.2.5.1');

        if (el.isEmpty()) {
          el = this.template('2.16.840.1.113883.10.20.22.2.5');
        }

        el.entries = entries;
        return el;

      case 'procedures':
        el = this.template('2.16.840.1.113883.10.20.22.2.7.1');

        if (el.isEmpty()) {
          el = this.template('2.16.840.1.113883.10.20.22.2.7');
        }

        el.entries = entries;
        return el;

      case 'social_history':
        el = this.template('2.16.840.1.113883.10.20.22.2.17');
        el.entries = entries;
        return el;

      case 'vitals':
        el = this.template('2.16.840.1.113883.10.20.22.2.4.1');

        if (el.isEmpty()) {
          el = this.template('2.16.840.1.113883.10.20.22.2.4');
        }

        el.entries = entries;
        return el;
    }

    return null;
  }

  ;
};

/***/ }),

/***/ 52:
/***/ ((module) => {

/*
 * ...
 */
module.exports = function (getEntries) {
  var self = this;
  self.getEntries = getEntries;
  self.process = process;
  self.section = section;
  /*
   * Preprocesses the CCDAR2 document
   */

  function process(ccda) {
    ccda.section = section;
    return ccda;
  }

  ;
  /*
   * Finds the section of a CCDA document
   */

  function section(name) {
    var el,
        entries = self.getEntries();

    switch (name) {
      case 'document':
        return this.template('2.16.840.1.113883.10.20.22.1.15');

      case 'demographics':
        return this.template('2.16.840.1.113883.10.20.22.1.15');

      case 'health_concerns_document':
        el = this.template('2.16.840.1.113883.10.20.22.2.58');
        el.entries = entries;
        return el;

      case 'goals':
        el = this.template('2.16.840.1.113883.10.20.22.2.60');
        el.entries = entries;
        return el;

      case 'interventions':
        el = this.template('2.16.840.1.113883.10.20.21.2.3');
        el.entries = entries;
        return el;

      case 'health_status_outcomes':
        el = this.template('2.16.840.1.113883.10.20.22.2.61');
        el.entries = entries;
        return el;
    }

    return null;
  }

  ;
};

/***/ }),

/***/ 409:
/***/ ((module, __unused_webpack_exports, __nested_webpack_require_46565__) => {

/*
 * ...
 */
var C32 = __nested_webpack_require_46565__(49);

var CCDA = __nested_webpack_require_46565__(246);

var method = function method() {};
/* exported Generators */


module.exports = {
  method: method,
  C32: C32,
  CCDA: CCDA
};
/* Import ejs if we're in Node. Then setup custom formatting filters
 */

/*if (typeof exports !== 'undefined') {
  if (typeof module !== 'undefined' && module.exports) {
    ejs = require("ejs");
  }
}
  if (typeof ejs !== 'undefined') {
  /* Filters are automatically available to ejs to be used like "... | hl7Date"
   * Helpers are functions that we'll manually pass in to ejs.
   * The intended distinction is that a helper gets called with regular function-call syntax
   */

/*
var pad = function(number) {
if (number < 10) {
return '0' + number;
}
return String(number);
};
ejs.filters.hl7Date = function(obj) {
try {
  if (obj === null || obj === undefined) { return 'nullFlavor="UNK"'; }
  var date = new Date(obj);
  if (isNaN(date.getTime())) { return obj; }
    var dateStr = null;
  if (date.getHours() || date.getMinutes() || date.getSeconds()) {
    // If there's a meaningful time, output a UTC datetime
    dateStr = date.getUTCFullYear() +
      pad( date.getUTCMonth() + 1 ) +
      pad( date.getUTCDate() );
    var timeStr = pad( date.getUTCHours() ) +
      pad( date.getUTCMinutes() ) +
      pad ( date.getUTCSeconds() ) +
      "+0000";
    return 'value="' + dateStr + timeStr + '"';
   
  } else {
    // If there's no time, don't apply timezone tranformations: just output a date
    dateStr = String(date.getFullYear()) +
      pad( date.getMonth() + 1 ) +
      pad( date.getDate() );
    return 'value="' + dateStr + '"';
  }
} catch (e) {
  return obj;
}
};
var escapeSpecialChars = function(s) {
return s.replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
};
ejs.filters.hl7Code = function(obj) {
if (!obj) { return ''; }
var tag = '';
var name = obj.name || '';
if (obj.name) { tag += 'displayName="'+escapeSpecialChars(name)+'"'; }
if (obj.code) {
tag += ' code="'+obj.code+'"';
if (obj.code_system) { tag += ' codeSystem="'+escapeSpecialChars(obj.code_system)+'"'; }
if (obj.code_system_name) { tag += ' codeSystemName="' +
                                escapeSpecialChars(obj.code_system_name)+'"'; }
} else {
tag += ' nullFlavor="UNK"';
}
if (!obj.name && ! obj.code) {
return 'nullFlavor="UNK"';
}
      return tag;
};
ejs.filters.emptyStringIfFalsy = function(obj) {
if (!obj) { return ''; }
return obj;
};
if (!ejs.helpers) ejs.helpers = {};
ejs.helpers.simpleTag = function(tagName, value) {
if (value) {
return "<"+tagName+">"+value+"</"+tagName+">";
} else {
return "<"+tagName+" nullFlavor=\"UNK\" />";
}
};
ejs.helpers.addressTags = function(addressDict) {
if (!addressDict) {
return '<streetAddressLine nullFlavor="NI" />\n' +
        '<city nullFlavor="NI" />\n' +
        '<state nullFlavor="NI" />\n' +
        '<postalCode nullFlavor="NI" />\n' +
        '<country nullFlavor="NI" />\n';
}
      var tags = '';
if (!addressDict.street.length) {
tags += ejs.helpers.simpleTag('streetAddressLine', null) + '\n';
} else {
for (var i=0; i<addressDict.street.length; i++) {
  tags += ejs.helpers.simpleTag('streetAddressLine', addressDict.street[i]) + '\n';
}
}
tags += ejs.helpers.simpleTag('city', addressDict.city) + '\n';
tags += ejs.helpers.simpleTag('state', addressDict.state) + '\n';
tags += ejs.helpers.simpleTag('postalCode', addressDict.zip) + '\n';
tags += ejs.helpers.simpleTag('country', addressDict.country) + '\n';
return tags;
};
ejs.helpers.nameTags = function(nameDict) {
if (!nameDict) {
return '<given nullFlavor="NI" />\n' +
        '<family nullFlavor="NI" />\n';
}
var tags = '';
if (nameDict.prefix) {
tags += ejs.helpers.simpleTag('prefix', nameDict.prefix) + '\n';
}
if (!nameDict.given.length) {
tags += ejs.helpers.simpleTag('given', null) + '\n';
} else {
for (var i=0; i<nameDict.given.length; i++) {
  tags += ejs.helpers.simpleTag('given', nameDict.given[i]) + '\n';
}
}
tags += ejs.helpers.simpleTag('family', nameDict.family) + '\n';
if (nameDict.suffix) {
tags += ejs.helpers.simpleTag('suffix', nameDict.suffix) + '\n';
}
return tags;
};
}*/

/***/ }),

/***/ 49:
/***/ ((module) => {

/*
 * ...
 */
module.exports = {
  run: run
};
/*
  * Generates a C32 document
  */

function run(json, template, testingMode) {
  /* jshint unused: false */
  // only until this stub is actually implemented
  console.log("C32 generation is not implemented yet");
  return null;
}

;

/***/ }),

/***/ 246:
/***/ ((module, __unused_webpack_exports, __nested_webpack_require_51354__) => {

/*
 * ...
 */
var _ = __nested_webpack_require_51354__(804);

module.exports = {
  run: run
};
/*
  * Generates a CCDA document
  * A lot of the EJS setup happens in generators.js
  *
  * If `testingMode` is true, we'll set the "now" variable to a specific,
  * fixed time, so that the expected XML doesn't change across runs
  */

function run(json, template, testingMode) {
  if (!template) {
    console.log("Please provide a template EJS file for the Generator to use. " + "Load it via fs.readFileSync in Node or XHR in the browser.");
    return null;
  } // `now` is actually now, unless we're running this for a test,
  // in which case it's always Jan 1, 2000 at 12PM UTC


  var now = testingMode ? new Date('2000-01-01T12:00:00Z') : new Date();

  var ccda = _.template(template, {
    filename: 'ccda.xml',
    bb: json,
    now: now,
    tagHelpers: ejs.helpers,
    codes: Core.Codes
  });

  return ccda;
}

;

/***/ }),

/***/ 46:
/***/ ((module, __unused_webpack_exports, __nested_webpack_require_52364__) => {

/*
 * ...
 */
var C32 = __nested_webpack_require_52364__(583);

var CCD = __nested_webpack_require_52364__(939);

var CCDA = __nested_webpack_require_52364__(193);

var CCDAR2 = __nested_webpack_require_52364__(767);

var method = function method() {};
/* exported Parsers */


module.exports = function (doc) {
  var self = this;
  self.doc = doc;
  self.method = method;
  self.C32 = new C32(self.doc);
  self.CCD = new CCD(self.doc);
  self.CCDA = new CCDA(self.doc);
  self.CCDAR2 = new CCDAR2(self.doc);
};

/***/ }),

/***/ 583:
/***/ ((module, __unused_webpack_exports, __nested_webpack_require_52918__) => {

/*
 * Parser for the C32 document
 */
var Core = __nested_webpack_require_52918__(1);

var AllergiesParser = __nested_webpack_require_52918__(946);

var DemographicsParser = __nested_webpack_require_52918__(932);

var DocumentParser = __nested_webpack_require_52918__(370);

var EncountersParser = __nested_webpack_require_52918__(443);

var ImmunizationsParser = __nested_webpack_require_52918__(554);

var MedicationsParser = __nested_webpack_require_52918__(659);

var ProblemsParser = __nested_webpack_require_52918__(119);

var ProceduresParser = __nested_webpack_require_52918__(383);

var ResultsParser = __nested_webpack_require_52918__(549);

var VitalsParser = __nested_webpack_require_52918__(396);

var ParseGenericInfo = __nested_webpack_require_52918__(711);

module.exports = function (doc) {
  var self = this;
  self.doc = doc;
  self.allergiesParser = new AllergiesParser(self.doc);
  self.demographicsParser = new DemographicsParser(self.doc);
  self.demographicsParser = new DocumentParser(self.doc);
  self.encountersParser = new EncountersParser(self.doc);
  self.immunizationsParser = new ImmunizationsParser(self.doc);
  self.medicationsParser = new MedicationsParser(self.doc);
  self.problemsParser = new ProblemsParser(self.doc);
  self.proceduresParser = new ProceduresParser(self.doc);
  self.resultsParser = new ResultsParser(self.doc);
  self.vitalsParser = new VitalsParser(self.doc);

  self.run = function (c32) {
    var data = {};
    data.document = self.demographicsParser.parse(c32);
    data.allergies = self.allergiesParser.parse(c32);
    data.demographics = self.demographicsParser.parse(c32);
    data.encounters = self.encountersParser.parse(c32);
    var parsedImmunizations = self.immunizationsParser.parse(c32);
    data.immunizations = parsedImmunizations.administered;
    data.immunization_declines = parsedImmunizations.declined;
    data.results = self.resultsParser.parse(c32);
    data.medications = self.medicationsParser.parse(c32);
    data.problems = self.problemsParser.parse(c32);
    data.procedures = self.proceduresParser.parse(c32);
    data.vitals = self.vitals.parse(c32);
    data.json = Core.json;
    data.document.json = Core.json;
    data.allergies.json = Core.json;
    data.demographics.json = Core.json;
    data.encounters.json = Core.json;
    data.immunizations.json = Core.json;
    data.immunization_declines.json = Core.json;
    data.results.json = Core.json;
    data.medications.json = Core.json;
    data.problems.json = Core.json;
    data.procedures.json = Core.json;
    data.vitals.json = Core.json; // Sections that are in CCDA but not C32... we want to keep the API
    // consistent, even if the entries are always null

    data.smoking_status = {
      date: null,
      name: null,
      code: null,
      code_system: null,
      code_system_name: null
    };
    data.smoking_status.json = Core.json;
    data.chief_complaint = {
      text: null
    };
    data.chief_complaint.json = Core.json;
    data.care_plan = [];
    data.care_plan.json = Core.json;
    data.instructions = [];
    data.instructions.json = Core.json;
    data.functional_statuses = [];
    data.functional_statuses.json = Core.json; // Decorate each section with Title, templateId and text and adds missing sections

    ParseGenericInfo(c32, data);
    return data;
  };
};

/***/ }),

/***/ 946:
/***/ ((module, __unused_webpack_exports, __nested_webpack_require_56205__) => {

/*
 * Parser for the C32 allergies section
 */
var Core = __nested_webpack_require_56205__(1);

module.exports = function (doc) {
  var self = this;
  self.doc = doc;
  self.parse = parse;

  function parse(c32) {
    var parseDate = self.doc.parseDate;
    var parseName = self.doc.parseName;
    var parseAddress = self.doc.parseAddress;
    var allergies = c32.section('allergies');
    var data = {},
        el;
    data.entries = [];
    data.displayName = "Allergies";
    data.templateId = allergies.tag('templateId').attr('root');
    data.text = allergies.tag('text').val(true);
    allergies.entries().each(function (entry) {
      el = entry.tag('effectiveTime');
      var start_date = parseDate(el.tag('low').attr('value')),
          end_date = parseDate(el.tag('high').attr('value'));
      el = entry.template('2.16.840.1.113883.3.88.11.83.6').tag('code');
      var name = el.attr('displayName'),
          code = el.attr('code'),
          code_system = el.attr('codeSystem'),
          code_system_name = el.attr('codeSystemName'); // value => reaction_type

      el = entry.template('2.16.840.1.113883.3.88.11.83.6').tag('value');
      var reaction_type_name = el.attr('displayName'),
          reaction_type_code = el.attr('code'),
          reaction_type_code_system = el.attr('codeSystem'),
          reaction_type_code_system_name = el.attr('codeSystemName'); // reaction

      el = entry.template('2.16.840.1.113883.10.20.1.54').tag('value');
      var reaction_name = el.attr('displayName'),
          reaction_code = el.attr('code'),
          reaction_code_system = el.attr('codeSystem'); // an irregularity seen in some c32s

      if (!reaction_name) {
        el = entry.template('2.16.840.1.113883.10.20.1.54').tag('text');

        if (!el.isEmpty()) {
          reaction_name = Core.stripWhitespace(el.val());
        }
      } // severity


      el = entry.template('2.16.840.1.113883.10.20.1.55').tag('value');
      var severity = el.attr('displayName'); // participant => allergen

      el = entry.tag('participant').tag('code');
      var allergen_name = el.attr('displayName'),
          allergen_code = el.attr('code'),
          allergen_code_system = el.attr('codeSystem'),
          allergen_code_system_name = el.attr('codeSystemName'); // another irregularity seen in some c32s

      if (!allergen_name) {
        el = entry.tag('participant').tag('name');

        if (!el.isEmpty()) {
          allergen_name = el.val();
        }
      }

      if (!allergen_name) {
        el = entry.template('2.16.840.1.113883.3.88.11.83.6').tag('originalText');

        if (!el.isEmpty()) {
          allergen_name = Core.stripWhitespace(el.val());
        }
      } // status


      el = entry.template('2.16.840.1.113883.10.20.1.39').tag('value');
      var status = el.attr('displayName');
      data.entries.push({
        date_range: {
          start: start_date,
          end: end_date
        },
        name: name,
        code: code,
        code_system: code_system,
        code_system_name: code_system_name,
        status: status,
        severity: severity,
        reaction: {
          name: reaction_name,
          code: reaction_code,
          code_system: reaction_code_system
        },
        reaction_type: {
          name: reaction_type_name,
          code: reaction_type_code,
          code_system: reaction_type_code_system,
          code_system_name: reaction_type_code_system_name
        },
        allergen: {
          name: allergen_name,
          code: allergen_code,
          code_system: allergen_code_system,
          code_system_name: allergen_code_system_name
        }
      });
    });
    return data;
  }
};

/***/ }),

/***/ 932:
/***/ ((module, __unused_webpack_exports, __nested_webpack_require_59994__) => {

/*
 * Parser for the C32 demographics section
 */
var Core = __nested_webpack_require_59994__(1);

module.exports = function (doc) {
  var self = this;
  self.doc = doc;
  self.parse = parse;

  function parse(c32) {
    var parseDate = self.doc.parseDate;
    var parseName = self.doc.parseName;
    var parseAddress = self.doc.parseAddress;
    var data = {},
        el;
    var demographics = c32.section('demographics');
    var patient = demographics.tag('patientRole');
    el = patient.tag('patient').tag('name');
    var patient_name_dict = parseName(el);
    el = patient.tag('patient');
    var dob = parseDate(el.tag('birthTime').attr('value')),
        gender = Core.Codes.gender(el.tag('administrativeGenderCode').attr('code')),
        marital_status = Core.Codes.maritalStatus(el.tag('maritalStatusCode').attr('code'));
    el = patient.tag('addr');
    var patient_address_dict = parseAddress(el);
    el = patient.tag('telecom');
    var home = el.attr('value'),
        work = null,
        mobile = null;
    var email = null;
    var language = patient.tag('languageCommunication').tag('languageCode').attr('code'),
        race = patient.tag('raceCode').attr('displayName'),
        ethnicity = patient.tag('ethnicGroupCode').attr('displayName'),
        religion = patient.tag('religiousAffiliationCode').attr('displayName');
    el = patient.tag('birthplace');
    var birthplace_dict = parseAddress(el);
    el = patient.tag('guardian');
    var guardian_relationship = el.tag('code').attr('displayName'),
        guardian_relationship_code = el.tag('code').attr('code'),
        guardian_home = el.tag('telecom').attr('value');
    el = el.tag('guardianPerson').tag('name');
    var guardian_name_dict = parseName(el);
    el = patient.tag('guardian').tag('addr');
    var guardian_address_dict = parseAddress(el);
    el = patient.tag('providerOrganization');
    var provider_organization = el.tag('name').val(),
        provider_phone = el.tag('telecom').attr('value'),
        provider_address_dict = parseAddress(el.tag('addr'));
    data = {
      name: patient_name_dict,
      dob: dob,
      gender: gender,
      marital_status: marital_status,
      address: patient_address_dict,
      phone: {
        home: home,
        work: work,
        mobile: mobile
      },
      email: email,
      language: language,
      race: race,
      ethnicity: ethnicity,
      religion: religion,
      birthplace: {
        state: birthplace_dict.state,
        zip: birthplace_dict.zip,
        country: birthplace_dict.country
      },
      guardian: {
        name: {
          given: guardian_name_dict.given,
          family: guardian_name_dict.family
        },
        relationship: guardian_relationship,
        relationship_code: guardian_relationship_code,
        address: guardian_address_dict,
        phone: {
          home: guardian_home
        }
      },
      provider: {
        organization: provider_organization,
        phone: provider_phone,
        address: provider_address_dict
      }
    };
    return data;
  }

  ;
};

/***/ }),

/***/ 370:
/***/ ((module, __unused_webpack_exports, __nested_webpack_require_63155__) => {

/*
 * Parser for the C32 document section
 */
var Core = __nested_webpack_require_63155__(1);

module.exports = function (doc) {
  var self = this;
  self.doc = doc;
  self.parse = parse;

  function parse(c32) {
    var parseDate = self.doc.parseDate;
    var parseName = self.doc.parseName;
    var parseAddress = self.doc.parseAddress;
    var data = {},
        el;
    var doc = c32.section('document'); // Parse Doc Type Info

    var templates = doc.elsByTag('templateId');
    var rootTemplate = templates[0].attr('root');
    var secondTemplate;
    if (templates.length > 1) secondTemplate = templates[1].attr('root');else secondTemplate = rootTemplate;
    var loinc = doc.tag('code').attr('code');
    var templateId = doc.tag('templateId').attr('root');
    var displayName = doc.tag('code').attr('displayName');
    var nonXml = doc.tag('nonXMLBody');
    var nonXmlNodes = nonXml.el.childNodes;
    var bodyType = "structured";
    var nonXmlBody = {
      type: "",
      mediaType: "",
      representation: "",
      rawText: "",
      reference: ""
    };

    if (nonXmlNodes && nonXmlNodes.length > 0) {
      bodyType = "unstructured";
      var text = nonXml.tag('text');
      var mediaType = "";
      var representation = "";
      var rawText = "";
      var reference = "";
      var type = ""; // We have an embedded doc

      if (text && text.attr('mediaType')) {
        mediaType = text.attr('mediaType');
        representation = text.attr('representation');
        rawText = text.val();
        type = "embedded";
      }

      if (text && !mediaType) {
        reference = text.tag('reference').attr('value');
        type = "reference";
      }

      nonXmlBody = {
        type: type,
        mediaType: mediaType,
        representation: representation,
        rawText: rawText,
        reference: reference
      };
    }

    var docType = {
      type: "CCDAR2",
      rootTemplateId: rootTemplate,
      templateId: secondTemplate,
      displayName: displayName,
      loinc: loinc,
      bodyType: bodyType,
      nonXmlBody: nonXmlBody
    };
    var date = parseDate(doc.tag('effectiveTime').attr('value'));
    var title = Core.stripWhitespace(doc.tag('title').val());
    var author = doc.tag('author');
    el = author.tag('assignedPerson').tag('name');
    var name_dict = parseName(el); // Sometimes C32s include names that are just like <name>String</name>
    // and we still want to get something out in that case

    if (!name_dict.prefix && !name_dict.given.length && !name_dict.family) {
      name_dict.family = el.val();
    }

    el = author.tag('addr');
    var address_dict = parseAddress(el);
    el = author.tag('telecom');
    var work_phone = el.attr('value');
    var documentation_of_list = [];
    var performers = doc.tag('documentationOf').elsByTag('performer');

    for (var i = 0; i < performers.length; i++) {
      el = performers[i].tag('assignedPerson').tag('name');
      var performer_name_dict = parseName(el);
      var performer_phone = performers[i].tag('telecom').attr('value');
      var performer_addr = parseAddress(el.tag('addr'));
      documentation_of_list.push({
        name: performer_name_dict,
        phone: {
          work: performer_phone
        },
        address: performer_addr
      });
    }

    el = doc.tag('encompassingEncounter');
    var location_name = Core.stripWhitespace(el.tag('name').val());
    var location_addr_dict = parseAddress(el.tag('addr'));
    var encounter_date = null;
    el = el.tag('effectiveTime');

    if (!el.isEmpty()) {
      encounter_date = parseDate(el.attr('value'));
    }

    data = {
      type: docType,
      date: date,
      title: title,
      author: {
        name: name_dict,
        address: address_dict,
        phone: {
          work: work_phone
        }
      },
      documentation_of: documentation_of_list,
      location: {
        name: location_name,
        address: location_addr_dict,
        encounter_date: encounter_date
      }
    };
    return data;
  }

  ;
};

/***/ }),

/***/ 443:
/***/ ((module) => {

/*
 * Parser for the C32 encounters section
 */
module.exports = function (doc) {
  var self = this;
  self.doc = doc;
  self.parse = parse;

  function parse(c32) {
    var parseDate = self.doc.parseDate;
    var parseName = self.doc.parseName;
    var parseAddress = self.doc.parseAddress;
    var encounters = c32.section('encounters');
    var data = {},
        el;
    data.entries = [];
    data.displayName = "Encounters";
    data.templateId = encounters.tag('templateId').attr('root');
    data.text = encounters.tag('text').val(true);
    encounters.entries().each(function (entry) {
      var date = parseDate(entry.tag('effectiveTime').attr('value'));

      if (!date) {
        date = parseDate(entry.tag('effectiveTime').tag('low').attr('value'));
      }

      el = entry.tag('code');
      var name = el.attr('displayName'),
          code = el.attr('code'),
          code_system = el.attr('codeSystem'),
          code_system_name = el.attr('codeSystemName'),
          code_system_version = el.attr('codeSystemVersion'); // translation

      el = entry.tag('translation');
      var translation_name = el.attr('displayName'),
          translation_code = el.attr('code'),
          translation_code_system = el.attr('codeSystem'),
          translation_code_system_name = el.attr('codeSystemName'); // performer

      el = entry.tag('performer');
      var performer_name = el.tag('name').val(),
          performer_code = el.attr('code'),
          performer_code_system = el.attr('codeSystem'),
          performer_code_system_name = el.attr('codeSystemName'); // participant => location

      el = entry.tag('participant');
      var organization = el.tag('name').val(),
          location_dict = parseAddress(el);
      location_dict.organization = organization; // findings

      var findings = [];
      var findingEls = entry.elsByTag('entryRelationship');

      for (var i = 0; i < findingEls.length; i++) {
        el = findingEls[i].tag('value');
        findings.push({
          name: el.attr('displayName'),
          code: el.attr('code'),
          code_system: el.attr('codeSystem')
        });
      }

      data.entries.push({
        date: date,
        name: name,
        code: code,
        code_system: code_system,
        code_system_name: code_system_name,
        code_system_version: code_system_version,
        findings: findings,
        translation: {
          name: translation_name,
          code: translation_code,
          code_system: translation_code_system,
          code_system_name: translation_code_system_name
        },
        performer: {
          name: performer_name,
          code: performer_code,
          code_system: performer_code_system,
          code_system_name: performer_code_system_name
        },
        location: location_dict
      });
    });
    return data;
  }

  ;
};

/***/ }),

/***/ 554:
/***/ ((module, __unused_webpack_exports, __nested_webpack_require_70203__) => {

/*
 * Parser for the C32 immunizations section
 */
var Core = __nested_webpack_require_70203__(1);

module.exports = function (doc) {
  var self = this;
  self.doc = doc;
  self.parse = parse;

  function parse(c32) {
    var parseDate = self.doc.parseDate;
    var parseName = self.doc.parseName;
    var parseAddress = self.doc.parseAddress;
    var administeredData = {},
        declinedData = {},
        product,
        el;
    var immunizations = c32.section('immunizations');
    administeredData.entries = [];
    administeredData.displayName = "Immunizations";
    administeredData.templateId = immunizations.tag('templateId').attr('root');
    administeredData.text = immunizations.tag('text').val(true);
    declinedData.entries = [];
    declinedData.displayName = "Immunizations Declined";
    declinedData.templateId = immunizations.tag('templateId').attr('root');
    declinedData.text = immunizations.tag('text').val(true);
    immunizations.entries().each(function (entry) {
      // date
      el = entry.tag('effectiveTime');
      var date = parseDate(el.attr('value'));

      if (!date) {
        date = parseDate(el.tag('low').attr('value'));
      } // if 'declined' is true, this is a record that this vaccine WASN'T administered


      el = entry.tag('substanceAdministration');
      var declined = el.boolAttr('negationInd'); // product

      product = entry.template('2.16.840.1.113883.10.20.1.53');
      el = product.tag('code');
      var product_name = el.attr('displayName'),
          product_code = el.attr('code'),
          product_code_system = el.attr('codeSystem'),
          product_code_system_name = el.attr('codeSystemName'); // translation

      el = product.tag('translation');
      var translation_name = el.attr('displayName'),
          translation_code = el.attr('code'),
          translation_code_system = el.attr('codeSystem'),
          translation_code_system_name = el.attr('codeSystemName'); // misc product details

      el = product.tag('lotNumberText');
      var lot_number = el.val();
      el = product.tag('manufacturerOrganization');
      var manufacturer_name = el.tag('name').val(); // route

      el = entry.tag('routeCode');
      var route_name = el.attr('displayName'),
          route_code = el.attr('code'),
          route_code_system = el.attr('codeSystem'),
          route_code_system_name = el.attr('codeSystemName'); // instructions

      el = entry.template('2.16.840.1.113883.10.20.1.49');
      var instructions_text = Core.stripWhitespace(el.tag('text').val());
      el = el.tag('code');
      var education_name = el.attr('displayName'),
          education_code = el.attr('code'),
          education_code_system = el.attr('codeSystem'); // dose

      el = entry.tag('doseQuantity');
      var dose_value = el.attr('value'),
          dose_unit = el.attr('unit');
      var data = declined ? declinedData : administeredData;
      data.entries.push({
        date: date,
        product: {
          name: product_name,
          code: product_code,
          code_system: product_code_system,
          code_system_name: product_code_system_name,
          translation: {
            name: translation_name,
            code: translation_code,
            code_system: translation_code_system,
            code_system_name: translation_code_system_name
          },
          lot_number: lot_number,
          manufacturer_name: manufacturer_name
        },
        dose_quantity: {
          value: dose_value,
          unit: dose_unit
        },
        route: {
          name: route_name,
          code: route_code,
          code_system: route_code_system,
          code_system_name: route_code_system_name
        },
        instructions: instructions_text,
        education_type: {
          name: education_name,
          code: education_code,
          code_system: education_code_system
        }
      });
    });
    return {
      administered: administeredData,
      declined: declinedData
    };
  }

  ;
};

/***/ }),

/***/ 659:
/***/ ((module, __unused_webpack_exports, __nested_webpack_require_74312__) => {

var Core = __nested_webpack_require_74312__(1);
/*
 * Parser for the C32 medications section
 */


module.exports = function (doc) {
  var self = this;
  self.doc = doc;
  self.parse = parse;

  function parse(c32) {
    var parseDate = self.doc.parseDate;
    var medications = c32.section('medications');
    var data = {},
        el;
    data.entries = [];
    data.displayName = "Medications";
    data.templateId = medications.tag('templateId').attr('root');
    data.text = medications.tag('text').val(true);
    medications.entries().each(function (entry) {
      var text = null;
      el = entry.tag('substanceAdministration').immediateChildTag('text');

      if (!el.isEmpty()) {
        // technically C32s don't use this, but C83s (another CCD) do,
        // and CCDAs do, so we may see it anyways
        text = Core.stripWhitespace(el.val());
      }

      var effectiveTimes = entry.elsByTag('effectiveTime');
      el = effectiveTimes[0]; // the first effectiveTime is the med start date

      var start_date = null,
          end_date = null;

      if (el) {
        start_date = parseDate(el.tag('low').attr('value'));
        end_date = parseDate(el.tag('high').attr('value'));
      } // the second effectiveTime might the schedule period or it might just
      // be a random effectiveTime from further in the entry... xsi:type should tell us


      el = effectiveTimes[1];
      var schedule_type = null,
          schedule_period_value = null,
          schedule_period_unit = null;

      if (el && el.attr('xsi:type') === 'PIVL_TS') {
        var institutionSpecified = el.attr('institutionSpecified');

        if (institutionSpecified === 'true') {
          schedule_type = 'frequency';
        } else if (institutionSpecified === 'false') {
          schedule_type = 'interval';
        }

        el = el.tag('period');
        schedule_period_value = el.attr('value');
        schedule_period_unit = el.attr('unit');
      }

      el = entry.tag('manufacturedProduct').tag('code');
      var product_name = el.attr('displayName'),
          product_code = el.attr('code'),
          product_code_system = el.attr('codeSystem');
      var product_original_text = null;
      el = entry.tag('manufacturedProduct').tag('originalText');

      if (!el.isEmpty()) {
        product_original_text = Core.stripWhitespace(el.val());
      } // if we don't have a product name yet, try the originalText version


      if (!product_name && product_original_text) {
        product_name = product_original_text;
      } // irregularity in some c32s


      if (!product_name) {
        el = entry.tag('manufacturedProduct').tag('name');

        if (!el.isEmpty()) {
          product_name = Core.stripWhitespace(el.val());
        }
      }

      el = entry.tag('manufacturedProduct').tag('translation');
      var translation_name = el.attr('displayName'),
          translation_code = el.attr('code'),
          translation_code_system = el.attr('codeSystem'),
          translation_code_system_name = el.attr('codeSystemName');
      el = entry.tag('doseQuantity');
      var dose_value = el.attr('value'),
          dose_unit = el.attr('unit');
      el = entry.tag('rateQuantity');
      var rate_quantity_value = el.attr('value'),
          rate_quantity_unit = el.attr('unit');
      el = entry.tag('precondition').tag('value');
      var precondition_name = el.attr('displayName'),
          precondition_code = el.attr('code'),
          precondition_code_system = el.attr('codeSystem');
      el = entry.template('2.16.840.1.113883.10.20.1.28').tag('value');
      var reason_name = el.attr('displayName'),
          reason_code = el.attr('code'),
          reason_code_system = el.attr('codeSystem');
      el = entry.tag('routeCode');
      var route_name = el.attr('displayName'),
          route_code = el.attr('code'),
          route_code_system = el.attr('codeSystem'),
          route_code_system_name = el.attr('codeSystemName'); // participant/playingEntity => vehicle

      el = entry.tag('participant').tag('playingEntity');
      var vehicle_name = el.tag('name').val();
      el = el.tag('code'); // prefer the code vehicle_name but fall back to the non-coded one
      // (which for C32s is in fact the primary field for this info)

      vehicle_name = el.attr('displayName') || vehicle_name;
      var vehicle_code = el.attr('code'),
          vehicle_code_system = el.attr('codeSystem'),
          vehicle_code_system_name = el.attr('codeSystemName');
      el = entry.tag('administrationUnitCode');
      var administration_name = el.attr('displayName'),
          administration_code = el.attr('code'),
          administration_code_system = el.attr('codeSystem'),
          administration_code_system_name = el.attr('codeSystemName'); // performer => prescriber

      el = entry.tag('performer');
      var prescriber_organization = el.tag('name').val(),
          prescriber_person = null;
      data.entries.push({
        date_range: {
          start: start_date,
          end: end_date
        },
        text: text,
        product: {
          name: product_name,
          text: product_original_text,
          code: product_code,
          code_system: product_code_system,
          translation: {
            name: translation_name,
            code: translation_code,
            code_system: translation_code_system,
            code_system_name: translation_code_system_name
          }
        },
        dose_quantity: {
          value: dose_value,
          unit: dose_unit
        },
        rate_quantity: {
          value: rate_quantity_value,
          unit: rate_quantity_unit
        },
        precondition: {
          name: precondition_name,
          code: precondition_code,
          code_system: precondition_code_system
        },
        reason: {
          name: reason_name,
          code: reason_code,
          code_system: reason_code_system
        },
        route: {
          name: route_name,
          code: route_code,
          code_system: route_code_system,
          code_system_name: route_code_system_name
        },
        schedule: {
          type: schedule_type,
          period_value: schedule_period_value,
          period_unit: schedule_period_unit
        },
        vehicle: {
          name: vehicle_name,
          code: vehicle_code,
          code_system: vehicle_code_system,
          code_system_name: vehicle_code_system_name
        },
        administration: {
          name: administration_name,
          code: administration_code,
          code_system: administration_code_system,
          code_system_name: administration_code_system_name
        },
        prescriber: {
          organization: prescriber_organization,
          person: prescriber_person
        }
      });
    });
    return data;
  }

  ;
};

/***/ }),

/***/ 119:
/***/ ((module, __unused_webpack_exports, __nested_webpack_require_81256__) => {

var Core = __nested_webpack_require_81256__(1);
/*
 * Parser for the C32 problems section
 */


module.exports = function (doc) {
  var self = this;
  self.doc = doc;
  self.parse = parse;

  function parse(c32) {
    var parseDate = self.doc.parseDate;
    var parseName = self.doc.parseName;
    var parseAddress = self.doc.parseAddress;
    var problems = c32.section('problems');
    var data = {},
        el;
    data.entries = [];
    data.displayName = "Problems";
    data.templateId = problems.tag('templateId').attr('root');
    data.text = problems.tag('text').val(true);
    problems.entries().each(function (entry) {
      el = entry.tag('effectiveTime');
      var start_date = parseDate(el.tag('low').attr('value')),
          end_date = parseDate(el.tag('high').attr('value'));
      el = entry.template('2.16.840.1.113883.10.20.1.28').tag('value');
      var name = el.attr('displayName'),
          code = el.attr('code'),
          code_system = el.attr('codeSystem'),
          code_system_name = el.attr('codeSystemName'); // Pre-C32 CCDs put the problem name in this "originalText" field, and some vendors
      // continue doing this with their C32, even though it's not technically correct

      if (!name) {
        el = entry.template('2.16.840.1.113883.10.20.1.28').tag('originalText');

        if (!el.isEmpty()) {
          name = Core.stripWhitespace(el.val());
        }
      }

      el = entry.template('2.16.840.1.113883.10.20.1.28').tag('translation');
      var translation_name = el.attr('displayName'),
          translation_code = el.attr('code'),
          translation_code_system = el.attr('codeSystem'),
          translation_code_system_name = el.attr('codeSystemName');
      el = entry.template('2.16.840.1.113883.10.20.1.50');
      var status = el.tag('value').attr('displayName');
      var age = null;
      el = entry.template('2.16.840.1.113883.10.20.1.38');

      if (!el.isEmpty()) {
        age = parseFloat(el.tag('value').attr('value'));
      }

      data.entries.push({
        date_range: {
          start: start_date,
          end: end_date
        },
        name: name,
        status: status,
        age: age,
        code: code,
        code_system: code_system,
        code_system_name: code_system_name,
        translation: {
          name: translation_name,
          code: translation_code,
          code_system: translation_code_system,
          code_system_name: translation_code_system_name
        },
        comment: null // not part of C32

      });
    });
    return data;
  }

  ;
};

/***/ }),

/***/ 383:
/***/ ((module, __unused_webpack_exports, __nested_webpack_require_83913__) => {

/*
 * Parser for the C32 procedures section
 */
var Core = __nested_webpack_require_83913__(1);

module.exports = function (doc) {
  var self = this;
  self.doc = doc;
  self.parse = parse;

  function parse(c32) {
    var parseDate = self.doc.parseDate;
    var parseName = self.doc.parseName;
    var parseAddress = self.doc.parseAddress;
    var procedures = c32.section('procedures');
    var data = {},
        el;
    data.entries = [];
    data.displayName = "Procedures";
    data.templateId = procedures.tag('templateId').attr('root');
    data.text = procedures.tag('text').val(true);
    procedures.entries().each(function (entry) {
      el = entry.tag('effectiveTime');
      var date = parseDate(el.attr('value'));
      el = entry.tag('code');
      var name = el.attr('displayName'),
          code = el.attr('code'),
          code_system = el.attr('codeSystem');

      if (!name) {
        name = Core.stripWhitespace(entry.tag('originalText').val());
      } // 'specimen' tag not always present


      el = entry.tag('specimen').tag('code');
      var specimen_name = el.attr('displayName'),
          specimen_code = el.attr('code'),
          specimen_code_system = el.attr('codeSystem');
      el = entry.tag('performer').tag('addr');
      var organization = el.tag('name').val(),
          phone = el.tag('telecom').attr('value');
      var performer_dict = parseAddress(el);
      performer_dict.organization = organization;
      performer_dict.phone = phone; // participant => device

      el = entry.tag('participant').tag('code');
      var device_name = el.attr('displayName'),
          device_code = el.attr('code'),
          device_code_system = el.attr('codeSystem');
      data.entries.push({
        date: date,
        name: name,
        code: code,
        code_system: code_system,
        specimen: {
          name: specimen_name,
          code: specimen_code,
          code_system: specimen_code_system
        },
        performer: performer_dict,
        device: {
          name: device_name,
          code: device_code,
          code_system: device_code_system
        }
      });
    });
    return data;
  }

  ;
};

/***/ }),

/***/ 549:
/***/ ((module, __unused_webpack_exports, __nested_webpack_require_86168__) => {

/*
 * Parser for the C32 results (labs) section
 */
var Core = __nested_webpack_require_86168__(1);

module.exports = function (doc) {
  var self = this;
  self.doc = doc;
  self.parse = parse;

  function parse(c32) {
    var parseDate = self.doc.parseDate;
    var parseName = self.doc.parseName;
    var parseAddress = self.doc.parseAddress;
    var results = c32.section('results');
    var data = {},
        el;
    data.entries = [];
    data.displayName = "Results";
    data.templateId = results.tag('templateId').attr('root');
    data.text = results.tag('text').val(true);
    results.entries().each(function (entry) {
      el = entry.tag('effectiveTime');
      var panel_date = parseDate(entry.tag('effectiveTime').attr('value'));

      if (!panel_date) {
        panel_date = parseDate(entry.tag('effectiveTime').tag('low').attr('value'));
      } // panel


      el = entry.tag('code');
      var panel_name = el.attr('displayName'),
          panel_code = el.attr('code'),
          panel_code_system = el.attr('codeSystem'),
          panel_code_system_name = el.attr('codeSystemName');
      var observation;
      var tests = entry.elsByTag('observation');
      var tests_data = [];

      for (var i = 0; i < tests.length; i++) {
        observation = tests[i]; // sometimes results organizers contain non-results. we only want tests

        if (observation.template('2.16.840.1.113883.10.20.1.31').val()) {
          var date = parseDate(observation.tag('effectiveTime').attr('value'));
          el = observation.tag('code');
          var name = el.attr('displayName'),
              code = el.attr('code'),
              code_system = el.attr('codeSystem'),
              code_system_name = el.attr('codeSystemName');

          if (!name) {
            name = Core.stripWhitespace(observation.tag('text').val());
          }

          el = observation.tag('translation');
          var translation_name = el.attr('displayName'),
              translation_code = el.attr('code'),
              translation_code_system = el.attr('codeSystem'),
              translation_code_system_name = el.attr('codeSystemName');
          el = observation.tag('value');
          var value = el.attr('value'),
              unit = el.attr('unit'); // We could look for xsi:type="PQ" (physical quantity) but it seems better
          // not to trust that that field has been used correctly...

          if (value && !isNaN(parseFloat(value))) {
            value = parseFloat(value);
          }

          if (!value) {
            value = el.val(); // look for free-text values
          }

          el = observation.tag('referenceRange');
          var reference_range_text = Core.stripWhitespace(el.tag('observationRange').tag('text').val()),
              reference_range_low_unit = el.tag('observationRange').tag('low').attr('unit'),
              reference_range_low_value = el.tag('observationRange').tag('low').attr('value'),
              reference_range_high_unit = el.tag('observationRange').tag('high').attr('unit'),
              reference_range_high_value = el.tag('observationRange').tag('high').attr('value');
          tests_data.push({
            date: date,
            name: name,
            value: value,
            unit: unit,
            code: code,
            code_system: code_system,
            code_system_name: code_system_name,
            translation: {
              name: translation_name,
              code: translation_code,
              code_system: translation_code_system,
              code_system_name: translation_code_system_name
            },
            reference_range: {
              text: reference_range_text,
              low_unit: reference_range_low_unit,
              low_value: reference_range_low_value,
              high_unit: reference_range_high_unit,
              high_value: reference_range_high_value
            }
          });
        }
      }

      data.entries.push({
        name: panel_name,
        code: panel_code,
        code_system: panel_code_system,
        code_system_name: panel_code_system_name,
        date: panel_date,
        tests: tests_data
      });
    });
    return data;
  }

  ;
};

/***/ }),

/***/ 396:
/***/ ((module) => {

/*
 * Parser for the C32 vitals section
 */
module.exports = function (doc) {
  var self = this;
  self.doc = doc;
  self.parse = parse;

  function parse(c32) {
    var parseDate = self.doc.parseDate;
    var parseName = self.doc.parseName;
    var parseAddress = self.doc.parseAddress;
    var vitals = c32.section('vitals');
    var data = {},
        el;
    data.entries = [];
    data.displayName = "Vitals";
    data.templateId = vitals.tag('templateId').attr('root');
    data.text = vitals.tag('text').val(true);
    vitals.entries().each(function (entry) {
      el = entry.tag('effectiveTime');
      var entry_date = parseDate(el.attr('value'));
      var result;
      var results = entry.elsByTag('component');
      var results_data = [];

      for (var j = 0; j < results.length; j++) {
        result = results[j]; // Results

        el = result.tag('code');
        var name = el.attr('displayName'),
            code = el.attr('code'),
            code_system = el.attr('codeSystem'),
            code_system_name = el.attr('codeSystemName');
        el = result.tag('value');
        var value = parseFloat(el.attr('value')),
            unit = el.attr('unit');
        results_data.push({
          name: name,
          code: code,
          code_system: code_system,
          code_system_name: code_system_name,
          value: value,
          unit: unit
        });
      }

      data.entries.push({
        date: entry_date,
        results: results_data
      });
    });
    return data;
  }

  ;
};

/***/ }),

/***/ 939:
/***/ ((module, __unused_webpack_exports, __nested_webpack_require_92034__) => {

/*
 * Parser for the CCDAR2 document
 */
var ParseGenericInfo = __nested_webpack_require_92034__(711);

var Core = __nested_webpack_require_92034__(1);

var DocumentParser = __nested_webpack_require_92034__(74);

var DemographicsParser = __nested_webpack_require_92034__(825);

var HealthConcernsParser = __nested_webpack_require_92034__(329);

module.exports = function (doc) {
  var self = this;
  self.doc = doc;
  self.documentParser = new DocumentParser(self.doc);
  self.demographicsParser = new DemographicsParser(self.doc);
  self.healthConcernsParser = new HealthConcernsParser(self.doc);

  self.run = function (ccda) {
    var data = {};
    data.document = self.documentParser.document(ccda);
    data.demographics = self.demographicsParser.demographics(ccda);
    data.health_concerns_document = self.healthConcernsParser.health_concerns_document(ccda);
    data.json = Core.json; // Decorate each section with Title, templateId and text and adds missing sections

    ParseGenericInfo(ccda, data);
    return data;
  };
};

/***/ }),

/***/ 74:
/***/ ((module, __unused_webpack_exports, __nested_webpack_require_93099__) => {

/*
 * Parser for the CCDAR2 document section
 */
var Core = __nested_webpack_require_93099__(1);

module.exports = function (doc) {
  var self = this;
  self.doc = doc;
  self.document = document;

  function document(ccda) {
    var parseDate = self.doc.parseDate;
    var parseName = self.doc.parseName;
    var parseAddress = self.doc.parseAddress;
    var data = {},
        el;
    var doc = ccda.section('document');
    var date = parseDate(doc.tag('effectiveTime').attr('value'));
    var title = Core.stripWhitespace(doc.tag('title').val()); // Parse Doc Type Info

    var templates = doc.elsByTag('templateId');
    var rootTemplate = templates[0].attr('root');
    var secondTemplate;
    if (templates.length > 1) secondTemplate = templates[1].attr('root');else secondTemplate = rootTemplate;
    var loinc = doc.tag('code').attr('code');
    var templateId = doc.tag('templateId').attr('root');
    var displayName = doc.tag('code').attr('displayName');
    var nonXml = doc.tag('nonXMLBody');
    var nonXmlNodes = nonXml.el.childNodes;
    var bodyType = "structured";
    var nonXmlBody = {
      type: "",
      mediaType: "",
      representation: "",
      rawText: "",
      reference: ""
    };

    if (nonXmlNodes && nonXmlNodes.length > 0) {
      bodyType = "unstructured";
      var text = nonXml.tag('text');
      var mediaType = "";
      var representation = "";
      var rawText = "";
      var reference = "";
      var type = ""; // We have an embedded doc

      if (text && text.attr('mediaType')) {
        mediaType = text.attr('mediaType');
        representation = text.attr('representation');
        rawText = text.val();
        type = "embedded";
      }

      if (text && !mediaType) {
        reference = text.tag('reference').attr('value');
        type = "reference";
      }

      nonXmlBody = {
        type: type,
        mediaType: mediaType,
        representation: representation,
        rawText: rawText,
        reference: reference
      };
    }

    var docType = {
      type: "CCDAR2",
      rootTemplateId: rootTemplate,
      templateId: secondTemplate,
      displayName: displayName,
      loinc: loinc,
      bodyType: bodyType,
      nonXmlBody: nonXmlBody
    };
    var author = doc.tag('author');
    el = author.tag('assignedPerson').tag('name');
    var name_dict = parseName(el);
    el = author.tag('addr');
    var address_dict = parseAddress(el);
    el = author.tag('telecom');
    var work_phone = el.attr('value');
    var documentation_of_list = [];
    var performers = doc.tag('documentationOf').elsByTag('performer');

    for (var i = 0; i < performers.length; i++) {
      el = performers[i];
      var performer_name_dict = parseName(el);
      var performer_phone = el.tag('telecom').attr('value');
      var performer_addr = parseAddress(el.tag('addr'));
      documentation_of_list.push({
        name: performer_name_dict,
        phone: {
          work: performer_phone
        },
        address: performer_addr
      });
    }

    el = doc.tag('encompassingEncounter').tag('location');
    var location_name = Core.stripWhitespace(el.tag('name').val());
    var location_addr_dict = parseAddress(el.tag('addr'));
    var encounter_date = null;
    el = el.tag('effectiveTime');

    if (!el.isEmpty()) {
      encounter_date = parseDate(el.attr('value'));
    }

    data = {
      type: docType,
      date: date,
      title: title,
      author: {
        name: name_dict,
        address: address_dict,
        phone: {
          work: work_phone
        }
      },
      documentation_of: documentation_of_list,
      location: {
        name: location_name,
        address: location_addr_dict,
        encounter_date: encounter_date
      }
    };
    return data;
  }

  ;
};

/***/ }),

/***/ 193:
/***/ ((module, __unused_webpack_exports, __nested_webpack_require_96963__) => {

var Core = __nested_webpack_require_96963__(1);

var AllergiesParser = __nested_webpack_require_96963__(754);

var CarePlanParser = __nested_webpack_require_96963__(171);

var DemographicsParser = __nested_webpack_require_96963__(825);

var DocumentParser = __nested_webpack_require_96963__(122);

var EncountersParser = __nested_webpack_require_96963__(729);

var FreeTextParser = __nested_webpack_require_96963__(833);

var FunctionalStatusesParser = __nested_webpack_require_96963__(902);

var ImmunizationsParser = __nested_webpack_require_96963__(530);

var InstructionsParser = __nested_webpack_require_96963__(463);

var MedicationsParser = __nested_webpack_require_96963__(306);

var ProblemsParser = __nested_webpack_require_96963__(150);

var ProceduresParser = __nested_webpack_require_96963__(361);

var ResultsParser = __nested_webpack_require_96963__(824);

var SmokingStatusParser = __nested_webpack_require_96963__(206);

var VitalsParser = __nested_webpack_require_96963__(204);

var ParseGenericInfo = __nested_webpack_require_96963__(711);
/*
 * Parser for the CCDA document
 */


module.exports = function (doc) {
  var self = this;
  self.doc = doc;
  self.allergiesParser = new AllergiesParser(self.doc);
  self.carePlanParser = new CarePlanParser(self.doc);
  self.demographicsParser = new DemographicsParser(self.doc);
  self.documentParser = new DocumentParser(self.doc);
  self.encountersParser = new EncountersParser(self.doc);
  self.freeTextParser = new FreeTextParser();
  self.functionalStatusesParser = new FunctionalStatusesParser(self.doc);
  self.immunizationsParser = new ImmunizationsParser(self.doc);
  self.instructionsParser = new InstructionsParser();
  self.medicationsParser = new MedicationsParser(self.doc);
  self.problemsParser = new ProblemsParser(self.doc);
  self.proceduresParser = new ProceduresParser(self.doc);
  self.resultsParser = new ResultsParser(self.doc);
  self.smokingStatusParser = new SmokingStatusParser(self.doc);
  self.vitalsParser = new VitalsParser(self.doc);

  self.run = function (ccda) {
    var data = {};
    data.document = self.documentParser.document(ccda);
    data.allergies = self.allergiesParser.allergies(ccda);
    data.care_plan = self.carePlanParser.care_plan(ccda);
    data.chief_complaint = self.freeTextParser.free_text(ccda, 'chief_complaint');
    data.demographics = self.demographicsParser.demographics(ccda);
    data.encounters = self.encountersParser.encounters(ccda);
    data.functional_statuses = self.functionalStatusesParser.functional_statuses(ccda);
    var parsedImmunizations = self.immunizationsParser.immunizations(ccda);
    data.immunizations = parsedImmunizations.administered;
    data.immunization_declines = parsedImmunizations.declined;
    data.instructions = self.instructionsParser.instructions(ccda);
    data.results = self.resultsParser.results(ccda);
    data.medications = self.medicationsParser.medications(ccda);
    data.problems = self.problemsParser.problems(ccda);
    data.procedures = self.proceduresParser.procedures(ccda);
    data.smoking_status = self.smokingStatusParser.smoking_status(ccda);
    data.vitals = self.vitalsParser.vitals(ccda);
    data.json = Core.json;
    data.document.json = Core.json;
    data.allergies.json = Core.json;
    data.care_plan.json = Core.json;
    data.chief_complaint.json = Core.json;
    data.demographics.json = Core.json;
    data.encounters.json = Core.json;
    data.functional_statuses.json = Core.json;
    data.immunizations.json = Core.json;
    data.immunization_declines.json = Core.json;
    data.instructions.json = Core.json;
    data.results.json = Core.json;
    data.medications.json = Core.json;
    data.problems.json = Core.json;
    data.procedures.json = Core.json;
    data.smoking_status.json = Core.json;
    data.vitals.json = Core.json; // Decorate each section with Title, templateId and text and adds missing sections

    ParseGenericInfo(ccda, data);
    return data;
  };
};

/***/ }),

/***/ 754:
/***/ ((module, __unused_webpack_exports, __nested_webpack_require_100819__) => {

/*
 * Parser for the CCDA allergies section
 */
var Core = __nested_webpack_require_100819__(1);

module.exports = function (doc) {
  var self = this;
  self.doc = doc;

  self.allergies = function (ccda) {
    var parseDate = self.doc.parseDate;
    var parseName = self.doc.parseName;
    var parseAddress = self.doc.parseAddress;
    var allergies = ccda.section('allergies');
    var data = {},
        el;
    data.entries = [];
    data.displayName = "Allergies";
    data.templateId = allergies.tag('templateId').attr('root');
    data.text = allergies.tag('text').val(true);
    allergies.entries().each(function (entry) {
      el = entry.tag('effectiveTime');
      var start_date = parseDate(el.tag('low').attr('value')),
          end_date = parseDate(el.tag('high').attr('value'));
      el = entry.template('2.16.840.1.113883.10.20.22.4.7').tag('code');
      var name = el.attr('displayName'),
          code = el.attr('code'),
          code_system = el.attr('codeSystem'),
          code_system_name = el.attr('codeSystemName'); // value => reaction_type

      el = entry.template('2.16.840.1.113883.10.20.22.4.7').tag('value');
      var reaction_type_name = el.attr('displayName'),
          reaction_type_code = el.attr('code'),
          reaction_type_code_system = el.attr('codeSystem'),
          reaction_type_code_system_name = el.attr('codeSystemName'); // reaction

      el = entry.template('2.16.840.1.113883.10.20.22.4.9').tag('value');
      var reaction_name = el.attr('displayName'),
          reaction_code = el.attr('code'),
          reaction_code_system = el.attr('codeSystem'); // severity

      el = entry.template('2.16.840.1.113883.10.20.22.4.8').tag('value');
      var severity = el.attr('displayName'); // participant => allergen

      el = entry.tag('participant').tag('code');
      var allergen_name = el.attr('displayName'),
          allergen_code = el.attr('code'),
          allergen_code_system = el.attr('codeSystem'),
          allergen_code_system_name = el.attr('codeSystemName'); // this is not a valid place to store the allergen name but some vendors use it

      if (!allergen_name) {
        el = entry.tag('participant').tag('name');

        if (!el.isEmpty()) {
          allergen_name = el.val();
        }
      }

      if (!allergen_name) {
        el = entry.template('2.16.840.1.113883.10.20.22.4.7').tag('originalText');

        if (!el.isEmpty()) {
          allergen_name = Core.stripWhitespace(el.val());
        }
      } // status


      el = entry.template('2.16.840.1.113883.10.20.22.4.28').tag('value');
      var status = el.attr('displayName');
      data.entries.push({
        date_range: {
          start: start_date,
          end: end_date
        },
        name: name,
        code: code,
        code_system: code_system,
        code_system_name: code_system_name,
        status: status,
        severity: severity,
        reaction: {
          name: reaction_name,
          code: reaction_code,
          code_system: reaction_code_system
        },
        reaction_type: {
          name: reaction_type_name,
          code: reaction_type_code,
          code_system: reaction_type_code_system,
          code_system_name: reaction_type_code_system_name
        },
        allergen: {
          name: allergen_name,
          code: allergen_code,
          code_system: allergen_code_system,
          code_system_name: allergen_code_system_name
        }
      });
    });
    return data;
  };
};

/***/ }),

/***/ 171:
/***/ ((module, __unused_webpack_exports, __nested_webpack_require_104401__) => {

/*
 * Parser for the CCDA "plan of care" section
 */
var Core = __nested_webpack_require_104401__(1);

module.exports = function (doc) {
  var self = this;
  self.doc = doc;

  self.care_plan = function (ccda) {
    var data = [],
        el;
    var data = {},
        el;
    care_plan = ccda.section('care_plan');
    data.entries = [];
    data.displayName = "Care Plan";
    data.templateId = care_plan.tag('templateId').attr('root');
    data.text = care_plan.tag('text').val(true);
    care_plan.entries().each(function (entry) {
      var name = null,
          code = null,
          code_system = null,
          code_system_name = null; // Plan of care encounters, which have no other details

      el = entry.template('2.16.840.1.113883.10.20.22.4.40');

      if (!el.isEmpty()) {
        name = 'encounter';
      } else {
        el = entry.tag('code');
        name = el.attr('displayName');
        code = el.attr('code');
        code_system = el.attr('codeSystem');
        code_system_name = el.attr('codeSystemName');
      }

      var text = Core.stripWhitespace(entry.tag('text').val(true));
      var time = entry.tag('effectiveTime').immediateChildTag('center').attr('value');
      data.entries.push({
        text: text,
        name: name,
        code: code,
        code_system: code_system,
        code_system_name: code_system_name,
        effective_time: parse(time)
      });
    });
    return data;

    function parse(str) {
      if (!str) return null;
      var y = str.substr(0, 4),
          m = str.substr(4, 2) - 1,
          d = str.substr(6, 2);
      var D = new Date(y, m, d);
      return D.getFullYear() == y && D.getMonth() == m && D.getDate() == d ? D : null;
    }
  };
};

/***/ }),

/***/ 825:
/***/ ((module, __unused_webpack_exports, __nested_webpack_require_106210__) => {

/*
 * Parser for the CCDA demographics section
 */
var Core = __nested_webpack_require_106210__(1);

module.exports = function (doc) {
  var self = this;
  self.doc = doc;
  self.demographics = demographics;

  function demographics(ccda) {
    var parseDate = self.doc.parseDate;
    var parseName = self.doc.parseName;
    var parseAddress = self.doc.parseAddress;
    var data = {},
        el;
    var demographics = ccda.section('demographics');
    var patient = demographics.tag('patientRole');
    el = patient.tag('patient').tag('name');
    var patient_name_dict = parseName(el);
    el = patient.tag('patient');
    var dob = parseDate(el.tag('birthTime').attr('value')),
        gender = Core.Codes.gender(el.tag('administrativeGenderCode').attr('code')),
        marital_status = Core.Codes.maritalStatus(el.tag('maritalStatusCode').attr('code'));
    el = patient.tag('addr');
    var patient_address_dict = parseAddress(el);
    el = patient.tag('telecom');
    var home = el.attr('value'),
        work = null,
        mobile = null;
    var email = null;
    var language = patient.tag('languageCommunication').tag('languageCode').attr('code'),
        race = patient.tag('raceCode').attr('displayName'),
        ethnicity = patient.tag('ethnicGroupCode').attr('displayName'),
        religion = patient.tag('religiousAffiliationCode').attr('displayName');
    el = patient.tag('birthplace');
    var birthplace_dict = parseAddress(el);
    el = patient.tag('guardian');
    var guardian_relationship = el.tag('code').attr('displayName'),
        guardian_relationship_code = el.tag('code').attr('code'),
        guardian_home = el.tag('telecom').attr('value');
    el = el.tag('guardianPerson').tag('name');
    var guardian_name_dict = parseName(el);
    el = patient.tag('guardian').tag('addr');
    var guardian_address_dict = parseAddress(el);
    el = patient.tag('providerOrganization');
    var provider_organization = el.tag('name').val(),
        provider_phone = el.tag('telecom').attr('value');
    var provider_address_dict = parseAddress(el.tag('addr'));
    data = {
      name: patient_name_dict,
      dob: dob,
      gender: gender,
      marital_status: marital_status,
      address: patient_address_dict,
      phone: {
        home: home,
        work: work,
        mobile: mobile
      },
      email: email,
      language: language,
      race: race,
      ethnicity: ethnicity,
      religion: religion,
      birthplace: {
        state: birthplace_dict.state,
        zip: birthplace_dict.zip,
        country: birthplace_dict.country
      },
      guardian: {
        name: {
          given: guardian_name_dict.given,
          family: guardian_name_dict.family
        },
        relationship: guardian_relationship,
        relationship_code: guardian_relationship_code,
        address: guardian_address_dict,
        phone: {
          home: guardian_home
        }
      },
      provider: {
        organization: provider_organization,
        phone: provider_phone,
        address: provider_address_dict
      }
    };
    return data;
  }

  ;
};

/***/ }),

/***/ 122:
/***/ ((module, __unused_webpack_exports, __nested_webpack_require_109395__) => {

/*
 * Parser for the CCDA document section
 */
var Core = __nested_webpack_require_109395__(1);

module.exports = function (doc) {
  var self = this;
  self.doc = doc;

  self.document = function (ccda) {
    var parseDate = self.doc.parseDate;
    var parseName = self.doc.parseName;
    var parseAddress = self.doc.parseAddress;
    var data = {},
        el;
    var doc = ccda.section('document'); // Parse Doc Type Info

    var templates = doc.elsByTag('templateId');
    var rootTemplate = templates[0].attr('root');
    var secondTemplate;
    if (templates.length > 1) secondTemplate = templates[1].attr('root');else secondTemplate = rootTemplate;
    var loinc = doc.tag('code').attr('code');
    var templateId = doc.tag('templateId').attr('root');
    var displayName = doc.tag('code').attr('displayName');
    var nonXml = doc.tag('nonXMLBody');
    var nonXmlNodes = nonXml.el.childNodes;
    var bodyType = "structured";
    var nonXmlBody = {
      type: "",
      mediaType: "",
      representation: "",
      rawText: "",
      reference: ""
    };

    if (nonXmlNodes && nonXmlNodes.length > 0) {
      bodyType = "unstructured";
      var text = nonXml.tag('text');
      var mediaType = "";
      var representation = "";
      var rawText = "";
      var reference = "";
      var type = ""; // We have an embedded doc

      if (text && text.attr('mediaType')) {
        mediaType = text.attr('mediaType');
        representation = text.attr('representation');
        rawText = text.val();
        type = "embedded";
      }

      if (text && !mediaType) {
        reference = text.tag('reference').attr('value');
        type = "reference";
      }

      nonXmlBody = {
        type: type,
        mediaType: mediaType,
        representation: representation,
        rawText: rawText,
        reference: reference
      };
    }

    var docType = {
      type: "CCDAR2",
      rootTemplateId: rootTemplate,
      templateId: secondTemplate,
      displayName: displayName,
      loinc: loinc,
      bodyType: bodyType,
      nonXmlBody: nonXmlBody
    };
    var date = parseDate(doc.tag('effectiveTime').attr('value'));
    var title = Core.stripWhitespace(doc.tag('title').val());
    var author = doc.tag('author');
    el = author.tag('assignedPerson').tag('name');
    var name_dict = parseName(el);
    el = author.tag('addr');
    var address_dict = parseAddress(el);
    el = author.tag('telecom');
    var work_phone = el.attr('value');
    var documentation_of_list = [];
    var performers = doc.tag('documentationOf').elsByTag('performer');

    for (var i = 0; i < performers.length; i++) {
      el = performers[i];
      var performer_name_dict = parseName(el);
      var performer_phone = el.tag('telecom').attr('value');
      var performer_addr = parseAddress(el.tag('addr'));
      documentation_of_list.push({
        name: performer_name_dict,
        phone: {
          work: performer_phone
        },
        address: performer_addr
      });
    }

    el = doc.tag('encompassingEncounter').tag('location');
    var location_name = Core.stripWhitespace(el.tag('name').val());
    var location_addr_dict = parseAddress(el.tag('addr'));
    var encounter_date = null;
    el = el.tag('effectiveTime');

    if (!el.isEmpty()) {
      encounter_date = parseDate(el.attr('value'));
    }

    data = {
      type: docType,
      date: date,
      title: title,
      author: {
        name: name_dict,
        address: address_dict,
        phone: {
          work: work_phone
        }
      },
      documentation_of: documentation_of_list,
      location: {
        name: location_name,
        address: location_addr_dict,
        encounter_date: encounter_date
      }
    };
    return data;
  };
};

/***/ }),

/***/ 729:
/***/ ((module) => {

/*
 * Parser for the CCDA encounters section
 */
module.exports = function (doc) {
  var self = this;
  self.doc = doc;

  self.encounters = function (ccda) {
    var parseDate = self.doc.parseDate;
    var parseName = self.doc.parseName;
    var parseAddress = self.doc.parseAddress;
    var encounters = ccda.section('encounters');
    var data = {},
        el;
    data.entries = [];
    data.displayName = "Encounters";
    data.templateId = encounters.tag('templateId').attr('root');
    data.text = encounters.tag('text').val(true);
    encounters.entries().each(function (entry) {
      var date = parseDate(entry.tag('effectiveTime').attr('value'));
      el = entry.tag('code');
      var name = el.attr('displayName'),
          code = el.attr('code'),
          code_system = el.attr('codeSystem'),
          code_system_name = el.attr('codeSystemName'),
          code_system_version = el.attr('codeSystemVersion'); // translation

      el = entry.tag('translation');
      var translation_name = el.attr('displayName'),
          translation_code = el.attr('code'),
          translation_code_system = el.attr('codeSystem'),
          translation_code_system_name = el.attr('codeSystemName'); // performer

      el = entry.tag('performer').tag('code');
      var performer_name = el.attr('displayName'),
          performer_code = el.attr('code'),
          performer_code_system = el.attr('codeSystem'),
          performer_code_system_name = el.attr('codeSystemName'); // participant => location

      el = entry.tag('participant');
      var organization = el.tag('code').attr('displayName');
      var location_dict = parseAddress(el);
      location_dict.organization = organization; // findings

      var findings = [];
      var findingEls = entry.elsByTag('entryRelationship');

      for (var i = 0; i < findingEls.length; i++) {
        el = findingEls[i].tag('value');
        findings.push({
          name: el.attr('displayName'),
          code: el.attr('code'),
          code_system: el.attr('codeSystem')
        });
      }

      data.entries.push({
        date: date,
        name: name,
        code: code,
        code_system: code_system,
        code_system_name: code_system_name,
        code_system_version: code_system_version,
        findings: findings,
        translation: {
          name: translation_name,
          code: translation_code,
          code_system: translation_code_system,
          code_system_name: translation_code_system_name
        },
        performer: {
          name: performer_name,
          code: performer_code,
          code_system: performer_code_system,
          code_system_name: performer_code_system_name
        },
        location: location_dict
      });
    });
    return data;
  };
};

/***/ }),

/***/ 833:
/***/ ((module, __unused_webpack_exports, __nested_webpack_require_116062__) => {

/*
 * Parser for any freetext section (i.e., contains just a single <text> element)
 */
var Core = __nested_webpack_require_116062__(1);

module.exports = function () {
  var self = this;

  self.free_text = function (ccda, sectionName) {
    var data = {};
    var doc = ccda.section(sectionName);
    var text = Core.stripWhitespace(doc.tag('text').val(true));
    data = {
      text: text
    };
    return data;
  };
};

/***/ }),

/***/ 902:
/***/ ((module) => {

/*
 * Parser for the CCDA functional & cognitive status
 */
module.exports = function (doc) {
  var self = this;
  self.doc = doc;

  self.functional_statuses = function (ccda) {
    var parseDate = self.doc.parseDate;
    var data = [],
        el;
    var statuses = ccda.section('functional_statuses');
    statuses.entries().each(function (entry) {
      var date = parseDate(entry.tag('effectiveTime').attr('value'));

      if (!date) {
        date = parseDate(entry.tag('effectiveTime').tag('low').attr('value'));
      }

      el = entry.tag('value');
      var name = el.attr('displayName'),
          code = el.attr('code'),
          code_system = el.attr('codeSystem'),
          code_system_name = el.attr('codeSystemName');
      data.push({
        date: date,
        name: name,
        code: code,
        code_system: code_system,
        code_system_name: code_system_name
      });
    });
    return data;
  };
};

/***/ }),

/***/ 530:
/***/ ((module, __unused_webpack_exports, __nested_webpack_require_117552__) => {

/*
 * Parser for the CCDA immunizations section
 */
var Core = __nested_webpack_require_117552__(1);

module.exports = function (doc) {
  var self = this;
  self.doc = doc;

  self.immunizations = function (ccda) {
    var parseDate = self.doc.parseDate;
    var parseName = self.doc.parseName;
    var parseAddress = self.doc.parseAddress;
    var administeredData = {},
        declinedData = {},
        product,
        el;
    var immunizations = ccda.section('immunizations');
    administeredData.entries = [];
    administeredData.displayName = "Immunizations";
    administeredData.templateId = immunizations.tag('templateId').attr('root');
    administeredData.text = immunizations.tag('text').val(true);
    declinedData.entries = [];
    declinedData.displayName = "Immunizations Declined";
    declinedData.templateId = immunizations.tag('templateId').attr('root');
    declinedData.text = immunizations.tag('text').val(true);
    immunizations.entries().each(function (entry) {
      // date
      el = entry.tag('effectiveTime');
      var date = parseDate(el.attr('value'));

      if (!date) {
        date = parseDate(el.tag('low').attr('value'));
      } // if 'declined' is true, this is a record that this vaccine WASN'T administered


      el = entry.tag('substanceAdministration');
      var declined = el.boolAttr('negationInd'); // product

      product = entry.template('2.16.840.1.113883.10.20.22.4.54');
      el = product.tag('code');
      var product_name = el.attr('displayName'),
          product_code = el.attr('code'),
          product_code_system = el.attr('codeSystem'),
          product_code_system_name = el.attr('codeSystemName'); // translation

      el = product.tag('translation');
      var translation_name = el.attr('displayName'),
          translation_code = el.attr('code'),
          translation_code_system = el.attr('codeSystem'),
          translation_code_system_name = el.attr('codeSystemName'); // misc product details

      el = product.tag('lotNumberText');
      var lot_number = el.val();
      el = product.tag('manufacturerOrganization');
      var manufacturer_name = el.tag('name').val(); // route

      el = entry.tag('routeCode');
      var route_name = el.attr('displayName'),
          route_code = el.attr('code'),
          route_code_system = el.attr('codeSystem'),
          route_code_system_name = el.attr('codeSystemName'); // instructions

      el = entry.template('2.16.840.1.113883.10.20.22.4.20');
      var instructions_text = Core.stripWhitespace(el.tag('text').val());
      el = el.tag('code');
      var education_name = el.attr('displayName'),
          education_code = el.attr('code'),
          education_code_system = el.attr('codeSystem'); // dose

      el = entry.tag('doseQuantity');
      var dose_value = el.attr('value'),
          dose_unit = el.attr('unit');
      var data = declined ? declinedData : administeredData;
      data.entries.push({
        date: date,
        product: {
          name: product_name,
          code: product_code,
          code_system: product_code_system,
          code_system_name: product_code_system_name,
          translation: {
            name: translation_name,
            code: translation_code,
            code_system: translation_code_system,
            code_system_name: translation_code_system_name
          },
          lot_number: lot_number,
          manufacturer_name: manufacturer_name
        },
        dose_quantity: {
          value: dose_value,
          unit: dose_unit
        },
        route: {
          name: route_name,
          code: route_code,
          code_system: route_code_system,
          code_system_name: route_code_system_name
        },
        instructions: instructions_text,
        education_type: {
          name: education_name,
          code: education_code,
          code_system: education_code_system
        }
      });
    });
    return {
      administered: administeredData,
      declined: declinedData
    };
  };
};

/***/ }),

/***/ 463:
/***/ ((module, __unused_webpack_exports, __nested_webpack_require_121660__) => {

/*
 * Parser for the CCDA "plan of care" section
 */
var Core = __nested_webpack_require_121660__(1);

module.exports = function () {
  var self = this;

  self.instructions = function (ccda) {
    var data = [],
        el;
    var instructions = ccda.section('instructions');
    data.templateId = instructions.tag('templateId').attr('root');
    instructions.entries().each(function (entry) {
      el = entry.tag('code');
      var name = el.attr('displayName'),
          code = el.attr('code'),
          code_system = el.attr('codeSystem'),
          code_system_name = el.attr('codeSystemName');
      var text = Core.stripWhitespace(entry.tag('text').val(true));
      data.push({
        text: text,
        name: name,
        code: code,
        code_system: code_system,
        code_system_name: code_system_name
      });
    });
    return data;
  };
};

/***/ }),

/***/ 306:
/***/ ((module, __unused_webpack_exports, __nested_webpack_require_122610__) => {

/*
 * Parser for the CCDA medications section
 */
var Core = __nested_webpack_require_122610__(1);

module.exports = function (doc) {
  var self = this;
  self.doc = doc;

  self.medications = function (ccda) {
    var parseDate = self.doc.parseDate;
    var medications = ccda.section('medications');
    var data = {},
        el;
    data.entries = [];
    data.displayName = "Medications";
    data.templateId = medications.tag('templateId').attr('root');
    data.text = medications.tag('text').val(true);
    medications.entries().each(function (entry) {
      el = entry.tag('text');
      var sig = Core.stripWhitespace(el.val());
      var effectiveTimes = entry.elsByTag('effectiveTime');
      el = effectiveTimes[0]; // the first effectiveTime is the med start date

      var start_date = null,
          end_date = null;

      if (el) {
        start_date = parseDate(el.tag('low').attr('value'));
        end_date = parseDate(el.tag('high').attr('value'));
      } // the second effectiveTime might the schedule period or it might just
      // be a random effectiveTime from further in the entry... xsi:type should tell us


      el = effectiveTimes[1];
      var schedule_type = null,
          schedule_period_value = null,
          schedule_period_unit = null;

      if (el && el.attr('xsi:type') === 'PIVL_TS') {
        var institutionSpecified = el.attr('institutionSpecified');

        if (institutionSpecified === 'true') {
          schedule_type = 'frequency';
        } else if (institutionSpecified === 'false') {
          schedule_type = 'interval';
        }

        el = el.tag('period');
        schedule_period_value = el.attr('value');
        schedule_period_unit = el.attr('unit');
      }

      el = entry.tag('manufacturedProduct').tag('code');
      var product_name = el.attr('displayName'),
          product_code = el.attr('code'),
          product_code_system = el.attr('codeSystem');
      var product_original_text = null;
      el = entry.tag('manufacturedProduct').tag('originalText');

      if (!el.isEmpty()) {
        product_original_text = Core.stripWhitespace(el.val());
      } // if we don't have a product name yet, try the originalText version


      if (!product_name && product_original_text) {
        product_name = product_original_text;
      }

      el = entry.tag('manufacturedProduct').tag('translation');
      var translation_name = el.attr('displayName'),
          translation_code = el.attr('code'),
          translation_code_system = el.attr('codeSystem'),
          translation_code_system_name = el.attr('codeSystemName');
      el = entry.tag('doseQuantity');
      var dose_value = el.attr('value'),
          dose_unit = el.attr('unit');
      el = entry.tag('rateQuantity');
      var rate_quantity_value = el.attr('value'),
          rate_quantity_unit = el.attr('unit');
      el = entry.tag('precondition').tag('value');
      var precondition_name = el.attr('displayName'),
          precondition_code = el.attr('code'),
          precondition_code_system = el.attr('codeSystem');
      el = entry.template('2.16.840.1.113883.10.20.22.4.19').tag('value');
      var reason_name = el.attr('displayName'),
          reason_code = el.attr('code'),
          reason_code_system = el.attr('codeSystem');
      el = entry.tag('routeCode');
      var route_name = el.attr('displayName'),
          route_code = el.attr('code'),
          route_code_system = el.attr('codeSystem'),
          route_code_system_name = el.attr('codeSystemName'); // participant/playingEntity => vehicle

      el = entry.tag('participant').tag('playingEntity');
      var vehicle_name = el.tag('name').val();
      el = el.tag('code'); // prefer the code vehicle_name but fall back to the non-coded one

      vehicle_name = el.attr('displayName') || vehicle_name;
      var vehicle_code = el.attr('code'),
          vehicle_code_system = el.attr('codeSystem'),
          vehicle_code_system_name = el.attr('codeSystemName');
      el = entry.tag('administrationUnitCode');
      var administration_name = el.attr('displayName'),
          administration_code = el.attr('code'),
          administration_code_system = el.attr('codeSystem'),
          administration_code_system_name = el.attr('codeSystemName'); // performer => prescriber

      el = entry.tag('performer');
      var prescriber_organization = el.tag('name').val(),
          prescriber_person = null;
      data.entries.push({
        date_range: {
          start: start_date,
          end: end_date
        },
        text: sig,
        product: {
          name: product_name,
          code: product_code,
          code_system: product_code_system,
          text: product_original_text,
          translation: {
            name: translation_name,
            code: translation_code,
            code_system: translation_code_system,
            code_system_name: translation_code_system_name
          }
        },
        dose_quantity: {
          value: dose_value,
          unit: dose_unit
        },
        rate_quantity: {
          value: rate_quantity_value,
          unit: rate_quantity_unit
        },
        precondition: {
          name: precondition_name,
          code: precondition_code,
          code_system: precondition_code_system
        },
        reason: {
          name: reason_name,
          code: reason_code,
          code_system: reason_code_system
        },
        route: {
          name: route_name,
          code: route_code,
          code_system: route_code_system,
          code_system_name: route_code_system_name
        },
        schedule: {
          type: schedule_type,
          period_value: schedule_period_value,
          period_unit: schedule_period_unit
        },
        vehicle: {
          name: vehicle_name,
          code: vehicle_code,
          code_system: vehicle_code_system,
          code_system_name: vehicle_code_system_name
        },
        administration: {
          name: administration_name,
          code: administration_code,
          code_system: administration_code_system,
          code_system_name: administration_code_system_name
        },
        prescriber: {
          organization: prescriber_organization,
          person: prescriber_person
        }
      });
    });
    return data;
  };
};

/***/ }),

/***/ 150:
/***/ ((module, __unused_webpack_exports, __nested_webpack_require_129030__) => {

/*
 * Parser for the CCDA problems section
 */
var Core = __nested_webpack_require_129030__(1);

module.exports = function (doc) {
  var self = this;
  self.doc = doc;

  self.problems = function (ccda) {
    var parseDate = self.doc.parseDate;
    var parseName = self.doc.parseName;
    var parseAddress = self.doc.parseAddress;
    var problems = ccda.section('problems');
    var data = {},
        el;
    data.entries = [];
    data.displayName = "Problems";
    data.templateId = problems.tag('templateId').attr('root');
    data.text = problems.tag('text').val(true);
    problems.entries().each(function (entry) {
      el = entry.tag('effectiveTime');
      var start_date = parseDate(el.tag('low').attr('value')),
          end_date = parseDate(el.tag('high').attr('value'));
      el = entry.template('2.16.840.1.113883.10.20.22.4.4').tag('value');
      var name = el.attr('displayName'),
          code = el.attr('code'),
          code_system = el.attr('codeSystem'),
          code_system_name = el.attr('codeSystemName');
      el = entry.template('2.16.840.1.113883.10.20.22.4.4').tag('translation');
      var translation_name = el.attr('displayName'),
          translation_code = el.attr('code'),
          translation_code_system = el.attr('codeSystem'),
          translation_code_system_name = el.attr('codeSystemName');
      el = entry.template('2.16.840.1.113883.10.20.22.4.6');
      var status = el.tag('value').attr('displayName');
      var age = null;
      el = entry.template('2.16.840.1.113883.10.20.22.4.31');

      if (!el.isEmpty()) {
        age = parseFloat(el.tag('value').attr('value'));
      }

      el = entry.template('2.16.840.1.113883.10.20.22.4.64');
      var comment = Core.stripWhitespace(el.tag('text').val());
      data.entries.push({
        date_range: {
          start: start_date,
          end: end_date
        },
        name: name,
        status: status,
        age: age,
        code: code,
        code_system: code_system,
        code_system_name: code_system_name,
        translation: {
          name: translation_name,
          code: translation_code,
          code_system: translation_code_system,
          code_system_name: translation_code_system_name
        },
        comment: comment
      });
    });
    return data;
  };
};

/***/ }),

/***/ 361:
/***/ ((module, __unused_webpack_exports, __nested_webpack_require_131423__) => {

/*
 * Parser for the CCDA procedures section
 */
var Core = __nested_webpack_require_131423__(1);

module.exports = function (doc) {
  var self = this;
  self.doc = doc;

  self.procedures = function (ccda) {
    var parseDate = self.doc.parseDate;
    var parseName = self.doc.parseName;
    var parseAddress = self.doc.parseAddress;
    var procedures = ccda.section('procedures');
    var data = {},
        el;
    data.entries = [];
    data.displayName = "Procedures";
    data.templateId = procedures.tag('templateId').attr('root');
    data.text = procedures.tag('text').val(true);
    procedures.entries().each(function (entry) {
      el = entry.tag('effectiveTime');
      var date = parseDate(el.attr('value'));
      el = entry.tag('code');
      var name = el.attr('displayName'),
          code = el.attr('code'),
          code_system = el.attr('codeSystem');

      if (!name) {
        name = Core.stripWhitespace(entry.tag('originalText').val());
      } // 'specimen' tag not always present


      el = entry.tag('specimen').tag('code');
      var specimen_name = el.attr('displayName'),
          specimen_code = el.attr('code'),
          specimen_code_system = el.attr('codeSystem');
      el = entry.tag('performer').tag('addr');
      var organization = el.tag('name').val(),
          phone = el.tag('telecom').attr('value');
      var performer_dict = parseAddress(el);
      performer_dict.organization = organization;
      performer_dict.phone = phone; // participant => device

      el = entry.template('2.16.840.1.113883.10.20.22.4.37').tag('code');
      var device_name = el.attr('displayName'),
          device_code = el.attr('code'),
          device_code_system = el.attr('codeSystem');
      data.entries.push({
        date: date,
        name: name,
        code: code,
        code_system: code_system,
        specimen: {
          name: specimen_name,
          code: specimen_code,
          code_system: specimen_code_system
        },
        performer: performer_dict,
        device: {
          name: device_name,
          code: device_code,
          code_system: device_code_system
        }
      });
    });
    return data;
  };
};

/***/ }),

/***/ 824:
/***/ ((module, __unused_webpack_exports, __nested_webpack_require_133693__) => {

/*
 * Parser for the CCDA results (labs) section
 */
var Core = __nested_webpack_require_133693__(1);

module.exports = function (doc) {
  var self = this;
  self.doc = doc;

  self.results = function (ccda) {
    var parseDate = self.doc.parseDate;
    var parseName = self.doc.parseName;
    var parseAddress = self.doc.parseAddress;
    var results = ccda.section('results');
    var data = {},
        el;
    data.entries = [];
    data.displayName = "Results";
    data.templateId = results.tag('templateId').attr('root');
    data.text = results.tag('text').val(true);
    results.entries().each(function (entry) {
      // panel
      el = entry.tag('code');
      var panel_name = el.attr('displayName'),
          panel_code = el.attr('code'),
          panel_code_system = el.attr('codeSystem'),
          panel_code_system_name = el.attr('codeSystemName');
      var observation;
      var tests = entry.elsByTag('observation');
      var tests_data = [];

      for (var i = 0; i < tests.length; i++) {
        observation = tests[i];
        var date = parseDate(observation.tag('effectiveTime').attr('value'));
        el = observation.tag('code');
        var name = el.attr('displayName'),
            code = el.attr('code'),
            code_system = el.attr('codeSystem'),
            code_system_name = el.attr('codeSystemName');

        if (!name) {
          name = Core.stripWhitespace(observation.tag('text').val());
        }

        el = observation.tag('translation');
        var translation_name = el.attr('displayName'),
            translation_code = el.attr('code'),
            translation_code_system = el.attr('codeSystem'),
            translation_code_system_name = el.attr('codeSystemName');
        el = observation.tag('value');
        var value = el.attr('value'),
            unit = el.attr('unit'); // We could look for xsi:type="PQ" (physical quantity) but it seems better
        // not to trust that that field has been used correctly...

        if (value && !isNaN(parseFloat(value))) {
          value = parseFloat(value);
        }

        if (!value) {
          value = el.val(); // look for free-text values
        }

        el = observation.tag('referenceRange');
        var reference_range_text = Core.stripWhitespace(el.tag('observationRange').tag('text').val()),
            reference_range_low_unit = el.tag('observationRange').tag('low').attr('unit'),
            reference_range_low_value = el.tag('observationRange').tag('low').attr('value'),
            reference_range_high_unit = el.tag('observationRange').tag('high').attr('unit'),
            reference_range_high_value = el.tag('observationRange').tag('high').attr('value');
        tests_data.push({
          date: date,
          name: name,
          value: value,
          unit: unit,
          code: code,
          code_system: code_system,
          code_system_name: code_system_name,
          translation: {
            name: translation_name,
            code: translation_code,
            code_system: translation_code_system,
            code_system_name: translation_code_system_name
          },
          reference_range: {
            text: reference_range_text,
            low_unit: reference_range_low_unit,
            low_value: reference_range_low_value,
            high_unit: reference_range_high_unit,
            high_value: reference_range_high_value
          }
        });
      }

      data.entries.push({
        name: panel_name,
        code: panel_code,
        code_system: panel_code_system,
        code_system_name: panel_code_system_name,
        tests: tests_data
      });
    });
    return data;
  };
};

/***/ }),

/***/ 206:
/***/ ((module) => {

/*
 * Parser for the CCDA smoking status in social history section
 */
module.exports = function (doc) {
  var self = this;
  self.doc = doc;

  self.smoking_status = function (ccda) {
    var parseDate = self.doc.parseDate;
    var parseName = self.doc.parseName;
    var parseAddress = self.doc.parseAddress;
    var data, el;
    var name = null,
        code = null,
        code_system = null,
        code_system_name = null,
        entry_date = null; // We can parse all of the social_history sections,
    // but in practice, this section seems to be used for
    // smoking status, so we're just going to break that out.
    // And we're just looking for the first non-empty one.

    var social_history = ccda.section('social_history');
    var entries = social_history.entries();

    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      var smoking_status = entry.template('2.16.840.1.113883.10.20.22.4.78');

      if (smoking_status.isEmpty()) {
        smoking_status = entry.template('2.16.840.1.113883.10.22.4.78');
      }

      if (smoking_status.isEmpty()) {
        continue;
      }

      el = smoking_status.tag('effectiveTime');
      entry_date = parseDate(el.attr('value'));
      el = smoking_status.tag('value');
      name = el.attr('displayName');
      code = el.attr('code');
      code_system = el.attr('codeSystem');
      code_system_name = el.attr('codeSystemName');

      if (name) {
        break;
      }
    }

    data = {
      date: entry_date,
      name: name,
      code: code,
      code_system: code_system,
      code_system_name: code_system_name
    };
    return data;
  };
};

/***/ }),

/***/ 204:
/***/ ((module) => {

/*
 * Parser for the CCDA vitals section
 */
module.exports = function (doc) {
  var self = this;
  self.doc = doc;

  self.vitals = function (ccda) {
    var parseDate = self.doc.parseDate;
    var parseName = self.doc.parseName;
    var parseAddress = self.doc.parseAddress;
    var vitals = ccda.section('vitals');
    var data = {},
        el;
    data.entries = [];
    data.displayName = "Vitals";
    data.templateId = vitals.tag('templateId').attr('root');
    data.text = vitals.tag('text').val(true);
    vitals.entries().each(function (entry) {
      el = entry.tag('effectiveTime');
      var entry_date = parseDate(el.attr('value'));
      var result;
      var results = entry.elsByTag('component');
      var results_data = [];

      for (var i = 0; i < results.length; i++) {
        result = results[i];
        el = result.tag('code');
        var name = el.attr('displayName'),
            code = el.attr('code'),
            code_system = el.attr('codeSystem'),
            code_system_name = el.attr('codeSystemName');
        el = result.tag('value');
        var value = parseFloat(el.attr('value')),
            unit = el.attr('unit');
        results_data.push({
          name: name,
          code: code,
          code_system: code_system,
          code_system_name: code_system_name,
          value: value,
          unit: unit
        });
      }

      data.entries.push({
        date: entry_date,
        results: results_data
      });
    });
    return data;
  };
};

/***/ }),

/***/ 767:
/***/ ((module, __unused_webpack_exports, __nested_webpack_require_140709__) => {

/*
 * Parser for the CCDAR2 document
 */
var ParseGenericInfo = __nested_webpack_require_140709__(711);

var Core = __nested_webpack_require_140709__(1);

var DocumentParser = __nested_webpack_require_140709__(801);

var DemographicsParser = __nested_webpack_require_140709__(825);

var HealthConcernsParser = __nested_webpack_require_140709__(329);

module.exports = function (doc) {
  var self = this;
  self.doc = doc;
  self.documentParser = new DocumentParser(self.doc);
  self.demographicsParser = new DemographicsParser(self.doc);
  self.healthConcernsParser = new HealthConcernsParser(self.doc);

  self.run = function (ccda) {
    var data = {};
    data.document = self.documentParser.document(ccda);
    data.demographics = self.demographicsParser.demographics(ccda);
    data.health_concerns_document = self.healthConcernsParser.health_concerns_document(ccda);
    data.json = Core.json; // Decorate each section with Title, templateId and text and adds missing sections

    ParseGenericInfo(ccda, data);
    return data;
  };
};

/***/ }),

/***/ 801:
/***/ ((module, __unused_webpack_exports, __nested_webpack_require_141776__) => {

/*
 * Parser for the CCDAR2 document section
 */
var Core = __nested_webpack_require_141776__(1);

module.exports = function (doc) {
  var self = this;
  self.doc = doc;

  self.document = function (ccda) {
    var parseDate = self.doc.parseDate;
    var parseName = self.doc.parseName;
    var parseAddress = self.doc.parseAddress;
    var data = {},
        el;
    var doc = ccda.section('document');
    var date = parseDate(doc.tag('effectiveTime').attr('value'));
    var title = Core.stripWhitespace(doc.tag('title').val()); // Parse Doc Type Info

    var templates = doc.elsByTag('templateId');
    var rootTemplate = templates[0].attr('root');
    var secondTemplate;
    if (templates.length > 1) secondTemplate = templates[1].attr('root');else secondTemplate = rootTemplate;
    var loinc = doc.tag('code').attr('code');
    var templateId = doc.tag('templateId').attr('root');
    var displayName = doc.tag('code').attr('displayName');
    var nonXml = doc.tag('nonXMLBody');
    var nonXmlNodes = nonXml.el.childNodes;
    var bodyType = "structured";
    var nonXmlBody = {
      type: "",
      mediaType: "",
      representation: "",
      rawText: "",
      reference: ""
    };

    if (nonXmlNodes && nonXmlNodes.length > 0) {
      bodyType = "unstructured";
      var text = nonXml.tag('text');
      var mediaType = "";
      var representation = "";
      var rawText = "";
      var reference = "";
      var type = ""; // We have an embedded doc

      if (text && text.attr('mediaType')) {
        mediaType = text.attr('mediaType');
        representation = text.attr('representation');
        rawText = text.val();
        type = "embedded";
      }

      if (text && !mediaType) {
        reference = text.tag('reference').attr('value');
        type = "reference";
      }

      nonXmlBody = {
        type: type,
        mediaType: mediaType,
        representation: representation,
        rawText: rawText,
        reference: reference
      };
    }

    var docType = {
      type: "CCDAR2",
      rootTemplateId: rootTemplate,
      templateId: secondTemplate,
      displayName: displayName,
      loinc: loinc,
      bodyType: bodyType,
      nonXmlBody: nonXmlBody
    };
    var author = doc.tag('author');
    el = author.tag('assignedPerson').tag('name');
    var name_dict = parseName(el);
    el = author.tag('addr');
    var address_dict = parseAddress(el);
    el = author.tag('telecom');
    var work_phone = el.attr('value');
    var documentation_of_list = [];
    var performers = doc.tag('documentationOf').elsByTag('performer');

    for (var i = 0; i < performers.length; i++) {
      el = performers[i];
      var performer_name_dict = parseName(el);
      var performer_phone = el.tag('telecom').attr('value');
      var performer_addr = parseAddress(el.tag('addr'));
      documentation_of_list.push({
        name: performer_name_dict,
        phone: {
          work: performer_phone
        },
        address: performer_addr
      });
    }

    el = doc.tag('encompassingEncounter').tag('location');
    var location_name = Core.stripWhitespace(el.tag('name').val());
    var location_addr_dict = parseAddress(el.tag('addr'));
    var encounter_date = null;
    el = el.tag('effectiveTime');

    if (!el.isEmpty()) {
      encounter_date = parseDate(el.attr('value'));
    }

    data = {
      type: docType,
      date: date,
      title: title,
      author: {
        name: name_dict,
        address: address_dict,
        phone: {
          work: work_phone
        }
      },
      documentation_of: documentation_of_list,
      location: {
        name: location_name,
        address: location_addr_dict,
        encounter_date: encounter_date
      }
    };
    return data;
  };
};

/***/ }),

/***/ 329:
/***/ ((module) => {

/*
 * Parser for the CCDAR2 Health Concerns Section
 * 2.16.840.1.113883.10.20.22.2.58
 */
module.exports = function (doc) {
  var self = this;
  self.doc = doc;

  self.health_concerns_document = function (ccda) {
    var parseDate = self.doc.parseDate;
    var parseName = self.doc.parseName;
    var parseAddress = self.doc.parseAddress; // Helper to create each iterator for collection

    var each = function each(callback) {
      for (var i = 0; i < this.length; i++) {
        callback(this[i]);
      }
    };

    var model = {},
        el;
    model.entries = [];
    model.text = ccda.tag('text').val(true);
    var health_concerns = ccda.section('health_concerns_document');
    var title = health_concerns.tag('title').val();
    health_concerns.entries().each(function (entry) {
      var entryModel = {}; // Parse out the ACT Body
      //A record of something that is being done, has been done, can be done, or is intended or requested to be done.

      var act = entry.tag('act');
      var er = act.elsByTag('entryRelationship');
      var templateId = act.tag('templateId').attr('root');
      var id = act.tag('id').attr('root');
      var statusCode = act.tag('statusCode').attr('code');
      var code = act.tag('code');
      var name = code.attr('displayName');
      var effectiveTime = parseDate(entry.tag('effectiveTime')); // The model we want to return in json

      var actModel = {
        effective_time: effectiveTime,
        name: name,
        entry_relationship: []
      }; // Parse Entity Relationship child nodes

      var ers = entry.elsByTag('entryRelationship');
      ers.each = each;
      ers.each(function (er) {
        var erModel = {
          type_code: er.attr('typeCode'),
          observations: []
        };
        var obs = er.elsByTag('observation');
        obs.each = each; // Parse out Obsevations for Each ER

        obs.each(function (ob) {
          erModel.observations.push({
            class_code: ob.attr('classCode'),
            mood_code: ob.attr('moodCode'),
            display_name: ob.tag('value').attr('displayName'),
            status: ob.tag('statusCode').attr('code')
          });
        });
        actModel.entry_relationship.push(erModel);
      }); // Add ACT Model to our final return model

      entryModel['act'] = actModel;
      model.entries.push(entryModel);
    });
    return model;
  };
};

/***/ }),

/***/ 711:
/***/ ((module) => {

/* Parses out basic data about each section */
module.exports = function (ccda, data) {
  var each = function each(callback) {
    for (var i = 0; i < this.length; i++) {
      callback(this[i]);
    }
  };

  var containsTemplateId = function containsTemplateId(templateId, data) {
    for (var property in data) {
      if (data.hasOwnProperty(property)) {
        var p = data[property].templateId; //var display = this[property].displayName;

        if (p) {
          if (p === templateId) {
            //console.log("TemplateId Match " + templateId + " " + display);
            return true;
          }
        }
      }
    }

    return false;
  };

  var allSections = ccda.elsByTag('section');
  allSections.each = each;
  allSections.each(function (s) {
    var code = s.tag('code').attr('displayName');
    var templateId = s.tag('templateId').attr('root');
    var existingTemplateId = containsTemplateId(templateId, data);

    if (code) {
      var nodeName = code.split(' ').join('_').toLowerCase(); //console.log("NODE NAME " + nodeName);

      if (!data[nodeName] && !existingTemplateId) {
        //console.log("CREATE NODE " + code);
        data[nodeName] = {};
      }

      if (data[nodeName]) {
        data[nodeName].displayName = code;
        data[nodeName].templateId = templateId;
        data[nodeName].text = s.tag('text').val(true);
      }
    }
  });
};

/***/ }),

/***/ 804:
/***/ ((module) => {

"use strict";
module.exports = __webpack_require__(3804);;

/***/ }),

/***/ 348:
/***/ ((module) => {

"use strict";
module.exports = __webpack_require__(647);;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nested_webpack_require_149855__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __nested_webpack_require_149855__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__nested_webpack_require_149855__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __nested_webpack_require_149855__(97);
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=bluebutton.js.map

/***/ }),

/***/ 8135:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

__webpack_require__(6253);
__webpack_require__(9115);
__webpack_require__(1181);
__webpack_require__(851);
__webpack_require__(9865);
__webpack_require__(1898);
module.exports = __webpack_require__(5645).Promise;


/***/ }),

/***/ 4963:
/***/ ((module) => {

module.exports = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};


/***/ }),

/***/ 7722:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// 22.1.3.31 Array.prototype[@@unscopables]
var UNSCOPABLES = __webpack_require__(6314)('unscopables');
var ArrayProto = Array.prototype;
if (ArrayProto[UNSCOPABLES] == undefined) __webpack_require__(7728)(ArrayProto, UNSCOPABLES, {});
module.exports = function (key) {
  ArrayProto[UNSCOPABLES][key] = true;
};


/***/ }),

/***/ 3328:
/***/ ((module) => {

module.exports = function (it, Constructor, name, forbiddenField) {
  if (!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)) {
    throw TypeError(name + ': incorrect invocation!');
  } return it;
};


/***/ }),

/***/ 7007:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var isObject = __webpack_require__(5286);
module.exports = function (it) {
  if (!isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};


/***/ }),

/***/ 9315:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// false -> Array#indexOf
// true  -> Array#includes
var toIObject = __webpack_require__(2110);
var toLength = __webpack_require__(875);
var toAbsoluteIndex = __webpack_require__(2337);
module.exports = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIObject($this);
    var length = toLength(O.length);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
      if (O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};


/***/ }),

/***/ 1488:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = __webpack_require__(2032);
var TAG = __webpack_require__(6314)('toStringTag');
// ES3 wrong here
var ARG = cof(function () { return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (e) { /* empty */ }
};

module.exports = function (it) {
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};


/***/ }),

/***/ 2032:
/***/ ((module) => {

var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};


/***/ }),

/***/ 5645:
/***/ ((module) => {

var core = module.exports = { version: '2.6.12' };
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef


/***/ }),

/***/ 741:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// optional / simple context binding
var aFunction = __webpack_require__(4963);
module.exports = function (fn, that, length) {
  aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};


/***/ }),

/***/ 1355:
/***/ ((module) => {

// 7.2.1 RequireObjectCoercible(argument)
module.exports = function (it) {
  if (it == undefined) throw TypeError("Can't call method on  " + it);
  return it;
};


/***/ }),

/***/ 7057:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// Thank's IE8 for his funny defineProperty
module.exports = !__webpack_require__(4253)(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});


/***/ }),

/***/ 2457:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var isObject = __webpack_require__(5286);
var document = __webpack_require__(3816).document;
// typeof document.createElement is 'object' in old IE
var is = isObject(document) && isObject(document.createElement);
module.exports = function (it) {
  return is ? document.createElement(it) : {};
};


/***/ }),

/***/ 4430:
/***/ ((module) => {

// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');


/***/ }),

/***/ 2985:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var global = __webpack_require__(3816);
var core = __webpack_require__(5645);
var hide = __webpack_require__(7728);
var redefine = __webpack_require__(7234);
var ctx = __webpack_require__(741);
var PROTOTYPE = 'prototype';

var $export = function (type, name, source) {
  var IS_FORCED = type & $export.F;
  var IS_GLOBAL = type & $export.G;
  var IS_STATIC = type & $export.S;
  var IS_PROTO = type & $export.P;
  var IS_BIND = type & $export.B;
  var target = IS_GLOBAL ? global : IS_STATIC ? global[name] || (global[name] = {}) : (global[name] || {})[PROTOTYPE];
  var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});
  var expProto = exports[PROTOTYPE] || (exports[PROTOTYPE] = {});
  var key, own, out, exp;
  if (IS_GLOBAL) source = name;
  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    // export native or passed
    out = (own ? target : source)[key];
    // bind timers to global for call from export context
    exp = IS_BIND && own ? ctx(out, global) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // extend global
    if (target) redefine(target, key, out, type & $export.U);
    // export
    if (exports[key] != out) hide(exports, key, exp);
    if (IS_PROTO && expProto[key] != out) expProto[key] = out;
  }
};
global.core = core;
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library`
module.exports = $export;


/***/ }),

/***/ 4253:
/***/ ((module) => {

module.exports = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};


/***/ }),

/***/ 3531:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var ctx = __webpack_require__(741);
var call = __webpack_require__(8851);
var isArrayIter = __webpack_require__(6555);
var anObject = __webpack_require__(7007);
var toLength = __webpack_require__(875);
var getIterFn = __webpack_require__(9002);
var BREAK = {};
var RETURN = {};
var exports = module.exports = function (iterable, entries, fn, that, ITERATOR) {
  var iterFn = ITERATOR ? function () { return iterable; } : getIterFn(iterable);
  var f = ctx(fn, that, entries ? 2 : 1);
  var index = 0;
  var length, step, iterator, result;
  if (typeof iterFn != 'function') throw TypeError(iterable + ' is not iterable!');
  // fast case for arrays with default iterator
  if (isArrayIter(iterFn)) for (length = toLength(iterable.length); length > index; index++) {
    result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
    if (result === BREAK || result === RETURN) return result;
  } else for (iterator = iterFn.call(iterable); !(step = iterator.next()).done;) {
    result = call(iterator, f, step.value, entries);
    if (result === BREAK || result === RETURN) return result;
  }
};
exports.BREAK = BREAK;
exports.RETURN = RETURN;


/***/ }),

/***/ 18:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(3825)('native-function-to-string', Function.toString);


/***/ }),

/***/ 3816:
/***/ ((module) => {

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef


/***/ }),

/***/ 9181:
/***/ ((module) => {

var hasOwnProperty = {}.hasOwnProperty;
module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};


/***/ }),

/***/ 7728:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var dP = __webpack_require__(9275);
var createDesc = __webpack_require__(681);
module.exports = __webpack_require__(7057) ? function (object, key, value) {
  return dP.f(object, key, createDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};


/***/ }),

/***/ 639:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var document = __webpack_require__(3816).document;
module.exports = document && document.documentElement;


/***/ }),

/***/ 1734:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = !__webpack_require__(7057) && !__webpack_require__(4253)(function () {
  return Object.defineProperty(__webpack_require__(2457)('div'), 'a', { get: function () { return 7; } }).a != 7;
});


/***/ }),

/***/ 7242:
/***/ ((module) => {

// fast apply, http://jsperf.lnkit.com/fast-apply/5
module.exports = function (fn, args, that) {
  var un = that === undefined;
  switch (args.length) {
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
  } return fn.apply(that, args);
};


/***/ }),

/***/ 9797:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = __webpack_require__(2032);
// eslint-disable-next-line no-prototype-builtins
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return cof(it) == 'String' ? it.split('') : Object(it);
};


/***/ }),

/***/ 6555:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// check on default Array iterator
var Iterators = __webpack_require__(2803);
var ITERATOR = __webpack_require__(6314)('iterator');
var ArrayProto = Array.prototype;

module.exports = function (it) {
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};


/***/ }),

/***/ 5286:
/***/ ((module) => {

module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};


/***/ }),

/***/ 8851:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// call something on iterator step with safe closing on error
var anObject = __webpack_require__(7007);
module.exports = function (iterator, fn, value, entries) {
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch (e) {
    var ret = iterator['return'];
    if (ret !== undefined) anObject(ret.call(iterator));
    throw e;
  }
};


/***/ }),

/***/ 9988:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var create = __webpack_require__(2503);
var descriptor = __webpack_require__(681);
var setToStringTag = __webpack_require__(2943);
var IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
__webpack_require__(7728)(IteratorPrototype, __webpack_require__(6314)('iterator'), function () { return this; });

module.exports = function (Constructor, NAME, next) {
  Constructor.prototype = create(IteratorPrototype, { next: descriptor(1, next) });
  setToStringTag(Constructor, NAME + ' Iterator');
};


/***/ }),

/***/ 2923:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var LIBRARY = __webpack_require__(4461);
var $export = __webpack_require__(2985);
var redefine = __webpack_require__(7234);
var hide = __webpack_require__(7728);
var Iterators = __webpack_require__(2803);
var $iterCreate = __webpack_require__(9988);
var setToStringTag = __webpack_require__(2943);
var getPrototypeOf = __webpack_require__(468);
var ITERATOR = __webpack_require__(6314)('iterator');
var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
var FF_ITERATOR = '@@iterator';
var KEYS = 'keys';
var VALUES = 'values';

var returnThis = function () { return this; };

module.exports = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
  $iterCreate(Constructor, NAME, next);
  var getMethod = function (kind) {
    if (!BUGGY && kind in proto) return proto[kind];
    switch (kind) {
      case KEYS: return function keys() { return new Constructor(this, kind); };
      case VALUES: return function values() { return new Constructor(this, kind); };
    } return function entries() { return new Constructor(this, kind); };
  };
  var TAG = NAME + ' Iterator';
  var DEF_VALUES = DEFAULT == VALUES;
  var VALUES_BUG = false;
  var proto = Base.prototype;
  var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
  var $default = $native || getMethod(DEFAULT);
  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
  var methods, key, IteratorPrototype;
  // Fix native
  if ($anyNative) {
    IteratorPrototype = getPrototypeOf($anyNative.call(new Base()));
    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
      // Set @@toStringTag to native iterators
      setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if (!LIBRARY && typeof IteratorPrototype[ITERATOR] != 'function') hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if (DEF_VALUES && $native && $native.name !== VALUES) {
    VALUES_BUG = true;
    $default = function values() { return $native.call(this); };
  }
  // Define iterator
  if ((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG] = returnThis;
  if (DEFAULT) {
    methods = {
      values: DEF_VALUES ? $default : getMethod(VALUES),
      keys: IS_SET ? $default : getMethod(KEYS),
      entries: $entries
    };
    if (FORCED) for (key in methods) {
      if (!(key in proto)) redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};


/***/ }),

/***/ 7462:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var ITERATOR = __webpack_require__(6314)('iterator');
var SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR]();
  riter['return'] = function () { SAFE_CLOSING = true; };
  // eslint-disable-next-line no-throw-literal
  Array.from(riter, function () { throw 2; });
} catch (e) { /* empty */ }

module.exports = function (exec, skipClosing) {
  if (!skipClosing && !SAFE_CLOSING) return false;
  var safe = false;
  try {
    var arr = [7];
    var iter = arr[ITERATOR]();
    iter.next = function () { return { done: safe = true }; };
    arr[ITERATOR] = function () { return iter; };
    exec(arr);
  } catch (e) { /* empty */ }
  return safe;
};


/***/ }),

/***/ 5436:
/***/ ((module) => {

module.exports = function (done, value) {
  return { value: value, done: !!done };
};


/***/ }),

/***/ 2803:
/***/ ((module) => {

module.exports = {};


/***/ }),

/***/ 4461:
/***/ ((module) => {

module.exports = false;


/***/ }),

/***/ 4351:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var global = __webpack_require__(3816);
var macrotask = __webpack_require__(4193).set;
var Observer = global.MutationObserver || global.WebKitMutationObserver;
var process = global.process;
var Promise = global.Promise;
var isNode = __webpack_require__(2032)(process) == 'process';

module.exports = function () {
  var head, last, notify;

  var flush = function () {
    var parent, fn;
    if (isNode && (parent = process.domain)) parent.exit();
    while (head) {
      fn = head.fn;
      head = head.next;
      try {
        fn();
      } catch (e) {
        if (head) notify();
        else last = undefined;
        throw e;
      }
    } last = undefined;
    if (parent) parent.enter();
  };

  // Node.js
  if (isNode) {
    notify = function () {
      process.nextTick(flush);
    };
  // browsers with MutationObserver, except iOS Safari - https://github.com/zloirock/core-js/issues/339
  } else if (Observer && !(global.navigator && global.navigator.standalone)) {
    var toggle = true;
    var node = document.createTextNode('');
    new Observer(flush).observe(node, { characterData: true }); // eslint-disable-line no-new
    notify = function () {
      node.data = toggle = !toggle;
    };
  // environments with maybe non-completely correct, but existent Promise
  } else if (Promise && Promise.resolve) {
    // Promise.resolve without an argument throws an error in LG WebOS 2
    var promise = Promise.resolve(undefined);
    notify = function () {
      promise.then(flush);
    };
  // for other environments - macrotask based on:
  // - setImmediate
  // - MessageChannel
  // - window.postMessag
  // - onreadystatechange
  // - setTimeout
  } else {
    notify = function () {
      // strange IE + webpack dev server bug - use .call(global)
      macrotask.call(global, flush);
    };
  }

  return function (fn) {
    var task = { fn: fn, next: undefined };
    if (last) last.next = task;
    if (!head) {
      head = task;
      notify();
    } last = task;
  };
};


/***/ }),

/***/ 3499:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

// 25.4.1.5 NewPromiseCapability(C)
var aFunction = __webpack_require__(4963);

function PromiseCapability(C) {
  var resolve, reject;
  this.promise = new C(function ($$resolve, $$reject) {
    if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
    resolve = $$resolve;
    reject = $$reject;
  });
  this.resolve = aFunction(resolve);
  this.reject = aFunction(reject);
}

module.exports.f = function (C) {
  return new PromiseCapability(C);
};


/***/ }),

/***/ 2503:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var anObject = __webpack_require__(7007);
var dPs = __webpack_require__(5588);
var enumBugKeys = __webpack_require__(4430);
var IE_PROTO = __webpack_require__(9335)('IE_PROTO');
var Empty = function () { /* empty */ };
var PROTOTYPE = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = __webpack_require__(2457)('iframe');
  var i = enumBugKeys.length;
  var lt = '<';
  var gt = '>';
  var iframeDocument;
  iframe.style.display = 'none';
  __webpack_require__(639).appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while (i--) delete createDict[PROTOTYPE][enumBugKeys[i]];
  return createDict();
};

module.exports = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty();
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : dPs(result, Properties);
};


/***/ }),

/***/ 9275:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var anObject = __webpack_require__(7007);
var IE8_DOM_DEFINE = __webpack_require__(1734);
var toPrimitive = __webpack_require__(1689);
var dP = Object.defineProperty;

exports.f = __webpack_require__(7057) ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return dP(O, P, Attributes);
  } catch (e) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};


/***/ }),

/***/ 5588:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var dP = __webpack_require__(9275);
var anObject = __webpack_require__(7007);
var getKeys = __webpack_require__(7184);

module.exports = __webpack_require__(7057) ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var keys = getKeys(Properties);
  var length = keys.length;
  var i = 0;
  var P;
  while (length > i) dP.f(O, P = keys[i++], Properties[P]);
  return O;
};


/***/ }),

/***/ 468:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var has = __webpack_require__(9181);
var toObject = __webpack_require__(508);
var IE_PROTO = __webpack_require__(9335)('IE_PROTO');
var ObjectProto = Object.prototype;

module.exports = Object.getPrototypeOf || function (O) {
  O = toObject(O);
  if (has(O, IE_PROTO)) return O[IE_PROTO];
  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};


/***/ }),

/***/ 189:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var has = __webpack_require__(9181);
var toIObject = __webpack_require__(2110);
var arrayIndexOf = __webpack_require__(9315)(false);
var IE_PROTO = __webpack_require__(9335)('IE_PROTO');

module.exports = function (object, names) {
  var O = toIObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) if (key != IE_PROTO) has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (has(O, key = names[i++])) {
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};


/***/ }),

/***/ 7184:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys = __webpack_require__(189);
var enumBugKeys = __webpack_require__(4430);

module.exports = Object.keys || function keys(O) {
  return $keys(O, enumBugKeys);
};


/***/ }),

/***/ 188:
/***/ ((module) => {

module.exports = function (exec) {
  try {
    return { e: false, v: exec() };
  } catch (e) {
    return { e: true, v: e };
  }
};


/***/ }),

/***/ 94:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var anObject = __webpack_require__(7007);
var isObject = __webpack_require__(5286);
var newPromiseCapability = __webpack_require__(3499);

module.exports = function (C, x) {
  anObject(C);
  if (isObject(x) && x.constructor === C) return x;
  var promiseCapability = newPromiseCapability.f(C);
  var resolve = promiseCapability.resolve;
  resolve(x);
  return promiseCapability.promise;
};


/***/ }),

/***/ 681:
/***/ ((module) => {

module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};


/***/ }),

/***/ 4408:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var redefine = __webpack_require__(7234);
module.exports = function (target, src, safe) {
  for (var key in src) redefine(target, key, src[key], safe);
  return target;
};


/***/ }),

/***/ 7234:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var global = __webpack_require__(3816);
var hide = __webpack_require__(7728);
var has = __webpack_require__(9181);
var SRC = __webpack_require__(3953)('src');
var $toString = __webpack_require__(18);
var TO_STRING = 'toString';
var TPL = ('' + $toString).split(TO_STRING);

__webpack_require__(5645).inspectSource = function (it) {
  return $toString.call(it);
};

(module.exports = function (O, key, val, safe) {
  var isFunction = typeof val == 'function';
  if (isFunction) has(val, 'name') || hide(val, 'name', key);
  if (O[key] === val) return;
  if (isFunction) has(val, SRC) || hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
  if (O === global) {
    O[key] = val;
  } else if (!safe) {
    delete O[key];
    hide(O, key, val);
  } else if (O[key]) {
    O[key] = val;
  } else {
    hide(O, key, val);
  }
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
})(Function.prototype, TO_STRING, function toString() {
  return typeof this == 'function' && this[SRC] || $toString.call(this);
});


/***/ }),

/***/ 2974:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var global = __webpack_require__(3816);
var dP = __webpack_require__(9275);
var DESCRIPTORS = __webpack_require__(7057);
var SPECIES = __webpack_require__(6314)('species');

module.exports = function (KEY) {
  var C = global[KEY];
  if (DESCRIPTORS && C && !C[SPECIES]) dP.f(C, SPECIES, {
    configurable: true,
    get: function () { return this; }
  });
};


/***/ }),

/***/ 2943:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var def = __webpack_require__(9275).f;
var has = __webpack_require__(9181);
var TAG = __webpack_require__(6314)('toStringTag');

module.exports = function (it, tag, stat) {
  if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
};


/***/ }),

/***/ 9335:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var shared = __webpack_require__(3825)('keys');
var uid = __webpack_require__(3953);
module.exports = function (key) {
  return shared[key] || (shared[key] = uid(key));
};


/***/ }),

/***/ 3825:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var core = __webpack_require__(5645);
var global = __webpack_require__(3816);
var SHARED = '__core-js_shared__';
var store = global[SHARED] || (global[SHARED] = {});

(module.exports = function (key, value) {
  return store[key] || (store[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: core.version,
  mode: __webpack_require__(4461) ? 'pure' : 'global',
  copyright: '© 2020 Denis Pushkarev (zloirock.ru)'
});


/***/ }),

/***/ 8364:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// 7.3.20 SpeciesConstructor(O, defaultConstructor)
var anObject = __webpack_require__(7007);
var aFunction = __webpack_require__(4963);
var SPECIES = __webpack_require__(6314)('species');
module.exports = function (O, D) {
  var C = anObject(O).constructor;
  var S;
  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
};


/***/ }),

/***/ 4496:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var toInteger = __webpack_require__(1467);
var defined = __webpack_require__(1355);
// true  -> String#at
// false -> String#codePointAt
module.exports = function (TO_STRING) {
  return function (that, pos) {
    var s = String(defined(that));
    var i = toInteger(pos);
    var l = s.length;
    var a, b;
    if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};


/***/ }),

/***/ 4193:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var ctx = __webpack_require__(741);
var invoke = __webpack_require__(7242);
var html = __webpack_require__(639);
var cel = __webpack_require__(2457);
var global = __webpack_require__(3816);
var process = global.process;
var setTask = global.setImmediate;
var clearTask = global.clearImmediate;
var MessageChannel = global.MessageChannel;
var Dispatch = global.Dispatch;
var counter = 0;
var queue = {};
var ONREADYSTATECHANGE = 'onreadystatechange';
var defer, channel, port;
var run = function () {
  var id = +this;
  // eslint-disable-next-line no-prototype-builtins
  if (queue.hasOwnProperty(id)) {
    var fn = queue[id];
    delete queue[id];
    fn();
  }
};
var listener = function (event) {
  run.call(event.data);
};
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if (!setTask || !clearTask) {
  setTask = function setImmediate(fn) {
    var args = [];
    var i = 1;
    while (arguments.length > i) args.push(arguments[i++]);
    queue[++counter] = function () {
      // eslint-disable-next-line no-new-func
      invoke(typeof fn == 'function' ? fn : Function(fn), args);
    };
    defer(counter);
    return counter;
  };
  clearTask = function clearImmediate(id) {
    delete queue[id];
  };
  // Node.js 0.8-
  if (__webpack_require__(2032)(process) == 'process') {
    defer = function (id) {
      process.nextTick(ctx(run, id, 1));
    };
  // Sphere (JS game engine) Dispatch API
  } else if (Dispatch && Dispatch.now) {
    defer = function (id) {
      Dispatch.now(ctx(run, id, 1));
    };
  // Browsers with MessageChannel, includes WebWorkers
  } else if (MessageChannel) {
    channel = new MessageChannel();
    port = channel.port2;
    channel.port1.onmessage = listener;
    defer = ctx(port.postMessage, port, 1);
  // Browsers with postMessage, skip WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if (global.addEventListener && typeof postMessage == 'function' && !global.importScripts) {
    defer = function (id) {
      global.postMessage(id + '', '*');
    };
    global.addEventListener('message', listener, false);
  // IE8-
  } else if (ONREADYSTATECHANGE in cel('script')) {
    defer = function (id) {
      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function () {
        html.removeChild(this);
        run.call(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function (id) {
      setTimeout(ctx(run, id, 1), 0);
    };
  }
}
module.exports = {
  set: setTask,
  clear: clearTask
};


/***/ }),

/***/ 2337:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var toInteger = __webpack_require__(1467);
var max = Math.max;
var min = Math.min;
module.exports = function (index, length) {
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};


/***/ }),

/***/ 1467:
/***/ ((module) => {

// 7.1.4 ToInteger
var ceil = Math.ceil;
var floor = Math.floor;
module.exports = function (it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};


/***/ }),

/***/ 2110:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = __webpack_require__(9797);
var defined = __webpack_require__(1355);
module.exports = function (it) {
  return IObject(defined(it));
};


/***/ }),

/***/ 875:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// 7.1.15 ToLength
var toInteger = __webpack_require__(1467);
var min = Math.min;
module.exports = function (it) {
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};


/***/ }),

/***/ 508:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// 7.1.13 ToObject(argument)
var defined = __webpack_require__(1355);
module.exports = function (it) {
  return Object(defined(it));
};


/***/ }),

/***/ 1689:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = __webpack_require__(5286);
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function (it, S) {
  if (!isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
  throw TypeError("Can't convert object to primitive value");
};


/***/ }),

/***/ 3953:
/***/ ((module) => {

var id = 0;
var px = Math.random();
module.exports = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};


/***/ }),

/***/ 575:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var global = __webpack_require__(3816);
var navigator = global.navigator;

module.exports = navigator && navigator.userAgent || '';


/***/ }),

/***/ 6314:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var store = __webpack_require__(3825)('wks');
var uid = __webpack_require__(3953);
var Symbol = __webpack_require__(3816).Symbol;
var USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function (name) {
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};

$exports.store = store;


/***/ }),

/***/ 9002:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var classof = __webpack_require__(1488);
var ITERATOR = __webpack_require__(6314)('iterator');
var Iterators = __webpack_require__(2803);
module.exports = __webpack_require__(5645).getIteratorMethod = function (it) {
  if (it != undefined) return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};


/***/ }),

/***/ 6997:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var addToUnscopables = __webpack_require__(7722);
var step = __webpack_require__(5436);
var Iterators = __webpack_require__(2803);
var toIObject = __webpack_require__(2110);

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
module.exports = __webpack_require__(2923)(Array, 'Array', function (iterated, kind) {
  this._t = toIObject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var kind = this._k;
  var index = this._i++;
  if (!O || index >= O.length) {
    this._t = undefined;
    return step(1);
  }
  if (kind == 'keys') return step(0, index);
  if (kind == 'values') return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');


/***/ }),

/***/ 6253:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

// 19.1.3.6 Object.prototype.toString()
var classof = __webpack_require__(1488);
var test = {};
test[__webpack_require__(6314)('toStringTag')] = 'z';
if (test + '' != '[object z]') {
  __webpack_require__(7234)(Object.prototype, 'toString', function toString() {
    return '[object ' + classof(this) + ']';
  }, true);
}


/***/ }),

/***/ 851:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var LIBRARY = __webpack_require__(4461);
var global = __webpack_require__(3816);
var ctx = __webpack_require__(741);
var classof = __webpack_require__(1488);
var $export = __webpack_require__(2985);
var isObject = __webpack_require__(5286);
var aFunction = __webpack_require__(4963);
var anInstance = __webpack_require__(3328);
var forOf = __webpack_require__(3531);
var speciesConstructor = __webpack_require__(8364);
var task = __webpack_require__(4193).set;
var microtask = __webpack_require__(4351)();
var newPromiseCapabilityModule = __webpack_require__(3499);
var perform = __webpack_require__(188);
var userAgent = __webpack_require__(575);
var promiseResolve = __webpack_require__(94);
var PROMISE = 'Promise';
var TypeError = global.TypeError;
var process = global.process;
var versions = process && process.versions;
var v8 = versions && versions.v8 || '';
var $Promise = global[PROMISE];
var isNode = classof(process) == 'process';
var empty = function () { /* empty */ };
var Internal, newGenericPromiseCapability, OwnPromiseCapability, Wrapper;
var newPromiseCapability = newGenericPromiseCapability = newPromiseCapabilityModule.f;

var USE_NATIVE = !!function () {
  try {
    // correct subclassing with @@species support
    var promise = $Promise.resolve(1);
    var FakePromise = (promise.constructor = {})[__webpack_require__(6314)('species')] = function (exec) {
      exec(empty, empty);
    };
    // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
    return (isNode || typeof PromiseRejectionEvent == 'function')
      && promise.then(empty) instanceof FakePromise
      // v8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
      // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
      // we can't detect it synchronously, so just check versions
      && v8.indexOf('6.6') !== 0
      && userAgent.indexOf('Chrome/66') === -1;
  } catch (e) { /* empty */ }
}();

// helpers
var isThenable = function (it) {
  var then;
  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
};
var notify = function (promise, isReject) {
  if (promise._n) return;
  promise._n = true;
  var chain = promise._c;
  microtask(function () {
    var value = promise._v;
    var ok = promise._s == 1;
    var i = 0;
    var run = function (reaction) {
      var handler = ok ? reaction.ok : reaction.fail;
      var resolve = reaction.resolve;
      var reject = reaction.reject;
      var domain = reaction.domain;
      var result, then, exited;
      try {
        if (handler) {
          if (!ok) {
            if (promise._h == 2) onHandleUnhandled(promise);
            promise._h = 1;
          }
          if (handler === true) result = value;
          else {
            if (domain) domain.enter();
            result = handler(value); // may throw
            if (domain) {
              domain.exit();
              exited = true;
            }
          }
          if (result === reaction.promise) {
            reject(TypeError('Promise-chain cycle'));
          } else if (then = isThenable(result)) {
            then.call(result, resolve, reject);
          } else resolve(result);
        } else reject(value);
      } catch (e) {
        if (domain && !exited) domain.exit();
        reject(e);
      }
    };
    while (chain.length > i) run(chain[i++]); // variable length - can't use forEach
    promise._c = [];
    promise._n = false;
    if (isReject && !promise._h) onUnhandled(promise);
  });
};
var onUnhandled = function (promise) {
  task.call(global, function () {
    var value = promise._v;
    var unhandled = isUnhandled(promise);
    var result, handler, console;
    if (unhandled) {
      result = perform(function () {
        if (isNode) {
          process.emit('unhandledRejection', value, promise);
        } else if (handler = global.onunhandledrejection) {
          handler({ promise: promise, reason: value });
        } else if ((console = global.console) && console.error) {
          console.error('Unhandled promise rejection', value);
        }
      });
      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
      promise._h = isNode || isUnhandled(promise) ? 2 : 1;
    } promise._a = undefined;
    if (unhandled && result.e) throw result.v;
  });
};
var isUnhandled = function (promise) {
  return promise._h !== 1 && (promise._a || promise._c).length === 0;
};
var onHandleUnhandled = function (promise) {
  task.call(global, function () {
    var handler;
    if (isNode) {
      process.emit('rejectionHandled', promise);
    } else if (handler = global.onrejectionhandled) {
      handler({ promise: promise, reason: promise._v });
    }
  });
};
var $reject = function (value) {
  var promise = this;
  if (promise._d) return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  promise._v = value;
  promise._s = 2;
  if (!promise._a) promise._a = promise._c.slice();
  notify(promise, true);
};
var $resolve = function (value) {
  var promise = this;
  var then;
  if (promise._d) return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  try {
    if (promise === value) throw TypeError("Promise can't be resolved itself");
    if (then = isThenable(value)) {
      microtask(function () {
        var wrapper = { _w: promise, _d: false }; // wrap
        try {
          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
        } catch (e) {
          $reject.call(wrapper, e);
        }
      });
    } else {
      promise._v = value;
      promise._s = 1;
      notify(promise, false);
    }
  } catch (e) {
    $reject.call({ _w: promise, _d: false }, e); // wrap
  }
};

// constructor polyfill
if (!USE_NATIVE) {
  // 25.4.3.1 Promise(executor)
  $Promise = function Promise(executor) {
    anInstance(this, $Promise, PROMISE, '_h');
    aFunction(executor);
    Internal.call(this);
    try {
      executor(ctx($resolve, this, 1), ctx($reject, this, 1));
    } catch (err) {
      $reject.call(this, err);
    }
  };
  // eslint-disable-next-line no-unused-vars
  Internal = function Promise(executor) {
    this._c = [];             // <- awaiting reactions
    this._a = undefined;      // <- checked in isUnhandled reactions
    this._s = 0;              // <- state
    this._d = false;          // <- done
    this._v = undefined;      // <- value
    this._h = 0;              // <- rejection state, 0 - default, 1 - handled, 2 - unhandled
    this._n = false;          // <- notify
  };
  Internal.prototype = __webpack_require__(4408)($Promise.prototype, {
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    then: function then(onFulfilled, onRejected) {
      var reaction = newPromiseCapability(speciesConstructor(this, $Promise));
      reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
      reaction.fail = typeof onRejected == 'function' && onRejected;
      reaction.domain = isNode ? process.domain : undefined;
      this._c.push(reaction);
      if (this._a) this._a.push(reaction);
      if (this._s) notify(this, false);
      return reaction.promise;
    },
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    'catch': function (onRejected) {
      return this.then(undefined, onRejected);
    }
  });
  OwnPromiseCapability = function () {
    var promise = new Internal();
    this.promise = promise;
    this.resolve = ctx($resolve, promise, 1);
    this.reject = ctx($reject, promise, 1);
  };
  newPromiseCapabilityModule.f = newPromiseCapability = function (C) {
    return C === $Promise || C === Wrapper
      ? new OwnPromiseCapability(C)
      : newGenericPromiseCapability(C);
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, { Promise: $Promise });
__webpack_require__(2943)($Promise, PROMISE);
__webpack_require__(2974)(PROMISE);
Wrapper = __webpack_require__(5645)[PROMISE];

// statics
$export($export.S + $export.F * !USE_NATIVE, PROMISE, {
  // 25.4.4.5 Promise.reject(r)
  reject: function reject(r) {
    var capability = newPromiseCapability(this);
    var $$reject = capability.reject;
    $$reject(r);
    return capability.promise;
  }
});
$export($export.S + $export.F * (LIBRARY || !USE_NATIVE), PROMISE, {
  // 25.4.4.6 Promise.resolve(x)
  resolve: function resolve(x) {
    return promiseResolve(LIBRARY && this === Wrapper ? $Promise : this, x);
  }
});
$export($export.S + $export.F * !(USE_NATIVE && __webpack_require__(7462)(function (iter) {
  $Promise.all(iter)['catch'](empty);
})), PROMISE, {
  // 25.4.4.1 Promise.all(iterable)
  all: function all(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var resolve = capability.resolve;
    var reject = capability.reject;
    var result = perform(function () {
      var values = [];
      var index = 0;
      var remaining = 1;
      forOf(iterable, false, function (promise) {
        var $index = index++;
        var alreadyCalled = false;
        values.push(undefined);
        remaining++;
        C.resolve(promise).then(function (value) {
          if (alreadyCalled) return;
          alreadyCalled = true;
          values[$index] = value;
          --remaining || resolve(values);
        }, reject);
      });
      --remaining || resolve(values);
    });
    if (result.e) reject(result.v);
    return capability.promise;
  },
  // 25.4.4.4 Promise.race(iterable)
  race: function race(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var reject = capability.reject;
    var result = perform(function () {
      forOf(iterable, false, function (promise) {
        C.resolve(promise).then(capability.resolve, reject);
      });
    });
    if (result.e) reject(result.v);
    return capability.promise;
  }
});


/***/ }),

/***/ 9115:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var $at = __webpack_require__(4496)(true);

// 21.1.3.27 String.prototype[@@iterator]()
__webpack_require__(2923)(String, 'String', function (iterated) {
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var index = this._i;
  var point;
  if (index >= O.length) return { value: undefined, done: true };
  point = $at(O, index);
  this._i += point.length;
  return { value: point, done: false };
});


/***/ }),

/***/ 9865:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
// https://github.com/tc39/proposal-promise-finally

var $export = __webpack_require__(2985);
var core = __webpack_require__(5645);
var global = __webpack_require__(3816);
var speciesConstructor = __webpack_require__(8364);
var promiseResolve = __webpack_require__(94);

$export($export.P + $export.R, 'Promise', { 'finally': function (onFinally) {
  var C = speciesConstructor(this, core.Promise || global.Promise);
  var isFunction = typeof onFinally == 'function';
  return this.then(
    isFunction ? function (x) {
      return promiseResolve(C, onFinally()).then(function () { return x; });
    } : onFinally,
    isFunction ? function (e) {
      return promiseResolve(C, onFinally()).then(function () { throw e; });
    } : onFinally
  );
} });


/***/ }),

/***/ 1898:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

// https://github.com/tc39/proposal-promise-try
var $export = __webpack_require__(2985);
var newPromiseCapability = __webpack_require__(3499);
var perform = __webpack_require__(188);

$export($export.S, 'Promise', { 'try': function (callbackfn) {
  var promiseCapability = newPromiseCapability.f(this);
  var result = perform(callbackfn);
  (result.e ? promiseCapability.reject : promiseCapability.resolve)(result.v);
  return promiseCapability.promise;
} });


/***/ }),

/***/ 1181:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

var $iterators = __webpack_require__(6997);
var getKeys = __webpack_require__(7184);
var redefine = __webpack_require__(7234);
var global = __webpack_require__(3816);
var hide = __webpack_require__(7728);
var Iterators = __webpack_require__(2803);
var wks = __webpack_require__(6314);
var ITERATOR = wks('iterator');
var TO_STRING_TAG = wks('toStringTag');
var ArrayValues = Iterators.Array;

var DOMIterables = {
  CSSRuleList: true, // TODO: Not spec compliant, should be false.
  CSSStyleDeclaration: false,
  CSSValueList: false,
  ClientRectList: false,
  DOMRectList: false,
  DOMStringList: false,
  DOMTokenList: true,
  DataTransferItemList: false,
  FileList: false,
  HTMLAllCollection: false,
  HTMLCollection: false,
  HTMLFormElement: false,
  HTMLSelectElement: false,
  MediaList: true, // TODO: Not spec compliant, should be false.
  MimeTypeArray: false,
  NamedNodeMap: false,
  NodeList: true,
  PaintRequestList: false,
  Plugin: false,
  PluginArray: false,
  SVGLengthList: false,
  SVGNumberList: false,
  SVGPathSegList: false,
  SVGPointList: false,
  SVGStringList: false,
  SVGTransformList: false,
  SourceBufferList: false,
  StyleSheetList: true, // TODO: Not spec compliant, should be false.
  TextTrackCueList: false,
  TextTrackList: false,
  TouchList: false
};

for (var collections = getKeys(DOMIterables), i = 0; i < collections.length; i++) {
  var NAME = collections[i];
  var explicit = DOMIterables[NAME];
  var Collection = global[NAME];
  var proto = Collection && Collection.prototype;
  var key;
  if (proto) {
    if (!proto[ITERATOR]) hide(proto, ITERATOR, ArrayValues);
    if (!proto[TO_STRING_TAG]) hide(proto, TO_STRING_TAG, NAME);
    Iterators[NAME] = ArrayValues;
    if (explicit) for (key in $iterators) if (!proto[key]) redefine(proto, key, $iterators[key], true);
  }
}


/***/ }),

/***/ 9942:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ 5817:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {


    var riot = __webpack_require__(2372)
    riot.tag2('ccda-section', '<allergies if="{opts.current.tagName == \'allergies\'}" section="{opts.current}" data="{data}"></allergies> <medications if="{opts.current.tagName == \'medications\'}" section="{opts.current}" data="{data}"></medications> <generic if="{opts.current.tagName == \'generic\'}" section="{opts.current}" data="{data}"></generic>', '', '', function(opts) {
    var options = {
      section: opts.current,
      data: opts.parent.opts.data[opts.current.key]
    };

    var self = this;
    Object.assign({}, this.parent, opts.parent);
    this.current = opts.current;
    this.data = self.parent.opts.data[self.current.key];
    this.on('update', function() {
      self.data = self.parent.opts.data[self.current.key];
    });
});

    
  

/***/ }),

/***/ 4572:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3804);
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _services__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1999);
/* harmony import */ var _services__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_services__WEBPACK_IMPORTED_MODULE_1__);

    var riot = __webpack_require__(2372)
    ;



riot.tag2('header', '<nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top"> <span class="navbar-brand" if="{opts.data}"> {opts.data.document.title} - <name name="{opts.data.demographics.name}" class="text-muted"></name> </span> <span class="navbar-brand" if="{!opts.data}"> Loading... </span> <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation"> <span class="navbar-toggler-icon"></span> </button> <div class="collapse navbar-collapse" id="navbarText"> <ul class="navbar-nav ml-auto"> <li class="nav-item dropdown" if="{opts.sections && opts.sections.length}"> <a class="jump-to nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"> Jump to </a> <div class="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown"> <a class="dropdown-item" href="#">Top</a> <div class="dropdown-divider"></div> <a each="{opts.sections}" class="dropdown-item" href="#{key}"> <i class="fa fa-{icon}" aria-hidden="true"></i> {display} </a> </div> </li> <li class="{active: this.parent.showPreferences}" if="{opts.sections}"> <a class="nav-link dropdown-toggle" href="#" onclick="{showPreferences}"> <i class="fa fa-lg fa-cog"></i> </a> </li> </ul> </div> </nav>', '', '', function(opts) {
    var self = this;
    self.service = new _services__WEBPACK_IMPORTED_MODULE_1__.DocumentsService();

    if (opts.documents && opts.documents.length)
      opts.documents[0].active = true;

    self.load = function(e) {
      e.preventDefault();
      self.toggleActive(e.item);
      self.service.open(e.item).then(function(options) {
        if (!options) return;
        self.parent.showPreferences = !options.pref.isSet;
        self.parent.opts = Object.assign(self.parent.opts, options);
        self.parent.update();
      });
    }

    self.showPreferences = function(e) {
      e.preventDefault();
      self.parent.showPreferences = true;
      self.parent.update();
    }

    self.toggleActive = function(document) {
      lodash__WEBPACK_IMPORTED_MODULE_0__.each(self.opts.documents, function(d) {
        d.active = false;
      });
      document.active = true;
    }

    self.on('update', function() {
      var noneSelected = self.opts.documents && self.opts.documents.filter(function(x) { return x.active; }).length === 0;
      if (noneSelected && self.opts.documents.length)
        self.opts.documents[0].active = true;
    });
});

    
  

/***/ }),

/***/ 8047:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {


    var riot = __webpack_require__(2372)
    riot.tag2('name', '<span>{opts.name.given[0]} {opts.name.family}{possesive}</span>', '', '', function(opts) {
    if (opts.possesive) {
      this.possesive = opts.name.family.slice(-1) === 's' ? '\'' : '\'s';
    }
});

    
  

/***/ }),

/***/ 7731:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {


    var riot = __webpack_require__(2372)
    riot.tag2('nonxml', '<div class="panel panel-default"> <div class="panel-heading"> <h3 class="panel-title"> Document Attachment </h3> </div> <div class="panel-body"> The clinical document you are viewing has an attached document <b>{opts.nonxml.reference}</b>. Please download the document through your EMR. <br> </div>', '', '', function(opts) {
});
    
  

/***/ }),

/***/ 5309:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3804);
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_0__);

    var riot = __webpack_require__(2372)
    ;

riot.tag2('panel', '<div class="panel panel-{opts.state ? opts.state : \'default\'}" id="{opts.section.key}"> <div class="panel-heading section-toggle" onclick="{toggleSection}"> <h3 class="panel-title"> <i class="fa fa-{opts.section.icon} section-icon" aria-hidden="true" if="{!opts.hideicon}"></i> {opts.section.display} <span class="text-muted" if="{isEmpty()}">(empty)</span> <span class="pull-right"> <i class="fa fa-chevron-down {fa-rotate-180: opts.section.enabled}" aria-hidden="true"></i> </span> </h3> </div> <div class="panel-body"> <yield></yield> </div> </div>', '', 'class="{opts.section.tagName}" class="{fade: isEmpty(), expanded: isEnabled(), collapsed: !isEnabled()}"', function(opts) {
    var current;

    this.on('update', function() {
      if (opts.data !== current) {
        current = opts.data;
        if(this.isEmpty()) opts.section.enabled = false;
      }
    }.bind(this));

    this.isEmpty = function() {
      return !opts.data.text;
    }

    this.isEnabled = function() {
      return opts.section.enabled || opts.enabled;
    }

    this.toggleSection = function(e) {
      e.preventDefault();
      opts.section.enabled = !opts.section.enabled;
    }
});

    
  

/***/ }),

/***/ 4089:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var dragula__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(8627);
/* harmony import */ var dragula__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(dragula__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3804);
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _utilities_lodashmixins__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(4845);
/* harmony import */ var _utilities_lodashmixins__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_utilities_lodashmixins__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _models_section__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(7693);
/* harmony import */ var _models_section__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_models_section__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _utilities_htmlhelpers__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(7433);
/* harmony import */ var _utilities_htmlhelpers__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_utilities_htmlhelpers__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _services__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(1999);
/* harmony import */ var _services__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_services__WEBPACK_IMPORTED_MODULE_5__);

    var riot = __webpack_require__(2372)
    ;






riot.tag2('preferences', '<h2> <button class="btn btn-primary pull-right" type="button" name="button" onclick="{save}">Save</button> Which sections would you like to see? <small> <a href="#" onclick="{enableAll}">all</a> | <a href="#" onclick="{disableAll}">none</a> (drag to sort)</small> </h2> <p class="alert-info" if="{!opts.pref.isSet}"> This is the first time you are setting up your section preferences for <b>{opts.pref.type.type} {opts.pref.type.displayName}</b> documents. You can order and select sections that are relevant for the care you are providing and we will save these for future use. </p> <ul class="list-group" id="preferences"> <preference-section each="{opts.sections}"></preference-section> </div>', '', '', function(opts) {
    var self = this;
    this.preferencesService = new _services__WEBPACK_IMPORTED_MODULE_5__.PreferencesService();

    this.on('mount', function () {
      (0,_models_section__WEBPACK_IMPORTED_MODULE_3__.updateSortOrder)();
      var container = document.getElementById('preferences');
      dragula__WEBPACK_IMPORTED_MODULE_0___default()([container], {direction: 'vertical'}).on('drop', drop);
    });

    function drop(el) {
      var from = lodash__WEBPACK_IMPORTED_MODULE_1__.findIndex(opts.sections, { key: el.key });
      var to = (0,_utilities_htmlhelpers__WEBPACK_IMPORTED_MODULE_4__.getElementIndex)(el);
      lodash__WEBPACK_IMPORTED_MODULE_1__.move(opts.sections, from, to);
      (0,_models_section__WEBPACK_IMPORTED_MODULE_3__.updateSortOrder)();
      self.preferencesService.save(opts);
      self.update();
    }

    this.enableAll = function(e) {
      e.preventDefault();
      lodash__WEBPACK_IMPORTED_MODULE_1__.each(opts.sections, function(s) {
        s.enabled = true;
      });
    }

    this.disableAll = function(e) {
      e.preventDefault();
      lodash__WEBPACK_IMPORTED_MODULE_1__.each(opts.sections, function(s) {
        s.enabled = false;
      });
    }

    this.save = function(e) {
      e.preventDefault();
      this.parent.showPreferences = false;
      this.preferencesService.save(opts);
      riot.update();
    }

});

riot.tag2('preference-section', '<li class="list-group-item preferences-section text-right"> <label class="checkbox-inline pull-left"> <input type="checkbox" checked="{enabled}" onchange="{change}"> <i class="fa fa-{icon}"></i> {display} </label> <i class="fa fa-bars" title="Drag to sort"></i> </div>', '', '', function(opts) {
    this.root.key = this.key;

    this.change = function(e) {
      e.item.enabled = e.target.checked;
      this.update();
    }
});

    
  

/***/ }),

/***/ 2415:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _utilities_htmlhelpers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(7433);
/* harmony import */ var _utilities_htmlhelpers__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_utilities_htmlhelpers__WEBPACK_IMPORTED_MODULE_0__);

    var riot = __webpack_require__(2372)
    ;

riot.tag2('raw', '<span></span>', '', '', function(opts) {
    this.root.innerHTML = (0,_utilities_htmlhelpers__WEBPACK_IMPORTED_MODULE_0__.bootstrapize)(opts.content);
    this.on('update', function() {
      this.root.innerHTML = (0,_utilities_htmlhelpers__WEBPACK_IMPORTED_MODULE_0__.bootstrapize)(opts.content);
    }.bind(this));
});

    
  

/***/ }),

/***/ 4424:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {


    var riot = __webpack_require__(2372)
    riot.tag2('allergies', '<panel section="{opts.section}" data="{opts.data}"> <div class="row" if="{opts.data.entries.length}"> <div each="{opts.data.entries}" class="col-sm-4"> <div class="alert alert-mild clearfix " role="alert"> <h4>{allergen.name}</h4> <div class="pull-left">{reaction.name}</div> <div class="pull-right">{severity}</div> </div> </div> </div> <empty if="{!opts.data.entries.length}"></empty> </panel>', '', '', function(opts) {
});

    
  

/***/ }),

/***/ 1375:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {


    var riot = __webpack_require__(2372)
    riot.tag2('care-plan', '<panel section="{opts.section}" data="{opts.data}"> <empty if="{!opts.data.entries.length}"></empty> </panel>', '', '', function(opts) {
});

    
  

/***/ }),

/***/ 5030:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {


    var riot = __webpack_require__(2372)
    riot.tag2('chief-complaint', '<panel section="{opts.section}" data="{opts.data}"> <empty if="{!opts.data.entries.length}"></empty> </panel>', '', '', function(opts) {
});

    
  

/***/ }),

/***/ 2236:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2470);
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(moment__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3804);
/* harmony import */ var lodash__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(lodash__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _utilities_lodashmixins__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(4845);
/* harmony import */ var _utilities_lodashmixins__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_utilities_lodashmixins__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _utilities_lang__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(1493);

    var riot = __webpack_require__(2372)
    ;




riot.tag2('demographics', '<div class="panel panel-default" id="demographics"> <div class="panel-heading"> <h2><name name="{opts.demographics.name}"></name></h2> <a href="#" class="toggle-body" onclick="{toggle}"> <i class="fa fa-chevron-down {fa-rotate-180: visible}" title="Show/hide"></i> </a> <ul class="fa-ul"> <li class="dob"> <i class="fa fa-li fa-birthday-cake" title="DOB"></i> <p>{formatDate(opts.demographics.dob)}</p> </li> <li class="guardian" if="{opts.demographics.guardian.name.family}"> <i class="fa fa-li fa-child" title="Guardian"></i> <name name="{opts.demographics.guardian.name}"></name> <span class="text-muted">(guardian)</span> </li> </ul> </div> <div class="panel-body" show="{visible}"> <ul class="fa-ul"> <li class="narrative"> <i class="fa fa-li" class="{\'fa-female\': opts.demographics.gender === \'female\', \'fa-male\': opts.demographics.gender === \'male\'}" title="Demographics"></i> <p> <strong>{opts.demographics.name.given[0]}</strong> is a <strong>{opts.demographics.marital_status} {opts.demographics.race} {opts.demographics.gender}</strong> whose religion is <strong>{opts.demographics.religion || \'unspecified\'}</strong> and speaks <strong>{formatLanguage(opts.demographics.language)}</strong>. </p> </li> <li if="{addressNotEmpty(opts.demographics.address)}"> <i class="fa fa-li fa-map-marker" title="Address"></i> <address class="address"> <span if="{opts.demographics.address.street[0]}">{opts.demographics.address.street[0]}<br><span> <span if="{opts.demographics.address.city}">{opts.demographics.address.city},</span> {opts.demographics.address.state} {opts.demographics.address.zip} </address> </li> <li if="{opts.demographics.phone}"> <i class="fa fa-li fa-phone" title="Phone"></i> <address class="phone"> {formatPhone(opts.demographics.phone)}</address> </li> <li if="{opts.demographics.provider.organization}"> <i class="fa fa-li fa-building" title="Provider"></i> <p>{opts.demographics.provider.organization}</p> </li> </ul> </div> </div>', '', '', function(opts) {
    this.visible = true;

    this.toggle = function(e) {
      e.preventDefault();
      this.visible = !this.visible;
    }

    this.addressNotEmpty = function(address) {
      return opts.demographics.address.street[0]
        || opts.demographics.address.city
        || opts.demographics.address.state
        || opts.demographics.address.zip;
    };

    this.formatDate = function(date) {
      return moment__WEBPACK_IMPORTED_MODULE_0___default()(date).format('MMM D, YYYY');
    };

    this.formatPhone = function(phone) {

      var p = '';
      // which phone?
      if (phone.work) {
        p = phone.work
      }
      if (phone.home) {
        p = phone.home;
      }
      if (phone.cell) {
        p = phone.cell;
      }

      var clean = "";
      //_.(p).forEach(function(value) {
        //clean = clean + value;
      //});
      for (var i = 0, len = p.length; i < len; i++) {
        if (!isNaN(p[i])) {
          clean = clean + p[i];
        }
      }

      if (clean.length > 10) {
        if (clean[0] == '1') {
          clean = clean.slice(1);
        }
      }

      var pretty = '';
      if (clean.length == 10) {
        var c = clean;
        pretty = '(' + c[0] + c[1] + c[2] + ') ' + c[3] + c[4] + c[5] + '-' + c[6] + c[7] + c[8] + c[9];
      }
      return pretty;
    };

    this.formatLanguage = function(languageCode) {
      return languageCode && _utilities_lang__WEBPACK_IMPORTED_MODULE_3__/* .languages */ .M[languageCode.toLowerCase()] || 'an unknown language';
    };

    // religion: http://www.hl7.org/documentcenter/public_temp_44EED454-1C23-BA17-0CCDE88B4D98F6FD/standards/vocabulary/vocabulary_tables/infrastructure/vocabulary/ReligiousAffiliation.html
});

    
  

/***/ }),

/***/ 7411:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {


    var riot = __webpack_require__(2372)
    riot.tag2('empty', '<span class="text-muted">This section is empty.</span>', '', '', function(opts) {
});

    
  

/***/ }),

/***/ 5498:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {


    var riot = __webpack_require__(2372)
    riot.tag2('encounters', '<panel section="{opts.section}" data="{opts.data}"> <empty if="{!opts.data.entries.length}"></empty> </panel>', '', '', function(opts) {
});

    
  

/***/ }),

/***/ 9310:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {


    var riot = __webpack_require__(2372)
    riot.tag2('functional-status', '<panel section="{opts.section}" data="{opts.data}"> <empty if="{!opts.data.entries.length}"></empty> </panel>', '', '', function(opts) {
});

    
  

/***/ }),

/***/ 6107:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {


    var riot = __webpack_require__(2372)
    riot.tag2('generic', '<panel section="{opts.section}" data="{opts.data}"> <raw content="{opts.data.text}" if="{opts.data.text}"></raw> <empty if="{!opts.data.text}"></empty> </panel>', '', '', function(opts) {
});

    
  

/***/ }),

/***/ 8025:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {


    var riot = __webpack_require__(2372)
    riot.tag2('immunization-declines', '<panel section="{opts.section}" data="{opts.data}"> <empty if="{!opts.data.entries.length}"></empty> </panel>', '', '', function(opts) {
});

    
  

/***/ }),

/***/ 4531:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {


    var riot = __webpack_require__(2372)
    riot.tag2('immunizations', '<panel section="{opts.section}" data="{opts.data}"> <empty if="{!opts.data.entries.length}"></empty> </panel>', '', '', function(opts) {
});
    
  

/***/ }),

/***/ 8056:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {


    var riot = __webpack_require__(2372)
    riot.tag2('instructions', '<panel section="{opts.section}" data="{opts.data}"> <empty if="{!opts.data.entries.length}"></empty> </panel>', '', '', function(opts) {
});

    
  

/***/ }),

/***/ 2775:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2470);
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(moment__WEBPACK_IMPORTED_MODULE_0__);

    var riot = __webpack_require__(2372)
    ;

riot.tag2('medications', '<panel section="{opts.section}" data="{opts.data}"> <div each="{opts.data.entries}"> <div class="row"> <div class="col-md-12"> <div class="header-row"> {text} <span class="header-date pull-right"> <span class="header-small">{date_range.start_display} - {date_range.end_display} </span> </div> </div> </div> <div class="row"> <div class="col-md-12"> </div> </div> <div class="row"> <div class="col-md-4"> <table class="table table-borderless"> <tbody> <tr> <th> <span class="header-small">Admin</span> </th> <td> <span>{administration.name} [{administration.code}]</span> </td> </tr> <tr> <th> <span class="header-small">Schedule</span> </th> <td> <span>{schedule.type} {schedule.period_value}{schedule.period_unit}</span> </td> </tr> <tr> <th> <span class="header-small">Dose</span> </th> <td> <span>{dose_quantity.value} {dose_quantity.unit}</span> </td> </tr> <tr> <th scope="row"> <span class="header-small">Rate</span> </th> <td> <span>{rate_quantity.value} {rate_quantity.unit}</span> </td> </tr> </tbody> </table> </div> <div class="col-md-4"> <table class="table table-borderless"> <tbody> <tr> <th> <span class="header-small">Route</span> </th> <td> <span>{route.name}</span> </td> </tr> <tr> <th> <span class="header-small">Vehicle</span> </th> <td> <span>{vehicle.name} [{vehicle.code_system_name} {vehicle.code}]</span> </td> </tr> <tr> <th> <span class="header-small">Prescriber</span> </th> <td> <span>{prescriber.organization}</span> </td> </tr> <tr> </tr> </tbody> </table> </div> <div class="col-md-4"> <span class="header-small"><b>Reason</b></span> <p class="reasons">{reason.name}</p> </div> </div> </div> </panel>', '', '', function(opts) {

        this.on('update', function() {
            _.each(opts.data.entries, function(e) {
                e.date_range.start_display =  moment__WEBPACK_IMPORTED_MODULE_0___default()(e.date_range.start).format('MMM D, YYYY');
                e.date_range.end_display =  moment__WEBPACK_IMPORTED_MODULE_0___default()(e.date_range.end).format('MMM D, YYYY');
            });
        })

});

    
  

/***/ }),

/***/ 501:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {


    var riot = __webpack_require__(2372)
    riot.tag2('problems', '<panel section="{opts.section}" data="{opts.data}"> <empty if="{!opts.data.entries.length}"></empty> </panel>', '', '', function(opts) {
});

    
  

/***/ }),

/***/ 5661:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {


    var riot = __webpack_require__(2372)
    riot.tag2('procedures', '<panel section="{opts.section}" data="{opts.data}"> <empty if="{!opts.data.entries.length}"></empty> </panel>', '', '', function(opts) {
});

    
  

/***/ }),

/***/ 1267:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {


    var riot = __webpack_require__(2372)
    riot.tag2('results', '<panel section="{opts.section}" data="{opts.data}"> <empty if="{!opts.data.entries.length}"></empty> </panel>', '', '', function(opts) {
});

    
  

/***/ }),

/***/ 1243:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {


    var riot = __webpack_require__(2372)
    riot.tag2('smoking-status', '<panel section="{opts.section}" data="{opts.data}"> <empty if="{!opts.data.entries.length}"></empty> </panel>', '', '', function(opts) {
});

    
  

/***/ }),

/***/ 2657:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {


    var riot = __webpack_require__(2372)
    riot.tag2('vitals', '<panel section="{opts.section}" data="{opts.data}"> <empty if="{!opts.data.entries.length}"></empty> </panel>', '', '', function(opts) {
});

    
  

/***/ }),

/***/ 8525:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {


    var riot = __webpack_require__(2372)
    riot.tag2('sialia', '<header data="{opts.data}" sections="{opts.sections}" documents="{opts.documents}"></header> <div class="container-fluid sialia-body" if="{opts.data}"> <div class="row"> <div class="col-lg-4 col-sm-4"> <demographics demographics="{opts.data.demographics}"></demographics> </div> <div class="col-lg-8 col-sm-8" id="right" if="{showPreferences && !showNonXml}"> <preferences sections="{opts.sections}" pref="{opts.pref}"></preferences> </div> <div class="col-lg-8 col-sm-8" id="right" if="{!showPreferences && !showNonXml}"> <ccda-section each="{section in opts.sections}" current="{section}" parent="{parent}"></ccda-section> </div> <div class="col-lg-8 col-sm-8" id="right" if="{showNonXml}"> <nonxml nonxml="{data.document.type.nonXmlBody}"></nonxml> </div> </div> </div>', '', '', function(opts) {
    var self = this;

    this.on('update', function() {
      // ML - Not showing preferences when the body type is nonXmL.  We just want to show
      // a link to the document.
      self.showNonXml = self.data && self.data.document.type.nonXmlBody.type;
    });
});

    
  

/***/ }),

/***/ 8913:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.IGNORE_SECTIONS = exports.SECTIONS = void 0;
exports.SECTIONS = [
    { key: 'allergies', display: 'Allergies', tagName: 'generic', icon: 'pagelines' },
    { key: 'care_plan', display: 'Care Plan', tagName: 'generic', icon: 'sticky-note-o' },
    { key: 'chief_complaint', display: 'Chief Complaint', tagName: 'generic', icon: 'bullhorn' },
    { key: 'encounters', display: 'Encounters', tagName: 'generic', icon: 'stethoscope' },
    { key: 'functional_statuses', display: 'Functional Status', tagName: 'generic', icon: 'wheelchair' },
    { key: 'immunizations', display: 'Immunizations', tagName: 'generic', icon: 'eyedropper' },
    { key: 'instructions', display: 'Patient Instructions', tagName: 'generic', icon: 'user-md' },
    { key: 'medications', display: 'Medications', tagName: 'generic', icon: 'medkit' },
    { key: 'problems', display: 'Problems', tagName: 'generic', icon: 'exclamation-triangle' },
    { key: 'procedures', display: 'Procedures', tagName: 'generic', icon: 'hospital-o' },
    { key: 'results', display: 'Results', tagName: 'generic', icon: 'flask' },
    { key: 'smoking_status', display: 'Smoking Status', tagName: 'generic', icon: 'fire' },
    { key: 'vitals', display: 'Vitals', tagName: 'generic', icon: 'heartbeat' },
];
exports.IGNORE_SECTIONS = ['document', 'demographics', 'json', 'immunization_declines'];


/***/ }),

/***/ 3607:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__webpack_require__(9942);
__webpack_require__(4217);
__webpack_require__(2065);
__webpack_require__(8135);
__exportStar(__webpack_require__(7063), exports);


/***/ }),

/***/ 9233:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isDocument = void 0;
function isDocument(arg) {
    return arg.url !== undefined;
}
exports.isDocument = isDocument;


/***/ }),

/***/ 7554:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(9233), exports);
__exportStar(__webpack_require__(7693), exports);
__exportStar(__webpack_require__(6874), exports);
__exportStar(__webpack_require__(4624), exports);


/***/ }),

/***/ 4624:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Preferences = void 0;
var lodash_1 = __importDefault(__webpack_require__(3804));
var Preferences = /** @class */ (function () {
    function Preferences(pref) {
        this.id = pref.id;
        this.type = pref.type;
        this.enabledSectionKeys = pref.enabledSectionKeys || [];
        this.sortedSectionKeys = pref.sortedSectionKeys || [];
        this.isSet = pref.isSet;
    }
    Preferences.prototype.isSectionEnabled = function (key) {
        return lodash_1.default.some(this.enabledSectionKeys, function (k) {
            return k === key;
        });
    };
    Preferences.prototype.indexOfSection = function (key) {
        return this.sortedSectionKeys.indexOf(key);
    };
    return Preferences;
}());
exports.Preferences = Preferences;


/***/ }),

/***/ 7693:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.updateSortOrder = void 0;
var lodash_1 = __importDefault(__webpack_require__(3804));
function updateSortOrder(sections) {
    lodash_1.default.each(sections, function (v, k) {
        v.sort = k;
    });
    return sections;
}
exports.updateSortOrder = updateSortOrder;


/***/ }),

/***/ 6874:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ViewerOptions = void 0;
var ViewerOptions = /** @class */ (function () {
    function ViewerOptions() {
    }
    return ViewerOptions;
}());
exports.ViewerOptions = ViewerOptions;


/***/ }),

/***/ 904:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DocumentsService = void 0;
var jquery_1 = __importDefault(__webpack_require__(1273));
var lodash_1 = __importDefault(__webpack_require__(3804));
var bluebutton_1 = __importDefault(__webpack_require__(2399));
var config_1 = __webpack_require__(8913);
var preferences_service_1 = __webpack_require__(4597);
var DocumentsService = /** @class */ (function () {
    function DocumentsService() {
        this.config = {};
    }
    DocumentsService.prototype.setHeaders = function (headers) {
        this.config.headers = headers;
    };
    DocumentsService.prototype.getSections = function (bb, sections, ignoreSections, pref) {
        var allSections = [];
        lodash_1.default.each(bb.data, function (val, key) {
            if (lodash_1.default.includes(ignoreSections, key))
                return;
            var match = lodash_1.default.find(sections, function (s) { return s.key === key; });
            if (match) {
                match.sort = pref.indexOfSection(key);
                allSections.push(match);
            }
            else
                allSections.push({
                    key: key,
                    display: val.displayName || key,
                    tagName: 'generic',
                    icon: 'asterisk',
                    sort: pref.indexOfSection(key)
                });
        });
        // sort by name first, then by sort order
        allSections = lodash_1.default.sortBy(allSections, function (s) { return s.display.toLowerCase(); });
        allSections = lodash_1.default.sortBy(allSections, function (s) { return s.sort; });
        // init sort and enabled
        lodash_1.default.each(allSections, function (val, index) {
            val.enabled = pref.isSectionEnabled(val.key);
        });
        return allSections;
    };
    DocumentsService.prototype.fetch = function (document) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            jquery_1.default.get({
                url: document.url,
                headers: _this.config.headers || {},
                dataType: 'text',
                success: function (content) { return resolve(content); },
                error: function (err) { return reject(err); }
            });
        });
    };
    DocumentsService.prototype.open = function (document) {
        var _this = this;
        if (document.content)
            return Promise.resolve(this.load(document.content));
        return this.fetch(document).then(function (x) { return _this.load(x); });
    };
    DocumentsService.prototype.load = function (data) {
        var bb = bluebutton_1.default(data);
        if (!bb.data)
            throw 'BlueButton could not parse the file.';
        var pref = new preferences_service_1.PreferencesService().getPreferences(bb.data.document.type);
        return {
            sections: this.getSections(bb, config_1.SECTIONS, config_1.IGNORE_SECTIONS, pref),
            data: bb.data,
            pref: pref,
        };
    };
    return DocumentsService;
}());
exports.DocumentsService = DocumentsService;


/***/ }),

/***/ 1999:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(4597), exports);
__exportStar(__webpack_require__(904), exports);


/***/ }),

/***/ 4597:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PreferencesService = void 0;
var models_1 = __webpack_require__(7554);
var lodash_1 = __importDefault(__webpack_require__(3804));
var PreferencesService = /** @class */ (function () {
    function PreferencesService() {
    }
    PreferencesService.prototype.save = function (opts) {
        var enabled = lodash_1.default.filter(opts.sections, function (item) {
            return item.enabled;
        });
        var sortOrder = lodash_1.default.map(opts.sections, function (item) {
            return item.key;
        });
        var pref = this.getPreferences(opts.pref.type);
        pref.enabledSectionKeys = lodash_1.default.map(enabled, function (item) {
            return item.key;
        });
        pref.sortedSectionKeys = sortOrder;
        pref.isSet = true;
        var storageId = 'doc_' + opts.pref.type.templateId;
        localStorage.setItem(storageId, JSON.stringify(pref));
    };
    PreferencesService.prototype.getPreferences = function (docType) {
        var id = docType.templateId;
        var storageId = 'doc_' + id;
        var prefString = localStorage.getItem(storageId);
        var pref = JSON.parse(prefString);
        var isSet = pref !== null;
        if (!isSet) {
            pref = {
                id: id,
                isSet: isSet,
                type: docType,
                enabledSectionKeys: null,
                sortedSectionKeys: null
            };
        }
        return new models_1.Preferences(pref);
    };
    return PreferencesService;
}());
exports.PreferencesService = PreferencesService;


/***/ }),

/***/ 7063:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Sialia = void 0;
var riot_1 = __importDefault(__webpack_require__(2372));
var models_1 = __webpack_require__(7554);
var services_1 = __webpack_require__(1999);
var Sialia = /** @class */ (function () {
    function Sialia(config) {
        this.documentService = new services_1.DocumentsService();
        this.instance = riot_1.default.mount('sialia')[0];
        if (config)
            this.configure(config);
    }
    Sialia.prototype.configure = function (config) {
        // backwards compatibility
        this.documents = (config.docs || []).map(function (x) { return ({
            name: x['Name'] || x.name,
            url: x['Url'] || x.name
        }); });
        this.documentService.setHeaders(__assign({}, (config.headers || {})));
        if (this.documents[0]) {
            this.open(this.documents[0]);
        }
    };
    Sialia.prototype.open = function (documentOrString) {
        var _this = this;
        var document = documentOrString;
        if (!models_1.isDocument(documentOrString)) {
            document = { url: documentOrString };
        }
        if (document) {
            return this.documentService.open(document)
                .then(function (options) {
                options.documents = _this.documents || [document];
                _this.instance.opts = options;
                _this.instance.update();
            });
        }
        this.close();
        return Promise.resolve();
    };
    Sialia.prototype.close = function () {
        this.instance.opts = {};
        this.instance.update();
    };
    return Sialia;
}());
exports.Sialia = Sialia;


/***/ }),

/***/ 2065:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
__webpack_require__(8525);
__webpack_require__(4089);
__webpack_require__(8047);
__webpack_require__(4572);
__webpack_require__(5309);
__webpack_require__(5817);
__webpack_require__(2415);
__webpack_require__(7731);
__webpack_require__(7411);
__webpack_require__(6107);
__webpack_require__(2236);
__webpack_require__(4424);
__webpack_require__(1375);
__webpack_require__(5030);
__webpack_require__(5498);
__webpack_require__(9310);
__webpack_require__(8025);
__webpack_require__(4531);
__webpack_require__(8056);
__webpack_require__(2775);
__webpack_require__(501);
__webpack_require__(5661);
__webpack_require__(1267);
__webpack_require__(1243);
__webpack_require__(2657);


/***/ }),

/***/ 7433:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.bootstrapize = exports.getElementIndex = void 0;
var lodash_1 = __importDefault(__webpack_require__(3804));
var jquery_1 = __importDefault(__webpack_require__(1273));
function getElementIndex(node) {
    var children = lodash_1.default.filter([].slice.call(node.parentNode.childNodes), { nodeType: 1 });
    return Array.prototype.indexOf.call(children, node);
}
exports.getElementIndex = getElementIndex;
function bootstrapize(html) {
    var $html = jquery_1.default('<div />');
    $html.html(html);
    var $all = $html.find('*').removeAttr('width border xmlns');
    $all.filter('table')
        .addClass('table table-bordered table-striped');
    return $html.html();
}
exports.bootstrapize = bootstrapize;


/***/ }),

/***/ 1493:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
exports.M = void 0;
exports.M = {
    'aa': 'Afar',
    'aar': 'Afar',
    'ab': 'Abkhazian',
    'abk': 'Abkhazian',
    'af': 'Afrikaans',
    'afr': 'Afrikaans',
    'am': 'Amharic',
    'amh': 'Amharic',
    'ar': 'Arabic',
    'ara': 'Arabic',
    'as': 'Assamese',
    'asm': 'Assamese',
    'ay': 'Aymara',
    'aym': 'Aymara',
    'az': 'Azerbaijani',
    'aze': 'Azerbaijani',
    'ba': 'Bashkir',
    'bak': 'Bashkir',
    'be': 'Byelorussian (Belarusian)',
    'bel': 'Byelorussian (Belarusian)',
    'bg': 'Bulgarian',
    'bul': 'Bulgarian',
    'bh': 'Bihari',
    'bih': 'Bihari',
    'bi': 'Bislama',
    'bis': 'Bislama',
    'bn': 'Bengali (Bangla)',
    'ben': 'Bengali (Bangla)',
    'bo': 'Tibetan',
    'bod': 'Tibetan',
    'br': 'Breton',
    'bre': 'Breton',
    'ca': 'Catalan',
    'cat': 'Catalan',
    'co': 'Corsican',
    'cos': 'Corsican',
    'cs': 'Czech',
    'ces': 'Czech',
    'cy': 'Welsh',
    'cym': 'Welsh',
    'da': 'Danish',
    'dan': 'Danish',
    'de': 'German',
    'deu': 'German',
    'dz': 'Bhutani',
    'dzo': 'Bhutani',
    'el': 'Greek',
    'ell': 'Greek',
    'en': 'English',
    'eng': 'English',
    'eo': 'Esperanto',
    'epo': 'Esperanto',
    'es': 'Spanish',
    'spa': 'Spanish',
    'et': 'Estonian',
    'est': 'Estonian',
    'eu': 'Basque',
    'euq': 'Basque',
    'fa': 'Farsi',
    'fas': 'Farsi',
    'fi': 'Finnish',
    'fin': 'Finnish',
    'fj': 'Fijian',
    'fij': 'Fijian',
    'fo': 'Faeroese',
    'fr': 'French',
    'fra': 'French',
    'fy': 'Frisian',
    'fry': 'Frisian',
    'ga': 'Irish',
    'gle': 'Irish',
    'gd': 'Gaelic (Scottish)',
    'gla': 'Gaelic (Scottish)',
    'gl': 'Galician',
    'glg': 'Galician',
    'gn': 'Guarani',
    'grn': 'Guarani',
    'gu': 'Gujarati',
    'guj': 'Gujarati',
    // marker - need iso 639-2 for remaining langages
    'gv': 'Gaelic (Manx)',
    'ha': 'Hausa',
    'he': 'Hebrew',
    'hi': 'Hindi',
    'hr': 'Croatian',
    'hu': 'Hungarian',
    'hy': 'Armenian',
    'ia': 'Interlingua',
    'id': 'Indonesian',
    'ie': 'Interlingue',
    'ik': 'Inupiak',
    'is': 'Icelandic',
    'it': 'Italian',
    'iu': 'Inuktitut',
    'ja': 'Japanese',
    // 'ja': 'Javanese',
    'ka': 'Georgian',
    'kk': 'Kazakh',
    'kl': 'Greenlandic',
    'km': 'Cambodian',
    'kn': 'Kannada',
    'ko': 'Korean',
    'ks': 'Kashmiri',
    'ku': 'Kurdish',
    'ky': 'Kirghiz',
    'la': 'Latin',
    'li': 'Limburgish ( Limburger)',
    'ln': 'Lingala',
    'lo': 'Laothian',
    'lt': 'Lithuanian',
    'lv': 'Latvian (Lettish)',
    'mg': 'Malagasy',
    'mi': 'Maori',
    'mk': 'Macedonian',
    'ml': 'Malayalam',
    'mn': 'Mongolian',
    'mo': 'Moldavian',
    'mr': 'Marathi',
    'ms': 'Malay',
    'mt': 'Maltese',
    'my': 'Burmese',
    'na': 'Nauru',
    'ne': 'Nepali',
    'nl': 'Dutch',
    'no': 'Norwegian',
    'oc': 'Occitan',
    'om': 'Oromo (Afan, Galla)',
    'or': 'Oriya',
    'pa': 'Punjabi',
    'pl': 'Polish',
    'ps': 'Pashto (Pushto)',
    'pt': 'Portuguese',
    'qu': 'Quechua',
    'rm': 'Rhaeto-Romance',
    'rn': 'Kirundi (Rundi)',
    'ro': 'Romanian',
    'ru': 'Russian',
    'rw': 'Kinyarwanda (Ruanda)',
    'sa': 'Sanskrit',
    'sd': 'Sindhi',
    'sg': 'Sangro',
    'sh': 'Serbo-Croatian',
    'si': 'Sinhalese',
    'sk': 'Slovak',
    'sl': 'Slovenian',
    'sm': 'Samoan',
    'sn': 'Shona',
    'so': 'Somali',
    'sq': 'Albanian',
    'sr': 'Serbian',
    'ss': 'Siswati',
    'st': 'Sesotho',
    'su': 'Sundanese',
    'sv': 'Swedish',
    'sw': 'Swahili (Kiswahili)',
    'ta': 'Tamil',
    'te': 'Telugu',
    'tg': 'Tajik',
    'th': 'Thai',
    'ti': 'Tigrinya',
    'tk': 'Turkmen',
    'tl': 'Tagalog',
    'tn': 'Setswana',
    'to': 'Tonga',
    'tr': 'Turkish',
    'ts': 'Tsonga',
    'tt': 'Tatar',
    'tw': 'Twi',
    'ug': 'Uighur',
    'uk': 'Ukrainian',
    'ur': 'Urdu',
    'uz': 'Uzbek',
    'vi': 'Vietnamese',
    'vo': 'Volapük',
    'wo': 'Wolof',
    'xh': 'Xhosa',
    'yi': 'Yiddish',
    'yo': 'Yoruba',
    // 'zh': 'Chinese (Simplified)',
    // 'zh': 'Chinese (Traditional)',
    'zh': 'Chinese',
    'zu': 'Zulu',
};


/***/ }),

/***/ 4845:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
var lodash_1 = __importDefault(__webpack_require__(3804));
lodash_1.default.mixin({
    move: function (array, fromIndex, toIndex) {
        array.splice(toIndex, 0, array.splice(fromIndex, 1)[0]);
        return array;
    }
});


/***/ }),

/***/ 647:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

function DOMParser(options){
	this.options = options ||{locator:{}};
}

DOMParser.prototype.parseFromString = function(source,mimeType){
	var options = this.options;
	var sax =  new XMLReader();
	var domBuilder = options.domBuilder || new DOMHandler();//contentHandler and LexicalHandler
	var errorHandler = options.errorHandler;
	var locator = options.locator;
	var defaultNSMap = options.xmlns||{};
	var isHTML = /\/x?html?$/.test(mimeType);//mimeType.toLowerCase().indexOf('html') > -1;
  	var entityMap = isHTML?htmlEntity.entityMap:{'lt':'<','gt':'>','amp':'&','quot':'"','apos':"'"};
	if(locator){
		domBuilder.setDocumentLocator(locator)
	}

	sax.errorHandler = buildErrorHandler(errorHandler,domBuilder,locator);
	sax.domBuilder = options.domBuilder || domBuilder;
	if(isHTML){
		defaultNSMap['']= 'http://www.w3.org/1999/xhtml';
	}
	defaultNSMap.xml = defaultNSMap.xml || 'http://www.w3.org/XML/1998/namespace';
	if(source && typeof source === 'string'){
		sax.parse(source,defaultNSMap,entityMap);
	}else{
		sax.errorHandler.error("invalid doc source");
	}
	return domBuilder.doc;
}
function buildErrorHandler(errorImpl,domBuilder,locator){
	if(!errorImpl){
		if(domBuilder instanceof DOMHandler){
			return domBuilder;
		}
		errorImpl = domBuilder ;
	}
	var errorHandler = {}
	var isCallback = errorImpl instanceof Function;
	locator = locator||{}
	function build(key){
		var fn = errorImpl[key];
		if(!fn && isCallback){
			fn = errorImpl.length == 2?function(msg){errorImpl(key,msg)}:errorImpl;
		}
		errorHandler[key] = fn && function(msg){
			fn('[xmldom '+key+']\t'+msg+_locator(locator));
		}||function(){};
	}
	build('warning');
	build('error');
	build('fatalError');
	return errorHandler;
}

//console.log('#\n\n\n\n\n\n\n####')
/**
 * +ContentHandler+ErrorHandler
 * +LexicalHandler+EntityResolver2
 * -DeclHandler-DTDHandler
 *
 * DefaultHandler:EntityResolver, DTDHandler, ContentHandler, ErrorHandler
 * DefaultHandler2:DefaultHandler,LexicalHandler, DeclHandler, EntityResolver2
 * @link http://www.saxproject.org/apidoc/org/xml/sax/helpers/DefaultHandler.html
 */
function DOMHandler() {
    this.cdata = false;
}
function position(locator,node){
	node.lineNumber = locator.lineNumber;
	node.columnNumber = locator.columnNumber;
}
/**
 * @see org.xml.sax.ContentHandler#startDocument
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ContentHandler.html
 */
DOMHandler.prototype = {
	startDocument : function() {
    	this.doc = new DOMImplementation().createDocument(null, null, null);
    	if (this.locator) {
        	this.doc.documentURI = this.locator.systemId;
    	}
	},
	startElement:function(namespaceURI, localName, qName, attrs) {
		var doc = this.doc;
	    var el = doc.createElementNS(namespaceURI, qName||localName);
	    var len = attrs.length;
	    appendElement(this, el);
	    this.currentElement = el;

		this.locator && position(this.locator,el)
	    for (var i = 0 ; i < len; i++) {
	        var namespaceURI = attrs.getURI(i);
	        var value = attrs.getValue(i);
	        var qName = attrs.getQName(i);
			var attr = doc.createAttributeNS(namespaceURI, qName);
			this.locator &&position(attrs.getLocator(i),attr);
			attr.value = attr.nodeValue = value;
			el.setAttributeNode(attr)
	    }
	},
	endElement:function(namespaceURI, localName, qName) {
		var current = this.currentElement
		var tagName = current.tagName;
		this.currentElement = current.parentNode;
	},
	startPrefixMapping:function(prefix, uri) {
	},
	endPrefixMapping:function(prefix) {
	},
	processingInstruction:function(target, data) {
	    var ins = this.doc.createProcessingInstruction(target, data);
	    this.locator && position(this.locator,ins)
	    appendElement(this, ins);
	},
	ignorableWhitespace:function(ch, start, length) {
	},
	characters:function(chars, start, length) {
		chars = _toString.apply(this,arguments)
		//console.log(chars)
		if(chars){
			if (this.cdata) {
				var charNode = this.doc.createCDATASection(chars);
			} else {
				var charNode = this.doc.createTextNode(chars);
			}
			if(this.currentElement){
				this.currentElement.appendChild(charNode);
			}else if(/^\s*$/.test(chars)){
				this.doc.appendChild(charNode);
				//process xml
			}
			this.locator && position(this.locator,charNode)
		}
	},
	skippedEntity:function(name) {
	},
	endDocument:function() {
		this.doc.normalize();
	},
	setDocumentLocator:function (locator) {
	    if(this.locator = locator){// && !('lineNumber' in locator)){
	    	locator.lineNumber = 0;
	    }
	},
	//LexicalHandler
	comment:function(chars, start, length) {
		chars = _toString.apply(this,arguments)
	    var comm = this.doc.createComment(chars);
	    this.locator && position(this.locator,comm)
	    appendElement(this, comm);
	},

	startCDATA:function() {
	    //used in characters() methods
	    this.cdata = true;
	},
	endCDATA:function() {
	    this.cdata = false;
	},

	startDTD:function(name, publicId, systemId) {
		var impl = this.doc.implementation;
	    if (impl && impl.createDocumentType) {
	        var dt = impl.createDocumentType(name, publicId, systemId);
	        this.locator && position(this.locator,dt)
	        appendElement(this, dt);
	    }
	},
	/**
	 * @see org.xml.sax.ErrorHandler
	 * @link http://www.saxproject.org/apidoc/org/xml/sax/ErrorHandler.html
	 */
	warning:function(error) {
		console.warn('[xmldom warning]\t'+error,_locator(this.locator));
	},
	error:function(error) {
		console.error('[xmldom error]\t'+error,_locator(this.locator));
	},
	fatalError:function(error) {
		throw new ParseError(error, this.locator);
	}
}
function _locator(l){
	if(l){
		return '\n@'+(l.systemId ||'')+'#[line:'+l.lineNumber+',col:'+l.columnNumber+']'
	}
}
function _toString(chars,start,length){
	if(typeof chars == 'string'){
		return chars.substr(start,length)
	}else{//java sax connect width xmldom on rhino(what about: "? && !(chars instanceof String)")
		if(chars.length >= start+length || start){
			return new java.lang.String(chars,start,length)+'';
		}
		return chars;
	}
}

/*
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/LexicalHandler.html
 * used method of org.xml.sax.ext.LexicalHandler:
 *  #comment(chars, start, length)
 *  #startCDATA()
 *  #endCDATA()
 *  #startDTD(name, publicId, systemId)
 *
 *
 * IGNORED method of org.xml.sax.ext.LexicalHandler:
 *  #endDTD()
 *  #startEntity(name)
 *  #endEntity(name)
 *
 *
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/DeclHandler.html
 * IGNORED method of org.xml.sax.ext.DeclHandler
 * 	#attributeDecl(eName, aName, type, mode, value)
 *  #elementDecl(name, model)
 *  #externalEntityDecl(name, publicId, systemId)
 *  #internalEntityDecl(name, value)
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/EntityResolver2.html
 * IGNORED method of org.xml.sax.EntityResolver2
 *  #resolveEntity(String name,String publicId,String baseURI,String systemId)
 *  #resolveEntity(publicId, systemId)
 *  #getExternalSubset(name, baseURI)
 * @link http://www.saxproject.org/apidoc/org/xml/sax/DTDHandler.html
 * IGNORED method of org.xml.sax.DTDHandler
 *  #notationDecl(name, publicId, systemId) {};
 *  #unparsedEntityDecl(name, publicId, systemId, notationName) {};
 */
"endDTD,startEntity,endEntity,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,resolveEntity,getExternalSubset,notationDecl,unparsedEntityDecl".replace(/\w+/g,function(key){
	DOMHandler.prototype[key] = function(){return null}
})

/* Private static helpers treated below as private instance methods, so don't need to add these to the public API; we might use a Relator to also get rid of non-standard public properties */
function appendElement (hander,node) {
    if (!hander.currentElement) {
        hander.doc.appendChild(node);
    } else {
        hander.currentElement.appendChild(node);
    }
}//appendChild and setAttributeNS are preformance key

//if(typeof require == 'function'){
var htmlEntity = __webpack_require__(3791);
var sax = __webpack_require__(8275);
var XMLReader = sax.XMLReader;
var ParseError = sax.ParseError;
var DOMImplementation = exports.DOMImplementation = __webpack_require__(9034).DOMImplementation;
exports.XMLSerializer = __webpack_require__(9034).XMLSerializer ;
exports.DOMParser = DOMParser;
exports.__DOMHandler = DOMHandler;
//}


/***/ }),

/***/ 9034:
/***/ ((__unused_webpack_module, exports) => {

var __webpack_unused_export__;
function copy(src,dest){
	for(var p in src){
		dest[p] = src[p];
	}
}
/**
^\w+\.prototype\.([_\w]+)\s*=\s*((?:.*\{\s*?[\r\n][\s\S]*?^})|\S.*?(?=[;\r\n]));?
^\w+\.prototype\.([_\w]+)\s*=\s*(\S.*?(?=[;\r\n]));?
 */
function _extends(Class,Super){
	var pt = Class.prototype;
	if(!(pt instanceof Super)){
		function t(){};
		t.prototype = Super.prototype;
		t = new t();
		copy(pt,t);
		Class.prototype = pt = t;
	}
	if(pt.constructor != Class){
		if(typeof Class != 'function'){
			console.error("unknow Class:"+Class)
		}
		pt.constructor = Class
	}
}
var htmlns = 'http://www.w3.org/1999/xhtml' ;
// Node Types
var NodeType = {}
var ELEMENT_NODE                = NodeType.ELEMENT_NODE                = 1;
var ATTRIBUTE_NODE              = NodeType.ATTRIBUTE_NODE              = 2;
var TEXT_NODE                   = NodeType.TEXT_NODE                   = 3;
var CDATA_SECTION_NODE          = NodeType.CDATA_SECTION_NODE          = 4;
var ENTITY_REFERENCE_NODE       = NodeType.ENTITY_REFERENCE_NODE       = 5;
var ENTITY_NODE                 = NodeType.ENTITY_NODE                 = 6;
var PROCESSING_INSTRUCTION_NODE = NodeType.PROCESSING_INSTRUCTION_NODE = 7;
var COMMENT_NODE                = NodeType.COMMENT_NODE                = 8;
var DOCUMENT_NODE               = NodeType.DOCUMENT_NODE               = 9;
var DOCUMENT_TYPE_NODE          = NodeType.DOCUMENT_TYPE_NODE          = 10;
var DOCUMENT_FRAGMENT_NODE      = NodeType.DOCUMENT_FRAGMENT_NODE      = 11;
var NOTATION_NODE               = NodeType.NOTATION_NODE               = 12;

// ExceptionCode
var ExceptionCode = {}
var ExceptionMessage = {};
var INDEX_SIZE_ERR              = ExceptionCode.INDEX_SIZE_ERR              = ((ExceptionMessage[1]="Index size error"),1);
var DOMSTRING_SIZE_ERR          = ExceptionCode.DOMSTRING_SIZE_ERR          = ((ExceptionMessage[2]="DOMString size error"),2);
var HIERARCHY_REQUEST_ERR       = ExceptionCode.HIERARCHY_REQUEST_ERR       = ((ExceptionMessage[3]="Hierarchy request error"),3);
var WRONG_DOCUMENT_ERR          = ExceptionCode.WRONG_DOCUMENT_ERR          = ((ExceptionMessage[4]="Wrong document"),4);
var INVALID_CHARACTER_ERR       = ExceptionCode.INVALID_CHARACTER_ERR       = ((ExceptionMessage[5]="Invalid character"),5);
var NO_DATA_ALLOWED_ERR         = ExceptionCode.NO_DATA_ALLOWED_ERR         = ((ExceptionMessage[6]="No data allowed"),6);
var NO_MODIFICATION_ALLOWED_ERR = ExceptionCode.NO_MODIFICATION_ALLOWED_ERR = ((ExceptionMessage[7]="No modification allowed"),7);
var NOT_FOUND_ERR               = ExceptionCode.NOT_FOUND_ERR               = ((ExceptionMessage[8]="Not found"),8);
var NOT_SUPPORTED_ERR           = ExceptionCode.NOT_SUPPORTED_ERR           = ((ExceptionMessage[9]="Not supported"),9);
var INUSE_ATTRIBUTE_ERR         = ExceptionCode.INUSE_ATTRIBUTE_ERR         = ((ExceptionMessage[10]="Attribute in use"),10);
//level2
var INVALID_STATE_ERR        	= ExceptionCode.INVALID_STATE_ERR        	= ((ExceptionMessage[11]="Invalid state"),11);
var SYNTAX_ERR               	= ExceptionCode.SYNTAX_ERR               	= ((ExceptionMessage[12]="Syntax error"),12);
var INVALID_MODIFICATION_ERR 	= ExceptionCode.INVALID_MODIFICATION_ERR 	= ((ExceptionMessage[13]="Invalid modification"),13);
var NAMESPACE_ERR            	= ExceptionCode.NAMESPACE_ERR           	= ((ExceptionMessage[14]="Invalid namespace"),14);
var INVALID_ACCESS_ERR       	= ExceptionCode.INVALID_ACCESS_ERR      	= ((ExceptionMessage[15]="Invalid access"),15);

/**
 * DOM Level 2
 * Object DOMException
 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/ecma-script-binding.html
 * @see http://www.w3.org/TR/REC-DOM-Level-1/ecma-script-language-binding.html
 */
function DOMException(code, message) {
	if(message instanceof Error){
		var error = message;
	}else{
		error = this;
		Error.call(this, ExceptionMessage[code]);
		this.message = ExceptionMessage[code];
		if(Error.captureStackTrace) Error.captureStackTrace(this, DOMException);
	}
	error.code = code;
	if(message) this.message = this.message + ": " + message;
	return error;
};
DOMException.prototype = Error.prototype;
copy(ExceptionCode,DOMException)
/**
 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-536297177
 * The NodeList interface provides the abstraction of an ordered collection of nodes, without defining or constraining how this collection is implemented. NodeList objects in the DOM are live.
 * The items in the NodeList are accessible via an integral index, starting from 0.
 */
function NodeList() {
};
NodeList.prototype = {
	/**
	 * The number of nodes in the list. The range of valid child node indices is 0 to length-1 inclusive.
	 * @standard level1
	 */
	length:0, 
	/**
	 * Returns the indexth item in the collection. If index is greater than or equal to the number of nodes in the list, this returns null.
	 * @standard level1
	 * @param index  unsigned long 
	 *   Index into the collection.
	 * @return Node
	 * 	The node at the indexth position in the NodeList, or null if that is not a valid index. 
	 */
	item: function(index) {
		return this[index] || null;
	},
	toString:function(isHTML,nodeFilter){
		for(var buf = [], i = 0;i<this.length;i++){
			serializeToString(this[i],buf,isHTML,nodeFilter);
		}
		return buf.join('');
	}
};
function LiveNodeList(node,refresh){
	this._node = node;
	this._refresh = refresh
	_updateLiveList(this);
}
function _updateLiveList(list){
	var inc = list._node._inc || list._node.ownerDocument._inc;
	if(list._inc != inc){
		var ls = list._refresh(list._node);
		//console.log(ls.length)
		__set__(list,'length',ls.length);
		copy(ls,list);
		list._inc = inc;
	}
}
LiveNodeList.prototype.item = function(i){
	_updateLiveList(this);
	return this[i];
}

_extends(LiveNodeList,NodeList);
/**
 * 
 * Objects implementing the NamedNodeMap interface are used to represent collections of nodes that can be accessed by name. Note that NamedNodeMap does not inherit from NodeList; NamedNodeMaps are not maintained in any particular order. Objects contained in an object implementing NamedNodeMap may also be accessed by an ordinal index, but this is simply to allow convenient enumeration of the contents of a NamedNodeMap, and does not imply that the DOM specifies an order to these Nodes.
 * NamedNodeMap objects in the DOM are live.
 * used for attributes or DocumentType entities 
 */
function NamedNodeMap() {
};

function _findNodeIndex(list,node){
	var i = list.length;
	while(i--){
		if(list[i] === node){return i}
	}
}

function _addNamedNode(el,list,newAttr,oldAttr){
	if(oldAttr){
		list[_findNodeIndex(list,oldAttr)] = newAttr;
	}else{
		list[list.length++] = newAttr;
	}
	if(el){
		newAttr.ownerElement = el;
		var doc = el.ownerDocument;
		if(doc){
			oldAttr && _onRemoveAttribute(doc,el,oldAttr);
			_onAddAttribute(doc,el,newAttr);
		}
	}
}
function _removeNamedNode(el,list,attr){
	//console.log('remove attr:'+attr)
	var i = _findNodeIndex(list,attr);
	if(i>=0){
		var lastIndex = list.length-1
		while(i<lastIndex){
			list[i] = list[++i]
		}
		list.length = lastIndex;
		if(el){
			var doc = el.ownerDocument;
			if(doc){
				_onRemoveAttribute(doc,el,attr);
				attr.ownerElement = null;
			}
		}
	}else{
		throw DOMException(NOT_FOUND_ERR,new Error(el.tagName+'@'+attr))
	}
}
NamedNodeMap.prototype = {
	length:0,
	item:NodeList.prototype.item,
	getNamedItem: function(key) {
//		if(key.indexOf(':')>0 || key == 'xmlns'){
//			return null;
//		}
		//console.log()
		var i = this.length;
		while(i--){
			var attr = this[i];
			//console.log(attr.nodeName,key)
			if(attr.nodeName == key){
				return attr;
			}
		}
	},
	setNamedItem: function(attr) {
		var el = attr.ownerElement;
		if(el && el!=this._ownerElement){
			throw new DOMException(INUSE_ATTRIBUTE_ERR);
		}
		var oldAttr = this.getNamedItem(attr.nodeName);
		_addNamedNode(this._ownerElement,this,attr,oldAttr);
		return oldAttr;
	},
	/* returns Node */
	setNamedItemNS: function(attr) {// raises: WRONG_DOCUMENT_ERR,NO_MODIFICATION_ALLOWED_ERR,INUSE_ATTRIBUTE_ERR
		var el = attr.ownerElement, oldAttr;
		if(el && el!=this._ownerElement){
			throw new DOMException(INUSE_ATTRIBUTE_ERR);
		}
		oldAttr = this.getNamedItemNS(attr.namespaceURI,attr.localName);
		_addNamedNode(this._ownerElement,this,attr,oldAttr);
		return oldAttr;
	},

	/* returns Node */
	removeNamedItem: function(key) {
		var attr = this.getNamedItem(key);
		_removeNamedNode(this._ownerElement,this,attr);
		return attr;
		
		
	},// raises: NOT_FOUND_ERR,NO_MODIFICATION_ALLOWED_ERR
	
	//for level2
	removeNamedItemNS:function(namespaceURI,localName){
		var attr = this.getNamedItemNS(namespaceURI,localName);
		_removeNamedNode(this._ownerElement,this,attr);
		return attr;
	},
	getNamedItemNS: function(namespaceURI, localName) {
		var i = this.length;
		while(i--){
			var node = this[i];
			if(node.localName == localName && node.namespaceURI == namespaceURI){
				return node;
			}
		}
		return null;
	}
};
/**
 * @see http://www.w3.org/TR/REC-DOM-Level-1/level-one-core.html#ID-102161490
 */
function DOMImplementation(/* Object */ features) {
	this._features = {};
	if (features) {
		for (var feature in features) {
			 this._features = features[feature];
		}
	}
};

DOMImplementation.prototype = {
	hasFeature: function(/* string */ feature, /* string */ version) {
		var versions = this._features[feature.toLowerCase()];
		if (versions && (!version || version in versions)) {
			return true;
		} else {
			return false;
		}
	},
	// Introduced in DOM Level 2:
	createDocument:function(namespaceURI,  qualifiedName, doctype){// raises:INVALID_CHARACTER_ERR,NAMESPACE_ERR,WRONG_DOCUMENT_ERR
		var doc = new Document();
		doc.implementation = this;
		doc.childNodes = new NodeList();
		doc.doctype = doctype;
		if(doctype){
			doc.appendChild(doctype);
		}
		if(qualifiedName){
			var root = doc.createElementNS(namespaceURI,qualifiedName);
			doc.appendChild(root);
		}
		return doc;
	},
	// Introduced in DOM Level 2:
	createDocumentType:function(qualifiedName, publicId, systemId){// raises:INVALID_CHARACTER_ERR,NAMESPACE_ERR
		var node = new DocumentType();
		node.name = qualifiedName;
		node.nodeName = qualifiedName;
		node.publicId = publicId;
		node.systemId = systemId;
		// Introduced in DOM Level 2:
		//readonly attribute DOMString        internalSubset;
		
		//TODO:..
		//  readonly attribute NamedNodeMap     entities;
		//  readonly attribute NamedNodeMap     notations;
		return node;
	}
};


/**
 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-1950641247
 */

function Node() {
};

Node.prototype = {
	firstChild : null,
	lastChild : null,
	previousSibling : null,
	nextSibling : null,
	attributes : null,
	parentNode : null,
	childNodes : null,
	ownerDocument : null,
	nodeValue : null,
	namespaceURI : null,
	prefix : null,
	localName : null,
	// Modified in DOM Level 2:
	insertBefore:function(newChild, refChild){//raises 
		return _insertBefore(this,newChild,refChild);
	},
	replaceChild:function(newChild, oldChild){//raises 
		this.insertBefore(newChild,oldChild);
		if(oldChild){
			this.removeChild(oldChild);
		}
	},
	removeChild:function(oldChild){
		return _removeChild(this,oldChild);
	},
	appendChild:function(newChild){
		return this.insertBefore(newChild,null);
	},
	hasChildNodes:function(){
		return this.firstChild != null;
	},
	cloneNode:function(deep){
		return cloneNode(this.ownerDocument||this,this,deep);
	},
	// Modified in DOM Level 2:
	normalize:function(){
		var child = this.firstChild;
		while(child){
			var next = child.nextSibling;
			if(next && next.nodeType == TEXT_NODE && child.nodeType == TEXT_NODE){
				this.removeChild(next);
				child.appendData(next.data);
			}else{
				child.normalize();
				child = next;
			}
		}
	},
  	// Introduced in DOM Level 2:
	isSupported:function(feature, version){
		return this.ownerDocument.implementation.hasFeature(feature,version);
	},
    // Introduced in DOM Level 2:
    hasAttributes:function(){
    	return this.attributes.length>0;
    },
    lookupPrefix:function(namespaceURI){
    	var el = this;
    	while(el){
    		var map = el._nsMap;
    		//console.dir(map)
    		if(map){
    			for(var n in map){
    				if(map[n] == namespaceURI){
    					return n;
    				}
    			}
    		}
    		el = el.nodeType == ATTRIBUTE_NODE?el.ownerDocument : el.parentNode;
    	}
    	return null;
    },
    // Introduced in DOM Level 3:
    lookupNamespaceURI:function(prefix){
    	var el = this;
    	while(el){
    		var map = el._nsMap;
    		//console.dir(map)
    		if(map){
    			if(prefix in map){
    				return map[prefix] ;
    			}
    		}
    		el = el.nodeType == ATTRIBUTE_NODE?el.ownerDocument : el.parentNode;
    	}
    	return null;
    },
    // Introduced in DOM Level 3:
    isDefaultNamespace:function(namespaceURI){
    	var prefix = this.lookupPrefix(namespaceURI);
    	return prefix == null;
    }
};


function _xmlEncoder(c){
	return c == '<' && '&lt;' ||
         c == '>' && '&gt;' ||
         c == '&' && '&amp;' ||
         c == '"' && '&quot;' ||
         '&#'+c.charCodeAt()+';'
}


copy(NodeType,Node);
copy(NodeType,Node.prototype);

/**
 * @param callback return true for continue,false for break
 * @return boolean true: break visit;
 */
function _visitNode(node,callback){
	if(callback(node)){
		return true;
	}
	if(node = node.firstChild){
		do{
			if(_visitNode(node,callback)){return true}
        }while(node=node.nextSibling)
    }
}



function Document(){
}
function _onAddAttribute(doc,el,newAttr){
	doc && doc._inc++;
	var ns = newAttr.namespaceURI ;
	if(ns == 'http://www.w3.org/2000/xmlns/'){
		//update namespace
		el._nsMap[newAttr.prefix?newAttr.localName:''] = newAttr.value
	}
}
function _onRemoveAttribute(doc,el,newAttr,remove){
	doc && doc._inc++;
	var ns = newAttr.namespaceURI ;
	if(ns == 'http://www.w3.org/2000/xmlns/'){
		//update namespace
		delete el._nsMap[newAttr.prefix?newAttr.localName:'']
	}
}
function _onUpdateChild(doc,el,newChild){
	if(doc && doc._inc){
		doc._inc++;
		//update childNodes
		var cs = el.childNodes;
		if(newChild){
			cs[cs.length++] = newChild;
		}else{
			//console.log(1)
			var child = el.firstChild;
			var i = 0;
			while(child){
				cs[i++] = child;
				child =child.nextSibling;
			}
			cs.length = i;
		}
	}
}

/**
 * attributes;
 * children;
 * 
 * writeable properties:
 * nodeValue,Attr:value,CharacterData:data
 * prefix
 */
function _removeChild(parentNode,child){
	var previous = child.previousSibling;
	var next = child.nextSibling;
	if(previous){
		previous.nextSibling = next;
	}else{
		parentNode.firstChild = next
	}
	if(next){
		next.previousSibling = previous;
	}else{
		parentNode.lastChild = previous;
	}
	_onUpdateChild(parentNode.ownerDocument,parentNode);
	return child;
}
/**
 * preformance key(refChild == null)
 */
function _insertBefore(parentNode,newChild,nextChild){
	var cp = newChild.parentNode;
	if(cp){
		cp.removeChild(newChild);//remove and update
	}
	if(newChild.nodeType === DOCUMENT_FRAGMENT_NODE){
		var newFirst = newChild.firstChild;
		if (newFirst == null) {
			return newChild;
		}
		var newLast = newChild.lastChild;
	}else{
		newFirst = newLast = newChild;
	}
	var pre = nextChild ? nextChild.previousSibling : parentNode.lastChild;

	newFirst.previousSibling = pre;
	newLast.nextSibling = nextChild;
	
	
	if(pre){
		pre.nextSibling = newFirst;
	}else{
		parentNode.firstChild = newFirst;
	}
	if(nextChild == null){
		parentNode.lastChild = newLast;
	}else{
		nextChild.previousSibling = newLast;
	}
	do{
		newFirst.parentNode = parentNode;
	}while(newFirst !== newLast && (newFirst= newFirst.nextSibling))
	_onUpdateChild(parentNode.ownerDocument||parentNode,parentNode);
	//console.log(parentNode.lastChild.nextSibling == null)
	if (newChild.nodeType == DOCUMENT_FRAGMENT_NODE) {
		newChild.firstChild = newChild.lastChild = null;
	}
	return newChild;
}
function _appendSingleChild(parentNode,newChild){
	var cp = newChild.parentNode;
	if(cp){
		var pre = parentNode.lastChild;
		cp.removeChild(newChild);//remove and update
		var pre = parentNode.lastChild;
	}
	var pre = parentNode.lastChild;
	newChild.parentNode = parentNode;
	newChild.previousSibling = pre;
	newChild.nextSibling = null;
	if(pre){
		pre.nextSibling = newChild;
	}else{
		parentNode.firstChild = newChild;
	}
	parentNode.lastChild = newChild;
	_onUpdateChild(parentNode.ownerDocument,parentNode,newChild);
	return newChild;
	//console.log("__aa",parentNode.lastChild.nextSibling == null)
}
Document.prototype = {
	//implementation : null,
	nodeName :  '#document',
	nodeType :  DOCUMENT_NODE,
	doctype :  null,
	documentElement :  null,
	_inc : 1,
	
	insertBefore :  function(newChild, refChild){//raises 
		if(newChild.nodeType == DOCUMENT_FRAGMENT_NODE){
			var child = newChild.firstChild;
			while(child){
				var next = child.nextSibling;
				this.insertBefore(child,refChild);
				child = next;
			}
			return newChild;
		}
		if(this.documentElement == null && newChild.nodeType == ELEMENT_NODE){
			this.documentElement = newChild;
		}
		
		return _insertBefore(this,newChild,refChild),(newChild.ownerDocument = this),newChild;
	},
	removeChild :  function(oldChild){
		if(this.documentElement == oldChild){
			this.documentElement = null;
		}
		return _removeChild(this,oldChild);
	},
	// Introduced in DOM Level 2:
	importNode : function(importedNode,deep){
		return importNode(this,importedNode,deep);
	},
	// Introduced in DOM Level 2:
	getElementById :	function(id){
		var rtv = null;
		_visitNode(this.documentElement,function(node){
			if(node.nodeType == ELEMENT_NODE){
				if(node.getAttribute('id') == id){
					rtv = node;
					return true;
				}
			}
		})
		return rtv;
	},
	
	getElementsByClassName: function(className) {
		var pattern = new RegExp("(^|\\s)" + className + "(\\s|$)");
		return new LiveNodeList(this, function(base) {
			var ls = [];
			_visitNode(base.documentElement, function(node) {
				if(node !== base && node.nodeType == ELEMENT_NODE) {
					if(pattern.test(node.getAttribute('class'))) {
						ls.push(node);
					}
				}
			});
			return ls;
		});
	},
	
	//document factory method:
	createElement :	function(tagName){
		var node = new Element();
		node.ownerDocument = this;
		node.nodeName = tagName;
		node.tagName = tagName;
		node.childNodes = new NodeList();
		var attrs	= node.attributes = new NamedNodeMap();
		attrs._ownerElement = node;
		return node;
	},
	createDocumentFragment :	function(){
		var node = new DocumentFragment();
		node.ownerDocument = this;
		node.childNodes = new NodeList();
		return node;
	},
	createTextNode :	function(data){
		var node = new Text();
		node.ownerDocument = this;
		node.appendData(data)
		return node;
	},
	createComment :	function(data){
		var node = new Comment();
		node.ownerDocument = this;
		node.appendData(data)
		return node;
	},
	createCDATASection :	function(data){
		var node = new CDATASection();
		node.ownerDocument = this;
		node.appendData(data)
		return node;
	},
	createProcessingInstruction :	function(target,data){
		var node = new ProcessingInstruction();
		node.ownerDocument = this;
		node.tagName = node.target = target;
		node.nodeValue= node.data = data;
		return node;
	},
	createAttribute :	function(name){
		var node = new Attr();
		node.ownerDocument	= this;
		node.name = name;
		node.nodeName	= name;
		node.localName = name;
		node.specified = true;
		return node;
	},
	createEntityReference :	function(name){
		var node = new EntityReference();
		node.ownerDocument	= this;
		node.nodeName	= name;
		return node;
	},
	// Introduced in DOM Level 2:
	createElementNS :	function(namespaceURI,qualifiedName){
		var node = new Element();
		var pl = qualifiedName.split(':');
		var attrs	= node.attributes = new NamedNodeMap();
		node.childNodes = new NodeList();
		node.ownerDocument = this;
		node.nodeName = qualifiedName;
		node.tagName = qualifiedName;
		node.namespaceURI = namespaceURI;
		if(pl.length == 2){
			node.prefix = pl[0];
			node.localName = pl[1];
		}else{
			//el.prefix = null;
			node.localName = qualifiedName;
		}
		attrs._ownerElement = node;
		return node;
	},
	// Introduced in DOM Level 2:
	createAttributeNS :	function(namespaceURI,qualifiedName){
		var node = new Attr();
		var pl = qualifiedName.split(':');
		node.ownerDocument = this;
		node.nodeName = qualifiedName;
		node.name = qualifiedName;
		node.namespaceURI = namespaceURI;
		node.specified = true;
		if(pl.length == 2){
			node.prefix = pl[0];
			node.localName = pl[1];
		}else{
			//el.prefix = null;
			node.localName = qualifiedName;
		}
		return node;
	}
};
_extends(Document,Node);


function Element() {
	this._nsMap = {};
};
Element.prototype = {
	nodeType : ELEMENT_NODE,
	hasAttribute : function(name){
		return this.getAttributeNode(name)!=null;
	},
	getAttribute : function(name){
		var attr = this.getAttributeNode(name);
		return attr && attr.value || '';
	},
	getAttributeNode : function(name){
		return this.attributes.getNamedItem(name);
	},
	setAttribute : function(name, value){
		var attr = this.ownerDocument.createAttribute(name);
		attr.value = attr.nodeValue = "" + value;
		this.setAttributeNode(attr)
	},
	removeAttribute : function(name){
		var attr = this.getAttributeNode(name)
		attr && this.removeAttributeNode(attr);
	},
	
	//four real opeartion method
	appendChild:function(newChild){
		if(newChild.nodeType === DOCUMENT_FRAGMENT_NODE){
			return this.insertBefore(newChild,null);
		}else{
			return _appendSingleChild(this,newChild);
		}
	},
	setAttributeNode : function(newAttr){
		return this.attributes.setNamedItem(newAttr);
	},
	setAttributeNodeNS : function(newAttr){
		return this.attributes.setNamedItemNS(newAttr);
	},
	removeAttributeNode : function(oldAttr){
		//console.log(this == oldAttr.ownerElement)
		return this.attributes.removeNamedItem(oldAttr.nodeName);
	},
	//get real attribute name,and remove it by removeAttributeNode
	removeAttributeNS : function(namespaceURI, localName){
		var old = this.getAttributeNodeNS(namespaceURI, localName);
		old && this.removeAttributeNode(old);
	},
	
	hasAttributeNS : function(namespaceURI, localName){
		return this.getAttributeNodeNS(namespaceURI, localName)!=null;
	},
	getAttributeNS : function(namespaceURI, localName){
		var attr = this.getAttributeNodeNS(namespaceURI, localName);
		return attr && attr.value || '';
	},
	setAttributeNS : function(namespaceURI, qualifiedName, value){
		var attr = this.ownerDocument.createAttributeNS(namespaceURI, qualifiedName);
		attr.value = attr.nodeValue = "" + value;
		this.setAttributeNode(attr)
	},
	getAttributeNodeNS : function(namespaceURI, localName){
		return this.attributes.getNamedItemNS(namespaceURI, localName);
	},
	
	getElementsByTagName : function(tagName){
		return new LiveNodeList(this,function(base){
			var ls = [];
			_visitNode(base,function(node){
				if(node !== base && node.nodeType == ELEMENT_NODE && (tagName === '*' || node.tagName == tagName)){
					ls.push(node);
				}
			});
			return ls;
		});
	},
	getElementsByTagNameNS : function(namespaceURI, localName){
		return new LiveNodeList(this,function(base){
			var ls = [];
			_visitNode(base,function(node){
				if(node !== base && node.nodeType === ELEMENT_NODE && (namespaceURI === '*' || node.namespaceURI === namespaceURI) && (localName === '*' || node.localName == localName)){
					ls.push(node);
				}
			});
			return ls;
			
		});
	}
};
Document.prototype.getElementsByTagName = Element.prototype.getElementsByTagName;
Document.prototype.getElementsByTagNameNS = Element.prototype.getElementsByTagNameNS;


_extends(Element,Node);
function Attr() {
};
Attr.prototype.nodeType = ATTRIBUTE_NODE;
_extends(Attr,Node);


function CharacterData() {
};
CharacterData.prototype = {
	data : '',
	substringData : function(offset, count) {
		return this.data.substring(offset, offset+count);
	},
	appendData: function(text) {
		text = this.data+text;
		this.nodeValue = this.data = text;
		this.length = text.length;
	},
	insertData: function(offset,text) {
		this.replaceData(offset,0,text);
	
	},
	appendChild:function(newChild){
		throw new Error(ExceptionMessage[HIERARCHY_REQUEST_ERR])
	},
	deleteData: function(offset, count) {
		this.replaceData(offset,count,"");
	},
	replaceData: function(offset, count, text) {
		var start = this.data.substring(0,offset);
		var end = this.data.substring(offset+count);
		text = start + text + end;
		this.nodeValue = this.data = text;
		this.length = text.length;
	}
}
_extends(CharacterData,Node);
function Text() {
};
Text.prototype = {
	nodeName : "#text",
	nodeType : TEXT_NODE,
	splitText : function(offset) {
		var text = this.data;
		var newText = text.substring(offset);
		text = text.substring(0, offset);
		this.data = this.nodeValue = text;
		this.length = text.length;
		var newNode = this.ownerDocument.createTextNode(newText);
		if(this.parentNode){
			this.parentNode.insertBefore(newNode, this.nextSibling);
		}
		return newNode;
	}
}
_extends(Text,CharacterData);
function Comment() {
};
Comment.prototype = {
	nodeName : "#comment",
	nodeType : COMMENT_NODE
}
_extends(Comment,CharacterData);

function CDATASection() {
};
CDATASection.prototype = {
	nodeName : "#cdata-section",
	nodeType : CDATA_SECTION_NODE
}
_extends(CDATASection,CharacterData);


function DocumentType() {
};
DocumentType.prototype.nodeType = DOCUMENT_TYPE_NODE;
_extends(DocumentType,Node);

function Notation() {
};
Notation.prototype.nodeType = NOTATION_NODE;
_extends(Notation,Node);

function Entity() {
};
Entity.prototype.nodeType = ENTITY_NODE;
_extends(Entity,Node);

function EntityReference() {
};
EntityReference.prototype.nodeType = ENTITY_REFERENCE_NODE;
_extends(EntityReference,Node);

function DocumentFragment() {
};
DocumentFragment.prototype.nodeName =	"#document-fragment";
DocumentFragment.prototype.nodeType =	DOCUMENT_FRAGMENT_NODE;
_extends(DocumentFragment,Node);


function ProcessingInstruction() {
}
ProcessingInstruction.prototype.nodeType = PROCESSING_INSTRUCTION_NODE;
_extends(ProcessingInstruction,Node);
function XMLSerializer(){}
XMLSerializer.prototype.serializeToString = function(node,isHtml,nodeFilter){
	return nodeSerializeToString.call(node,isHtml,nodeFilter);
}
Node.prototype.toString = nodeSerializeToString;
function nodeSerializeToString(isHtml,nodeFilter){
	var buf = [];
	var refNode = this.nodeType == 9 && this.documentElement || this;
	var prefix = refNode.prefix;
	var uri = refNode.namespaceURI;
	
	if(uri && prefix == null){
		//console.log(prefix)
		var prefix = refNode.lookupPrefix(uri);
		if(prefix == null){
			//isHTML = true;
			var visibleNamespaces=[
			{namespace:uri,prefix:null}
			//{namespace:uri,prefix:''}
			]
		}
	}
	serializeToString(this,buf,isHtml,nodeFilter,visibleNamespaces);
	//console.log('###',this.nodeType,uri,prefix,buf.join(''))
	return buf.join('');
}
function needNamespaceDefine(node,isHTML, visibleNamespaces) {
	var prefix = node.prefix||'';
	var uri = node.namespaceURI;
	if (!prefix && !uri){
		return false;
	}
	if (prefix === "xml" && uri === "http://www.w3.org/XML/1998/namespace" 
		|| uri == 'http://www.w3.org/2000/xmlns/'){
		return false;
	}
	
	var i = visibleNamespaces.length 
	//console.log('@@@@',node.tagName,prefix,uri,visibleNamespaces)
	while (i--) {
		var ns = visibleNamespaces[i];
		// get namespace prefix
		//console.log(node.nodeType,node.tagName,ns.prefix,prefix)
		if (ns.prefix == prefix){
			return ns.namespace != uri;
		}
	}
	//console.log(isHTML,uri,prefix=='')
	//if(isHTML && prefix ==null && uri == 'http://www.w3.org/1999/xhtml'){
	//	return false;
	//}
	//node.flag = '11111'
	//console.error(3,true,node.flag,node.prefix,node.namespaceURI)
	return true;
}
function serializeToString(node,buf,isHTML,nodeFilter,visibleNamespaces){
	if(nodeFilter){
		node = nodeFilter(node);
		if(node){
			if(typeof node == 'string'){
				buf.push(node);
				return;
			}
		}else{
			return;
		}
		//buf.sort.apply(attrs, attributeSorter);
	}
	switch(node.nodeType){
	case ELEMENT_NODE:
		if (!visibleNamespaces) visibleNamespaces = [];
		var startVisibleNamespaces = visibleNamespaces.length;
		var attrs = node.attributes;
		var len = attrs.length;
		var child = node.firstChild;
		var nodeName = node.tagName;
		
		isHTML =  (htmlns === node.namespaceURI) ||isHTML 
		buf.push('<',nodeName);
		
		
		
		for(var i=0;i<len;i++){
			// add namespaces for attributes
			var attr = attrs.item(i);
			if (attr.prefix == 'xmlns') {
				visibleNamespaces.push({ prefix: attr.localName, namespace: attr.value });
			}else if(attr.nodeName == 'xmlns'){
				visibleNamespaces.push({ prefix: '', namespace: attr.value });
			}
		}
		for(var i=0;i<len;i++){
			var attr = attrs.item(i);
			if (needNamespaceDefine(attr,isHTML, visibleNamespaces)) {
				var prefix = attr.prefix||'';
				var uri = attr.namespaceURI;
				var ns = prefix ? ' xmlns:' + prefix : " xmlns";
				buf.push(ns, '="' , uri , '"');
				visibleNamespaces.push({ prefix: prefix, namespace:uri });
			}
			serializeToString(attr,buf,isHTML,nodeFilter,visibleNamespaces);
		}
		// add namespace for current node		
		if (needNamespaceDefine(node,isHTML, visibleNamespaces)) {
			var prefix = node.prefix||'';
			var uri = node.namespaceURI;
			var ns = prefix ? ' xmlns:' + prefix : " xmlns";
			buf.push(ns, '="' , uri , '"');
			visibleNamespaces.push({ prefix: prefix, namespace:uri });
		}
		
		if(child || isHTML && !/^(?:meta|link|img|br|hr|input)$/i.test(nodeName)){
			buf.push('>');
			//if is cdata child node
			if(isHTML && /^script$/i.test(nodeName)){
				while(child){
					if(child.data){
						buf.push(child.data);
					}else{
						serializeToString(child,buf,isHTML,nodeFilter,visibleNamespaces);
					}
					child = child.nextSibling;
				}
			}else
			{
				while(child){
					serializeToString(child,buf,isHTML,nodeFilter,visibleNamespaces);
					child = child.nextSibling;
				}
			}
			buf.push('</',nodeName,'>');
		}else{
			buf.push('/>');
		}
		// remove added visible namespaces
		//visibleNamespaces.length = startVisibleNamespaces;
		return;
	case DOCUMENT_NODE:
	case DOCUMENT_FRAGMENT_NODE:
		var child = node.firstChild;
		while(child){
			serializeToString(child,buf,isHTML,nodeFilter,visibleNamespaces);
			child = child.nextSibling;
		}
		return;
	case ATTRIBUTE_NODE:
		return buf.push(' ',node.name,'="',node.value.replace(/[&"]/g,_xmlEncoder),'"');
	case TEXT_NODE:
		/**
		 * The ampersand character (&) and the left angle bracket (<) must not appear in their literal form,
		 * except when used as markup delimiters, or within a comment, a processing instruction, or a CDATA section.
		 * If they are needed elsewhere, they must be escaped using either numeric character references or the strings
		 * `&amp;` and `&lt;` respectively.
		 * The right angle bracket (>) may be represented using the string " &gt; ", and must, for compatibility,
		 * be escaped using either `&gt;` or a character reference when it appears in the string `]]>` in content,
		 * when that string is not marking the end of a CDATA section.
		 *
		 * In the content of elements, character data is any string of characters
		 * which does not contain the start-delimiter of any markup
		 * and does not include the CDATA-section-close delimiter, `]]>`.
		 *
		 * @see https://www.w3.org/TR/xml/#NT-CharData
		 */
		return buf.push(node.data
			.replace(/[<&]/g,_xmlEncoder)
			.replace(/]]>/g, ']]&gt;')
		);
	case CDATA_SECTION_NODE:
		return buf.push( '<![CDATA[',node.data,']]>');
	case COMMENT_NODE:
		return buf.push( "<!--",node.data,"-->");
	case DOCUMENT_TYPE_NODE:
		var pubid = node.publicId;
		var sysid = node.systemId;
		buf.push('<!DOCTYPE ',node.name);
		if(pubid){
			buf.push(' PUBLIC ', pubid);
			if (sysid && sysid!='.') {
				buf.push(' ', sysid);
			}
			buf.push('>');
		}else if(sysid && sysid!='.'){
			buf.push(' SYSTEM ', sysid, '>');
		}else{
			var sub = node.internalSubset;
			if(sub){
				buf.push(" [",sub,"]");
			}
			buf.push(">");
		}
		return;
	case PROCESSING_INSTRUCTION_NODE:
		return buf.push( "<?",node.target," ",node.data,"?>");
	case ENTITY_REFERENCE_NODE:
		return buf.push( '&',node.nodeName,';');
	//case ENTITY_NODE:
	//case NOTATION_NODE:
	default:
		buf.push('??',node.nodeName);
	}
}
function importNode(doc,node,deep){
	var node2;
	switch (node.nodeType) {
	case ELEMENT_NODE:
		node2 = node.cloneNode(false);
		node2.ownerDocument = doc;
		//var attrs = node2.attributes;
		//var len = attrs.length;
		//for(var i=0;i<len;i++){
			//node2.setAttributeNodeNS(importNode(doc,attrs.item(i),deep));
		//}
	case DOCUMENT_FRAGMENT_NODE:
		break;
	case ATTRIBUTE_NODE:
		deep = true;
		break;
	//case ENTITY_REFERENCE_NODE:
	//case PROCESSING_INSTRUCTION_NODE:
	////case TEXT_NODE:
	//case CDATA_SECTION_NODE:
	//case COMMENT_NODE:
	//	deep = false;
	//	break;
	//case DOCUMENT_NODE:
	//case DOCUMENT_TYPE_NODE:
	//cannot be imported.
	//case ENTITY_NODE:
	//case NOTATION_NODE：
	//can not hit in level3
	//default:throw e;
	}
	if(!node2){
		node2 = node.cloneNode(false);//false
	}
	node2.ownerDocument = doc;
	node2.parentNode = null;
	if(deep){
		var child = node.firstChild;
		while(child){
			node2.appendChild(importNode(doc,child,deep));
			child = child.nextSibling;
		}
	}
	return node2;
}
//
//var _relationMap = {firstChild:1,lastChild:1,previousSibling:1,nextSibling:1,
//					attributes:1,childNodes:1,parentNode:1,documentElement:1,doctype,};
function cloneNode(doc,node,deep){
	var node2 = new node.constructor();
	for(var n in node){
		var v = node[n];
		if(typeof v != 'object' ){
			if(v != node2[n]){
				node2[n] = v;
			}
		}
	}
	if(node.childNodes){
		node2.childNodes = new NodeList();
	}
	node2.ownerDocument = doc;
	switch (node2.nodeType) {
	case ELEMENT_NODE:
		var attrs	= node.attributes;
		var attrs2	= node2.attributes = new NamedNodeMap();
		var len = attrs.length
		attrs2._ownerElement = node2;
		for(var i=0;i<len;i++){
			node2.setAttributeNode(cloneNode(doc,attrs.item(i),true));
		}
		break;;
	case ATTRIBUTE_NODE:
		deep = true;
	}
	if(deep){
		var child = node.firstChild;
		while(child){
			node2.appendChild(cloneNode(doc,child,deep));
			child = child.nextSibling;
		}
	}
	return node2;
}

function __set__(object,key,value){
	object[key] = value
}
//do dynamic
try{
	if(Object.defineProperty){
		Object.defineProperty(LiveNodeList.prototype,'length',{
			get:function(){
				_updateLiveList(this);
				return this.$$length;
			}
		});
		Object.defineProperty(Node.prototype,'textContent',{
			get:function(){
				return getTextContent(this);
			},
			set:function(data){
				switch(this.nodeType){
				case ELEMENT_NODE:
				case DOCUMENT_FRAGMENT_NODE:
					while(this.firstChild){
						this.removeChild(this.firstChild);
					}
					if(data || String(data)){
						this.appendChild(this.ownerDocument.createTextNode(data));
					}
					break;
				default:
					//TODO:
					this.data = data;
					this.value = data;
					this.nodeValue = data;
				}
			}
		})
		
		function getTextContent(node){
			switch(node.nodeType){
			case ELEMENT_NODE:
			case DOCUMENT_FRAGMENT_NODE:
				var buf = [];
				node = node.firstChild;
				while(node){
					if(node.nodeType!==7 && node.nodeType !==8){
						buf.push(getTextContent(node));
					}
					node = node.nextSibling;
				}
				return buf.join('');
			default:
				return node.nodeValue;
			}
		}
		__set__ = function(object,key,value){
			//console.log(value)
			object['$$'+key] = value
		}
	}
}catch(e){//ie8
}

//if(typeof require == 'function'){
	__webpack_unused_export__ = Node;
	__webpack_unused_export__ = DOMException;
	exports.DOMImplementation = DOMImplementation;
	exports.XMLSerializer = XMLSerializer;
//}


/***/ }),

/***/ 3791:
/***/ ((__unused_webpack_module, exports) => {

exports.entityMap = {
       lt: '<',
       gt: '>',
       amp: '&',
       quot: '"',
       apos: "'",
       Agrave: "À",
       Aacute: "Á",
       Acirc: "Â",
       Atilde: "Ã",
       Auml: "Ä",
       Aring: "Å",
       AElig: "Æ",
       Ccedil: "Ç",
       Egrave: "È",
       Eacute: "É",
       Ecirc: "Ê",
       Euml: "Ë",
       Igrave: "Ì",
       Iacute: "Í",
       Icirc: "Î",
       Iuml: "Ï",
       ETH: "Ð",
       Ntilde: "Ñ",
       Ograve: "Ò",
       Oacute: "Ó",
       Ocirc: "Ô",
       Otilde: "Õ",
       Ouml: "Ö",
       Oslash: "Ø",
       Ugrave: "Ù",
       Uacute: "Ú",
       Ucirc: "Û",
       Uuml: "Ü",
       Yacute: "Ý",
       THORN: "Þ",
       szlig: "ß",
       agrave: "à",
       aacute: "á",
       acirc: "â",
       atilde: "ã",
       auml: "ä",
       aring: "å",
       aelig: "æ",
       ccedil: "ç",
       egrave: "è",
       eacute: "é",
       ecirc: "ê",
       euml: "ë",
       igrave: "ì",
       iacute: "í",
       icirc: "î",
       iuml: "ï",
       eth: "ð",
       ntilde: "ñ",
       ograve: "ò",
       oacute: "ó",
       ocirc: "ô",
       otilde: "õ",
       ouml: "ö",
       oslash: "ø",
       ugrave: "ù",
       uacute: "ú",
       ucirc: "û",
       uuml: "ü",
       yacute: "ý",
       thorn: "þ",
       yuml: "ÿ",
       nbsp: "\u00a0",
       iexcl: "¡",
       cent: "¢",
       pound: "£",
       curren: "¤",
       yen: "¥",
       brvbar: "¦",
       sect: "§",
       uml: "¨",
       copy: "©",
       ordf: "ª",
       laquo: "«",
       not: "¬",
       shy: "­­",
       reg: "®",
       macr: "¯",
       deg: "°",
       plusmn: "±",
       sup2: "²",
       sup3: "³",
       acute: "´",
       micro: "µ",
       para: "¶",
       middot: "·",
       cedil: "¸",
       sup1: "¹",
       ordm: "º",
       raquo: "»",
       frac14: "¼",
       frac12: "½",
       frac34: "¾",
       iquest: "¿",
       times: "×",
       divide: "÷",
       forall: "∀",
       part: "∂",
       exist: "∃",
       empty: "∅",
       nabla: "∇",
       isin: "∈",
       notin: "∉",
       ni: "∋",
       prod: "∏",
       sum: "∑",
       minus: "−",
       lowast: "∗",
       radic: "√",
       prop: "∝",
       infin: "∞",
       ang: "∠",
       and: "∧",
       or: "∨",
       cap: "∩",
       cup: "∪",
       'int': "∫",
       there4: "∴",
       sim: "∼",
       cong: "≅",
       asymp: "≈",
       ne: "≠",
       equiv: "≡",
       le: "≤",
       ge: "≥",
       sub: "⊂",
       sup: "⊃",
       nsub: "⊄",
       sube: "⊆",
       supe: "⊇",
       oplus: "⊕",
       otimes: "⊗",
       perp: "⊥",
       sdot: "⋅",
       Alpha: "Α",
       Beta: "Β",
       Gamma: "Γ",
       Delta: "Δ",
       Epsilon: "Ε",
       Zeta: "Ζ",
       Eta: "Η",
       Theta: "Θ",
       Iota: "Ι",
       Kappa: "Κ",
       Lambda: "Λ",
       Mu: "Μ",
       Nu: "Ν",
       Xi: "Ξ",
       Omicron: "Ο",
       Pi: "Π",
       Rho: "Ρ",
       Sigma: "Σ",
       Tau: "Τ",
       Upsilon: "Υ",
       Phi: "Φ",
       Chi: "Χ",
       Psi: "Ψ",
       Omega: "Ω",
       alpha: "α",
       beta: "β",
       gamma: "γ",
       delta: "δ",
       epsilon: "ε",
       zeta: "ζ",
       eta: "η",
       theta: "θ",
       iota: "ι",
       kappa: "κ",
       lambda: "λ",
       mu: "μ",
       nu: "ν",
       xi: "ξ",
       omicron: "ο",
       pi: "π",
       rho: "ρ",
       sigmaf: "ς",
       sigma: "σ",
       tau: "τ",
       upsilon: "υ",
       phi: "φ",
       chi: "χ",
       psi: "ψ",
       omega: "ω",
       thetasym: "ϑ",
       upsih: "ϒ",
       piv: "ϖ",
       OElig: "Œ",
       oelig: "œ",
       Scaron: "Š",
       scaron: "š",
       Yuml: "Ÿ",
       fnof: "ƒ",
       circ: "ˆ",
       tilde: "˜",
       ensp: " ",
       emsp: " ",
       thinsp: " ",
       zwnj: "‌",
       zwj: "‍",
       lrm: "‎",
       rlm: "‏",
       ndash: "–",
       mdash: "—",
       lsquo: "‘",
       rsquo: "’",
       sbquo: "‚",
       ldquo: "“",
       rdquo: "”",
       bdquo: "„",
       dagger: "†",
       Dagger: "‡",
       bull: "•",
       hellip: "…",
       permil: "‰",
       prime: "′",
       Prime: "″",
       lsaquo: "‹",
       rsaquo: "›",
       oline: "‾",
       euro: "€",
       trade: "™",
       larr: "←",
       uarr: "↑",
       rarr: "→",
       darr: "↓",
       harr: "↔",
       crarr: "↵",
       lceil: "⌈",
       rceil: "⌉",
       lfloor: "⌊",
       rfloor: "⌋",
       loz: "◊",
       spades: "♠",
       clubs: "♣",
       hearts: "♥",
       diams: "♦"
};


/***/ }),

/***/ 8275:
/***/ ((__unused_webpack_module, exports) => {

//[4]   	NameStartChar	   ::=   	":" | [A-Z] | "_" | [a-z] | [#xC0-#xD6] | [#xD8-#xF6] | [#xF8-#x2FF] | [#x370-#x37D] | [#x37F-#x1FFF] | [#x200C-#x200D] | [#x2070-#x218F] | [#x2C00-#x2FEF] | [#x3001-#xD7FF] | [#xF900-#xFDCF] | [#xFDF0-#xFFFD] | [#x10000-#xEFFFF]
//[4a]   	NameChar	   ::=   	NameStartChar | "-" | "." | [0-9] | #xB7 | [#x0300-#x036F] | [#x203F-#x2040]
//[5]   	Name	   ::=   	NameStartChar (NameChar)*
var nameStartChar = /[A-Z_a-z\xC0-\xD6\xD8-\xF6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]///\u10000-\uEFFFF
var nameChar = new RegExp("[\\-\\.0-9"+nameStartChar.source.slice(1,-1)+"\\u00B7\\u0300-\\u036F\\u203F-\\u2040]");
var tagNamePattern = new RegExp('^'+nameStartChar.source+nameChar.source+'*(?:\:'+nameStartChar.source+nameChar.source+'*)?$');
//var tagNamePattern = /^[a-zA-Z_][\w\-\.]*(?:\:[a-zA-Z_][\w\-\.]*)?$/
//var handlers = 'resolveEntity,getExternalSubset,characters,endDocument,endElement,endPrefixMapping,ignorableWhitespace,processingInstruction,setDocumentLocator,skippedEntity,startDocument,startElement,startPrefixMapping,notationDecl,unparsedEntityDecl,error,fatalError,warning,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,comment,endCDATA,endDTD,endEntity,startCDATA,startDTD,startEntity'.split(',')

//S_TAG,	S_ATTR,	S_EQ,	S_ATTR_NOQUOT_VALUE
//S_ATTR_SPACE,	S_ATTR_END,	S_TAG_SPACE, S_TAG_CLOSE
var S_TAG = 0;//tag name offerring
var S_ATTR = 1;//attr name offerring 
var S_ATTR_SPACE=2;//attr name end and space offer
var S_EQ = 3;//=space?
var S_ATTR_NOQUOT_VALUE = 4;//attr value(no quot value only)
var S_ATTR_END = 5;//attr value end and no space(quot end)
var S_TAG_SPACE = 6;//(attr value end || tag end ) && (space offer)
var S_TAG_CLOSE = 7;//closed el<el />

/**
 * Creates an error that will not be caught by XMLReader aka the SAX parser.
 *
 * @param {string} message
 * @param {any?} locator Optional, can provide details about the location in the source
 * @constructor
 */
function ParseError(message, locator) {
	this.message = message
	this.locator = locator
	if(Error.captureStackTrace) Error.captureStackTrace(this, ParseError);
}
ParseError.prototype = new Error();
ParseError.prototype.name = ParseError.name

function XMLReader(){
	
}

XMLReader.prototype = {
	parse:function(source,defaultNSMap,entityMap){
		var domBuilder = this.domBuilder;
		domBuilder.startDocument();
		_copy(defaultNSMap ,defaultNSMap = {})
		parse(source,defaultNSMap,entityMap,
				domBuilder,this.errorHandler);
		domBuilder.endDocument();
	}
}
function parse(source,defaultNSMapCopy,entityMap,domBuilder,errorHandler){
	function fixedFromCharCode(code) {
		// String.prototype.fromCharCode does not supports
		// > 2 bytes unicode chars directly
		if (code > 0xffff) {
			code -= 0x10000;
			var surrogate1 = 0xd800 + (code >> 10)
				, surrogate2 = 0xdc00 + (code & 0x3ff);

			return String.fromCharCode(surrogate1, surrogate2);
		} else {
			return String.fromCharCode(code);
		}
	}
	function entityReplacer(a){
		var k = a.slice(1,-1);
		if(k in entityMap){
			return entityMap[k]; 
		}else if(k.charAt(0) === '#'){
			return fixedFromCharCode(parseInt(k.substr(1).replace('x','0x')))
		}else{
			errorHandler.error('entity not found:'+a);
			return a;
		}
	}
	function appendText(end){//has some bugs
		if(end>start){
			var xt = source.substring(start,end).replace(/&#?\w+;/g,entityReplacer);
			locator&&position(start);
			domBuilder.characters(xt,0,end-start);
			start = end
		}
	}
	function position(p,m){
		while(p>=lineEnd && (m = linePattern.exec(source))){
			lineStart = m.index;
			lineEnd = lineStart + m[0].length;
			locator.lineNumber++;
			//console.log('line++:',locator,startPos,endPos)
		}
		locator.columnNumber = p-lineStart+1;
	}
	var lineStart = 0;
	var lineEnd = 0;
	var linePattern = /.*(?:\r\n?|\n)|.*$/g
	var locator = domBuilder.locator;
	
	var parseStack = [{currentNSMap:defaultNSMapCopy}]
	var closeMap = {};
	var start = 0;
	while(true){
		try{
			var tagStart = source.indexOf('<',start);
			if(tagStart<0){
				if(!source.substr(start).match(/^\s*$/)){
					var doc = domBuilder.doc;
	    			var text = doc.createTextNode(source.substr(start));
	    			doc.appendChild(text);
	    			domBuilder.currentElement = text;
				}
				return;
			}
			if(tagStart>start){
				appendText(tagStart);
			}
			switch(source.charAt(tagStart+1)){
			case '/':
				var end = source.indexOf('>',tagStart+3);
				var tagName = source.substring(tagStart+2,end);
				var config = parseStack.pop();
				if(end<0){
					
	        		tagName = source.substring(tagStart+2).replace(/[\s<].*/,'');
	        		//console.error('#@@@@@@'+tagName)
	        		errorHandler.error("end tag name: "+tagName+' is not complete:'+config.tagName);
	        		end = tagStart+1+tagName.length;
	        	}else if(tagName.match(/\s</)){
	        		tagName = tagName.replace(/[\s<].*/,'');
	        		errorHandler.error("end tag name: "+tagName+' maybe not complete');
	        		end = tagStart+1+tagName.length;
				}
				//console.error(parseStack.length,parseStack)
				//console.error(config);
				var localNSMap = config.localNSMap;
				var endMatch = config.tagName == tagName;
				var endIgnoreCaseMach = endMatch || config.tagName&&config.tagName.toLowerCase() == tagName.toLowerCase()
		        if(endIgnoreCaseMach){
		        	domBuilder.endElement(config.uri,config.localName,tagName);
					if(localNSMap){
						for(var prefix in localNSMap){
							domBuilder.endPrefixMapping(prefix) ;
						}
					}
					if(!endMatch){
		            	errorHandler.fatalError("end tag name: "+tagName+' is not match the current start tagName:'+config.tagName ); // No known test case
					}
		        }else{
		        	parseStack.push(config)
		        }
				
				end++;
				break;
				// end elment
			case '?':// <?...?>
				locator&&position(tagStart);
				end = parseInstruction(source,tagStart,domBuilder);
				break;
			case '!':// <!doctype,<![CDATA,<!--
				locator&&position(tagStart);
				end = parseDCC(source,tagStart,domBuilder,errorHandler);
				break;
			default:
				locator&&position(tagStart);
				var el = new ElementAttributes();
				var currentNSMap = parseStack[parseStack.length-1].currentNSMap;
				//elStartEnd
				var end = parseElementStartPart(source,tagStart,el,currentNSMap,entityReplacer,errorHandler);
				var len = el.length;
				
				
				if(!el.closed && fixSelfClosed(source,end,el.tagName,closeMap)){
					el.closed = true;
					if(!entityMap.nbsp){
						errorHandler.warning('unclosed xml attribute');
					}
				}
				if(locator && len){
					var locator2 = copyLocator(locator,{});
					//try{//attribute position fixed
					for(var i = 0;i<len;i++){
						var a = el[i];
						position(a.offset);
						a.locator = copyLocator(locator,{});
					}
					//}catch(e){console.error('@@@@@'+e)}
					domBuilder.locator = locator2
					if(appendElement(el,domBuilder,currentNSMap)){
						parseStack.push(el)
					}
					domBuilder.locator = locator;
				}else{
					if(appendElement(el,domBuilder,currentNSMap)){
						parseStack.push(el)
					}
				}
				
				
				
				if(el.uri === 'http://www.w3.org/1999/xhtml' && !el.closed){
					end = parseHtmlSpecialContent(source,end,el.tagName,entityReplacer,domBuilder)
				}else{
					end++;
				}
			}
		}catch(e){
			if (e instanceof ParseError) {
				throw e;
			}
			errorHandler.error('element parse error: '+e)
			end = -1;
		}
		if(end>start){
			start = end;
		}else{
			//TODO: 这里有可能sax回退，有位置错误风险
			appendText(Math.max(tagStart,start)+1);
		}
	}
}
function copyLocator(f,t){
	t.lineNumber = f.lineNumber;
	t.columnNumber = f.columnNumber;
	return t;
}

/**
 * @see #appendElement(source,elStartEnd,el,selfClosed,entityReplacer,domBuilder,parseStack);
 * @return end of the elementStartPart(end of elementEndPart for selfClosed el)
 */
function parseElementStartPart(source,start,el,currentNSMap,entityReplacer,errorHandler){

	/**
	 * @param {string} qname
	 * @param {string} value
	 * @param {number} startIndex
	 */
	function addAttribute(qname, value, startIndex) {
		if (qname in el.attributeNames) errorHandler.fatalError('Attribute ' + qname + ' redefined')
		el.addValue(qname, value, startIndex)
	}
	var attrName;
	var value;
	var p = ++start;
	var s = S_TAG;//status
	while(true){
		var c = source.charAt(p);
		switch(c){
		case '=':
			if(s === S_ATTR){//attrName
				attrName = source.slice(start,p);
				s = S_EQ;
			}else if(s === S_ATTR_SPACE){
				s = S_EQ;
			}else{
				//fatalError: equal must after attrName or space after attrName
				throw new Error('attribute equal must after attrName'); // No known test case
			}
			break;
		case '\'':
		case '"':
			if(s === S_EQ || s === S_ATTR //|| s == S_ATTR_SPACE
				){//equal
				if(s === S_ATTR){
					errorHandler.warning('attribute value must after "="')
					attrName = source.slice(start,p)
				}
				start = p+1;
				p = source.indexOf(c,start)
				if(p>0){
					value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
					addAttribute(attrName, value, start-1);
					s = S_ATTR_END;
				}else{
					//fatalError: no end quot match
					throw new Error('attribute value no end \''+c+'\' match');
				}
			}else if(s == S_ATTR_NOQUOT_VALUE){
				value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
				//console.log(attrName,value,start,p)
				addAttribute(attrName, value, start);
				//console.dir(el)
				errorHandler.warning('attribute "'+attrName+'" missed start quot('+c+')!!');
				start = p+1;
				s = S_ATTR_END
			}else{
				//fatalError: no equal before
				throw new Error('attribute value must after "="'); // No known test case
			}
			break;
		case '/':
			switch(s){
			case S_TAG:
				el.setTagName(source.slice(start,p));
			case S_ATTR_END:
			case S_TAG_SPACE:
			case S_TAG_CLOSE:
				s =S_TAG_CLOSE;
				el.closed = true;
			case S_ATTR_NOQUOT_VALUE:
			case S_ATTR:
			case S_ATTR_SPACE:
				break;
			//case S_EQ:
			default:
				throw new Error("attribute invalid close char('/')") // No known test case
			}
			break;
		case ''://end document
			errorHandler.error('unexpected end of input');
			if(s == S_TAG){
				el.setTagName(source.slice(start,p));
			}
			return p;
		case '>':
			switch(s){
			case S_TAG:
				el.setTagName(source.slice(start,p));
			case S_ATTR_END:
			case S_TAG_SPACE:
			case S_TAG_CLOSE:
				break;//normal
			case S_ATTR_NOQUOT_VALUE://Compatible state
			case S_ATTR:
				value = source.slice(start,p);
				if(value.slice(-1) === '/'){
					el.closed  = true;
					value = value.slice(0,-1)
				}
			case S_ATTR_SPACE:
				if(s === S_ATTR_SPACE){
					value = attrName;
				}
				if(s == S_ATTR_NOQUOT_VALUE){
					errorHandler.warning('attribute "'+value+'" missed quot(")!');
					addAttribute(attrName, value.replace(/&#?\w+;/g,entityReplacer), start)
				}else{
					if(currentNSMap[''] !== 'http://www.w3.org/1999/xhtml' || !value.match(/^(?:disabled|checked|selected)$/i)){
						errorHandler.warning('attribute "'+value+'" missed value!! "'+value+'" instead!!')
					}
					addAttribute(value, value, start)
				}
				break;
			case S_EQ:
				throw new Error('attribute value missed!!');
			}
//			console.log(tagName,tagNamePattern,tagNamePattern.test(tagName))
			return p;
		/*xml space '\x20' | #x9 | #xD | #xA; */
		case '\u0080':
			c = ' ';
		default:
			if(c<= ' '){//space
				switch(s){
				case S_TAG:
					el.setTagName(source.slice(start,p));//tagName
					s = S_TAG_SPACE;
					break;
				case S_ATTR:
					attrName = source.slice(start,p)
					s = S_ATTR_SPACE;
					break;
				case S_ATTR_NOQUOT_VALUE:
					var value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
					errorHandler.warning('attribute "'+value+'" missed quot(")!!');
					addAttribute(attrName, value, start)
				case S_ATTR_END:
					s = S_TAG_SPACE;
					break;
				//case S_TAG_SPACE:
				//case S_EQ:
				//case S_ATTR_SPACE:
				//	void();break;
				//case S_TAG_CLOSE:
					//ignore warning
				}
			}else{//not space
//S_TAG,	S_ATTR,	S_EQ,	S_ATTR_NOQUOT_VALUE
//S_ATTR_SPACE,	S_ATTR_END,	S_TAG_SPACE, S_TAG_CLOSE
				switch(s){
				//case S_TAG:void();break;
				//case S_ATTR:void();break;
				//case S_ATTR_NOQUOT_VALUE:void();break;
				case S_ATTR_SPACE:
					var tagName =  el.tagName;
					if(currentNSMap[''] !== 'http://www.w3.org/1999/xhtml' || !attrName.match(/^(?:disabled|checked|selected)$/i)){
						errorHandler.warning('attribute "'+attrName+'" missed value!! "'+attrName+'" instead2!!')
					}
					addAttribute(attrName, attrName, start);
					start = p;
					s = S_ATTR;
					break;
				case S_ATTR_END:
					errorHandler.warning('attribute space is required"'+attrName+'"!!')
				case S_TAG_SPACE:
					s = S_ATTR;
					start = p;
					break;
				case S_EQ:
					s = S_ATTR_NOQUOT_VALUE;
					start = p;
					break;
				case S_TAG_CLOSE:
					throw new Error("elements closed character '/' and '>' must be connected to");
				}
			}
		}//end outer switch
		//console.log('p++',p)
		p++;
	}
}
/**
 * @return true if has new namespace define
 */
function appendElement(el,domBuilder,currentNSMap){
	var tagName = el.tagName;
	var localNSMap = null;
	//var currentNSMap = parseStack[parseStack.length-1].currentNSMap;
	var i = el.length;
	while(i--){
		var a = el[i];
		var qName = a.qName;
		var value = a.value;
		var nsp = qName.indexOf(':');
		if(nsp>0){
			var prefix = a.prefix = qName.slice(0,nsp);
			var localName = qName.slice(nsp+1);
			var nsPrefix = prefix === 'xmlns' && localName
		}else{
			localName = qName;
			prefix = null
			nsPrefix = qName === 'xmlns' && ''
		}
		//can not set prefix,because prefix !== ''
		a.localName = localName ;
		//prefix == null for no ns prefix attribute 
		if(nsPrefix !== false){//hack!!
			if(localNSMap == null){
				localNSMap = {}
				//console.log(currentNSMap,0)
				_copy(currentNSMap,currentNSMap={})
				//console.log(currentNSMap,1)
			}
			currentNSMap[nsPrefix] = localNSMap[nsPrefix] = value;
			a.uri = 'http://www.w3.org/2000/xmlns/'
			domBuilder.startPrefixMapping(nsPrefix, value) 
		}
	}
	var i = el.length;
	while(i--){
		a = el[i];
		var prefix = a.prefix;
		if(prefix){//no prefix attribute has no namespace
			if(prefix === 'xml'){
				a.uri = 'http://www.w3.org/XML/1998/namespace';
			}if(prefix !== 'xmlns'){
				a.uri = currentNSMap[prefix || '']
				
				//{console.log('###'+a.qName,domBuilder.locator.systemId+'',currentNSMap,a.uri)}
			}
		}
	}
	var nsp = tagName.indexOf(':');
	if(nsp>0){
		prefix = el.prefix = tagName.slice(0,nsp);
		localName = el.localName = tagName.slice(nsp+1);
	}else{
		prefix = null;//important!!
		localName = el.localName = tagName;
	}
	//no prefix element has default namespace
	var ns = el.uri = currentNSMap[prefix || ''];
	domBuilder.startElement(ns,localName,tagName,el);
	//endPrefixMapping and startPrefixMapping have not any help for dom builder
	//localNSMap = null
	if(el.closed){
		domBuilder.endElement(ns,localName,tagName);
		if(localNSMap){
			for(prefix in localNSMap){
				domBuilder.endPrefixMapping(prefix) 
			}
		}
	}else{
		el.currentNSMap = currentNSMap;
		el.localNSMap = localNSMap;
		//parseStack.push(el);
		return true;
	}
}
function parseHtmlSpecialContent(source,elStartEnd,tagName,entityReplacer,domBuilder){
	if(/^(?:script|textarea)$/i.test(tagName)){
		var elEndStart =  source.indexOf('</'+tagName+'>',elStartEnd);
		var text = source.substring(elStartEnd+1,elEndStart);
		if(/[&<]/.test(text)){
			if(/^script$/i.test(tagName)){
				//if(!/\]\]>/.test(text)){
					//lexHandler.startCDATA();
					domBuilder.characters(text,0,text.length);
					//lexHandler.endCDATA();
					return elEndStart;
				//}
			}//}else{//text area
				text = text.replace(/&#?\w+;/g,entityReplacer);
				domBuilder.characters(text,0,text.length);
				return elEndStart;
			//}
			
		}
	}
	return elStartEnd+1;
}
function fixSelfClosed(source,elStartEnd,tagName,closeMap){
	//if(tagName in closeMap){
	var pos = closeMap[tagName];
	if(pos == null){
		//console.log(tagName)
		pos =  source.lastIndexOf('</'+tagName+'>')
		if(pos<elStartEnd){//忘记闭合
			pos = source.lastIndexOf('</'+tagName)
		}
		closeMap[tagName] =pos
	}
	return pos<elStartEnd;
	//} 
}
function _copy(source,target){
	for(var n in source){target[n] = source[n]}
}
function parseDCC(source,start,domBuilder,errorHandler){//sure start with '<!'
	var next= source.charAt(start+2)
	switch(next){
	case '-':
		if(source.charAt(start + 3) === '-'){
			var end = source.indexOf('-->',start+4);
			//append comment source.substring(4,end)//<!--
			if(end>start){
				domBuilder.comment(source,start+4,end-start-4);
				return end+3;
			}else{
				errorHandler.error("Unclosed comment");
				return -1;
			}
		}else{
			//error
			return -1;
		}
	default:
		if(source.substr(start+3,6) == 'CDATA['){
			var end = source.indexOf(']]>',start+9);
			domBuilder.startCDATA();
			domBuilder.characters(source,start+9,end-start-9);
			domBuilder.endCDATA() 
			return end+3;
		}
		//<!DOCTYPE
		//startDTD(java.lang.String name, java.lang.String publicId, java.lang.String systemId) 
		var matchs = split(source,start);
		var len = matchs.length;
		if(len>1 && /!doctype/i.test(matchs[0][0])){
			var name = matchs[1][0];
			var pubid = false;
			var sysid = false;
			if(len>3){
				if(/^public$/i.test(matchs[2][0])){
					pubid = matchs[3][0];
					sysid = len>4 && matchs[4][0];
				}else if(/^system$/i.test(matchs[2][0])){
					sysid = matchs[3][0];
				}
			}
			var lastMatch = matchs[len-1]
			domBuilder.startDTD(name, pubid, sysid);
			domBuilder.endDTD();
			
			return lastMatch.index+lastMatch[0].length
		}
	}
	return -1;
}



function parseInstruction(source,start,domBuilder){
	var end = source.indexOf('?>',start);
	if(end){
		var match = source.substring(start,end).match(/^<\?(\S*)\s*([\s\S]*?)\s*$/);
		if(match){
			var len = match[0].length;
			domBuilder.processingInstruction(match[1], match[2]) ;
			return end+2;
		}else{//error
			return -1;
		}
	}
	return -1;
}

function ElementAttributes(){
	this.attributeNames = {}
}
ElementAttributes.prototype = {
	setTagName:function(tagName){
		if(!tagNamePattern.test(tagName)){
			throw new Error('invalid tagName:'+tagName)
		}
		this.tagName = tagName
	},
	addValue:function(qName, value, offset) {
		if(!tagNamePattern.test(qName)){
			throw new Error('invalid attribute:'+qName)
		}
		this.attributeNames[qName] = this.length;
		this[this.length++] = {qName:qName,value:value,offset:offset}
	},
	length:0,
	getLocalName:function(i){return this[i].localName},
	getLocator:function(i){return this[i].locator},
	getQName:function(i){return this[i].qName},
	getURI:function(i){return this[i].uri},
	getValue:function(i){return this[i].value}
//	,getIndex:function(uri, localName)){
//		if(localName){
//			
//		}else{
//			var qName = uri
//		}
//	},
//	getValue:function(){return this.getValue(this.getIndex.apply(this,arguments))},
//	getType:function(uri,localName){}
//	getType:function(i){},
}



function split(source,start){
	var match;
	var buf = [];
	var reg = /'[^']+'|"[^"]+"|[^\s<>\/=]+=?|(\/?\s*>|<)/g;
	reg.lastIndex = start;
	reg.exec(source);//skip <
	while(match = reg.exec(source)){
		buf.push(match);
		if(match[1])return buf;
	}
}

exports.XMLReader = XMLReader;
exports.ParseError = ParseError;


/***/ }),

/***/ 4217:
/***/ ((module) => {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE__4217__;

/***/ }),

/***/ 8627:
/***/ ((module) => {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE__8627__;

/***/ }),

/***/ 1273:
/***/ ((module) => {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE__1273__;

/***/ }),

/***/ 3804:
/***/ ((module) => {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE__3804__;

/***/ }),

/***/ 2470:
/***/ ((module) => {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE__2470__;

/***/ }),

/***/ 2372:
/***/ ((module) => {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE__2372__;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(3607);
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=sialia.js.map