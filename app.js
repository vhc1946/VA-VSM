
const { app,
        BrowserWindow,
        ipcMain} = require('electron'),
      path = require('path'),
      fs = require('fs'),
      os= require('os'),
      reader = require('xlsx');

/* Routes
*/
var {
    dashroutes,
    pageroutes,
    reportroutes
} = require('./js/routes.js');

/* Database
    -
*/
var {
    referalsdb,
    devreferalsdb,
    refreportsdb,
    devrefreportsdb,
    refcleansdb,
    devrefcleansdb
} = require('./db/dbsetup.js');

var {
    srvreferal,
    SrvReferals
}= require('./js/srvreferals.js');

var {cmptruser} =require('../repo/toolbox/things/vogel-users.js');
var {
    RunEndOfMonth,
    CleanEndOfMonth,
    RefreshEOM
}=require('./js/referalReport.js');



var mainview;
var dbreferral = referalsdb;//devreferalsdb;
var dbrefreport = refreportsdb; //devrefreportsdb;
var dbrefcleans = refcleansdb; //devrefcleansdb;


//Get user information
var CUser = cmptruser();

/*  Sync with Log //////////////////////////////////////////////
    Referal log is an excel sheet populated after a form is
    submited from Form Stack.
*/
/* checks log for new referals, adds new referals to master */
var AddNewSubmissions = (submits)=>{
    for(let x=0;x<submits.length;x++){
        dbreferral.findOne({FormID: submits[x].FormID},(err, doc)=>{
            if(err){
                //something went wrong
            }else if(!doc){//the referal already exist, check the next referal
                dbreferral.insert(srvreferal(submits[x]),(err,doc)=>{
                    if(err){
                        //something went wrong
                    }else if(doc){
                        newrefs.push(doc); //add to array of new referals
                    }
                });
            }
        });
    }
}

/* reading in from excel file as excel object*/
var reflog = null;
var newrefs= []; //array with new referalls
var mrlist = new SrvReferals(); //Master list of referals

try{ //try to read in new submissions from log
    var reflog = reader.readFile(CUser.spdrive + '/Vogel - Service/Commissions/Log/Commission Que.xlsx'); //temporary setup
    reflog = reader.utils.sheet_to_json(reflog.Sheets[reflog.SheetNames[0]]); //array of all referals in log
    AddNewSubmissions(reflog);

}catch(e){
    reflog = null; //could not read from log
    console.log('Could not reach Que');
}

/* parse sheet from reflog to object */
//Fill mrlist with contents in db
dbreferral.findOne({},(err,doc)=>{
    if(err){
        mrlist = null;
    }else if(doc){
        mrlist.SETsrlist(doc);
    }
});


/* Starting Call    ///////////////////////////////////////////////
*/
app.on('ready',(eve)=>{
    mainview = new BrowserWindow({
        webPreferences:{
            nodeIntegration: true,
            contextIsolation: false
        },
        //autoHideMenuBar: true,
        width: 1500,
        height: 1500,
    });
    mainview.loadURL(path.join(__dirname,'/controllers/dash.html'));
    mainview.on('close',(eve)=>{
        app.exit();
    });
});

/*  View Calls  */
ipcMain.on(pageroutes.reporting,(eve,data)=>{
  console.log(data);
  mainview.loadURL(path.join(__dirname,'/controllers/reportdash.html'));
  eve.sender.send(pageroutes.reporting,'Reporting Page Has Loaded');
});

ipcMain.on(pageroutes.userdash,(eve,data)=>{
  console.log(data);
  mainview.loadURL(path.join(__dirname,'/controllers/dash.html'));
});

/* Sync Referals with db    //////////////////////////////////////
    First call from main controller on startup
*/
ipcMain.on(dashroutes.getAllReferals,(eve,data)=>{
  console.log("GET REFERRALS")
    dbreferral.loadDatabase();
    let that ={
        one:false,
        two:reflog
    }
    dbreferral.find({},(err,doc)=>{
        if(err){
            eve.sender.send(dashroutes.getAllReferals,false);
        }else if(doc){
            mrlist.SETsrlist(doc);
            eve.sender.send(dashroutes.getAllReferals,doc); //send referals to requester
        }else{
            console.log('not connected')
            eve.sender.send(dashroutes.getAllReferals,false);
        }
    });
});

ipcMain.on(dashroutes.updateReferals,(eve,data)=>{
    if(data && data!=undefined){

        console.log(data);
        for(let x=0;x<data.length;x++){
            dbreferral.update({FormID : data[x]['FormID']},{$set:data[x]},{},(err,doc)=>{
                if(err){
                    console.log('error');
                }else if(doc){
                }
            });
        }
    }else{eve.sender.send(dashroutes.updateReferals,false);}
});



/*  Report Dash calls
*/
ipcMain.on(reportroutes.GETlast,(eve,data)=>{
  var lastrep = {
    status:false,
    repdata:null
  }
  dbrefreport.find({},(err,doc)=>{
    if(doc){
      lastrep.status=true;
      try{
        lastrep.repdata = doc.pop();
        console.log(lastrep);
        eve.sender.send(reportroutes.GETlast,lastrep);
      }catch{eve.sender.send(reportroutes.GETlast,lastrep)}
    }
    else{eve.sender.send(reportroutes.GETlast,lastrep)} //did not find a report
  });
});
//takes a list of referrals to be updated in database



var updatereferrals = (cnt,reftoup)=>{
    if(cnt<reftoup.length){
        dbreferral.update({FormID:reftoup[cnt].FormID},{$set:reftoup[cnt]},{},(err,doc)=>{
            updatereferrals(++cnt,reftoup);
        });
    }
}

/*

    data = {
      ids = [], //list of employee ids to include in report
      list = [], //list of referrals to include
      reportmonth = string //month of the report
    }
*/
ipcMain.on(reportroutes.runEOM,(eve,data)=>{
    console.log('Run EOM');
    if(data && data!=undefined){
        updatereferrals(0,data.list);
        //save "data" to the report database
        dbrefreport.insert(data,(err,doc)=>{ //insert the recently ran report
          if(doc){eve.sender.send(reportroutes.runEOM,{run:true,message:'Report Was Saved',report:doc});}//return the report
          else{eve.sender.send(reportroutes.runEOM,{run:false,message:'Run Not Saved'});}
        });
    }else{eve.sender.send(reportroutes.runEOM,{run:false,message:'No Referrals to Report'});}
});


ipcMain.on(reportroutes.cleanEOM,(eve,data)=>{
    console.log('Clean EOM')
    let canclean = false
    if(data){
      //check to see if the a clean can happen
      dbrefreport.find({}).sort({date:-1}).limit(1).exec((err,doc)=>{
        if(doc){ //check for the 'last report'
          try{
            let repdata = doc[0]; //save the last report data
            dbrefcleans.find({}).sort({date:-1}).limit(1).exec((err,cdoc)=>{
              if(cdoc){ //check for the 'last clean'
                console.log(cdoc[0]);
                try{
                  let cleandate = cdoc.pop().date;
                  if(cleandate < repdata.date){ //compare the last report date to the last clean date
                    canclean = true;
                  }
                  else{eve.sender.send(reportroutes.cleanEOM,{clean:false,message:'Run Report First'});} //last clean was after last report. Do not Clean
                }catch{canclean=true}//Clean log has not been initlialized. Can Clean
              }
              else{canclean=true} //no clean found. Can Clean
              if(canclean){
                console.log('Cleaning');
                updatereferrals(0,CleanEndOfMonth(data));//clean the past referrals
                dbreferral.find({},(err,rdoc)=>{
                    if(rdoc){
                        eve.sender.send(dashroutes.getAllReferals,rdoc);//send refreshed list of referrals
                    }
                });
                dbrefcleans.insert({
                  date:new Date(),
                  runner:os.userInfo().username,
                  month:repdata.month
                });
                eve.sender.send(reportroutes.cleanEOM,{clean:true,message:'Referrals have been Cleaned'})
              }
              else{eve.sender.send(reportroutes.cleanEOM,{clean:false,message:'Clean Failed'});} //some bad clean check. Do Not Clean
            });

          }catch{eve.sender.send(reportroutes.cleanEOM,false)}//report log has not been intilialized. Do not Clean
        }
        else{eve.sender.send(reportroutes.cleanEOM,{clean:false,message:'No Completed Reports'});} //Could not find Report. Can not Clean
      });
    }else{eve.sender.send(reportroutes.cleanEOM,{clean:false,message:'No Referrals to Clean'});}
});

ipcMain.on(reportroutes.refreshEOM,(eve,data)=>{
  console.log('Refresh EOM');
  let repdata;
  let clndate;
  let canrefresh = false;
  if(data){
    dbrefreport.find({}).sort({date:-1}).limit(1).exec((err,rdoc)=>{
      if(rdoc){
        try{
          repdata = rdoc[0];
          dbrefcleans.find({}).sort({date:-1}).limit(1).exec((err,cdoc)=>{
            if(cdoc){
              try{
                clndate = cdoc[0].date;
                canrefresh = true;
              }catch{
                eve.sender.send(reportroutes.refreshEOM,{refresh:false,message:'Must Clean First'});
              }
            }else{eve.sender.send(reportroutes.refreshEOM,{refresh:false,message:'Must Clean First'})}

            if(canrefresh && repdata.date<clndate){
              //check to see if a refresh can be run
              updatereferrals(0,RefreshEOM(data));
              eve.sender.send(reportroutes.refreshEOM,{refresh:true,message:'Referrals have been Refreshed'});
            }else{
              eve.sender.send(reportroutes.refreshEOM,{refresh:false,message:'Must run Cleaning before Refresh'})
            }
          });
        }catch{eve.sender.send(reportroutes.refreshEOM,{refresh:false,message:'Refresh has Failed'})}
      }else{eve.sender.send(reportroutes.refreshEOM,{refresh:false,message:'No Reports have been run'})}
    });
  }
  else{eve.sender.send(reportroutes.refreshEOM,{refresh:false,message:'No Referrals to Refresh'});}
});
