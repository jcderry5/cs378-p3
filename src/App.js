import './App.css';
import React from 'react';
import { useState, useEffect } from 'react';
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, set, child, get } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAa-Z0hmWUeCMZWsuxWb_VPamalA0IKPBU",
  authDomain: "hcifirebase-d373a.firebaseapp.com",
  databaseURL: "https://hcifirebase-d373a-default-rtdb.firebaseio.com",
  projectId: "hcifirebase-d373a",
  storageBucket: "hcifirebase-d373a.appspot.com",
  messagingSenderId: "1051593364533",
  appId: "1:1051593364533:web:3d962938b430742309cd7c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);
// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);



export default function WeatherApp() {
  const BASE_ATX_URL = "https://api.open-meteo.com/v1/forecast?latitude=30.27&longitude=-97.74&hourly=temperature_2m"
  const BASE_DAL_URL = "https://api.open-meteo.com/v1/forecast?latitude=32.78&longitude=-96.81&hourly=temperature_2m"
  const GEO_CODING_STUB = "https://geocoding-api.open-meteo.com/v1/search?name="
  const [time, setTime] = useState([]);
  const [temp, setTemp] = useState([]);
  const [user, setUser] = useState([]);
  const [userId, setUserId] = useState([]);
  const [currentURL, setCurrentURL] = useState([]);
  const [currentCityName, setCurrentCityName] = useState([]);
  let displayData
  

  async function pullJson(URL) {
    setCurrentURL(URL)
    const response = await fetch(URL)
    const responseData = await response.json()
    let timeArr = responseData.hourly.time
    let tempArr = responseData.hourly.temperature_2m
    setTime(timeArr);
    setTemp(tempArr);
  }

  useEffect(() => {
    pullJson(BASE_ATX_URL)
    setCurrentCityName("Austin")
    let cityHeader = document.getElementById("currentCityHeader");
    cityHeader.innerText = currentCityName
  }, []);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user)
        setUserId(user.uid)
      } else {
        setUser(null)
      }
    });
  })
  
  function onClickLocal() {
    const dbRef = ref(getDatabase());
    // Get the URL
    get(child(dbRef, `users/${userId}/URL`)).then((snapshot) => {
      if (snapshot.exists()) {
        pullJson(snapshot.val());
      } else {
        console.log("No data available");
      }
    }).catch((error) => {
      alert(error);
    });

    // Get the City Name
    get(child(dbRef, `users/${userId}/CityName`)).then((snapshot) => {
      if (snapshot.exists()) {
        let cityHeader = document.getElementById("currentCityHeader");
        cityHeader.innerText = snapshot.val()
      } else {
        console.log("No data available");
      }
    }).catch((error) => {
      alert(error);
    });
    
  }

  function onClickATX() {
    setCurrentCityName("Austin")
    pullJson(BASE_ATX_URL)
    let cityHeader = document.getElementById("currentCityHeader");
    cityHeader.innerText = "Austin"
  }

  function onClickDAL() {
    pullJson(BASE_DAL_URL)
    setCurrentCityName("Dallas")
    let cityHeader = document.getElementById("currentCityHeader");
    cityHeader.innerText = "Dallas"
  }

  return (<>
    <div class="container">
      <AuthHeader />
      <ThreeCityButtons />
      <CityInput />
      <CurrentCityHeader />
      <ForecastHeader />
      < DataSet />
    </div>
  </>)

  function CityInput() {
    return (
      <div>
        <input type="text" id="searchCity" name="city" placeholder="Input City Name" />
        <button id="searchCityBtn" onClick={() => getCustomCity()}> Get Weather </button>
      </div>
    )
  }

  function getCustomCity() {
    const inputCity = document.getElementById("searchCity").value
    setCurrentCityName(inputCity)
    let cityHeader = document.getElementById("currentCityHeader");
    cityHeader.innerText = inputCity
    let encodedCityName = encodeURI(inputCity)
    const CUSTOM_URL = GEO_CODING_STUB + encodedCityName
    pullCustomJson(CUSTOM_URL)
  }

  async function pullCustomJson(URL) {
    const response = await fetch(URL)
    const responseData = await response.json()
    if (responseData.results != null) {
      let lat = responseData.results[0].latitude
      let long = responseData.results[0].longitude
      buildCustomJsonURL(long, lat)
    } else {
      alert ("Not a Valid City")
    }
  }

  function buildCustomJsonURL(long, lat) {
    const beginningURL = "https://api.open-meteo.com/v1/forecast?latitude="
    const middleURL = "&longitude="
    const endURL = "&hourly=temperature_2m&temperature_unit=fahrenheit"
    const CUSTOM_URL = beginningURL + lat + middleURL + long + endURL
    pullJson(CUSTOM_URL)
  }

  function AuthHeader() {
    return (
      <div class="row">
        <div class="col-6">
            <button class="auth-btn" id="login-btn" onClick={onClickLogin}> <b> Log In </b></button>
          </div>
        <div class="col-6">
          <button class="auth-btn" id="logout-btn" onClick={onClickLogout}> <b> Log Out </b></button>
        </div>
      </div>
    )
  }

  function onClickSignup() {
    let newEmail = prompt("Enter your email to signup")
    let newPassword = prompt("Enter your desired password to signup")
    createUserWithEmailAndPassword(auth, newEmail, newPassword)
      .then((userCredential) => {
        // Signed in 
        user = userCredential.user;
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert(errorMessage)
      });
  }

  function onClickLogin() {
    let email = prompt("Enter username")
    let password = prompt("Enter password")
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        //
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert(errorMessage)
      });
  }

  function onClickLogout() {
    if (user) {
      auth.signOut()
      .then(function () {
          console.log('Signed Out');
      }, function(error) {
          console.error('Sign Out Error', error);
    });
    } else {
      alert("You are not signed in")
    }
    
  }

  function onClickSetLocalCity() {
    set(ref(database, 'users/' + userId), {
      URL: currentURL,
      CityName: currentCityName
    });
  }

  function ThreeCityButtons() {
    return (
      <div class="row">
        <div class="col">
          <button id="LOCAL-btn" class="cityBtn" onClick={onClickLocal}> <b> Local </b> </button>
        </div>
        <div class="col">
          <button id="ATX-btn" class="cityBtn" onClick={onClickATX}> <b> Austin </b> </button>
        </div>
        <div class="col">
          <button id="DAL-btn" class="cityBtn" onClick={onClickDAL}> <b> Dallas </b> </button>
        </div>
      </div>
    )
  }

  function CurrentCityHeader() {
    let cityName = ""
    if (document.getElementById("currentCityHeader") == null) {
      cityName = "<Unknown City Name>"
    } else {
      cityName = document.getElementById("currentCityHeader").innerText
    }
    return (
      <div id="cityHeader">
        Weather for <var id="currentCityHeader"><b>{cityName}</b></var>
        <button id="setLocalCityBtn" onClick={onClickSetLocalCity}><b>Set Local</b></button>
      </div>
    )
  }

  function ForecastHeader() {
    return (
      <div class="row forecast" >
        <div class="col-4">
          <b>Time</b>
        </div>
        <div class="col">
          <b>Temperature</b>
        </div>
      </div>
    )
  }

  function DataRow({ idx }) {
    let returnValue = ''
    if (temp.length != 0) {
      returnValue = (
        <div class="row forecast forecaseData">
          <div class="col-4">
            {time[idx].substring(11)}
          </div>
          <div class="col">
            {temp[idx]} F
          </div>
        </div>
      )
    } else {
      returnValue = <p> Nothing populated yet </p>
    }
    return (
      returnValue
    )
  }

  function DataSet() {
    const returnValue = [];
    for (let i = 8; i < 24; i++) {
      returnValue.push(<DataRow idx={i} />)
    }
    return returnValue
  }
  
}
