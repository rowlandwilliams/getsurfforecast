// Surf app JS

var y = 0;
var imagesSurf = ['img/secrets_sequence.jpg', 
                'img/secrets_sequence-2.jpg',
                'img/secrets_sequence-3.jpg',
                'img/secrets_sequence-4.jpg',
                'img/secrets_sequence-5.jpg',
                'img/secrets_sequence-6.jpg',
                'img/secrets_sequence-7.jpg',
                'img/secrets_sequence-8.jpg']

var timeSurf = 500;
var playingSurf = true;


// Change Images on page load and prevent changing if playing is false
function changeImgSurf() {
    if (playingSurf) {
        document.surfslide.src = imagesSurf[y];
        if (y < imagesSurf.length-1) {
        y++
        } else {
        y=0;
        }
    setTimeout(changeImgSurf, timeSurf);
}}

window.onload = function () {
    //changeImg();
    changeImgSurf();
}



var forecasts = {'Watersplash': 'http://magicseaweed.com/api/6448b3a746b10f4504a92dc39e1d9e98/forecast/?spot_id=120&units=uk',
                 'St Brelades': 'http://magicseaweed.com/api/6448b3a746b10f4504a92dc39e1d9e98/forecast/?spot_id=1191&units=uk'}
var proxyUrl = 'https://cors-anywhere.herokuapp.com/'
var locations = Object.keys(forecasts);
var webData = {};


var date = new Date().getDate();
var currentHour = new Date().getHours();

// check 1 in the morning hs is 1 not 01

// function to convert UNIX timestamp into date and time
function convert(timeStamp){
    // Months array
    var months_arr = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
   
    // Convert timestamp to milliseconds
    var date = new Date(timeStamp*1000);
   
    // Year
    var year = date.getFullYear();
   
    // Month
    var month = months_arr[date.getMonth()];
   
    // Day
    var day = date.getDate();
   
    // Hours
    var hours = date.getHours();
   
    // Minutes
    var minutes = "0" + date.getMinutes();
   
    // Seconds
    var seconds = "0" + date.getSeconds();
   
    // Display date time in MM-dd-yyyy h:m:s format
    var convdataTime = month+'-'+day+'-'+year+' '+hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    
    return convdataTime
    
   }



// create APP
const app = document.getElementById('root')

const container = document.createElement('div');
container.setAttribute('class', 'container');

app.appendChild(container);


// Access MSW API for jersey and pull out required data for todays day, nearest hour  
for (let i=0; i<locations.length; i++) {

    fetch(proxyUrl + forecasts[locations[i]])
        .then((resp) => {
            return resp.json();
        })
        .then((data) => {
            // convert each local timestamp in array to readable data
            data.forEach(element => {
                element.localTimestamp = convert(element.localTimestamp);
                element.forecastHour = element.localTimestamp.match(/\s{1}(\d{1,2})/)[1];
                element.diff = Math.abs(element.forecastHour - currentHour); // work out difference between current hour and forecast interval
            });
            
            //filter array based on todats date and then based on nearest hour using diff
            //work out minimum difference and then filter
            const minDiff = Math.min(...data.map(item => item.diff));
            
            //remove start and end [] from current data
            currentData = data.filter(element => element.localTimestamp.match(/(\d{1,2})/)[0] == String(date)).filter(element => element.diff == minDiff);
            currentData = JSON.stringify(currentData);
            currentData = JSON.parse(currentData.substring(1, currentData.length-1));
            
            //maxHeight': currentData.swell.maxBreakingHeight,
            //'minHeight': currentData.swell.minBreakingHeight,

            // extract desired attributes from data
            var newData = {'Waves': currentData.swell.minBreakingHeight + '-' + currentData.swell.maxBreakingHeight + 'ft' + ' @ ' + currentData.swell.components.primary.period +'s',
                           'Wind': currentData.wind.speed + 'mph ' + currentData.wind.compassDirection,
                           'Water': currentData.condition.temperature + ' ºC'}
            
            
            
            // Using processed data create a general comment based on conditions
            var stateData = {}
            //Wave height
            if (currentData.swell.maxBreakingHeight <= 3) {
                stateData['sizeState'] = 'Small';
            }
            else if (currentData.swell.maxBreakingHeight <= 6) {
                stateData['sizeState'] = 'Fun-sized...'
            }
            else {
                stateData['sizeState'] = 'BIG!'
            }


            //Wind speed
            if (currentData.wind.speed < 10) {
                stateData['windSpeedState'] = 'Glassy' 
            }
            else if (currentData.wind.speed < 20) {
                stateData['windSpeedState'] = 'Should be fun...'
            }
            else {
                stateData['windSpeedState'] = 'It\'s windy!'
            }

            //Water temp
            if (currentData.condition.temperature < 10) {
                stateData['tempState'] = 'Chilly, full wetsuit required' 
            }
            else if (currentData.condition.temperature < 15) {
                stateData['tempState'] = 'Not too bad'
            }
            else {
                stateData['tempState'] = 'It\'s summer!'
            }



            // Create box for each forecast details to go into
            
            const box = document.createElement('div');
            box.setAttribute('class', 'box');
            
            // Write title of each location
            const h1 = document.createElement('h1');
            h1.setAttribute('class', 'h1');
            h1.innerHTML = locations[i];
            
            //create div to hold the two lists
            const lists = document.createElement('div');
            lists.setAttribute('class', 'lists');

            // For each location print the conditions variables in a list
            var newDataKeys = Object.keys(newData);
            const ul = document.createElement('ul');
            ul.setAttribute('class', 'ul');

            for (let i=0; i<newDataKeys.length; i++) {
                var li = document.createElement('li');
                li.innerHTML = newDataKeys[i] + ': ' + newData[newDataKeys[i]]
                ul.append(li)
            }

            
            //For each location print the conmment based on conditions in a separate list
            var stateDataKeys = Object.keys(stateData)
            const ulStates = document.createElement('ul');
            ulStates.setAttribute('class', 'ulStates');

            for (let i=0; i<stateDataKeys.length; i++) {
                var span = document.createElement('span');
                var li = document.createElement('li');
                span.innerHTML = stateData[stateDataKeys[i]];
                li.append(span);
                ulStates.append(li);
            }
            
            
            // Append items
            container.appendChild(box);
            box.appendChild(h1);
            lists.appendChild(ul);
            lists.appendChild(ulStates);
            box.appendChild(lists);

            

        
        })
}
