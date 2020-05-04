// define DOM elements;

const container = document.getElementsByClassName('startingDialog__container')[0];
const spinner = document.getElementsByClassName('startingDialog__spinner')[0];
const loadingText = document.getElementsByClassName('startingDialog__loadingText')[0];
const loadingDialog = document.getElementById('startingDialog');
const videoCont = document.getElementById('videos');
const publisherCont = document.getElementById('publisher');
const breakoutButton = document.getElementById('breakoutButton');
const largeGroupButton = document.getElementById('largeGroupButton');
const subscriberCont = document.getElementById('subscriber');
const arrows = document.getElementsByClassName('arrow-cont')[0];

// (optional) add server code here
var SERVER_BASE_URL = '';
fetch(SERVER_BASE_URL + '/room/myroom').then(function (res) {
  return res.json()
}).then(function (res) {
  apiKey = res.apiKey;
  sessionId = res.sessionId;
  token = res.token;
  document.getElementById('startSession').addEventListener("click", () => {
    container.style.display = "none";
    spinner.style.display = "block";
    loadingText.style.display = "block";
    setTimeout(() => {
      loadingDialog.style.display = "none"
      videoCont.style.display = "block";
      publisherCont.classList.add('active');
      breakoutButton.style.display = "block";
      initializeSession(name);
    }, 3000)
      
  });
}).catch(handleError);

let totalSubs = [];
let connectionCount = 0;

// Handling all of our errors here by alerting them
function handleError(error) {
  if (error) {
    alert(error.message);
  }
}

function initializeSession(name) {
  var session = OT.initSession(apiKey, sessionId);

  // Subscribe to a newly created stream
  session.on('streamCreated', function (event) {
    var subscriber = session.subscribe(event.stream, 'subscriber', {
      name: "Anthony",
      insertMode: 'append',
      width: '220px',
      height: '150px',
      style: {
        nameDisplayMode: "on"
      }
    }, handleError);
  });

  session.on("connectionCreated", e => {
    console.log('someone connected');
    connectionCount++;
    console.log(`There are ${connectionCount} people connected`);

    totalSubs.push(e);

    // if (totalSubs.length > 7) {
    //   setTimeout(() => {
    //     $("#subscriber").slick({
    //       slidesToShow: 6,
    //       slidesToScroll: 1,
    //       infinite: false,
    //       nextArrow: ".forward-arrow",
    //       prevArrow: ".back-arrow"
    //     });
    //   }, 5000)
    // }

    // resize(totalSubs);
  })

  session.on("connectionDestroyed", e => {
    console.log('someone left');
    connectionCount--;
    console.log(`There are ${connectionCount} people connected`);

    totalSubs = totalSubs.filter(subscription => subscription.connection.id !== e.connection.id)
    // resize(totalSubs);
  })

  function resize(subs) {
    //ignores the publisher for now
    let totalSubs = subs.length - 1;
    let rowWidth = 3;

    setTimeout(() => {
      let subDivsCont = document.getElementById("subscriber");
      //may not work on FF
      let subDivs = subDivsCont.querySelectorAll(':scope > div');
      console.log(subDivs);
      if (totalSubs > 0) {
        let count = 1;
        let rowCount = 1;
        let rows = Math.ceil(totalSubs / 3);
        console.log(rows);
        console.log(rowCount);
        subDivs.forEach(subDiv => {
          if (rowCount !== rows) {
            let width = 100 / rowWidth;
            let newWidth = `${width}% !important`
            subDiv.setAttribute('style', `width: ${newWidth}`);
            subDiv.style.height = "180px";
            count++
            console.log(count);
            if (count > rowWidth) {
              count = 1;
              rowCount++;
            }
          }
          else {
            let width = 100;
            if (rowCount > 1) {
              width = 100 / (totalSubs % rowWidth);
            }
            else {
              width = 100 / totalSubs;
            }
            let newWidth = `${width}% !important`
            subDiv.setAttribute('style', `width: ${newWidth}`);
            subDiv.style.height = "180px";
            count++
            if (count === rowWidth) {
              count = 1;
              rowCount++;
            }
          }
        })
      }
    }, 1500)


  }

  breakoutButton.addEventListener('click', () => {
    // totalSubs.forEach(
    //   subscribers => {
    //     console.log(subscribers);
    //   }
    // );
    // if(totalSubs > 7) {
    //   $("#subscriber").slick('unslick');
    // }

    breakoutButton.style.display = "none";
    publisherCont.classList.add('breakout');
    publisherCont.classList.remove('active');
    subscriberCont.style.display = "none";
    loadingText.firstChild.nodeValue = "Moving to Breakout Room...";
    loadingDialog.style.display = "block";
    spinner.style.display = "block";
    loadingText.style.display = "block";
    // arrows.style.display = "none";

    setTimeout(() => {
      loadingDialog.style.display = "none";
      subscriberCont.classList.add('breakout');
      subscriberCont.style.display = "flex";
      subscriberCont.style.border = "none";
      largeGroupButton.style.display = "block";
    }, 3000)
  });

  largeGroupButton.addEventListener('click', () => {
    largeGroupButton.style.display = "none";
    publisherCont.classList.remove('breakout');
    subscriberCont.style.display = "none";
    loadingText.firstChild.nodeValue = "Moving to Main Room...";
    loadingDialog.style.display = "block";
    spinner.style.display = "block";
    loadingText.style.display = "block";

    setTimeout(() => {
      // arrows.style.display = "flex";
      publisherCont.classList.add('active');
      loadingDialog.style.display = "none";
      subscriberCont.classList.remove('breakout');
      subscriberCont.style.display = "flex";
      subscriberCont.style.borderTop = "2px solid grey";
      breakoutButton.style.display = "block";
      // if (totalSubs > 7) {
      //   $("#subscriber").slick({
      //       slidesToShow: 6,
      //       slidesToScroll: 1,
      //       infinite: false,
      //       nextArrow: ".forward-arrow",
      //       prevArrow: ".back-arrow"
      //   });
      // }
    }, 3000);
  })

  // Create a publisher
  var publisher = OT.initPublisher('publisher', {
    insertMode: 'append',
    width: '100%',
    height: '100%'
  }, handleError);

  // Connect to the session
  session.connect(token, function (error) {
    // If the connection is successful, publish to the session
    if (error) {
      handleError(error);
    } else {
      session.publish(publisher, handleError);
    }
  });

  
}

