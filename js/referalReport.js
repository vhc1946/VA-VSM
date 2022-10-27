
const reader= require('xlsx');
const path = require('path');

var {srvreferal,SrvReferals} = require('./srvreferals.js');
var {repdom}=require('./commdoms.js');
var {reportls}=require('./lstore.js');

//var rfile = '/Vogel - Service/Commissions/Reports/Referral Report.xlsx';
var yroot = 'Vogel - Service/Commissions/Reports/store/Referral Report.xlsx';//store/referstore/Referral Report.xlsx'; //root through server

var SetupEOMButton = (butname,func)=>{
    var butt;
    try{
        console.log(butname)
        butt = document.getElementById(butname);
        butt.addEventListener('dblclick',func);

        return true;
    }
    catch(e){
        return false;
    }
}

/* End of Month Commission Report


    This function is called in the main process
     upon request from the dash.

    *Need to move this to the client side, client
     will then send the altered list to the main
     process to updated


    PASSED:
        - reproot = user root to sharepoint
        - replist = list of techIDs and referrals
                {ids = [], //list of {TechID, TechName} included
                date=DATE
                 list = [], //list of referrals on report
                 month = string //Month name
                 }
*/
var RunEndOfMonth = (rdata)=>{
    var uplist = [];

    //tag the referrals with a DATE
    //tag the referrals with report month

    for(let x=0;x<rdata.list.length;x++){ //only atachs the report month to the Approved and Opened
      if(rdata.list[x].status=='A'||rdata.list[x].status=='D'){
        //rdata.list[x] = srvreferal(rdata.list[x]);
        rdata.list[x].closedate = new Date().toISOString().split('T')[0];
        rdata.list[x].reportmonth= rdata.month;

        console.log(rdata.list[x])
      }
    }
    console.log(rdata);
    localStorage.setItem(reportls.EOMrepdata,JSON.stringify(rdata)); //save the report to localStorage

    return rdata; //return the altered LIST

    //save report list as seperate in local localStorage

    /*  PROCESS WAS FOR MAIN Process

    //write data to excel file
    let repexel = reader.readFile(path.join(reproot,yroot));
    console.log(repexel.SheetNames);
    reader.utils.sheet_add_json(repexel.Sheets['DATA'],rdata.list);
    reader.writeFile(repexel,path.join(reproot,yroot));
    return true;
    */
}

/* Clean End of Month Commission Report
    passed clslist (list of referrals to be closed)
*/
var CleanEndOfMonth = (clslist)=>{
    var clnlist = [];
    try{
        for(let x=0;x<clslist.length;x++){
            clslist[x].status = 'C';
        }
        clnlist = clslist;
    }catch{}

    return clnlist;
}

var RefreshEOM = (rlist)=>{
  var nrlist = [];
  console.log('Referesh',rlist);
  try{
    for(let x=0;x<rlist.length;x++){
      if(Number(rlist[x].paid)!=0){
        rlist[x].status='A';
      }else{rlist[x].status='D'}
    }
    nrlist = rlist;
  }catch{}
  return nrlist;
}

/*  PRINT EOM


*/
var printrefheads=[
  "Date",
  "WO",
  "Address",
  "CustLName",
  "CustFName",
  "ReferTo",
  "SpiffFor",
  "paid",
  "comments"
]
var inputprintrefrow = (drow)=>{
  let row = document.createElement('div');
  for(let x=0;x<printrefheads.length;x++){
    row.appendChild(document.createElement('div'));
    row.lastChild.innerText = drow[printrefheads[x]] || ''
  }
  return row;
}

var PrintEOM = ()=>{

  var rdata = JSON.parse(localStorage.getItem(reportls.EOMrepdata)) || null;
  if(rdata){
    console.log('Report is Printing...');
    console.log(rdata);
    //get the report print CONTAINER
    var printcont = document.getElementById(repdom.EOMview.techlist);
    printcont.innerHTML = '';

    //try{
      for(let x=0;x<rdata.ids.length;x++){//loop through id objects
        //clone the tech page TEMPLATE
        var techpage = document.getElementById(repdom.EOMview.pagetemplate).getElementsByClassName(repdom.EOMview.page.cont)[0].cloneNode(true);
        var refsum={
          'A':0,
          'D':0,
          'O':0
        }
        let paidtot = 0;


        techpage.getElementsByClassName(repdom.EOMview.page.id)[0].innerText = rdata.ids[x].id;
        techpage.getElementsByClassName(repdom.EOMview.page.lname)[0].innerText = rdata.ids[x].lname;
        techpage.getElementsByClassName(repdom.EOMview.page.fname)[0].innerText = rdata.ids[x].fname;

        techpage.getElementsByClassName(repdom.EOMview.page.month)[0].innerText = rdata.month;

        for(let y=0;y<rdata.list.length;y++){
          if(rdata.list[y].TechID == rdata.ids[x].id){//match to a tech's referral
            refsum[rdata.list[y].status]++;//increse status count
            if(rdata.list[y].status == 'A'){paidtot+=((rdata.list[y].paid!=''||Number(rdata.list[y].paid)!=0)?Number(rdata.list[y].paid):0);} //increase commission pay D,O=0 A=will have price

            //PROBLEM
            try{
              techpage.getElementsByClassName(repdom.EOMview.page.tables[rdata.list[y].status.toUpperCase()])[0].appendChild(inputprintrefrow(rdata.list[y]));//create and add a row to the table
              techpage.getElementsByClassName(repdom.EOMview.page.tables[rdata.list[y].status.toUpperCase()])[0].lastChild.classList.add(repdom.EOMview.page.tables.row);
            }catch{}
          }
        }
        techpage.getElementsByClassName(repdom.EOMview.page.paidtot)[0].innerText = paidtot;
        techpage.getElementsByClassName(repdom.EOMview.page.apprcnt)[0].innerText = refsum['A'];
        techpage.getElementsByClassName(repdom.EOMview.page.lostcnt)[0].innerText = refsum['D'];
        techpage.getElementsByClassName(repdom.EOMview.page.opencnt)[0].innerText = refsum['O'];

        techpage.getElementsByClassName(repdom.EOMview.page.sbmtcnt)[0].innerText = refsum['A']+refsum['D']+refsum['O'];

        $(techpage).show();
        printcont.appendChild(techpage);
      }
    //}catch{}
  }else{console.log('Must run the report first')}
  //check if there is a report already ran

window.print();
}

module.exports = {
    SetupEOMButton,
    RunEndOfMonth,
    CleanEndOfMonth,
    RefreshEOM,
    PrintEOM
}
