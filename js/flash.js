function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}
var csrftoken = getCookie("csrftoken");
var startbutton = document.getElementById("startbutton");
var startbutton2 = document.getElementById("startbutton2");
var learnbutton = document.getElementById("learnbutton");
var startcore = document.getElementById("startcore");
var audio = document.getElementById("audio");

var audio2 = document.getElementById("audio2");
var audio3 = document.getElementById("audio3");
var lset = localStorage.getItem("set");
var aaa = lset;

var localuserid = localStorage.getItem("userid");
console.log(localuserid);

localStorage.setItem("etype", "eflash");

var cattower = 0;

var audioonoff = localStorage.getItem("soundonoff");

var playword = "";

var wordbold = document.getElementsByClassName("wordstrong");
for (var i = 0; i < wordbold.length; i++) {
  wordbold[i].style.color = "#FFA900";
}

poopindex = 0;

startbutton.addEventListener("click", function () {
  location.reload();
  localStorage.setItem("etype", "eflash");
  localStorage.setItem("wordbank", "off");
  window.location.href = "http://127.0.0.1:8000/flashcard2";
});

startbutton2.addEventListener("click", function () {
  location.reload();
  localStorage.setItem("etype", "eflash");
  localStorage.setItem("wordbank", "on");
  window.location.href = "http://127.0.0.1:8000/flashcard";
});

learnbutton.addEventListener("click", function () {
  location.reload();
  localStorage.setItem("etype", "eflash");
  window.location.href = "http://127.0.0.1:8000/flashcardlearn";
});

startcore.addEventListener("click", function () {
  console.log("herro");
});

setTimeout(function () {
  startprogram();
}, 10);

function startprogram() {
  var wordgroup2 = [];
  var wordgroup = [];
  var activityname = "default";
  var actid = 0;

  var bankstatus = localStorage.getItem("wordbank");
  console.log(bankstatus);
  if (bankstatus == "off") {
    $("#bankbox").fadeOut(5000);
  }

  var bonuspoints = 100;
  if (bankstatus == "off") {
    bonuspoints = 150;
  }

  //fix to just use api later on

  var tpoint = 0;

  function getscore() {
    var wrapper = document.getElementById("loopbox3");
    fetch("http://127.0.0.1:8000/userpointapiview")
      .then((resp) => resp.json())
      .then(function (data) {
        //        console.log('userpoints: ', data)
        var list = data;
        console.log(localuserid);
        for (var x in list) {
          if (list[x].student == localuserid) tpoint += list[x].point;
          //                console.log(tpoint)
        }
      })
      .then(function () {
        console.log(tpoint);

        //                wrapper.innerHTML += ` ${tpoint}`;
      });
  }

  getscore();

  function getwordvalue(callback) {
    var wrapper = document.getElementById("loopbox2");
    fetch("http://127.0.0.1:8000/api")
      .then((resp) => resp.json())
      .then(function (data) {
        //        console.log('wordbank: ', data)
        var list = data;
        console.log(wordgroup2);
        var flashwords = list.filter((i) => wordgroup2.includes(i.id));
        wordgroup = flashwords;
        console.log(flashwords);
        console.log(wordgroup);
        for (var i in flashwords) {
          var item2 = `
             <strong>${flashwords[i].vocab} &middot; </strong>`;
          wrapper.innerHTML += item2;
        }
        callback();
      });
  }

  function buildlist(callback) {
    var wrapper = document.getElementById("loopbox");
    var settt = document.getElementById("settitle");
    var url = "http://127.0.0.1:8000/apisetdetail/" + aaa;
    fetch(url)
      .then((resp) => resp.json())
      .then(function (data) {
        console.log("corelist: ", data);
        var list = data;
        activityname = list.setName;
        actid = list.id;
        settt.innerHTML = "**" + list.setName + "";
        wordgroup2 = list.vocab;
        //            wrapper.innerHTML += wordgroup2;
        //word id
        callback(checklist);
      });
  }

  buildlist(getwordvalue);

  var item = [];
  var popindex = 0;
  let i = 10;
  count = 0;

  function getIndex(search) {
    return search.vocab === item[0].vocab;
  }
  function checklist() {
    $("#startbutton").hide();
    $("#startbutton2").hide();
    $("#learnbutton").hide();
    //        if (poopindex == 15) {
    //            alert("that's a lot of poo!")
    //
    //        }

    timeStart();
    console.log(wordgroup);
    var randomItem = wordgroup[Math.floor(Math.random() * wordgroup.length)];
    console.log(randomItem);
    $("#title").html(randomItem.meaning);
    console.log("sound vocab: " + randomItem.vocab);
    playword = randomItem.vocab;

    item.push(randomItem);
    count = wordgroup.length;
    var barcount = "&#10074; ";
    document.getElementById("rembar").innerHTML = barcount.repeat(count);
    popindex = wordgroup.findIndex(getIndex);
    //            item.forEach(wordloop);
    $("#worddisplay").html(`<i class="bi bi-receipt-cutoff text-info">
        </i>Words Left: <span class="text-light">${count}</span>`);
    console.log(wordgroup);
  }
  function wordloop(word, index) {
    document.getElementById("wordlist").innerHTML +=
      index + ": " + word.vocab + ", ";
  }

  var student = localuserid;
  var coreset = aaa;
  var correct = 0;
  var incorrect = 0;
  var donedate = new Date();
  var incorrectwords = [];
  var result1 = 0;
  var result3 = 0;

  var wrong = 0;

  var donedate2 = donedate.toLocaleString();

  var addsetpoint = function () {
    var url = "/userstatdata2api";
    console.log(activityname);

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken,
      },
      body: JSON.stringify({
        student: student,
        coreset: activityname,
        correct: result3,
        donedate: donedate,
        tpoint: tpoint,
        type: "flash",
        actid: actid,
      }),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log("data", data);
      });
  };

  var addsetcompletestat = function () {
    var url = "/flashcardrecord2api";

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken,
      },
      body: JSON.stringify({
        student: student,
        coreset: coreset,
        correct: correct,
        incorrect: incorrect,
        donedate: donedate,
      }),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log("data", data);
      });
  };
 