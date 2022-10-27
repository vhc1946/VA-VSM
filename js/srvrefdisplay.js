const {ipcRenderer}=require('electron');

const $ = require('jquery');

var { //LocalStorage
    referalls
}=require('./lstore.js');
var {
    SrvReferals
}=require('./srvreferals.js');


/*  EDIT MODULE /////////////////////////////////////////////////////////////////////////////////////
*/
/* Puts Referal information onto dom
*/
var PutToEditMod = (ref)=>{
    localStorage.setItem(referalls.toedit,JSON.stringify(ref));
    for(let v in srdom.eview.edit.info){ //load data to dom
        let dat = document.getElementById(srdom.eview.edit.info[v]);
        if(dat.innerText && v !='comments'){
            dat.innerText = ref[v];
            //console.log(v, '=',dat.innerText);
        }else{

          dat.value = ref[v];
          console.log(v, '=',dat.value)
        }
    }
    $('#' + srdom.eview.container).show();

}
/* Get Referal Information from dom
    First gets the current referal being
     edited from local storage. It then
     loops through the dom elements to
     grab/set new referal data.
    The update Referal is then returned
     as an object.
*/
var GetFrmEditMod = ()=>{
    let ref = JSON.parse(localStorage.getItem(referalls.toedit));
    for(let v in srdom.eview.edit.info){ //load data to dom
        let dat = document.getElementById(srdom.eview.edit.info[v]);
        if(dat.innerText && v!='comments'){
            ref[v] = dat.innerText;
            //dat.innerText = ''
        }else{
          if(v=='status'){ref[v] = dat.value.toUpperCase()}
          ref[v] = dat.value;
          //dat.value = ''
        }
    }
    return ref;
}

var SetEditModOptions=(rlist)=>{
    for(let but in srdom.eview.edit.buttons){
        document.getElementById(srdom.eview.edit.buttons[but][0]).addEventListener('click',(ele)=>{
            let ref = srdom.eview.edit.buttons[but][1]();
             if(ref){
                let elist = JSON.parse(localStorage.getItem(referalls.editlist));
                if(!elist || elist == undefined){
                    elist = [];
                }
                elist.push(ref);
                localStorage.setItem(referalls.editlist,JSON.stringify(elist));
             }
        });
    }
}

/* Actions for Edit Module
*/
var editsubmit = ()=>{
    console.log('Submiting Edit...');
    let ref = GetFrmEditMod();
    console.log(ref);
    if(ref && (ref.status && ref.status != undefined) && ref.status != ''){
        switch(ref.status){
            case 'A':
                if(ref && (ref.paid && ref.paid != undefined) && ref.paid != ''){
                }else{
                    console.log("No Input on Spiff Amount. CANNOT submit");
                    return false;
                }
        }

        ref.lastdate = new Date().toISOString().split('T')[0];
        localStorage.setItem(referalls.toedit,false);
        $('#'+srdom.eview.container).hide();
        return ref;
    }else{
        console.log("No Input on status. CANNOT submit");
        return false;
    }
}
var editcancel = (ele)=>{
    console.log('Cancel Edit...');
    localStorage.setItem(referalls.toedit,false);
    $('#'+srdom.eview.container).hide();
    return false;
}
//////////////////////////////////
/*  Actions for Table Row Option Bar
*/
var reqappr = (ref)=>{
    ref = JSON.parse(JSON.stringify(ref));
    console.log('Approve');
    ref.status = 'A';
    PutToEditMod(ref);
}
var reqdeny = (ref)=>{
    ref = JSON.parse(JSON.stringify(ref));
    console.log('Deny');
    ref.status = 'D';
    PutToEditMod(ref);
}
var reqedit = (ref)=>{
    console.log('Edit');
    PutToEditMod(ref);
}
///////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////



var srdom = {
    cont:'ref-container',
    reporting:{
        cont:'ref-reporting',
        toggle: 'ref-report-button',
        manage:{
            cont:'ref-manage-report',
            runEOM:'runEOM',
            cleanEOM:'cleanEOM'
        }
    },
    summary:{
        apprCount:'ref-table-appr-cnt',
        denyCount: 'ref-table-deni-cnt',
        openCount: 'ref-table-open-cnt',
        submitCount: 'ref-sbmt-cnt',
        totalPay: 'ref-total-commish'
    },

    /* Referal Table Views  //////////////////////////////////////////
    //////////////////////////////////////////////////////////////////
        Organized to work with
    */
    rview:{
        /* This view represents differently sorted
        */
        utils:{ //names used by all views
            switchselected : 'ref-table-switch-selected',
            trowbar:{
                hover:'ref-tablerow-hover',
                editing:'ref-tablerow-editing',
                editbarbutt:'ref-tablerow-editbar-butt',
                editbar:'ref-tablerow-editbar',
                editswtch: 'ref-tablerow-editbar-swtch',
                editbutts: 'ref-tablerow-editbarbutts',
                editicons: {
                    approved: '../assets/thumbs-up-icon.png',
                    denied:'../assets/thumbs-down-icon.png',
                    open:'../assets/more-info.png',
                    more:'../assets/more-info.png'
                },
                /* Actions available for a given table row
                    Acts as map to pass a referal on to be
                    modified and recirculated into the flow
                */
                optactions:{
                    approve: ['request-appr',reqappr,'../assets/thumbs-up-icon.png'],
                    deny:['request-deny',reqdeny,'../assets/thumbs-down-icon.png'],
                    edit:['request-edit',reqedit,'../assets/edit-icon.png']
                }
            },
            datalist:{ //datalist for input fields

                ReferTo: 'ref-referto-list',
                SpiffFor: 'ref-spifffor-list',
                TechID: 'ref-techid-list'
            },
            userfilters:{ //User input fields that filter
                TechID: 'ref-table-techid',
                WO:'ref-table-wo',
                ReferTo: 'ref-table-referto',
                SpiffFor: 'ref-table-spifffor',
                Address:'ref-table-address',
                CustLName:'ref-table-custlname'
            }
        },
        /* Relative Objects
            The following are the categories in that
        */
        appr: 'appr',
        deny: 'deny',
        open: 'open',
        close: 'close',
        views:{ //view container names
            appr: 'ref-table-appr',
            deny: 'ref-table-deny',
            open: 'ref-table-open',
            close: 'ref-table-closed'
        },
        swtchs:{ //buttons to switch between views
            appr: 'ref-table-switch-appr',
            deny:'ref-table-switch-deny',
            open:'ref-table-switch-open',
            close:'ref-table-switch-closed'
        },
        roptbar:{ //Option bar
            appr:'appr-tablerow-optionbar',
            deny:'deny-tablerow-optionbar',
            open:'open-tablerow-optionbar',
            close:'closed-tablerow-optionbar'
        },
        theads:{ //Table headers to exclude  //lastdate is not in use any more, but included for safety
            appr: ['FormID','_id','status','closedate','reportmonth','lastdate'],
            deny: ['FormID','_id','paid','status','closedate','reportmonth','lastdate'],
            open: ['FormID','_id','paid','lastdate','status','closedate','reportmonth','lastdate'],
            close:['FormID','_id','lastdate','paid','status','closedate','lastdate']
        },
        disheads:{
            TechID: 'ID',
            TechLName: 'Last',
            TechFName: 'First',
            WO: 'WO#',
            Address:'Address',
            paid:'Paid',
            ReferTo:'Refer',
            SpiffFor: 'Spiff For',
            status: 'Status',
            lastdate: 'Modified',
            CustLName: 'Last',
            CustFName: 'First',
            Date: 'Date',
            comments: 'Notes',
            reportmonth:'Reported In'
        }
    },
    /////////////////////////////////////////////////////////////////////

    /* Referral Edit Views
    */
    eview:{
        container:'ref-edit-container',
        views:{
            edit:'ref-edit-module'
        },
        swtchs:{
            edit:'request-edit'
        },
        edit:{
            info:{
                /* READ ONLY */////////////////
                FormID: 'edit-formid',
                TechID: 'edit-techid',
                TechLName: 'edit-tlname',
                TechFName: 'edit-tfname',
                WO: 'edit-wo',
                SpiffFor: 'edit-spifffor',
                ReferTo: 'edit-referto',
                ///////////////////////////////

                status: 'edit-status',
                paid: 'edit-paid',
                comments: 'edit-comments',

            },
            buttons:{
                save:['edit-submit-button',editsubmit],
                cancel:['edit-cancel-button',editcancel]
            }
        }
    },
}


/*  Service Referal Display ///////////////////////////////////////////////////////////////////////////////////
*/
class SrvReferalDisplay extends SrvReferals{
    /* Contstructor /////////////////////////////////////////////////////
    */
    constructor(refList,refView){
        super(refList);
        this.rtable = null; //table with data

        if(refView && srdom.rview.views[refView] && document.getElementById(srdom.rview.views[refView])){
            this.rview = refView;
            this.rtable = document.getElementById(srdom.rview.views[this.rview]);
        }else{console.log('Check ' + this.rview + ' view dom name...')}

        this.SetTable(); //set the table
    }

    /* Load Referal Table ///////////////////////////////////////////////
        Loads a table element with rows of data from rlist into
        the table named rtable.
    */
    SetTable = ()=>{
        let trow; //temp row
        let tdat; //temp dat
        let thdat; //temp head
        let thead; //

        if(this.rtable){
            this.rtable.innerHTML = '';

            for(let x=0;x<this.srlist.length;x++){ //loop through array of objects
                trow = document.createElement('tr');
                if(x == 0){thead = document.createElement('tr');}else{thead=null;}

                for(let r in this.srlist[x]){ //loop through object
                    tdat = document.createElement('td');
                    if(thead){thdat = document.createElement('td');}
                    if(srdom.rview.theads[this.rview].includes(r)){ //hide columns
                        $(tdat).hide();
                        if(thead){$(thdat).hide();}
                    }
                    tdat.innerText = this.srlist[x][r];
                    trow.appendChild(tdat);
                    if(thead){
                        thdat.innerText = (srdom.rview.disheads[r] || srdom.rview.disheads[r] != undefined ) ? srdom.rview.disheads[r] : '-';
                        thead.appendChild(thdat);
                    }
                }
                trow.appendChild(document.createElement('td')).addEventListener('click',this.SetTableRowEditor); //set the editbar switch

                //place image for more info in last cell
                trow.children[trow.children.length-1].appendChild(document.createElement('img')).src = srdom.rview.utils.trowbar.editicons.more; // set show/hide row edit bar button
                trow.children[trow.children.length-1].classList.add(srdom.rview.utils.trowbar.editbarbutt);
                if(thead){this.rtable.appendChild(thead);}
                this.rtable.appendChild(trow);
            }
        }
    }
    /* Event placed at end of row ///////////////////////////////////////
        Loads/delets an edit bar from a row
    */
    SetTableRowEditor = (ele)=>{
        let elpar = ele.target; //finds the table row
        while(elpar.tagName!= 'TR'){
            elpar = elpar.parentNode;
        }
        if(elpar.classList.contains(srdom.rview.utils.trowbar.editing)){
            elpar.classList.remove(srdom.rview.utils.trowbar.editing); //remove editing
            elpar.removeChild(elpar.children[elpar.children.length-1]);
        }else{
            elpar.classList.add(srdom.rview.utils.trowbar.editing); //declare editing
            elpar.appendChild(document.createElement('td')).innerHTML = document.getElementById(srdom.rview.roptbar[this.rview]).innerHTML;
            elpar.children[elpar.children.length-1].classList.add(srdom.rview.utils.trowbar.editbar);
            this.SetRefOptionButtons();
        }
    }

    /* Sets the option bar actions //////////////////////////////////////
    */
    SetRefOptionButtons = ()=>{
        for(let o in srdom.rview.utils.trowbar.optactions){
            let opt = srdom.rview.utils.trowbar.optactions[o];
            let butts = this.rtable.getElementsByClassName(opt[0]);
            for(let x=0;x<butts.length;x++){
                butts[x].addEventListener('click',(ele)=>{
                    let trow = ele.target.parentNode.parentNode;
                    let ref = this.TRIMsrlist({FormID:trow.children[0].innerText})[0];//
                    if(ref || ref !=undefined){
                        opt[1](ref);
                    }else{

                    }
                });
                butts[x].src = opt[2];
            }
        }
    }
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////




/* Switch a View    /////////////////////////////////////////////
    PASS:
        - butt - element selected
        - view = {
            views:{}
            swtchs:{}
        }
*/
var switchview = (views,swtch)=>{
    for(let v in views){
        if(swtch == v){
            $('#'+ views[v]).show();
            document.getElementById(srdom.rview.swtchs[v]).classList.add(srdom.rview.utils.switchselected);
        }else{
            $('#' + views[v]).hide();
            document.getElementById(srdom.rview.swtchs[v]).classList.remove(srdom.rview.utils.switchselected);
        }
    }
}

/*  Setting Table Switches  /////////////////////////////////////
    PASSED:
        - view = {
            swtchs
        }
*/
var setViewSwitches = ({views,swtchs})=>{
    for(let v in views){
        if(swtchs[v]){
            document.getElementById(swtchs[v]).addEventListener('click',(ele)=>{
                switchview(views,v);
            });
        }
    }
}

///////////////////////////////////////////////////////////////////////////





module.exports = {
    srdom,
    SrvReferals,
    SrvReferalDisplay,

    setViewSwitches,
    SetEditModOptions
}
