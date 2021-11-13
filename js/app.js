window.addEventListener('DOMContentLoaded', (event) => {
  let recordButton = document.querySelector('i.fa-circle');
  let stopButton = document.querySelector('i.fa-stop-circle');
  let downloadButton = document.querySelector('i.fa-file-download');

  let counterID;
  let hours = 0, minutes = 0, seconds = 0;
  let hoursLabel = document.querySelector('#hours');
  let minutesLabel = document.querySelector('#minutes');
  let secondsLabel = document.querySelector('#seconds');

  let gpsID;
  let track = [];
  let distance = 0;
  let distanceLabel = document.querySelector('#distance');
  let unitsLabel = document.querySelector('#units');

  recordButton.addEventListener('click', (event) => {
    recordButton.classList.toggle('hidden');
    stopButton.classList.toggle('hidden');
    downloadButton.classList.add('disabled');

    hours = 0;
    minutes = 0;
    seconds = 0;
    track = [];
    distance = 0;

    counterID = window.setInterval(updateCounter, 1000);

    gpsID = navigator.geolocation.watchPosition(
      (position) => {
        track.push({
          'timestamp': position.timestamp,
          'latitude': position.coords.latitude,
          'longitude': position.coords.longitude
        });

        updateDistance();
      },
      (error) => {
        console.log(`ERROR(${error.code}): ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: 27000
      }
    );
  });

  stopButton.addEventListener('click', (event) => {
    recordButton.classList.toggle('hidden');
    stopButton.classList.toggle('hidden');
    downloadButton.classList.toggle('disabled');

    window.clearInterval(counterID);
    navigator.geolocation.clearWatch(gpsID);
  });

  downloadButton.addEventListener('click', (event) => {
    if (downloadButton.classList.contains('disabled')) return;

    let fileContent = 'timestamp;latitude;longitude%0A';
    for (let point of track) {
      fileContent += `${point.timestamp};${point.latitude};${point.longitude}%0A`;
    }


    let now = new Date();
    let fileName = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}_${now.getHours()}H${now.getMinutes()}.csv`;

    /*
    let blob = new Blob([fileContent], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8;'});
    let url = URL.createObjectURL(blob);
    */

    let url = `mailto:name@mail.com?subject=${fileName}&body=${fileContent}`;

    let anchor = document.createElement('a');
    //anchor.download = fileName;
    anchor.href = url;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);

    anchor.click();
    document.body.removeChild(anchor);
  });

  function updateCounter() {
    if (++seconds === 60) {
      seconds = 0;
      if (++minutes === 60) {
        minutes = 0;
        ++hours;
      }
    }

    hoursLabel.textContent = (hours < 10) ? '0' + hours : hours;
    minutesLabel.textContent = (minutes < 10) ? '0' + minutes : minutes;
    secondsLabel.textContent = (seconds < 10) ? '0' + seconds : seconds;
  }

  function updateDistance() {
    if (track.length > 1) distance += greatCircleDistanceBetween(track[track.length - 2], track[track.length - 1]);

    if (distance > 10000) {
      distanceLabel.textContent = Math.round(distance / 100) / 10;
      unitsLabel.textContent = 'km';
    }
    else {
      distanceLabel.textContent = Math.round(distance);
      unitsLabel.textContent = 'm';
    }
  }

  function greatCircleDistanceBetween(p1, p2) {
    let lat1 = p1.latitude * Math.PI / 180;
    let lat2 = p2.latitude * Math.PI / 180;
    let dLon = Math.abs(p2.longitude - p1.longitude) * Math.PI / 180;

    let cosLat1 = Math.cos(lat1)
    let sinLat1 = Math.sin(lat1)
    let cosLat2 = Math.cos(lat2)
    let sinLat2 = Math.sin(lat2)
    let cosDLon = Math.cos(dLon)
    let sinDLon = Math.sin(dLon)

    let A = cosLat2 * sinDLon
    let B = cosLat1 * sinLat2 - sinLat1 * cosLat2 * cosDLon

    return 6371009 * Math.atan2(Math.sqrt(A * A + B * B),
      sinLat1 * sinLat2 + cosLat1 * cosLat2 * cosDLon);
  }
});