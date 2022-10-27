

const DataStore = require('nedb');
const path = require('path');
var {cmptruser} =require('../../repo/toolbox/things/vogel-users.js');
//
var dbroot = 'Vogel - IM/dev/Projects/SERCOMM/db/store/'
var srvroot = 'Y:/DB/store/referstore/'


var refdbfilename = 'referals.db';
var refrepdbfilename = 'refreportlog.db';
var refcleandbfilename = 'refcleanlog.db';

//datastores

var cuser = cmptruser();

//referral databases
var referalsdb = new DataStore(srvroot+refdbfilename);
var devreferalsdb = new DataStore(path.join(__dirname,'/store/'+refdbfilename)); //test

//referral report databases
var refreportsdb = new DataStore(srvroot+refrepdbfilename);
var devrefreportsdb = new DataStore(path.join(__dirname,'/store/'+refrepdbfilename));//test

//clean log database
var refcleansdb = new DataStore(srvroot+refcleandbfilename);
var devrefcleansdb = new DataStore(path.join(__dirname,'/store/'+refcleandbfilename));

//setup and load referral db
referalsdb.loadDatabase();
referalsdb.ensureIndex({fieldName: 'FormID', unique: true});

//setup and load referral report db
refreportsdb.loadDatabase();


//setup and load clean report db
refcleansdb.loadDatabase();

module.exports={
    referalsdb,
    devreferalsdb,
    refreportsdb,
    devrefreportsdb,
    refcleansdb,
    devrefcleansdb
}
