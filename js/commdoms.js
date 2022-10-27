

var repdom = {
  title:'ref-title',
  buttons:{
    toggle:'toggle-report-dash'
  },

  EOMform:{
    cont:'ref-report-EOM-area',
    actions:{
      runEOM:'runEOM',
      cleanEOM:'cleanEOM',
      refreshEOM:'refreshEOM',
      printEOM:'printEOM'
    },
    repform:{
      month:'ref-report-EOM-reportmonth',
      date:'ref-report-EOM-rundate',
      runner:'ref-report-EOM-runbywho',
      has:'ref-report-EOM-hasrun'
    },
  },
  sumform:{
    apprCount:'ref-table-appr-cnt',
    denyCount: 'ref-table-deni-cnt',
    openCount: 'ref-table-open-cnt',
    submitCount: 'ref-sbmt-cnt',
    totalPay: 'ref-total-commish'
  },
  fltform:{
    cont:'ref-table-filters',
    flts:{
      TechID: 'ref-table-techid',
      WO:'ref-table-wo',
      ReferTo: 'ref-table-referto',
      SpiffFor: 'ref-table-spifffor',
      Address:'ref-table-address',
      CustLName:'ref-table-custlname'
    }
  },

  views:{
    FLTview:'ref-view-table-cont',
    EOMview:'eom-view-cont'
  },

  EOMview:{
    pagetemplate:'report-print-tech-page-template',
    techlist:'ref-report-print-cont',
    page:{
        cont:'report-print-tech-page',
        id:'rp-techid',
        fname:'rp-tlname',
        lname:'rp-tfname',

        month:'report-print-period',

        paidtot:'rp-total-commish',
        apprcnt:'rp-table-appr-cnt',
        lostcnt:'rp-table-deni-cnt',
        opencnt:'rp-table-open-cnt',
        sbmtcnt:'rp-sbmt-cnt',

        tables:{
          row:'rp-table-row',
          'A':'rp-appr-table',
          'D':'rp-lost-table',
          'O':'rp-open-table'
        }
      }
  }

}

module.exports={
  repdom
}
