
var dashroutes = {
    getAllReferals:'get-AllReferals',
    updateReferals:'post-UpdatedReferals',

    runEOM:'post-RunEndOfMonth',
    cleanEOM:'post-CleanEndofMonth'
}
var pageroutes = {
  reporting:'GET-ReportingPage',
  userdash:'GET-UserDash'
}

var reportroutes = {
  GETlast:'get-LastReportRun',
  runEOM:'post-RunEndOfMonth',
  cleanEOM:'post-CleanEndofMonth',
  refreshEOM:'post-RefreshEOM'
}
var referralroutes = {
  GETall:'get-AllReferals',
  POSTupdates: 'post-UpdatedReferals'
}

module.exports = {
    dashroutes,
    reportroutes,
    pageroutes,
    referralroutes
};
