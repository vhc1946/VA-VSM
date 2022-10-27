/* Service Referals
    Handling of:
        - Service Referal Objects
        - Service Referal Lists
*/

var {ExcelDateToJSDate}=require('../../repo/toolbox/xltools.js');


/* Service Referal Object
    Used to ensure the quality of a service
     referal objects.

    Function that takes in an object (or
     nothing), and returns a clean service
     referal object.

*/
var srvreferal = (srvr)=>{
    if(!srvr){
        srvr = {};
    }
    return {
        /*   FROM EXCEL   */
        FormID : String(srvr.FormID) || '', //WONT CHANGE

        TechID : srvr.TechID || '',
        TechLName : String(srvr.TechLName).toUpperCase() || '',
        TechFName : String(srvr.TechFName).toUpperCase() || '',


        Date : (srvr.Date) ? (String(srvr.Date).includes('T') ? (String(srvr.Date).split('T')[0]) : ExcelDateToJSDate(parseInt(srvr.Date)).toISOString().split('T')[0]) : (new Date().toISOString().split('T')[0]), //[0]=data , [1]=time

        WO : srvr.WO || '',
        Address: String(srvr.Address).toUpperCase() || '',
        CustLName: (srvr.CustLName || srvr.CustLName !=undefined) ? String(srvr.CustLName).toUpperCase() : '',
        CustFName: (srvr.CustFName || srvr.CustFName !=undefined) ? String(srvr.CustFName).toUpperCase() : '',

        ReferTo: srvr.ReferTo || 'OTHER',
        SpiffFor: srvr.SpiffFor || '',
        status: srvr.status || 'O', /*O=OPEN,A=APPROVED,D=DISAPROVED,H=HOLDING)*/
        paid: srvr.paid || 0,

        comments: srvr.comments || '', //want to make array. will treat as last comment for now

        ////////////////////

        //the date runEOM()
        closedate:srvr.closedate?Date(srvr.closedate).toISOString.split('T')[0]:null,
        reportmonth:srvr.reportmonth?srvr.reportmonth:null,

    }

}

/*  Service Referal Lists //////////////////////////////////////////////////////////////////////////
    Manages a list of service referals.
*/
class SrvReferals{
    constructor(srvreflist){
        this.srlist=[]; //pool of referals to work with
        if(srvreflist && srvreflist!=undefined){ //list passed in
            this.srlist = srvreflist;
        }
    }

    /* Set srlist /////////////////////////////////////
        PASSED:
            nsrlist: outside srvreferal list
        Sets srlist to passed nsrlist, OR if
         passed nothing, srlist is emptied.
    */
    SETsrlist = (nsrlist)=>{
        if(nsrlist){ //nsrlist
            //additional checks on nsrlist
            this.srlist = nsrlist;
        }else{
            if(nsrlist != undefined){ //to make sure a failed attempt to pass wasnt made
                this.srlist = [];
            }
        }
    }
    /* Get srlist /////////////////////////////////////
    */
    GETsrlist = ()=>{
        if(this.srlist || this.srlist!=undefined){
            return this.srlist;
        }else{return []};
    }
    /* Trim list flts object  //////////////////////////
        PASS:
            - flts = {
                *any properties of the referals object
            }

        Loops throught the flts object for == matches
         on like prop names. Referals that fit the
         requirements are collected into an object
         array.
    */
    TRIMsrlist = (flts)=>{
        var rsortlist = [];
        if(this.srlist){
            for(let x=0;x<this.srlist.length;x++){
                let found = true;
                if(flts){
                    let fcheck = {};
                    for(let f in flts){ //need to make sure ALL flts are honored
                        fcheck[f] = false;
                        if(this.srlist[x][f]!=undefined){
                                var multiflt = flts[f].split(',');
                                for(let y=0;y<multiflt.length;y++){
                                    if(this.srlist[x][f].toUpperCase() == multiflt[y].toUpperCase() || this.srlist[x][f].toUpperCase().includes(multiflt[y].toUpperCase())){
                                        fcheck[f] = true;
                                        break;
                                    }
                                }
                        }
                    }

                    for(let fc in fcheck){
                        if(!fcheck[fc]){
                            found = false;
                        }
                    }
                }
                if(found){rsortlist.push(this.srlist[x]);}
            }
        }
        return rsortlist;
    }


    GETpayout = ()=>{
        let pout = 0;
        if(this.srlist){
            for(let x=0;x<this.srlist.length;x++){
                if(this.srlist[x].paid){
                    pout = pout + parseInt(this.srlist[x].paid);
                }
            }
        }
        return pout;
    }
    /* Changes the status of a referal  ////////////////
        Takes a referal id and a desired status to change
         to. Finds the correct referal id and changes the:
            - status
            - chngdate
            of a referal.
        Returns an activity log object with data about the
         change.
    */
    ChangeStatus = (refID, nstatus, apprname)=>{
        let chngd;
        let actdescr = 'STATUS CHANGE';

        for(let x=0;x<this.srlist.length;x++){
            chngd = false;
            if(this.srlist[x].FormID == refID){
                switch(nstatus){ //confirm that the correct code was sent
                case 'A':
                    this.srlist[x].status = nstatus;
                    chngd = true;
                case 'D':
                    this.srlist[x].status = nstatus;
                    chngd = true;
                case 'O':
                    this.srlist[x].status = nstatus;
                    chngd = true;
                }
                if(chngd){
                    this.srlist[x].lastdate = Date(); //set the chngdate to NOW

                }
                break;
            }
        }
        return this.ActivityLog({user: apprname,
                                 activity: actdescr,
                                 success: chngd
                                });
    }

    /* Activity Log ////////////////////////////////////
        Creates a log for edits made to referals
    */
    ActivityLog({user,refID,activity,success}){
        return{
            date: (new Date().toISOString().split('T')[0]),
            user: user || '',
            refID: refID || '',
            activity: activity || '',
            success: success || ''
        }
    }

}

module.exports = {
    srvreferal,
    SrvReferals
}
