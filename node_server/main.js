var http = require('http');
var fs = require('fs');
var async = require('async');
require('date-utils');
const firebase = require("firebase/app");
require("firebase/firestore");
require("firebase/auth");

var firebaseConfig = {
    apiKey: "AIzaSyAvIG1G0xo3Mw-n8AYC-04OEk0pKcTGVMo",
    authDomain: "test1-e691f.firebaseapp.com",  
    databaseURL: "https://test1-e691f.firebaseio.com",
    projectId: "test1-e691f",
    storageBucket: "test1-e691f.appspot.com",
    messagingSenderId: "130018653709",
    appId: "1:130018653709:web:0e7847910d63d083648744",
    measurementId: "G-ED4PVSK91X"
};

firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();
var weatherArr = [];
var fullDate;
var location;
var time;
var base_time = ['0200', '0500', '0800', '1100', '1400', '1700', '2000', '2300']

var app = http.createServer(function (request, response) {
    var url = request.url;
    if (request.url == '/') {
        url = '/index.html';
    }
    if (request.url == '/favicon.ico') {
        return response.writeHead(404);
    }
    var mcuDate = 0;
    var mcuTime = 0;
    function nearTime(){
        var newDate = new Date();
        time = newDate.toFormat('HH24:MI:SS');
        mytime = time[0] +time[1] +time[3]+ time[4];
        var smallest = 5000;
        for(i in base_time){  
            if(smallest > Math.abs(mytime-base_time[i]) ){
              smallest =Math.abs(mytime-base_time[i]);
              console.log(mytime-base_time[i] + " " + i + "smallest is" + smallest);
              smallest_i = i;
            }
        }
        //console.log("현재 api 시간은  " + parseInt(base_time[smallest_i]) + " 실제 시간은 " + parseInt(mytime) + "타입은"+ typeof(base_time[smallest_i]) +  " 타입은 " + typeof(mytime));
        if(parseInt(base_time[smallest_i]) > parseInt(mytime)){
            if(smallest_i>1)
                return base_time[smallest_i-1];
            else if(smalles_i == 0)
                return base_time[7];
        }else{
            console.log("no");
        }    
        return base_time[smallest_i];
    }

    function currentTime(){
        mcuDate = new Date();
        var cTime = mcuDate.toFormat('HH24:MI:SS'); 
        cTime = cTime[0] +cTime[1]+cTime[3]+cTime[4];
        return cTime;
    }

    function fDate(){
        var today = new Date();
        var dd = today.getDate();
        var yy = today.getFullYear();
        var mm = today.getMonth() + 1;
        if(dd >9){
            fullDate = yy + '0' + mm + dd;
        }else if(dd <10){
            fullDate = yy + '0' + mm + '0'+ dd;
        }
        return fullDate;
    }

    function database() {
        console.log("데이터 베이스 시작");
        databaseTime = nearTime();
        console.log(weatherArr);
        let data = {
            time : databaseTime,
            date : fullDate,
            tem: weatherArr[4],
            hum: weatherArr[2],
            API: "cast"
        };

        console.log("년월일은 :" + fullDate + "시간은 :!!! " + fullDate+databaseTime);
        let addDoc = db.collection('weather').doc(fullDate+databaseTime).set(data);///3시간 마다 오픈 api 데이터를 파이어베이스 넣는다. 
        let readDoc = db.collection('weather').doc(fullDate+databaseTime);
        readDoc.get().then(function (doc) {
            if (doc.exists) {
                console.log("Document data:", doc.data());
            } else {
                console.log("No such document!");
            }
        }).catch(function (error) {
            console.log("Error getting document:", error);
        });
    }

    function dummyData(){
        for(i of base_time){
            let data = {
                time : i,
                date : fDate(),
                tem: Math.floor(Math.random() * 15)-10,
                hum: Math.floor(Math.random() * 100),
                API: "cast"
            };
    
            let addDoc = db.collection('weather').doc(fDate()+i).set(data);///3시간 마다 오픈 api 데이터를 파이어베이스 넣는다. 
        }
    }

    function mcuDatabase(){
        var temp = fDate();
        mcuTime = currentTime();
        let data = {
            time : mcuTime,
            date : temp,
            hum: Math.floor(Math.random() * 10),
            tem: Math.floor(Math.random() * 10)
        };
        console.log("fdate는 " + temp + "mcuTime은 " + mcuTime);
        //let addDoc = db.collection('weather').doc(temp).set(data);
        let addDoc = db.collection('weather').doc(temp+mcuTime).set(data);///3시간 마다 오픈 api 데이터를 파이어베이스 넣는다. 
        let readDoc = db.collection('weather').doc(temp+mcuTime);
        readDoc.get().then(function (doc) {
            if (doc.exists) {
                console.log("Document data:", doc.data());
                console.log(mcuTime);
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }
        }).catch(function (error) {
            console.log("Error getting document:", error);
        });
    }    
    
    function add(callback) {//open api 호출
        var today = new Date();
        var dd = today.getDate();
        var yy = today.getFullYear();
        var mm = today.getMonth() + 1;
        if(dd >9){
            fullDate = yy + '0' + mm + dd;
        }else if(dd <10){
            fullDate = yy + '0' + mm + '0'+ dd;
        }

        apiTime = nearTime();
        console.log("기상청 시간 " + apiTime + " 현재 날짜 " + fullDate);
        var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
        var xhr = new XMLHttpRequest();
        var myUrl = 'http://newsky2.kma.go.kr/service/SecndSrtpdFrcstInfoService2/ForecastSpaceData';
        var queryParams = '?' + encodeURIComponent('ServiceKey') + '=' + 'aL5c%2BUoVd2ChuApYUlC1S5yo4sfKq5FS9Ct2N9TqY5dUWBFUux1vjHP96hjYRRbz9x%2BTQHuYTAUAYIu8O%2ByQ9w%3D%3D';
        queryParams += '&' + encodeURIComponent('base_date') + '=' + encodeURIComponent(fullDate);
        queryParams += '&' + encodeURIComponent('base_time') + '=' + encodeURIComponent(apiTime);// 3시간마다 업뎃 ex) 2시 5시 8시
        queryParams += '&' + encodeURIComponent('nx') + '=' + encodeURIComponent('61');//역삼동 위치
        queryParams += '&' + encodeURIComponent('ny') + '=' + encodeURIComponent('125');
        queryParams += '&' + encodeURIComponent('_type') + '=' + encodeURIComponent('json');
        xhr.open('GET', myUrl + queryParams);
        var requestedJson;
        var obj;

        xhr.onreadystatechange = function () {

            if (this.readyState == 4) {
                console.log('Status: ' + this.status + ' Headers: ' + JSON.stringify(this.getAllResponseHeaders()) + ' Body: ' + this.responseText);
                requestedJson = this.responseText;
                obj = JSON.parse(requestedJson);
                console.log(obj.response.body.items.item.length);
                for (var i in obj.response.body.items.item) {
                    console.log(i + "is " + obj.response.body.items.item[i].fcstValue);
                    weatherArr.push(obj.response.body.items.item[i].fcstValue);
                }
                console.log("weather arr is " + weatherArr);
            }

        };
        xhr.send('');
        setTimeout(callback, 3000);
    }

    function mcuAdd(callback){
        setTimeout(callback, 1000);
    }
    dummyData();
    add(database);//지금 가장 가까운 시간의 데이터베이스 저장하기 
    setInterval(() => add(database),10800000);//3시간 마다 호출     //setInterval( 10800000);// 3시간 마다 호출 이 방식은 에러가 난다.

    mcuAdd(mcuDatabase);
    mcuAdd(mcuDatabase);
    setInterval(() => mcuAdd(mcuDatabase), 600000); // 600000  --> 10분  600 

    response.writeHead(200);
    response.end(fs.readFileSync(__dirname + url));
});
app.listen(3000);